import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  Clock,
  Film,
  Flag,
  MapPin,
  MessageCircle,
  Play,
  Plus,
  Store,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  ActiveTab,
  CommentItem,
  CustomFeature,
  FriendRequest,
  GroupItem,
  Language,
  MarketplaceItem,
  PostItem,
  PrivacyLevel,
  ReactionType,
  ReelItem,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { ASSETS } from '../data/seedData';

interface SecondaryViewsProps {
  lang: Language;
  activeTab: ActiveTab;
  currentUser: UserAccount;
  users: UserAccount[];
  posts: PostItem[];
  reels: ReelItem[];
  friendRequests: FriendRequest[];
  marketplace: MarketplaceItem[];
  groups: GroupItem[];
  customFeatures: CustomFeature[];
  onAcceptFriendRequest: (req: FriendRequest) => void;
  onDeclineFriendRequest: (reqId: string) => void;
  onOpenReelPlayer: (reelId: string) => void;
  onOpenChatWithUser: (user: UserAccount) => void;
  onAddMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'sellerId' | 'sellerName'>) => void;
  onToggleGroupJoin: (groupId: string) => void;
  onCreateGroup: (group: Omit<GroupItem, 'id' | 'membersCount' | 'isJoined'>) => void;
  onReact: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, comment: Omit<CommentItem, 'id' | 'createdAt'>) => void;
  onShare: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onEditPost: (postId: string, newContent: string) => void;
  onChangePrivacy: (postId: string, privacy: PrivacyLevel) => void;
  onRequestDelete: (postId: string) => void;
}

export const SecondaryViews: React.FC<SecondaryViewsProps> = ({
  lang,
  activeTab,
  currentUser,
  users,
  posts,
  reels,
  friendRequests,
  marketplace,
  groups,
  customFeatures,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onOpenReelPlayer,
  onOpenChatWithUser,
  onAddMarketplaceItem,
  onToggleGroupJoin,
  onCreateGroup,
  onReact,
  onAddComment,
  onShare,
  onToggleSave,
  onEditPost,
  onChangePrivacy,
  onRequestDelete,
}) => {
  const t = getT(lang);
  const [marketCategory, setMarketCategory] = useState('all');
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellTitle, setSellTitle] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellLocation, setSellLocation] = useState('');
  const [sellDesc, setSellDesc] = useState('');

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [grpName, setGrpName] = useState('');
  const [grpCategory, setGrpCategory] = useState('');
  const [grpDesc, setGrpDesc] = useState('');

  if (activeTab === 'friends') {
    const friendsList = users.filter((u) => u.id !== currentUser.id);
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-pink-500" />
            <span>
              {lang === 'ar' ? 'طلبات الصداقة' : 'Friend Requests'} ({friendRequests.length})
            </span>
          </h1>
          {friendRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              {lang === 'ar' ? 'لا توجد طلبات صداقة معلقة' : 'No pending friend requests'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={req.fromName} src={req.fromAvatar} size="lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {req.fromName}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {req.mutualFriends} {lang === 'ar' ? 'أصدقاء مشتركين' : 'mutual friends'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onAcceptFriendRequest(req)}
                      className="py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
                    >
                      {t.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeclineFriendRequest(req.id)}
                      className="py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'ar' ? 'جميع الأصدقاء' : 'All Friends'} ({friendsList.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendsList.map((fr) => (
              <div
                key={fr.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={fr.name} src={fr.avatarUrl} size="md" isOnline={fr.isOnline} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {fr.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{fr.city}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChatWithUser(fr)}
                  className="p-2 rounded-xl bg-cyan-500/10 text-teal-700 dark:text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'videos') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-pink-500" />
            <span>{t.reels}</span>
          </h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <button
              key={reel.id}
              type="button"
              onClick={() => onOpenReelPlayer(reel.id)}
              className="relative aspect-[9/14] rounded-2xl overflow-hidden group text-start cursor-pointer border border-slate-200 dark:border-slate-800"
            >
              <img
                src={reel.coverUrl}
                alt={reel.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm text-white flex items-center justify-center">
                <Play className="w-6 h-6 fill-white" />
              </span>
              <div className="absolute bottom-3 inset-x-3 text-white">
                <p className="text-xs text-cyan-300 font-semibold">{reel.authorName}</p>
                <p className="text-sm font-bold line-clamp-2 mt-0.5">{reel.title}</p>
                <p className="text-[11px] text-slate-300 mt-1 tabular-nums">
                  {reel.viewsCount.toLocaleString()} {t.views} · {reel.duration}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'marketplace') {
    const categories = ['all', ...Array.from(new Set(marketplace.map((m) => m.category)))];
    const filteredMarket =
      marketCategory === 'all'
        ? marketplace
        : marketplace.filter((m) => m.category === marketCategory);

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-teal-500" />
            <span>{t.navMarketplace}</span>
          </h1>
          <button
            type="button"
            onClick={() => setShowSellModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة منتج للبيع' : 'Sell Item'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setMarketCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                marketCategory === cat
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? t.filterAll : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMarket.map((item) => {
            const seller = users.find((u) => u.id === item.sellerId) || users[0];
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-lg font-extrabold text-pink-600 dark:text-cyan-400 tabular-nums">
                      {item.price.toLocaleString()} {item.currency}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.location}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => onOpenChatWithUser(seller)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-teal-700 dark:text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
                  >
                    {lang === 'ar' ? `مراسلة ${item.sellerName}` : `Message ${item.sellerName}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showSellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{lang === 'ar' ? 'إضافة منتج جديد' : 'New Listing'}</h3>
                <button type="button" onClick={() => setShowSellModal(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!sellTitle.trim() || !sellPrice) return;
                  onAddMarketplaceItem({
                    title: sellTitle.trim(),
                    price: Number(sellPrice),
                    currency: 'EGP',
                    category: lang === 'ar' ? 'متنوع' : 'General',
                    location: sellLocation.trim() || (lang === 'ar' ? 'القاهرة' : 'Cairo'),
                    imageUrl: ASSETS.headphones,
                    description: sellDesc.trim(),
                  });
                  setSellTitle('');
                  setSellPrice('');
                  setSellLocation('');
                  setSellDesc('');
                  setShowSellModal(false);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={sellTitle}
                  onChange={(e) => setSellTitle(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المنتج' : 'Item title'}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder={lang === 'ar' ? 'السعر بالجنيه' : 'Price (EGP)'}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <input
                  type="text"
                  value={sellLocation}
                  onChange={(e) => setSellLocation(e.target.value)}
                  placeholder={lang === 'ar' ? 'الموقع' : 'Location'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <textarea
                  value={sellDesc}
                  onChange={(e) => setSellDesc(e.target.value)}
                  placeholder={lang === 'ar' ? 'وصف المنتج' : 'Description'}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
                >
                  {t.publishPost}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'groups') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <span>{t.navGroups}</span>
          </h1>
          <button
            type="button"
            onClick={() => setShowGroupModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إنشاء مجموعة' : 'Create Group'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <img
                  src={grp.coverUrl}
                  alt={grp.name}
                  referrerPolicy="no-referrer"
                  className="h-36 w-full object-cover"
                />
                <div className="p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-teal-600 dark:text-cyan-400">
                    {grp.category} · <span className="tabular-nums">{grp.membersCount.toLocaleString()}</span> {lang === 'ar' ? 'عضو' : 'members'}
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{grp.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{grp.description}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => onToggleGroupJoin(grp.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    grp.isJoined
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                  }`}
                >
                  {grp.isJoined && <Check className="w-3.5 h-3.5" />}
                  <span>
                    {grp.isJoined
                      ? lang === 'ar'
                        ? 'منضم للمجموعة'
                        : 'Joined'
                      : lang === 'ar'
                        ? 'انضمام للمجموعة'
                        : 'Join Group'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{lang === 'ar' ? 'إنشاء مجموعة جديدة' : 'Create Group'}</h3>
                <button type="button" onClick={() => setShowGroupModal(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!grpName.trim()) return;
                  onCreateGroup({
                    name: grpName.trim(),
                    category: grpCategory.trim() || (lang === 'ar' ? 'مجتمع' : 'Community'),
                    coverUrl: ASSETS.coverSunset,
                    description: grpDesc.trim(),
                  });
                  setGrpName('');
                  setGrpCategory('');
                  setGrpDesc('');
                  setShowGroupModal(false);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={grpName}
                  onChange={(e) => setGrpName(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المجموعة' : 'Group Name'}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <input
                  type="text"
                  value={grpCategory}
                  onChange={(e) => setGrpCategory(e.target.value)}
                  placeholder={lang === 'ar' ? 'التصنيف' : 'Category'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <textarea
                  value={grpDesc}
                  onChange={(e) => setGrpDesc(e.target.value)}
                  placeholder={lang === 'ar' ? 'وصف المجموعة' : 'Description'}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-teal-500 cursor-pointer"
                >
                  {t.confirm}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'saved') {
    const savedPosts = posts.filter((p) => p.isSaved);
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-pink-500" />
          <span>{t.saved}</span>
        </h1>
        {savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500">
            {lang === 'ar'
              ? 'لم تقم بحفظ أي منشورات بعد. يمكنك الحفظ من قائمة النقاط الثلاث.'
              : 'No saved posts yet. Save posts from the 3-dot menu.'}
          </div>
        ) : (
          savedPosts.map((p) => (
            <PostCard
              key={p.id}
              lang={lang}
              post={p}
              currentUser={currentUser}
              onReact={onReact}
              onAddComment={onAddComment}
              onShare={onShare}
              onToggleSave={onToggleSave}
              onEditPost={onEditPost}
              onChangePrivacy={onChangePrivacy}
              onRequestDelete={onRequestDelete}
            />
          ))
        )}
      </div>
    );
  }

  if (activeTab === 'memories' || activeTab === 'pages') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          {activeTab === 'memories' ? (
            <Clock className="w-10 h-10 text-pink-500 mx-auto" />
          ) : (
            <Flag className="w-10 h-10 text-cyan-500 mx-auto" />
          )}
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeTab === 'memories' ? t.memories : t.pages}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {activeTab === 'memories'
              ? lang === 'ar'
                ? 'استعد أجمل لحظاتك ومنشوراتك السابقة على منصة تواصل.'
                : 'Relive your favorite past moments and shared posts on Tawasol.'
              : lang === 'ar'
                ? 'استكشف الصفحات الرسمية للعلامات التجارية والمبدعين على تواصل.'
                : 'Discover verified brand pages and creators on Tawasol.'}
          </p>
        </div>
      </div>
    );
  }

  if (activeTab.startsWith('custom_')) {
    const featId = activeTab.replace('custom_', '');
    const feat = customFeatures.find((f) => f.id === featId);
    if (feat) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'ar' ? feat.titleAr : feat.titleEn}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'ar' ? feat.descriptionAr : feat.descriptionEn}
            </p>
          </div>
        </div>
      );
    }
  }

  return null;
};
