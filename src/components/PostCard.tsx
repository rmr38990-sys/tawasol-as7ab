import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  Copy,
  Edit3,
  Globe,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  Smile,
  ThumbsUp,
  Trash2,
  Users,
  Video,
} from 'lucide-react';
import {
  CommentItem,
  Language,
  PostItem,
  PrivacyLevel,
  ReactionType,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';

const REACTION_META: Record<ReactionType, { emoji: string; ar: string; en: string; color: string }> = {
  like: { emoji: '👍', ar: 'أعجبني', en: 'Like', color: 'text-cyan-600 dark:text-cyan-400' },
  love: { emoji: '❤️', ar: 'أحببته', en: 'Love', color: 'text-pink-600 dark:text-pink-400' },
  care: { emoji: '🤗', ar: 'أدعمه', en: 'Care', color: 'text-amber-500' },
  haha: { emoji: '😂', ar: 'هاهاها', en: 'Haha', color: 'text-amber-500' },
  wow: { emoji: '😮', ar: 'واو', en: 'Wow', color: 'text-amber-500' },
  sad: { emoji: '😢', ar: 'حزين', en: 'Sad', color: 'text-sky-500' },
  angry: { emoji: '😡', ar: 'أغضبني', en: 'Angry', color: 'text-rose-600' },
};

const QUICK_EMOJIS = ['😍', '🔥', '👏', '🎉', '🩵', '💖', '😂', '✨'];
const QUICK_GIFS = [
  'GIF · تصفيق حار 👏',
  'GIF · حب وإعجاب 💖',
  'GIF · مذهل جداً 🤩',
  'GIF · طاقة إيجابية ✨',
];

function formatRelativeTime(iso: string, lang: Language): string {
  const diffMin = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMin < 60) {
    return lang === 'ar' ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  }
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) {
    return lang === 'ar' ? `منذ ${diffHrs} ساعة` : `${diffHrs}h ago`;
  }
  const diffDays = Math.floor(diffHrs / 24);
  return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
}

interface PostCardProps {
  lang: Language;
  post: PostItem;
  currentUser: UserAccount;
  onReact: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, comment: Omit<CommentItem, 'id' | 'createdAt'>) => void;
  onShare: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onEditPost: (postId: string, newContent: string) => void;
  onChangePrivacy: (postId: string, privacy: PrivacyLevel) => void;
  onRequestDelete: (postId: string) => void;
  onOpenAuthorProfile?: (authorId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  lang,
  post,
  currentUser,
  onReact,
  onAddComment,
  onShare,
  onToggleSave,
  onEditPost,
  onChangePrivacy,
  onRequestDelete,
  onOpenAuthorProfile,
}) => {
  const t = getT(lang);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<string | undefined>(undefined);
  const [commentGif, setCommentGif] = useState<string | undefined>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.content);
  const [copiedLink, setCopiedLink] = useState(false);

  const myReaction = post.reactions[currentUser.id];
  const reactionEntries = Object.values(post.reactions);
  const totalReactions = reactionEntries.length;
  const uniqueEmojis = Array.from(new Set(reactionEntries)).slice(0, 3);
  const isOwner = post.authorId === currentUser.id;

  const privacyIcon =
    post.privacy === 'public' ? (
      <Globe className="w-3.5 h-3.5" />
    ) : post.privacy === 'friends' ? (
      <Users className="w-3.5 h-3.5" />
    ) : (
      <Lock className="w-3.5 h-3.5" />
    );

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage && !commentGif) return;
    onAddComment(post.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      text: commentText.trim(),
      imageUrl: commentImage,
      gifLabel: commentGif,
    });
    setCommentText('');
    setCommentImage(undefined);
    setCommentGif(undefined);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowComments(true);
  };

  const handleCommentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCommentImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = () => {
    if (editDraft.trim()) {
      onEditPost(post.id, editDraft.trim());
    }
    setIsEditing(false);
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-visible">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onOpenAuthorProfile?.(post.authorId)}
            className="cursor-pointer shrink-0"
          >
            <Avatar name={post.authorName} src={post.authorAvatar} size="md" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAuthorProfile?.(post.authorId)}
                className="text-sm font-bold text-slate-900 dark:text-white hover:underline cursor-pointer truncate"
              >
                {post.authorName}
              </button>
              {post.authorVerified && (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-white"
                  title="Verified"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              {post.feeling && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  — {post.feeling}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatRelativeTime(post.createdAt, lang)}</span>
              <span aria-hidden="true">·</span>
              {isOwner ? (
                <select
                  value={post.privacy}
                  onChange={(e) => onChangePrivacy(post.id, e.target.value as PrivacyLevel)}
                  className="bg-transparent text-xs text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer"
                  aria-label="Post privacy"
                >
                  <option value="public">{t.privacyPublic}</option>
                  <option value="friends">{t.privacyFriends}</option>
                  <option value="only_me">{t.privacyOnlyMe}</option>
                </select>
              ) : (
                <span className="inline-flex items-center gap-1">{privacyIcon}</span>
              )}
              {post.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-teal-600 dark:text-cyan-400 font-medium">
                    {post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3-Dot Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute top-9 end-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onToggleSave(post.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                <span>{post.isSaved ? t.unsavePost : t.savePost}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 1800);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{t.copyLink}</span>
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditDraft(post.content);
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t.editPost}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRequestDelete(post.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.deletePost}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {copiedLink && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-teal-700 dark:text-cyan-300 text-xs font-semibold">
          {lang === 'ar' ? 'تم نسخ رابط المنشور!' : 'Post link copied!'}
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        )}
      </div>

      {/* Media Attachment */}
      {post.imageUrl && (
        <div className="bg-slate-100 dark:bg-slate-950 overflow-hidden max-h-[460px]">
          <img
            src={post.imageUrl}
            alt={post.authorName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.videoLabel && (
        <div className="mx-4 mb-3 p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{post.videoLabel}</p>
              <p className="text-xs text-cyan-300">
                {lang === 'ar' ? 'مقطع فيديو على تواصل' : 'Tawasol Video Clip'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {totalReactions > 0 && (
            <>
              <span className="flex items-center -space-x-1 rtl:space-x-reverse">
                {uniqueEmojis.map((r) => (
                  <span key={r} className="text-sm leading-none">
                    {REACTION_META[r].emoji}
                  </span>
                ))}
              </span>
              <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                {totalReactions}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 tabular-nums">
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {post.comments.length} {t.comment}
          </button>
          <span aria-hidden="true">·</span>
          <span>
            {post.sharesCount} {t.share}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-2 py-1 grid grid-cols-3 gap-1 border-b border-slate-100 dark:border-slate-800">
        {/* Like with Multi-Reaction Picker */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            type="button"
            onClick={() => onReact(post.id, myReaction || 'like')}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              myReaction
                ? REACTION_META[myReaction].color
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {myReaction ? (
              <span className="text-base leading-none">{REACTION_META[myReaction].emoji}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>
              {myReaction ? (lang === 'ar' ? REACTION_META[myReaction].ar : REACTION_META[myReaction].en) : t.like}
            </span>
          </button>

          {showReactions && (
            <div className="absolute bottom-11 start-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl px-2.5 py-1.5 flex items-center gap-1.5 z-30">
              {(Object.keys(REACTION_META) as ReactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onReact(post.id, type);
                    setShowReactions(false);
                  }}
                  title={lang === 'ar' ? REACTION_META[type].ar : REACTION_META[type].en}
                  className="text-xl hover:scale-125 transition-transform cursor-pointer px-0.5"
                >
                  {REACTION_META[type].emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowComments(true)}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.comment}</span>
        </button>

        <button
          type="button"
          onClick={() => onShare(post.id)}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{t.share}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/50 rounded-b-2xl">
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar name={c.authorName} src={c.authorAvatar} size="xs" className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="inline-block max-w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-3.5 py-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {c.authorName}
                  </p>
                  {c.text && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-0.5 break-words">
                      {c.text}
                    </p>
                  )}
                  {c.gifLabel && (
                    <div className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/15 to-cyan-500/15 text-xs font-bold text-pink-600 dark:text-cyan-300">
                      {c.gifLabel}
                    </div>
                  )}
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt="Comment attachment"
                      referrerPolicy="no-referrer"
                      className="mt-2 max-h-40 rounded-xl object-cover"
                    />
                  )}
                </div>
                <div className="px-2 mt-1 text-[11px] text-slate-400">
                  {formatRelativeTime(c.createdAt, lang)}
                </div>
              </div>
            </div>
          ))}

          {/* Comment Composer */}
          <form onSubmit={handleSubmitComment} className="space-y-2 pt-1">
            {(commentImage || commentGif) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-xs text-teal-700 dark:text-cyan-300">
                <span className="truncate">{commentGif || (lang === 'ar' ? 'صورة مرفقة جاهزة' : 'Image attached')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCommentImage(undefined);
                    setCommentGif(undefined);
                  }}
                  className="text-rose-500 font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="xs" />
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-transparent focus-within:border-cyan-400">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t.writeComment}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />

                <div className="flex items-center gap-1 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    title={t.addEmoji}
                    className="p-1 text-slate-400 hover:text-pink-500 cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                    }}
                    title={t.addGif}
                    className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-cyan-500 cursor-pointer"
                  >
                    GIF
                  </button>

                  <label
                    title={t.addPhoto}
                    className="p-1 text-slate-400 hover:text-teal-500 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCommentImageUpload}
                      className="hidden"
                    />
                  </label>

                  {showEmojiPicker && (
                    <div className="absolute bottom-9 end-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 flex items-center gap-1 z-30">
                      {QUICK_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setCommentText((prev) => prev + em);
                            setShowEmojiPicker(false);
                          }}
                          className="text-lg hover:scale-125 transition cursor-pointer px-0.5"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}

                  {showGifPicker && (
                    <div className="absolute bottom-9 end-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 z-30">
                      {QUICK_GIFS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setCommentGif(g);
                            setShowGifPicker(false);
                          }}
                          className="w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500/10 cursor-pointer"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white flex items-center justify-center shrink-0 hover:opacity-90 cursor-pointer"
                aria-label={t.send}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
