import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  Camera,
  Clock,
  Edit3,
  Film,
  Image as ImageIcon,
  MapPin,
  Plus,
  Users,
  X,
} from 'lucide-react';
import {
  ActivityLogItem,
  CommentItem,
  Language,
  PostItem,
  PrivacyLevel,
  ReactionType,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { ASSETS } from '../data/seedData';

interface ProfilePageProps {
  lang: Language;
  currentUser: UserAccount;
  users: UserAccount[];
  posts: PostItem[];
  activityLog: ActivityLogItem[];
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onOpenCreateStory: () => void;
  onReact: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, comment: Omit<CommentItem, 'id' | 'createdAt'>) => void;
  onShare: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onEditPost: (postId: string, newContent: string) => void;
  onChangePrivacy: (postId: string, privacy: PrivacyLevel) => void;
  onRequestDelete: (postId: string) => void;
  onCreatePost: (post: Omit<PostItem, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount'>) => void;
  onOpenChatWithUser: (user: UserAccount) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  lang,
  currentUser,
  users,
  posts,
  activityLog,
  onUpdateProfile,
  onOpenCreateStory,
  onReact,
  onAddComment,
  onShare,
  onToggleSave,
  onEditPost,
  onChangePrivacy,
  onRequestDelete,
  onCreatePost,
  onOpenChatWithUser,
}) => {
  const t = getT(lang);
  const [subTab, setSubTab] = useState<'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'more'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editCity, setEditCity] = useState(currentUser.city);
  const [editWork, setEditWork] = useState(currentUser.work);
  const [quickPost, setQuickPost] = useState('');

  const myPosts = posts.filter((p) => p.authorId === currentUser.id);
  const friends = users.filter((u) => u.id !== currentUser.id);
  const photos = posts.filter((p) => p.imageUrl).map((p) => p.imageUrl!);

  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'avatarUrl' | 'coverUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ [field]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName.trim() || currentUser.name,
      bio: editBio.trim(),
      city: editCity.trim(),
      work: editWork.trim(),
    });
    setShowEditModal(false);
  };

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPost.trim()) return;
    onCreatePost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      authorVerified: currentUser.isVerified,
      content: quickPost.trim(),
      privacy: 'public',
    });
    setQuickPost('');
  };

  const tabs: { id: typeof subTab; label: string }[] = [
    { id: 'posts', label: t.tabPosts },
    { id: 'about', label: t.tabAbout },
    { id: 'friends', label: t.tabFriends },
    { id: 'photos', label: t.tabPhotos },
    { id: 'videos', label: t.tabVideos },
    { id: 'more', label: t.tabMore },
  ];

  return (
    <div className="pb-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          {/* Panoramic Cover */}
          <div className="relative h-56 sm:h-72 lg:h-80 w-full bg-gradient-to-r from-pink-500/20 via-cyan-500/20 to-teal-500/20 overflow-hidden sm:rounded-b-2xl">
            <img
              src={currentUser.coverUrl || ASSETS.coverSunset}
              alt="Cover"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <label className="absolute bottom-3 end-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-xs font-bold text-slate-900 dark:text-white shadow-md hover:bg-white cursor-pointer">
              <Camera className="w-4 h-4 text-pink-500" />
              <span>{lang === 'ar' ? 'تغيير الغلاف' : 'Edit Cover'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileChange(e, 'coverUrl')}
                className="hidden"
              />
            </label>
          </div>

          {/* Identity + Actions Row */}
          <div className="px-4 sm:px-8 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative inline-block w-fit">
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="xl" />
                  <label
                    title={lang === 'ar' ? 'تغيير الصورة' : 'Change photo'}
                    className="absolute bottom-1 end-1 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-pink-500 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'avatarUrl')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pb-1 space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                    {currentUser.bio}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>
                      {friends.length} {t.friendsCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {currentUser.followersCount} {t.followersCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={onOpenCreateStory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addStory}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditBio(currentUser.bio);
                    setEditCity(currentUser.city);
                    setEditWork(currentUser.work);
                    setShowEditModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{t.editProfile}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowActivityModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.activityLog}</span>
                </button>
              </div>
            </div>

            {/* Horizontal Navigation Tabs */}
            <div className="mt-5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubTab(tab.id)}
                  className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                    subTab === tab.id
                      ? 'text-pink-600 dark:text-cyan-400 bg-pink-500/8 dark:bg-cyan-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dual-Column Profile Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-5">
        {subTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Intro & Previews */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.intro}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center py-2 border-b border-slate-100 dark:border-slate-800">
                  {currentUser.bio}
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>
                      {t.worksAt} <strong>{currentUser.work}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
                    <span>
                      {t.livesIn} <strong>{currentUser.city}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>
                      {t.joinedOn} {new Date(currentUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos Grid Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.tabPhotos}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSubTab('photos')}
                    className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {t.seeMore}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                  {photos.slice(0, 6).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Gallery"
                      referrerPolicy="no-referrer"
                      className="aspect-square w-full object-cover"
                    />
                  ))}
                </div>
              </div>

              {/* Friends Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.tabFriends}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSubTab('friends')}
                    className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {t.seeMore}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {friends.slice(0, 6).map((fr) => (
                    <button
                      key={fr.id}
                      type="button"
                      onClick={() => onOpenChatWithUser(fr)}
                      className="text-start space-y-1 cursor-pointer group"
                    >
                      <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Avatar name={fr.name} src={fr.avatarUrl} size="lg" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-pink-500">
                        {fr.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right User Feed */}
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleQuickPostSubmit}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3"
              >
                <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
                <input
                  type="text"
                  value={quickPost}
                  onChange={(e) => setQuickPost(e.target.value)}
                  placeholder={`${t.whatsOnMind} ${currentUser.name.split(' ')[0]}؟`}
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
                >
                  {t.publishPost}
                </button>
              </form>

              {myPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    {lang === 'ar'
                      ? 'لا توجد منشورات خاصة بك بعد. شارك أول منشور!'
                      : 'No posts yet. Share your first update!'}
                  </p>
                </div>
              ) : (
                myPosts.map((p) => (
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
          </div>
        )}

        {subTab === 'about' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.tabAbout}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500">{t.fullName}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{currentUser.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500">{t.worksAt}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{currentUser.work}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500">{t.livesIn}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{currentUser.city}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500">{t.dob}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {currentUser.dob}
                </p>
              </div>
            </div>
          </div>
        )}

        {subTab === 'friends' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              <span>
                {t.tabFriends} ({friends.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((fr) => (
                <div
                  key={fr.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={fr.name} src={fr.avatarUrl} size="md" isOnline={fr.isOnline} />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{fr.name}</p>
                      <p className="text-xs text-slate-500">{fr.city}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChatWithUser(fr)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-teal-700 dark:text-cyan-300 cursor-pointer"
                  >
                    {t.messenger}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {subTab === 'photos' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-500" />
              <span>{t.tabPhotos}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Photo"
                  referrerPolicy="no-referrer"
                  className="aspect-4/3 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {(subTab === 'videos' || subTab === 'more') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <Film className="w-8 h-8 text-cyan-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {subTab === 'videos' ? t.tabVideos : t.tabMore}
            </p>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'تم جمع جميع الأنشطة والذكريات في ملفك الشخصي.'
                : 'Your highlights and media archives are synced here.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.editProfile}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.intro}
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.livesIn}
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.worksAt}
                </label>
                <input
                  type="text"
                  value={editWork}
                  onChange={(e) => setEditWork(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.activityLog}
              </h3>
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-80 overflow-y-auto space-y-2.5">
              {activityLog.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  {lang === 'ar' ? 'لا يوجد نشاط مسجل بعد' : 'No recorded activity yet'}
                </p>
              ) : (
                activityLog.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {lang === 'ar' ? act.actionAr : act.actionEn}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
