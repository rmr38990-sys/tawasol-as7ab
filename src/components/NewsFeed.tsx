import React, { useState } from 'react';
import {
  Bookmark,
  Clock,
  Film,
  Flag,
  Gift,
  Image as ImageIcon,
  Play,
  Plus,
  Send,
  Smile,
  Store,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import {
  ActiveTab,
  CommentItem,
  CustomFeature,
  Language,
  PostItem,
  PrivacyLevel,
  PrivacySettings,
  ReactionType,
  ReelItem,
  SearchFilter,
  StoryItem,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { ASSETS } from '../data/seedData';

const FEELINGS = [
  'سعيد 😊',
  'متحمس 🔥',
  'ممتن 🩵',
  'مبدع 🎨',
  'مسافر ✈️',
  'يحتفل 🎉',
];

interface NewsFeedProps {
  lang: Language;
  currentUser: UserAccount;
  users: UserAccount[];
  posts: PostItem[];
  stories: StoryItem[];
  reels: ReelItem[];
  customFeatures: CustomFeature[];
  privacySettings: PrivacySettings;
  searchQuery: string;
  searchFilter: SearchFilter;
  onSelectTab: (tab: ActiveTab) => void;
  onCreatePost: (post: Omit<PostItem, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount'>) => void;
  onReact: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, comment: Omit<CommentItem, 'id' | 'createdAt'>) => void;
  onShare: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onEditPost: (postId: string, newContent: string) => void;
  onChangePrivacy: (postId: string, privacy: PrivacyLevel) => void;
  onRequestDelete: (postId: string) => void;
  onOpenStoryViewer: (storyId: string) => void;
  onOpenCreateStory: () => void;
  onOpenReelPlayer: (reelId: string) => void;
  onOpenLiveVideo: () => void;
  onOpenChatWithUser: (user: UserAccount) => void;
  onSendBirthdayWish: (friend: UserAccount, wishText: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  lang,
  currentUser,
  users,
  posts,
  stories,
  reels,
  customFeatures,
  privacySettings,
  searchQuery,
  searchFilter,
  onSelectTab,
  onCreatePost,
  onReact,
  onAddComment,
  onShare,
  onToggleSave,
  onEditPost,
  onChangePrivacy,
  onRequestDelete,
  onOpenStoryViewer,
  onOpenCreateStory,
  onOpenReelPlayer,
  onOpenLiveVideo,
  onOpenChatWithUser,
  onSendBirthdayWish,
}) => {
  const t = getT(lang);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | undefined>(undefined);
  const [postFeeling, setPostFeeling] = useState<string | undefined>(undefined);
  const [postPrivacy, setPostPrivacy] = useState<PrivacyLevel>(privacySettings.defaultPostPrivacy);
  const [showFeelings, setShowFeelings] = useState(false);
  const [birthdayWish, setBirthdayWish] = useState('');
  const [wishSentTo, setWishSentTo] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPostImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !postImage) return;
    onCreatePost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      authorVerified: currentUser.isVerified,
      content: postText.trim(),
      imageUrl: postImage,
      feeling: postFeeling,
      privacy: postPrivacy,
    });
    setPostText('');
    setPostImage(undefined);
    setPostFeeling(undefined);
    setShowFeelings(false);
  };

  // Filtered Feed Posts
  const visiblePosts = posts.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      if (searchFilter === 'photos' && !p.imageUrl) return false;
      if (searchFilter === 'videos' && !p.videoLabel) return false;
      if (
        !p.content.toLowerCase().includes(q) &&
        !p.authorName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const contacts = users.filter((u) => u.id !== currentUser.id);
  const birthdayFriend = users.find((u) => u.id === 'u_sara') || contacts[0];

  const shortcuts: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'friends',
      label: t.navFriends,
      icon: <UserCheck className="w-5 h-5" />,
      color: 'text-cyan-500',
    },
    {
      id: 'memories',
      label: t.memories,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-pink-500',
    },
    {
      id: 'groups',
      label: t.navGroups,
      icon: <Users className="w-5 h-5" />,
      color: 'text-teal-500',
    },
    {
      id: 'marketplace',
      label: t.navMarketplace,
      icon: <Store className="w-5 h-5" />,
      color: 'text-sky-500',
    },
    {
      id: 'videos',
      label: t.navVideos,
      icon: <Film className="w-5 h-5" />,
      color: 'text-rose-500',
    },
    {
      id: 'pages',
      label: t.pages,
      icon: <Flag className="w-5 h-5" />,
      color: 'text-amber-500',
    },
    {
      id: 'saved',
      label: t.saved,
      icon: <Bookmark className="w-5 h-5" />,
      color: 'text-pink-600',
    },
  ];

  const activeBanners = customFeatures.filter((f) => f.isEnabled && f.type === 'banner');
  const activeWidgets = customFeatures.filter((f) => f.isEnabled && f.type === 'feed_widget');
  const activeShortcuts = customFeatures.filter((f) => f.isEnabled && f.type === 'shortcut');

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar (Shortcuts) */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-2">
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition text-start cursor-pointer"
        >
          <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {currentUser.name}
          </span>
        </button>

        {shortcuts.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onSelectTab(sc.id)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition text-start cursor-pointer"
          >
            <span className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${sc.color}`}>
              {sc.icon}
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {sc.label}
            </span>
          </button>
        ))}

        {activeShortcuts.map((feat) => (
          <button
            key={feat.id}
            type="button"
            onClick={() => onSelectTab(`custom_${feat.id}`)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition text-start cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/15 to-cyan-500/15 text-pink-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">
              ★
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {lang === 'ar' ? feat.titleAr : feat.titleEn}
            </span>
          </button>
        ))}
      </aside>

      {/* Center Column (Stories + Composer + Reels + Feed) */}
      <section className="lg:col-span-6 space-y-5 min-w-0">
        {/* Admin Custom Announcement Banners */}
        {activeBanners.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl border text-white shadow-sm ${
              b.accentColor === 'pink'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-400'
                : b.accentColor === 'cyan'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 border-cyan-400'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-400'
            }`}
          >
            <h3 className="text-sm font-bold">{lang === 'ar' ? b.titleAr : b.titleEn}</h3>
            <p className="text-xs opacity-95 mt-1">
              {lang === 'ar' ? b.descriptionAr : b.descriptionEn}
            </p>
          </div>
        ))}

        {/* Stories Carousel (24h expiring stories) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.stories}</h2>
            <span className="text-[11px] text-slate-400">{t.storyHint}</span>
          </div>

          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1">
            {/* Add Story Card */}
            <button
              type="button"
              onClick={onOpenCreateStory}
              className="w-28 sm:w-32 h-44 shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-28 w-full bg-gradient-to-br from-pink-500/20 via-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
              </div>
              <div className="relative flex-1 bg-white dark:bg-slate-900 flex flex-col items-center justify-center px-2 pt-3 pb-2">
                <span className="absolute -top-4 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900 group-hover:scale-105 transition">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center">
                  {t.addStory}
                </span>
              </div>
            </button>

            {/* Active Stories */}
            {stories.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onOpenStoryViewer(st.id)}
                className="relative w-28 sm:w-32 h-44 shrink-0 rounded-2xl overflow-hidden group cursor-pointer text-start"
                style={st.gradient ? { background: st.gradient } : undefined}
              >
                {st.imageUrl && (
                  <img
                    src={st.imageUrl}
                    alt={st.authorName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />
                <div className="absolute top-2.5 start-2.5 ring-2 ring-pink-500 rounded-full">
                  <Avatar name={st.authorName} src={st.authorAvatar} size="xs" />
                </div>
                <div className="absolute bottom-2.5 inset-x-2.5">
                  <p className="text-xs font-bold text-white leading-tight line-clamp-2">
                    {st.authorName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create Post Composer */}
        <form
          onSubmit={handlePublishPost}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
            <div className="flex-1 space-y-2">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={2}
                placeholder={`${t.whatsOnMind} ${currentUser.name.split(' ')[0]}؟`}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
              />

              {postFeeling && (
                <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-2">
                  <span>{postFeeling}</span>
                  <button
                    type="button"
                    onClick={() => setPostFeeling(undefined)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {postImage && (
                <div className="relative rounded-xl overflow-hidden max-h-56 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={postImage}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPostImage(undefined)}
                    className="absolute top-2 end-2 w-7 h-7 rounded-full bg-slate-900/70 text-white text-xs font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {showFeelings && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setPostFeeling(f);
                    setShowFeelings(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-pink-500/15 cursor-pointer"
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={onOpenLiveVideo}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer whitespace-nowrap"
              >
                <Video className="w-4 h-4" />
                <span>{t.liveVideo}</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 cursor-pointer whitespace-nowrap">
                <ImageIcon className="w-4 h-4" />
                <span>{t.photoVideo}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowFeelings(!showFeelings)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer whitespace-nowrap"
              >
                <Smile className="w-4 h-4" />
                <span>{t.feelingActivity}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={postPrivacy}
                onChange={(e) => setPostPrivacy(e.target.value as PrivacyLevel)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="public">{t.privacyPublic}</option>
                <option value="friends">{t.privacyFriends}</option>
                <option value="only_me">{t.privacyOnlyMe}</option>
              </select>

              <button
                type="submit"
                disabled={!postText.trim() && !postImage}
                className="px-5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-95 disabled:opacity-40 transition cursor-pointer"
              >
                {t.publishPost}
              </button>
            </div>
          </div>
        </form>

        {/* Reels Horizontal Strip */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.reels}</h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('videos')}
              className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              {t.watchAll}
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {reels.map((reel) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => onOpenReelPlayer(reel.id)}
                className="relative w-32 sm:w-36 h-52 shrink-0 rounded-2xl overflow-hidden group cursor-pointer text-start"
              >
                <img
                  src={reel.coverUrl}
                  alt={reel.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-110 transition">
                  <Play className="w-5 h-5 fill-white" />
                </span>
                <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                  <p className="text-xs font-bold line-clamp-2">{reel.title}</p>
                  <p className="text-[10px] text-cyan-200 mt-0.5 tabular-nums">
                    {reel.viewsCount.toLocaleString()} {t.views}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Admin Feed Widgets */}
        {activeWidgets.map((w) => (
          <div
            key={w.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ar' ? w.titleAr : w.titleEn}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {lang === 'ar' ? w.descriptionAr : w.descriptionEn}
              </p>
            </div>
            {(w.ctaLabelAr || w.ctaLabelEn) && (
              <button
                type="button"
                onClick={() => onSelectTab(`custom_${w.id}`)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 shrink-0 cursor-pointer"
              >
                {lang === 'ar' ? w.ctaLabelAr : w.ctaLabelEn}
              </button>
            )}
          </div>
        ))}

        {/* Posts Stream */}
        <div className="space-y-4">
          {visiblePosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {lang === 'ar' ? 'لا توجد منشورات مطابقة لبحثك' : 'No posts match your filter'}
              </p>
            </div>
          ) : (
            visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                lang={lang}
                post={post}
                currentUser={currentUser}
                onReact={onReact}
                onAddComment={onAddComment}
                onShare={onShare}
                onToggleSave={onToggleSave}
                onEditPost={onEditPost}
                onChangePrivacy={onChangePrivacy}
                onRequestDelete={onRequestDelete}
                onOpenAuthorProfile={() => onSelectTab('profile')}
              />
            ))
          )}
        </div>
      </section>

      {/* Right Sidebar (Sponsored + Birthdays + Online Contacts) */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4">
        {/* Sponsored */}
        {!privacySettings.hideSponsored && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.sponsored}
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab('marketplace')}
              className="w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-start cursor-pointer"
            >
              <img
                src={ASSETS.headphones}
                alt="Sponsored headphones"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {lang === 'ar'
                    ? 'سماعات سماوية عازلة للضوضاء — متوفرة في الماركت بليس'
                    : 'Pastel Cyan ANC Headphones — Marketplace'}
                </p>
                <p className="text-[11px] text-teal-600 dark:text-cyan-400 mt-1">
                  tawasol.market
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Birthdays */}
        {birthdayFriend && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-500" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {t.birthdays}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? `${t.birthdayToday} ${birthdayFriend.name} ${t.todaySuffix}`
                : `${birthdayFriend.name}${t.birthdayToday}`}
            </p>
            {wishSentTo === birthdayFriend.id ? (
              <p className="text-xs font-semibold text-teal-600 dark:text-cyan-400">
                {lang === 'ar' ? 'تم إرسال تهنئتك بنجاح 🎉' : 'Birthday wish sent 🎉'}
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!birthdayWish.trim()) return;
                  onSendBirthdayWish(birthdayFriend, birthdayWish.trim());
                  setBirthdayWish('');
                  setWishSentTo(birthdayFriend.id);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={birthdayWish}
                  onChange={(e) => setBirthdayWish(e.target.value)}
                  placeholder={t.sendBirthdayWish}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Contacts (Online Friends with Green Indicator) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {t.contacts}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
              {contacts.filter((c) => c.isOnline).length} {t.onlineNow}
            </span>
          </div>

          <div className="space-y-1">
            {contacts.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => onOpenChatWithUser(friend)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-start cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    name={friend.name}
                    src={friend.avatarUrl}
                    size="sm"
                    isOnline={friend.isOnline}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {friend.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
