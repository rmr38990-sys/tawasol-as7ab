import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  Play,
  RefreshCw,
  Send,
  Table2,
  Video,
  X,
} from 'lucide-react';
import {
  ChatMessage,
  GoogleSheetsConfig,
  Language,
  ReelItem,
  StoryItem,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/appsScriptDb';

interface OverlaysProps {
  lang: Language;
  currentUser: UserAccount;
  users: UserAccount[];
  // Messenger
  messengerOpen: boolean;
  activeChatUser: UserAccount | null;
  messages: Record<string, ChatMessage[]>;
  onCloseMessenger: () => void;
  onSelectChatUser: (u: UserAccount) => void;
  onSendMessage: (receiverId: string, text: string) => void;
  // Story Viewer & Creator
  viewingStory: StoryItem | null;
  onCloseStoryViewer: () => void;
  createStoryOpen: boolean;
  onCloseCreateStory: () => void;
  onPublishStory: (caption: string, imageUrl?: string, gradient?: string) => void;
  // Reel Player
  playingReel: ReelItem | null;
  onCloseReelPlayer: () => void;
  onToggleReelLike: (reelId: string) => void;
  // Live Video Modal
  liveVideoOpen: boolean;
  onCloseLiveVideo: () => void;
  onPublishLivePost: (title: string) => void;
  // Delete Confirmation Modal
  pendingDeletePostId: string | null;
  onConfirmDeletePost: () => void;
  onCancelDeletePost: () => void;
  // Google Sheets Database Modal
  sheetsModalOpen: boolean;
  sheetsConfig: GoogleSheetsConfig;
  isGoogleConnected: boolean;
  googleEmail: string | null;
  sheetsBusy: boolean;
  sheetsError: string;
  sheetsPreviewRows: string[][];
  onCloseSheetsModal: () => void;
  onConnectGoogle: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onLinkSheetId: (id: string) => Promise<void>;
  onPushSyncToSheets: () => Promise<void>;
  onPreviewSheetTab: (tab: string) => Promise<void>;
  onSaveAppsScriptUrl: (url: string) => Promise<void>;
  onPushViaAppsScript: () => Promise<void>;
  onPullViaAppsScript: () => Promise<void>;
}

const STORY_GRADIENTS = [
  'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
];

export const MessengerAndOverlays: React.FC<OverlaysProps> = ({
  lang,
  currentUser,
  users,
  messengerOpen,
  activeChatUser,
  messages,
  onCloseMessenger,
  onSelectChatUser,
  onSendMessage,
  viewingStory,
  onCloseStoryViewer,
  createStoryOpen,
  onCloseCreateStory,
  onPublishStory,
  playingReel,
  onCloseReelPlayer,
  onToggleReelLike,
  liveVideoOpen,
  onCloseLiveVideo,
  onPublishLivePost,
  pendingDeletePostId,
  onConfirmDeletePost,
  onCancelDeletePost,
  sheetsModalOpen,
  sheetsConfig,
  isGoogleConnected,
  googleEmail,
  sheetsBusy,
  sheetsError,
  sheetsPreviewRows,
  onCloseSheetsModal,
  onConnectGoogle,
  onCreateNewSheet,
  onLinkSheetId,
  onPushSyncToSheets,
  onPreviewSheetTab,
  onSaveAppsScriptUrl,
  onPushViaAppsScript,
  onPullViaAppsScript,
}) => {
  const t = getT(lang);
  const [chatInput, setChatInput] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyImg, setStoryImg] = useState<string | undefined>(undefined);
  const [storyGrad, setStoryGrad] = useState(STORY_GRADIENTS[0]);
  const [liveTitle, setLiveTitle] = useState('');
  const [sheetIdInput, setSheetIdInput] = useState(sheetsConfig.spreadsheetId || '');
  const [appsScriptInput, setAppsScriptInput] = useState(sheetsConfig.appsScriptUrl || '');
  const [sheetsMode, setSheetsMode] = useState<'apps_script' | 'oauth'>('apps_script');
  const [copiedScript, setCopiedScript] = useState(false);
  const [confirmSyncDialog, setConfirmSyncDialog] = useState(false);
  const [confirmAppsScriptPush, setConfirmAppsScriptPush] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('Users');

  const friends = users.filter((u) => u.id !== currentUser.id);
  const currentChatMessages = activeChatUser ? messages[activeChatUser.id] || [] : [];

  const handleStoryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setStoryImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Interactive Messenger Chat Drawer */}
      {messengerOpen && (
        <div className="fixed bottom-0 end-3 sm:end-6 z-40 w-[92vw] sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
          <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">
                {activeChatUser ? activeChatUser.name : t.messenger}
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMessenger}
              className="p-1 rounded-lg hover:bg-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Friends Horizontal Quick Selector */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            {friends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectChatUser(f)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                  activeChatUser?.id === f.id
                    ? 'bg-cyan-500/15 text-teal-700 dark:text-cyan-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Avatar name={f.name} src={f.avatarUrl} size="xs" isOnline={f.isOnline} />
                <span>{f.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[220px]">
            {!activeChatUser ? (
              <p className="text-xs text-slate-500 text-center py-10">
                {lang === 'ar' ? 'اختر صديقاً لبدء المحادثة' : 'Select a friend to chat'}
              </p>
            ) : currentChatMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                {lang === 'ar'
                  ? `ابدأ المحادثة مع ${activeChatUser.name}`
                  : `Start chatting with ${activeChatUser.name}`}
              </p>
            ) : (
              currentChatMessages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {m.createdAt}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeChatUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                onSendMessage(activeChatUser.id, chatInput.trim());
                setChatInput('');
              }}
              className="p-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                className="flex-1 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div
            className="relative w-full max-w-sm h-[75vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            style={viewingStory.gradient ? { background: viewingStory.gradient } : undefined}
          >
            {viewingStory.imageUrl && (
              <img
                src={viewingStory.imageUrl}
                alt={viewingStory.authorName}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75" />

            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Avatar name={viewingStory.authorName} src={viewingStory.authorAvatar} size="sm" />
                <div>
                  <p className="text-xs font-bold">{viewingStory.authorName}</p>
                  <p className="text-[10px] text-white/75">{t.storyHint}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseStoryViewer}
                className="p-1.5 rounded-full bg-black/40 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 p-6 text-center">
              <p className="text-base font-bold text-white drop-shadow">{viewingStory.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {createStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.addStory}</h3>
              <button type="button" onClick={onCloseCreateStory} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="h-48 rounded-2xl flex items-center justify-center p-4 text-center text-white relative overflow-hidden"
              style={{ background: storyGrad }}
            >
              {storyImg && (
                <img
                  src={storyImg}
                  alt="Story preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <p className="relative z-10 font-bold text-sm drop-shadow">
                {storyCaption || t.storyCaptionPlaceholder}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {STORY_GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setStoryImg(undefined);
                    setStoryGrad(g);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-white shadow cursor-pointer"
                  style={{ background: g }}
                />
              ))}
              <label className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer">
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>{t.addPhoto}</span>
                <input type="file" accept="image/*" onChange={handleStoryFile} className="hidden" />
              </label>
            </div>

            <input
              type="text"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder={t.storyCaptionPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />

            <button
              type="button"
              onClick={() => {
                onPublishStory(storyCaption.trim() || '✨', storyImg, storyImg ? undefined : storyGrad);
                setStoryCaption('');
                setStoryImg(undefined);
                onCloseCreateStory();
              }}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
            >
              {t.publishStory}
            </button>
          </div>
        </div>
      )}

      {/* Reels Player Modal */}
      {playingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="relative w-full max-w-sm h-[78vh] rounded-3xl overflow-hidden bg-black flex flex-col justify-between">
            <img
              src={playingReel.coverUrl}
              alt={playingReel.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span className="text-xs font-bold">{playingReel.duration}</span>
              </div>
              <button
                type="button"
                onClick={onCloseReelPlayer}
                className="p-1.5 rounded-full bg-black/50 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 p-5 flex items-end justify-between text-white">
              <div>
                <p className="text-xs font-bold text-cyan-300">{playingReel.authorName}</p>
                <p className="text-base font-extrabold mt-1">{playingReel.title}</p>
                <p className="text-xs text-slate-300 mt-1 tabular-nums">
                  {playingReel.viewsCount.toLocaleString()} {t.views}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleReelLike(playingReel.id)}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    playingReel.isLiked ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${playingReel.isLiked ? 'fill-white' : ''}`} />
                </span>
                <span className="text-xs font-bold tabular-nums">{playingReel.likesCount}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Modal */}
      {liveVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
                <Video className="w-5 h-5" />
                <span>{t.liveVideo}</span>
              </div>
              <button type="button" onClick={onCloseLiveVideo} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
              placeholder={lang === 'ar' ? 'عنوان البث المباشر...' : 'Live stream title...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                onPublishLivePost(
                  liveTitle.trim() || (lang === 'ar' ? 'بث مباشر مع الأصدقاء' : 'Live Video Stream')
                );
                setLiveTitle('');
                onCloseLiveVideo();
              }}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 cursor-pointer"
            >
              {lang === 'ar' ? 'بدء البث ونشره في الموجز' : 'Go Live & Share to Feed'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {pendingDeletePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">{t.confirmDeleteTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.confirmDeletePost}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancelDeletePost}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={onConfirmDeletePost}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Live Database Modal */}
      {sheetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Table2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.sheetsTitle}
                  </h3>
                  <p className="text-xs text-slate-500">{t.sheetsSubtitle}</p>
                </div>
              </div>
              <button type="button" onClick={onCloseSheetsModal} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {sheetsError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {sheetsError}
                </div>
              )}

              {/* Connection Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setSheetsMode('apps_script')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    sheetsMode === 'apps_script'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Apps Script (API URL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSheetsMode('oauth')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    sheetsMode === 'oauth'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  <span>Google Sign-In</span>
                </button>
              </div>

              {sheetsMode === 'apps_script' ? (
                <div className="space-y-4">
                  {/* Step 1: Web App URL */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'ar'
                        ? 'رابط Google Apps Script Web App (API URL)'
                        : 'Google Apps Script Web App URL'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={appsScriptInput}
                        onChange={(e) => setAppsScriptInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        dir="ltr"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => onSaveAppsScriptUrl(appsScriptInput.trim())}
                        disabled={sheetsBusy || !appsScriptInput.trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-95 disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'حفظ وفحص الرابط' : 'Save & Test'}</span>
                      </button>
                    </div>

                    {sheetsConfig.appsScriptUrl && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {lang === 'ar'
                              ? 'تم الربط بـ Apps Script بنجاح'
                              : 'Apps Script Connected'}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onPullViaAppsScript}
                            disabled={sheetsBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/15 text-teal-700 dark:text-cyan-300 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t.pullFromSheetBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmAppsScriptPush(true)}
                            disabled={sheetsBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500 text-white cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${sheetsBusy ? 'animate-spin' : ''}`} />
                            <span>{t.syncNowBtn}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {confirmAppsScriptPush && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          {t.confirmSyncTitle}: {t.confirmSyncDesc}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmAppsScriptPush(false)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setConfirmAppsScriptPush(false);
                              await onPushViaAppsScript();
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                          >
                            {t.confirm}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Copyable Apps Script Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'ar'
                          ? 'كود Google Apps Script الجاهز (Extensions > Apps Script)'
                          : 'Ready-to-Use Google Apps Script Code (Extensions > Apps Script)'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(GOOGLE_APPS_SCRIPT_CODE).catch(() => {});
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white cursor-pointer"
                      >
                        {copiedScript ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedScript
                            ? lang === 'ar'
                              ? 'تم النسخ!'
                              : 'Copied!'
                            : lang === 'ar'
                              ? 'نسخ الكود'
                              : 'Copy Code'}
                        </span>
                      </button>
                    </div>
                    <pre
                      dir="ltr"
                      className="p-3.5 rounded-xl bg-slate-950 text-cyan-200 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed"
                    >
                      {GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                  </div>
                </div>
              ) : !isGoogleConnected ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                    {lang === 'ar'
                      ? 'سجّل الدخول بحساب Google لمنح التطبيق إذن إنشاء وتحديث جدول البيانات.'
                      : 'Sign in with Google to authorize creating and syncing your live spreadsheet.'}
                  </p>
                  <button
                    type="button"
                    onClick={onConnectGoogle}
                    disabled={sheetsBusy}
                    className="gsi-material-button max-w-xs mx-auto"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <span className="gsi-material-button-contents">{t.signInGoogle}</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {t.googleConnectedAs} {googleEmail}
                      </span>
                    </span>
                    {sheetsConfig.lastSyncedAt && (
                      <span className="tabular-nums text-[11px]">
                        {new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* Create or Link Spreadsheet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={onCreateNewSheet}
                      disabled={sheetsBusy}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 cursor-pointer"
                    >
                      {sheetsBusy ? '...' : t.createSheetBtn}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={sheetIdInput}
                        onChange={(e) => setSheetIdInput(e.target.value)}
                        placeholder="Spreadsheet ID"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => onLinkSheetId(sheetIdInput.trim())}
                        disabled={sheetsBusy || !sheetIdInput.trim()}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white cursor-pointer"
                      >
                        {lang === 'ar' ? 'ربط' : 'Link'}
                      </button>
                    </div>
                  </div>

                  {sheetsConfig.spreadsheetId && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {sheetsConfig.spreadsheetTitle}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {sheetsConfig.spreadsheetId}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={sheetsConfig.spreadsheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{t.openInSheets}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setConfirmSyncDialog(true)}
                            disabled={sheetsBusy}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${sheetsBusy ? 'animate-spin' : ''}`} />
                            <span>{t.syncNowBtn}</span>
                          </button>
                        </div>
                      </div>

                      {/* Confirmation before updating Google Sheets */}
                      {confirmSyncDialog && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            {t.confirmSyncTitle}: {t.confirmSyncDesc}
                          </p>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmSyncDialog(false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 cursor-pointer"
                            >
                              {t.cancel}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setConfirmSyncDialog(false);
                                await onPushSyncToSheets();
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                            >
                              {t.confirm}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Live Sheet Tab Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {['Users', 'Posts', 'Interactions', 'CustomFeatures'].map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setActivePreviewTab(tab);
                                onPreviewSheetTab(tab);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                activePreviewTab === tab
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {sheetsPreviewRows.length > 0 && (
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                            <table className="w-full text-[11px] font-mono text-start">
                              <tbody>
                                {sheetsPreviewRows.slice(0, 8).map((row, ri) => (
                                  <tr
                                    key={ri}
                                    className={
                                      ri === 0
                                        ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                                        : 'border-t border-slate-100 dark:border-slate-800'
                                    }
                                  >
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="py-1.5 px-2.5 truncate max-w-[140px]">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
