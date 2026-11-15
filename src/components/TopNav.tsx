import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Film,
  Globe,
  Grid,
  Home,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Shield,
  Store,
  Sun,
  Table2,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  ActiveTab,
  CustomFeature,
  GroupItem,
  Language,
  MarketplaceItem,
  NotificationItem,
  PostItem,
  SearchFilter,
  ThemeMode,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { Avatar } from './Avatar';
import { LOGO_SRC } from '../data/seedData';

interface TopNavProps {
  lang: Language;
  theme: ThemeMode;
  currentUser: UserAccount;
  isAdminSession: boolean;
  activeTab: ActiveTab;
  searchQuery: string;
  searchFilter: SearchFilter;
  searchHistory: string[];
  pendingRequestsCount: number;
  unreadNotificationsCount: number;
  notifications: NotificationItem[];
  customNavFeatures: CustomFeature[];
  users: UserAccount[];
  posts: PostItem[];
  groups: GroupItem[];
  marketplace: MarketplaceItem[];
  isSheetsConnected: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onSearchChange: (q: string) => void;
  onSearchFilterChange: (f: SearchFilter) => void;
  onCommitSearch: (q: string) => void;
  onClearSearchHistory: () => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onOpenMessenger: () => void;
  onMarkAllRead: () => void;
  onOpenSheetsModal: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  lang,
  theme,
  currentUser,
  isAdminSession,
  activeTab,
  searchQuery,
  searchFilter,
  searchHistory,
  pendingRequestsCount,
  unreadNotificationsCount,
  notifications,
  customNavFeatures,
  users,
  posts,
  groups,
  marketplace,
  isSheetsConnected,
  onSelectTab,
  onSearchChange,
  onSearchFilterChange,
  onCommitSearch,
  onClearSearchHistory,
  onToggleLang,
  onToggleTheme,
  onOpenMessenger,
  onMarkAllRead,
  onOpenSheetsModal,
  onLogout,
}) => {
  const t = getT(lang);
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMenu, setOpenMenu] = useState<'none' | 'grid' | 'notifications' | 'profile'>('none');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
        setOpenMenu('none');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filters: { id: SearchFilter; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'posts', label: t.filterPosts },
    { id: 'people', label: t.filterPeople },
    { id: 'photos', label: t.filterPhotos },
    { id: 'videos', label: t.filterVideos },
    { id: 'groups', label: t.filterGroups },
    { id: 'marketplace', label: t.filterMarketplace },
  ];

  const q = searchQuery.trim().toLowerCase();
  const matchedUsers = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedPosts = q
    ? posts
        .filter((p) => {
          if (searchFilter === 'photos' && !p.imageUrl) return false;
          if (searchFilter === 'videos' && !p.videoLabel) return false;
          return p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
        })
        .slice(0, 3)
    : [];
  const matchedGroups = q
    ? groups.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 2)
    : [];
  const matchedMarket = q
    ? marketplace.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 2)
    : [];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-5 h-5" /> },
    {
      id: 'friends',
      label: t.navFriends,
      icon: <UserCheck className="w-5 h-5" />,
      badge: pendingRequestsCount,
    },
    { id: 'videos', label: t.navVideos, icon: <Film className="w-5 h-5" /> },
    { id: 'marketplace', label: t.navMarketplace, icon: <Store className="w-5 h-5" /> },
    { id: 'groups', label: t.navGroups, icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left/Start Zone: Logo + Search */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              onSelectTab('home');
              setOpenMenu('none');
            }}
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            title={t.navHome}
          >
            <img
              src={LOGO_SRC}
              alt={t.brand}
              referrerPolicy="no-referrer"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden xl:inline-block text-xl font-extrabold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
              {t.brand}
            </span>
          </button>

          {/* Search Input + Live Dropdown */}
          <div className="relative w-44 sm:w-64 md:w-72">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-transparent focus-within:border-cyan-400 focus-within:bg-white dark:focus-within:bg-slate-900 transition">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onCommitSearch(searchQuery.trim());
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchFocused && (
              <div className="absolute top-11 start-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-3 z-50">
                {/* Filter Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSearchFilterChange(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        searchFilter === f.id
                          ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Live Search Matches */}
                {q ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(searchFilter === 'all' || searchFilter === 'people') &&
                      matchedUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onCommitSearch(u.name);
                            onSelectTab('friends');
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                        >
                          <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{u.city}</p>
                          </div>
                        </button>
                      ))}

                    {(searchFilter === 'all' ||
                      searchFilter === 'posts' ||
                      searchFilter === 'photos' ||
                      searchFilter === 'videos') &&
                      matchedPosts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onCommitSearch(searchQuery);
                            onSelectTab('home');
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                        >
                          <Search className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {p.authorName}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.content}</p>
                          </div>
                        </button>
                      ))}

                    {(searchFilter === 'all' || searchFilter === 'groups') &&
                      matchedGroups.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            onSelectTab('groups');
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-pink-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {g.name}
                          </span>
                        </button>
                      ))}

                    {(searchFilter === 'all' || searchFilter === 'marketplace') &&
                      matchedMarket.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onSelectTab('marketplace');
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                        >
                          <Store className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {m.title}
                          </span>
                        </button>
                      ))}

                    {matchedUsers.length === 0 &&
                      matchedPosts.length === 0 &&
                      matchedGroups.length === 0 &&
                      matchedMarket.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-4">
                          {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.recentSearches}
                      </span>
                      {searchHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={onClearSearchHistory}
                          className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.clearHistory}</span>
                        </button>
                      )}
                    </div>
                    {searchHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 px-1 py-2">
                        {lang === 'ar' ? 'لا يوجد سجل بحث بعد' : 'No recent searches yet'}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {searchHistory.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onSearchChange(item)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{item}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Zone: Primary Facebook-Style Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 h-full">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`relative h-12 px-4 lg:px-7 flex items-center justify-center rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-pink-600 dark:text-cyan-400 bg-pink-500/8 dark:bg-cyan-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-1.5 end-2 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                ) : null}
                {active && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500" />
                )}
              </button>
            );
          })}
          {customNavFeatures
            .filter((f) => f.isEnabled)
            .map((feat) => {
              const tabKey: ActiveTab = `custom_${feat.id}`;
              const active = activeTab === tabKey;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => onSelectTab(tabKey)}
                  className={`relative h-12 px-4 flex items-center gap-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-teal-600 dark:text-cyan-300 bg-cyan-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{lang === 'ar' ? feat.titleAr : feat.titleEn}</span>
                </button>
              );
            })}
        </nav>

        {/* Right/End Zone: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Language Switch */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            className="h-9 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/15 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Globe className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-500/15 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-pink-500" />
            )}
          </button>

          {/* Apps Grid Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'grid' ? 'none' : 'grid')}
              title={t.menuGrid}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              <Grid className="w-4 h-4" />
            </button>

            {openMenu === 'grid' && (
              <div className="absolute top-12 end-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50">
                <p className="text-xs font-bold text-slate-900 dark:text-white px-2 pt-1">
                  {t.shortcuts}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('saved');
                      setOpenMenu('none');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-500/10 text-xs font-semibold text-start cursor-pointer"
                  >
                    {t.saved}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('memories');
                      setOpenMenu('none');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-500/10 text-xs font-semibold text-start cursor-pointer"
                  >
                    {t.memories}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('pages');
                      setOpenMenu('none');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-500/10 text-xs font-semibold text-start cursor-pointer"
                  >
                    {t.pages}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSheetsModal();
                      setOpenMenu('none');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-start cursor-pointer"
                  >
                    Google Sheets
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messenger */}
          <button
            type="button"
            onClick={() => {
              setOpenMenu('none');
              onOpenMessenger();
            }}
            title={t.messenger}
            className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/15 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === 'notifications' ? 'none' : 'notifications')
              }
              title={t.notifications}
              className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-500/15 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-pink-500" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {openMenu === 'notifications' && (
              <div className="absolute top-12 end-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.notifications}
                  </span>
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {t.markAllRead}
                  </button>
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs transition ${
                        n.isRead
                          ? 'bg-transparent text-slate-600 dark:text-slate-400'
                          : 'bg-cyan-500/10 text-slate-900 dark:text-white font-semibold'
                      }`}
                    >
                      <p>{lang === 'ar' ? n.titleAr : n.titleEn}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'profile' ? 'none' : 'profile')}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
            >
              <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
            </button>

            {openMenu === 'profile' && (
              <div className="absolute top-12 end-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('profile');
                    setOpenMenu('none');
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start cursor-pointer"
                >
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-teal-600 dark:text-cyan-400">{t.viewProfile}</p>
                  </div>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('settings');
                    setOpenMenu('none');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>{t.settingsPrivacy}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenSheetsModal();
                    setOpenMenu('none');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Table2 className="w-4 h-4 text-emerald-500" />
                    <span>{t.googleSheetsSync}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {isSheetsConnected ? (lang === 'ar' ? 'متصل' : 'Linked') : lang === 'ar' ? 'ربط' : 'Link'}
                  </span>
                </button>

                {isAdminSession && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('admin');
                      setOpenMenu('none');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 hover:bg-pink-500/15 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{t.adminStudio}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Compact Bottom Tab Strip inside TopNav area (keeps sticky header compact <= 15% viewport) */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 dark:border-slate-800 px-2 py-1">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative p-2 rounded-xl transition cursor-pointer ${
                active
                  ? 'text-pink-600 dark:text-cyan-400 bg-pink-500/10'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-0.5 end-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
};
