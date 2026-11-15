import React, { useEffect, useState } from 'react';
import {
  ActiveTab,
  ActivityLogItem,
  ChatMessage,
  CommentItem,
  CustomFeature,
  FriendRequest,
  GoogleSheetsConfig,
  GroupItem,
  Language,
  MarketplaceItem,
  NotificationItem,
  PostItem,
  PrivacyLevel,
  PrivacySettings,
  ReactionType,
  ReelItem,
  SearchFilter,
  StoryItem,
  ThemeMode,
  UserAccount,
} from './types';
import {
  ASSETS,
  INITIAL_CUSTOM_FEATURES,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_GROUPS,
  INITIAL_MARKETPLACE,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_REELS,
  INITIAL_STORIES,
  INITIAL_USERS,
} from './data/seedData';
import {
  createTawasolSpreadsheet,
  googleSignInForSheets,
  googleSignOut,
  initGoogleAuth,
  inspectSpreadsheet,
  readSheetPreview,
  syncAllToGoogleSheets,
} from './services/googleSheets';
import {
  DEFAULT_APPS_SCRIPT_URL,
  pingAppsScript,
  postToAppsScript,
  pullFromAppsScript,
} from './services/appsScriptDb';
import { AuthPage } from './components/AuthPage';
import { TopNav } from './components/TopNav';
import { NewsFeed } from './components/NewsFeed';
import { ProfilePage } from './components/ProfilePage';
import { SecondaryViews } from './components/SecondaryViews';
import { SettingsPage } from './components/SettingsPage';
import { AdminPanel } from './components/AdminPanel';
import { MessengerAndOverlays } from './components/MessengerAndOverlays';

const STORAGE_KEYS = {
  lang: 'tawasol_lang',
  theme: 'tawasol_theme',
  users: 'tawasol_users_v1',
  posts: 'tawasol_posts_v1',
  stories: 'tawasol_stories_v1',
  reels: 'tawasol_reels_v1',
  requests: 'tawasol_requests_v1',
  marketplace: 'tawasol_marketplace_v1',
  groups: 'tawasol_groups_v1',
  messages: 'tawasol_messages_v1',
  notifications: 'tawasol_notifications_v1',
  features: 'tawasol_custom_features_v1',
  privacy: 'tawasol_privacy_v1',
  searchHistory: 'tawasol_search_history_v1',
  activity: 'tawasol_activity_v1',
  sheetsMeta: 'tawasol_sheets_meta_v1',
  sessionUserId: 'tawasol_session_user_id',
  isAdmin: 'tawasol_session_admin',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => loadJson(STORAGE_KEYS.lang, 'ar'));
  const [theme, setTheme] = useState<ThemeMode>(() => loadJson(STORAGE_KEYS.theme, 'light'));

  const [users, setUsers] = useState<UserAccount[]>(() => loadJson(STORAGE_KEYS.users, INITIAL_USERS));
  const [posts, setPosts] = useState<PostItem[]>(() => loadJson(STORAGE_KEYS.posts, INITIAL_POSTS));
  const [stories, setStories] = useState<StoryItem[]>(() =>
    loadJson(STORAGE_KEYS.stories, INITIAL_STORIES)
  );
  const [reels, setReels] = useState<ReelItem[]>(() => loadJson(STORAGE_KEYS.reels, INITIAL_REELS));
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() =>
    loadJson(STORAGE_KEYS.requests, INITIAL_FRIEND_REQUESTS)
  );
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>(() =>
    loadJson(STORAGE_KEYS.marketplace, INITIAL_MARKETPLACE)
  );
  const [groups, setGroups] = useState<GroupItem[]>(() =>
    loadJson(STORAGE_KEYS.groups, INITIAL_GROUPS)
  );
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() =>
    loadJson(STORAGE_KEYS.messages, INITIAL_MESSAGES)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadJson(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS)
  );
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>(() =>
    loadJson(STORAGE_KEYS.features, INITIAL_CUSTOM_FEATURES)
  );
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() =>
    loadJson(STORAGE_KEYS.privacy, {
      defaultPostPrivacy: 'public',
      whoCanFindByContact: 'everyone',
      profileLocked: false,
      prioritizeFriendsFeed: true,
      hideSponsored: false,
    })
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    loadJson(STORAGE_KEYS.searchHistory, ['سارة المنصور', 'تصميم', 'سماعات'])
  );
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>(() =>
    loadJson(STORAGE_KEYS.activity, [])
  );
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = loadJson<GoogleSheetsConfig>(STORAGE_KEYS.sheetsMeta, {
      spreadsheetId: '',
      spreadsheetUrl: '',
      spreadsheetTitle: '',
      sheetTabs: [],
      lastSyncedAt: null,
      autoSync: true,
      connectedEmail: null,
      appsScriptUrl: DEFAULT_APPS_SCRIPT_URL,
    });
    return {
      ...saved,
      appsScriptUrl: saved.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL,
    };
  });
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking' | 'error'>('checking');

  // Auth & Navigation State
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.sessionUserId)
  );
  const [isAdminSession, setIsAdminSession] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEYS.isAdmin) === 'true'
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

  // Google Sheets OAuth State (token kept strictly in memory via googleSheets.ts)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);
  const [sheetsBusy, setSheetsBusy] = useState(false);
  const [sheetsError, setSheetsError] = useState('');
  const [sheetsPreviewRows, setSheetsPreviewRows] = useState<string[][]>([]);

  // Overlays & Modals State
  const [messengerOpen, setMessengerOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<UserAccount | null>(null);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [liveVideoOpen, setLiveVideoOpen] = useState(false);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);

  // Sync HTML dir/lang & dark class
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  // Persist domain states cleanly
  useEffect(() => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories)), [stories]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.reels, JSON.stringify(reels)), [reels]);
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(friendRequests)),
    [friendRequests]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.marketplace, JSON.stringify(marketplace)),
    [marketplace]
  );
  useEffect(() => localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups)), [groups]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages)), [messages]);
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications)),
    [notifications]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.features, JSON.stringify(customFeatures)),
    [customFeatures]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.privacy, JSON.stringify(privacySettings)),
    [privacySettings]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(searchHistory)),
    [searchHistory]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activityLog)),
    [activityLog]
  );
  useEffect(
    () => localStorage.setItem(STORAGE_KEYS.sheetsMeta, JSON.stringify(sheetsConfig)),
    [sheetsConfig]
  );

  // Firebase Auth state listener for Google Sheets access
  useEffect(() => {
    const unsub = initGoogleAuth(
      (user) => {
        setIsGoogleConnected(true);
        setGoogleEmail(user.email || null);
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleEmail(null);
      }
    );
    return () => unsub();
  }, []);

  // Auto-connect and pull live Google Sheets data via Apps Script URL on startup
  useEffect(() => {
    const url = sheetsConfig.appsScriptUrl;
    if (!url) {
      setDbStatus('error');
      return;
    }
    let cancelled = false;
    setDbStatus('checking');
    pullFromAppsScript(url)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setDbStatus('connected');
          if (res.users && res.users.length > 0) {
            setUsers((prev) => {
              const map = new Map<string, UserAccount>();
              prev.forEach((u) => map.set(u.contact.toLowerCase(), u));
              res.users!.forEach((u) => map.set(u.contact.toLowerCase(), u));
              return Array.from(map.values());
            });
          }
          if (res.posts && res.posts.length > 0) {
            setPosts((prev) => {
              const map = new Map<string, PostItem>();
              prev.forEach((p) => map.set(p.id, p));
              res.posts!.forEach((p) => map.set(p.id, p));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
          if (res.customFeatures && res.customFeatures.length > 0) {
            setCustomFeatures(res.customFeatures);
          }
          setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
        } else {
          setDbStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setDbStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [sheetsConfig.appsScriptUrl]);

  const recordActivity = (actionAr: string, actionEn: string) => {
    setActivityLog((prev) => [
      { id: `act_${Date.now()}`, actionAr, actionEn, timestamp: new Date().toISOString() },
      ...prev.slice(0, 40),
    ]);
  };

  // Current User resolution (Admin uses a privileged session profile)
  const adminAccount: UserAccount = {
    id: 'u_admin',
    name: lang === 'ar' ? 'مدير النظام (آيسل)' : 'System Admin',
    contact: 'admin',
    contactType: 'email',
    passwordHash: 'admin_session',
    dob: '1995-01-01',
    gender: 'male',
    bio: lang === 'ar' ? 'الحساب الإداري السري لمنصة تواصل' : 'Tawasol Secret Admin Studio',
    city: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
    work: 'شركة آيسل',
    followersCount: 9999,
    friendsIds: users.map((u) => u.id),
    isOnline: true,
    isAdmin: true,
    isVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const currentUser = isAdminSession
    ? adminAccount
    : users.find((u) => u.id === currentUserId) || null;

  // Google Sheets & Google Sign-In Handler
  const handleConnectGoogle = async (autoLoginOnAuthPage = false) => {
    setSheetsError('');
    setSheetsBusy(true);
    try {
      const { user } = await googleSignInForSheets();
      setIsGoogleConnected(true);
      setGoogleEmail(user.email || null);
      setSheetsConfig((prev) => ({ ...prev, connectedEmail: user.email || null }));

      if (autoLoginOnAuthPage && user.email) {
        const existing = users.find(
          (u) => u.contact.toLowerCase() === user.email!.toLowerCase()
        );
        if (existing) {
          handleLoginSuccess(existing);
        } else {
          const newGoogleUser: UserAccount = {
            id: `u_g_${Date.now()}`,
            name: user.displayName || user.email.split('@')[0],
            contact: user.email,
            contactType: 'email',
            passwordHash: 'google_oauth_user',
            dob: '2000-01-01',
            gender: 'other',
            avatarUrl: user.photoURL || undefined,
            coverUrl: ASSETS.coverSunset,
            bio:
              lang === 'ar'
                ? 'عضو في منصة تواصل ✨'
                : 'Member on Tawasol ✨',
            city: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
            work: lang === 'ar' ? 'مجتمع تواصل' : 'Tawasol Community',
            followersCount: 1,
            friendsIds: ['u_ahmed', 'u_sara'],
            isOnline: true,
            isAdmin: false,
            createdAt: new Date().toISOString(),
          };
          handleRegisterUser(newGoogleUser);
        }
      }
    } catch (err) {
      setSheetsError(
        err instanceof Error ? err.message : 'Could not complete Google authentication.'
      );
      throw err;
    } finally {
      setSheetsBusy(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setSheetsError('');
    setSheetsBusy(true);
    try {
      const created = await createTawasolSpreadsheet();
      setSheetsConfig({
        spreadsheetId: created.spreadsheetId,
        spreadsheetUrl: created.spreadsheetUrl,
        spreadsheetTitle: created.title,
        sheetTabs: created.tabs,
        lastSyncedAt: new Date().toISOString(),
        autoSync: false,
        connectedEmail: googleEmail,
      });
      await syncAllToGoogleSheets(created.spreadsheetId, users, posts, customFeatures);
      const preview = await readSheetPreview(created.spreadsheetId, 'Users');
      setSheetsPreviewRows(preview);
    } catch (err) {
      setSheetsError(err instanceof Error ? err.message : 'Failed to create Google Sheet');
    } finally {
      setSheetsBusy(false);
    }
  };

  const handleLinkSheetId = async (id: string) => {
    setSheetsError('');
    setSheetsBusy(true);
    try {
      const info = await inspectSpreadsheet(id);
      setSheetsConfig({
        spreadsheetId: id,
        spreadsheetUrl: info.spreadsheetUrl,
        spreadsheetTitle: info.title,
        sheetTabs: info.tabs,
        lastSyncedAt: null,
        autoSync: false,
        connectedEmail: googleEmail,
      });
      if (info.tabs.length > 0) {
        const preview = await readSheetPreview(id, info.tabs[0]);
        setSheetsPreviewRows(preview);
      }
    } catch (err) {
      setSheetsError(err instanceof Error ? err.message : 'Failed to inspect Spreadsheet ID');
    } finally {
      setSheetsBusy(false);
    }
  };

  const handlePushSyncToSheets = async () => {
    if (!sheetsConfig.spreadsheetId) return;
    setSheetsError('');
    setSheetsBusy(true);
    try {
      await syncAllToGoogleSheets(sheetsConfig.spreadsheetId, users, posts, customFeatures);
      setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      const preview = await readSheetPreview(sheetsConfig.spreadsheetId, 'Users');
      setSheetsPreviewRows(preview);
    } catch (err) {
      setSheetsError(err instanceof Error ? err.message : 'Failed to sync to Google Sheets');
    } finally {
      setSheetsBusy(false);
    }
  };

  const handlePreviewSheetTab = async (tab: string) => {
    if (!sheetsConfig.spreadsheetId) return;
    setSheetsBusy(true);
    setSheetsError('');
    try {
      const rows = await readSheetPreview(sheetsConfig.spreadsheetId, tab);
      setSheetsPreviewRows(rows);
    } catch (err) {
      setSheetsError(err instanceof Error ? err.message : 'Could not read tab');
    } finally {
      setSheetsBusy(false);
    }
  };

  // Apps Script Web App URL Handlers
  const handleSaveAppsScriptUrl = async (url: string) => {
    setSheetsError('');
    setSheetsBusy(true);
    setDbStatus('checking');
    try {
      const res = await pingAppsScript(url);
      if (!res.ok) throw new Error('Ping failed');
      setDbStatus('connected');
      setSheetsConfig((prev) => ({
        ...prev,
        appsScriptUrl: url,
        lastSyncedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setDbStatus('error');
      setSheetsError(
        err instanceof Error
          ? `Apps Script URL check failed: ${err.message}`
          : 'Failed to reach Apps Script Web App URL'
      );
    } finally {
      setSheetsBusy(false);
    }
  };

  const handlePushViaAppsScript = async () => {
    if (!sheetsConfig.appsScriptUrl) return;
    setSheetsError('');
    setSheetsBusy(true);
    try {
      const res = await postToAppsScript(sheetsConfig.appsScriptUrl, {
        action: 'syncAll',
        users,
        posts,
        customFeatures,
      });
      if (!res.ok) throw new Error(res.error || 'Sync error');
      setDbStatus('connected');
      setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
    } catch (err) {
      setDbStatus('error');
      setSheetsError(err instanceof Error ? err.message : 'Failed to push data via Apps Script');
    } finally {
      setSheetsBusy(false);
    }
  };

  const handlePullViaAppsScript = async () => {
    if (!sheetsConfig.appsScriptUrl) return;
    setSheetsError('');
    setSheetsBusy(true);
    try {
      const res = await pullFromAppsScript(sheetsConfig.appsScriptUrl);
      if (!res.ok) throw new Error('Pull failed');
      setDbStatus('connected');
      if (res.users && res.users.length > 0) setUsers(res.users);
      if (res.posts && res.posts.length > 0) setPosts(res.posts);
      if (res.customFeatures) setCustomFeatures(res.customFeatures);
      setSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
    } catch (err) {
      setDbStatus('error');
      setSheetsError(err instanceof Error ? err.message : 'Failed to pull data from Apps Script');
    } finally {
      setSheetsBusy(false);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setIsAdminSession(false);
    setCurrentUserId(user.id);
    localStorage.setItem(STORAGE_KEYS.sessionUserId, user.id);
    localStorage.removeItem(STORAGE_KEYS.isAdmin);
    setActiveTab('home');
  };

  const handleAdminLogin = () => {
    setIsAdminSession(true);
    setCurrentUserId('u_admin');
    localStorage.setItem(STORAGE_KEYS.isAdmin, 'true');
    localStorage.setItem(STORAGE_KEYS.sessionUserId, 'u_admin');
    setActiveTab('admin');
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers((prev) => [newUser, ...prev]);
    handleLoginSuccess(newUser);
    recordActivity(`إنشاء حساب جديد باسم ${newUser.name}`, `Registered new account: ${newUser.name}`);
    if (sheetsConfig.appsScriptUrl) {
      postToAppsScript(sheetsConfig.appsScriptUrl, { action: 'addUser', user: newUser }).catch(() => {});
    }
  };

  const handleUpdateUserPassword = (contact: string, newHash: string) => {
    let updated = false;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.contact.toLowerCase() === contact.toLowerCase()) {
          updated = true;
          return { ...u, passwordHash: newHash };
        }
        return u;
      })
    );
    return updated;
  };

  const handleLogout = async () => {
    setCurrentUserId(null);
    setIsAdminSession(false);
    localStorage.removeItem(STORAGE_KEYS.sessionUserId);
    localStorage.removeItem(STORAGE_KEYS.isAdmin);
    setMessengerOpen(false);
    if (isGoogleConnected) {
      await googleSignOut().catch(() => {});
    }
  };

  const handleLookupRemoteUser = async (contact: string): Promise<UserAccount | null> => {
    if (!sheetsConfig.appsScriptUrl) return null;
    try {
      const res = await pullFromAppsScript(sheetsConfig.appsScriptUrl);
      if (res.ok && res.users && res.users.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, UserAccount>();
          prev.forEach((u) => map.set(u.contact.toLowerCase(), u));
          res.users!.forEach((u) => map.set(u.contact.toLowerCase(), u));
          return Array.from(map.values());
        });
        return (
          res.users.find((u) => u.contact.toLowerCase() === contact.toLowerCase()) || null
        );
      }
    } catch {
      return null;
    }
    return null;
  };

  if (!currentUser) {
    return (
      <AuthPage
        lang={lang}
        theme={theme}
        users={users}
        googleConnectedEmail={googleEmail}
        onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
        onToggleTheme={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
        onLoginSuccess={handleLoginSuccess}
        onAdminLogin={handleAdminLogin}
        onRegisterUser={handleRegisterUser}
        onUpdateUserPassword={handleUpdateUserPassword}
        onGoogleConnect={() => handleConnectGoogle(true)}
        onLookupRemoteUser={handleLookupRemoteUser}
      />
    );
  }

  // Feed & Interactions Handlers
  const handleCreatePost = (
    draft: Omit<PostItem, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount'>
  ) => {
    const newPost: PostItem = {
      ...draft,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      reactions: {},
      comments: [],
      sharesCount: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    recordActivity('نشر منشور جديد في موجز الأخبار', 'Published a new post');
    if (sheetsConfig.appsScriptUrl) {
      postToAppsScript(sheetsConfig.appsScriptUrl, { action: 'addPost', post: newPost }).catch(() => {});
    }
  };

  const handleReact = (postId: string, reaction: ReactionType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextReactions = { ...p.reactions };
        if (nextReactions[currentUser.id] === reaction) {
          delete nextReactions[currentUser.id];
        } else {
          nextReactions[currentUser.id] = reaction;
        }
        return { ...p, reactions: nextReactions };
      })
    );
    if (sheetsConfig.appsScriptUrl) {
      postToAppsScript(sheetsConfig.appsScriptUrl, {
        action: 'addInteraction',
        interaction: {
          postId,
          type: 'reaction',
          actorId: currentUser.id,
          actorName: currentUser.name,
          value: reaction,
          createdAt: new Date().toISOString(),
        },
      }).catch(() => {});
    }
  };

  const handleAddComment = (
    postId: string,
    commentDraft: Omit<CommentItem, 'id' | 'createdAt'>
  ) => {
    const newComment: CommentItem = {
      ...commentDraft,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
    recordActivity('إضافة تعليق على منشور', 'Commented on a post');
    if (sheetsConfig.appsScriptUrl) {
      postToAppsScript(sheetsConfig.appsScriptUrl, {
        action: 'addInteraction',
        interaction: {
          postId,
          type: 'comment',
          actorId: currentUser.id,
          actorName: currentUser.name,
          value: newComment.text,
          createdAt: newComment.createdAt,
        },
      }).catch(() => {});
    }
  };

  const handleShare = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
    recordActivity('مشاركة منشور', 'Shared a post');
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p)));
  };

  const handleEditPost = (postId: string, newContent: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p)));
  };

  const handleChangePrivacy = (postId: string, privacy: PrivacyLevel) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, privacy } : p)));
  };

  const handleConfirmDeletePost = () => {
    if (!pendingDeletePostId) return;
    setPosts((prev) => prev.filter((p) => p.id !== pendingDeletePostId));
    setPendingDeletePostId(null);
  };

  const handlePublishStory = (caption: string, imageUrl?: string, gradient?: string) => {
    const newStory: StoryItem = {
      id: `st_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      imageUrl,
      gradient,
      caption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
    setStories((prev) => [newStory, ...prev]);
    recordActivity('نشر قصة جديدة', 'Shared a 24h story');
  };

  const handleUpdateProfile = (updates: Partial<UserAccount>) => {
    if (isAdminSession) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
    recordActivity('تحديث بيانات الملف الشخصي', 'Updated profile details');
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    const msg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), msg],
    }));
  };

  const customNavFeatures = customFeatures.filter((f) => f.type === 'nav_tab');
  const viewingStory = stories.find((s) => s.id === viewingStoryId) || null;
  const playingReel = reels.find((r) => r.id === playingReelId) || null;

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <TopNav
        lang={lang}
        theme={theme}
        currentUser={currentUser}
        isAdminSession={isAdminSession}
        activeTab={activeTab}
        searchQuery={searchQuery}
        searchFilter={searchFilter}
        searchHistory={searchHistory}
        pendingRequestsCount={friendRequests.length}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        notifications={notifications}
        customNavFeatures={customNavFeatures}
        users={users}
        posts={posts}
        groups={groups}
        marketplace={marketplace}
        isSheetsConnected={
          (isGoogleConnected && Boolean(sheetsConfig.spreadsheetId)) ||
          Boolean(sheetsConfig.appsScriptUrl)
        }
        onSelectTab={setActiveTab}
        onSearchChange={setSearchQuery}
        onSearchFilterChange={setSearchFilter}
        onCommitSearch={(q) =>
          setSearchHistory((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8))
        }
        onClearSearchHistory={() => setSearchHistory([])}
        onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
        onToggleTheme={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
        onOpenMessenger={() => {
          setMessengerOpen(true);
          if (!activeChatUser && users.length > 1) {
            const firstFriend = users.find((u) => u.id !== currentUser.id) || null;
            setActiveChatUser(firstFriend);
          }
        }}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        }
        onOpenSheetsModal={() => setSheetsModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="pb-16">
        {activeTab === 'home' && (
          <NewsFeed
            lang={lang}
            currentUser={currentUser}
            users={users}
            posts={posts}
            stories={stories}
            reels={reels}
            customFeatures={customFeatures}
            privacySettings={privacySettings}
            searchQuery={searchQuery}
            searchFilter={searchFilter}
            onSelectTab={setActiveTab}
            onCreatePost={handleCreatePost}
            onReact={handleReact}
            onAddComment={handleAddComment}
            onShare={handleShare}
            onToggleSave={handleToggleSave}
            onEditPost={handleEditPost}
            onChangePrivacy={handleChangePrivacy}
            onRequestDelete={(id) => setPendingDeletePostId(id)}
            onOpenStoryViewer={(id) => setViewingStoryId(id)}
            onOpenCreateStory={() => setCreateStoryOpen(true)}
            onOpenReelPlayer={(id) => setPlayingReelId(id)}
            onOpenLiveVideo={() => setLiveVideoOpen(true)}
            onOpenChatWithUser={(u) => {
              setActiveChatUser(u);
              setMessengerOpen(true);
            }}
            onSendBirthdayWish={(friend, wish) => {
              handleSendMessage(friend.id, `🎂 ${wish}`);
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            lang={lang}
            currentUser={currentUser}
            users={users}
            posts={posts}
            activityLog={activityLog}
            onUpdateProfile={handleUpdateProfile}
            onOpenCreateStory={() => setCreateStoryOpen(true)}
            onReact={handleReact}
            onAddComment={handleAddComment}
            onShare={handleShare}
            onToggleSave={handleToggleSave}
            onEditPost={handleEditPost}
            onChangePrivacy={handleChangePrivacy}
            onRequestDelete={(id) => setPendingDeletePostId(id)}
            onCreatePost={handleCreatePost}
            onOpenChatWithUser={(u) => {
              setActiveChatUser(u);
              setMessengerOpen(true);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            lang={lang}
            currentUser={currentUser}
            privacySettings={privacySettings}
            sheetsConfig={sheetsConfig}
            isGoogleConnected={isGoogleConnected}
            onUpdateProfile={handleUpdateProfile}
            onUpdatePassword={(newHash) => handleUpdateUserPassword(currentUser.contact, newHash)}
            onUpdatePrivacy={(upd) => setPrivacySettings((p) => ({ ...p, ...upd }))}
            onClearSearchHistory={() => setSearchHistory([])}
            onOpenSheetsModal={() => setSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && isAdminSession && (
          <AdminPanel
            lang={lang}
            users={users}
            posts={posts}
            customFeatures={customFeatures}
            sheetsConfig={sheetsConfig}
            isGoogleConnected={isGoogleConnected}
            dbStatus={dbStatus}
            dbBusy={sheetsBusy}
            dbError={sheetsError}
            onAddCustomFeature={(feat) => {
              const nextList = [
                { ...feat, id: `cf_${Date.now()}`, createdAt: new Date().toISOString() },
                ...customFeatures,
              ];
              setCustomFeatures(nextList);
              if (sheetsConfig.appsScriptUrl) {
                postToAppsScript(sheetsConfig.appsScriptUrl, {
                  action: 'syncAll',
                  users,
                  posts,
                  customFeatures: nextList,
                }).catch(() => {});
              }
            }}
            onToggleFeature={(id) =>
              setCustomFeatures((prev) =>
                prev.map((f) => (f.id === id ? { ...f, isEnabled: !f.isEnabled } : f))
              )
            }
            onDeleteFeature={(id) =>
              setCustomFeatures((prev) => prev.filter((f) => f.id !== id))
            }
            onToggleUserVerified={(uid) =>
              setUsers((prev) =>
                prev.map((u) => (u.id === uid ? { ...u, isVerified: !u.isVerified } : u))
              )
            }
            onDeleteUser={(uid) => setUsers((prev) => prev.filter((u) => u.id !== uid))}
            onDeletePost={(pid) => setPosts((prev) => prev.filter((p) => p.id !== pid))}
            onSaveAppsScriptUrl={handleSaveAppsScriptUrl}
            onPullViaAppsScript={handlePullViaAppsScript}
            onPushViaAppsScript={handlePushViaAppsScript}
            onOpenSheetsModal={() => setSheetsModalOpen(true)}
            onReturnToFeed={() => setActiveTab('home')}
          />
        )}

        {(activeTab === 'friends' ||
          activeTab === 'videos' ||
          activeTab === 'marketplace' ||
          activeTab === 'groups' ||
          activeTab === 'saved' ||
          activeTab === 'memories' ||
          activeTab === 'pages' ||
          activeTab.startsWith('custom_')) && (
          <SecondaryViews
            lang={lang}
            activeTab={activeTab}
            currentUser={currentUser}
            users={users}
            posts={posts}
            reels={reels}
            friendRequests={friendRequests}
            marketplace={marketplace}
            groups={groups}
            customFeatures={customFeatures}
            onAcceptFriendRequest={(req) => {
              setFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
              setUsers((prev) => [
                ...prev,
                {
                  id: req.fromId,
                  name: req.fromName,
                  contact: `${req.fromId}@tawasol.app`,
                  contactType: 'email',
                  passwordHash: 'demo_hash_123',
                  dob: '2000-05-10',
                  gender: 'male',
                  bio: lang === 'ar' ? 'صديق جديد على تواصل' : 'New friend on Tawasol',
                  city: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
                  work: lang === 'ar' ? 'عضو تواصل' : 'Tawasol Member',
                  followersCount: 120,
                  friendsIds: [currentUser.id],
                  isOnline: true,
                  createdAt: new Date().toISOString(),
                },
              ]);
            }}
            onDeclineFriendRequest={(id) =>
              setFriendRequests((prev) => prev.filter((r) => r.id !== id))
            }
            onOpenReelPlayer={(id) => setPlayingReelId(id)}
            onOpenChatWithUser={(u) => {
              setActiveChatUser(u);
              setMessengerOpen(true);
            }}
            onAddMarketplaceItem={(item) =>
              setMarketplace((prev) => [
                {
                  ...item,
                  id: `mp_${Date.now()}`,
                  sellerId: currentUser.id,
                  sellerName: currentUser.name,
                },
                ...prev,
              ])
            }
            onToggleGroupJoin={(gid) =>
              setGroups((prev) =>
                prev.map((g) =>
                  g.id === gid
                    ? {
                        ...g,
                        isJoined: !g.isJoined,
                        membersCount: g.isJoined ? g.membersCount - 1 : g.membersCount + 1,
                      }
                    : g
                )
              )
            }
            onCreateGroup={(grp) =>
              setGroups((prev) => [
                {
                  ...grp,
                  id: `g_${Date.now()}`,
                  membersCount: 1,
                  isJoined: true,
                },
                ...prev,
              ])
            }
            onReact={handleReact}
            onAddComment={handleAddComment}
            onShare={handleShare}
            onToggleSave={handleToggleSave}
            onEditPost={handleEditPost}
            onChangePrivacy={handleChangePrivacy}
            onRequestDelete={(id) => setPendingDeletePostId(id)}
          />
        )}
      </main>

      <MessengerAndOverlays
        lang={lang}
        currentUser={currentUser}
        users={users}
        messengerOpen={messengerOpen}
        activeChatUser={activeChatUser}
        messages={messages}
        onCloseMessenger={() => setMessengerOpen(false)}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onSendMessage={handleSendMessage}
        viewingStory={viewingStory}
        onCloseStoryViewer={() => setViewingStoryId(null)}
        createStoryOpen={createStoryOpen}
        onCloseCreateStory={() => setCreateStoryOpen(false)}
        onPublishStory={handlePublishStory}
        playingReel={playingReel}
        onCloseReelPlayer={() => setPlayingReelId(null)}
        onToggleReelLike={(rid) =>
          setReels((prev) =>
            prev.map((r) =>
              r.id === rid
                ? {
                    ...r,
                    isLiked: !r.isLiked,
                    likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
                  }
                : r
            )
          )
        }
        liveVideoOpen={liveVideoOpen}
        onCloseLiveVideo={() => setLiveVideoOpen(false)}
        onPublishLivePost={(title) =>
          handleCreatePost({
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatarUrl,
            authorVerified: currentUser.isVerified,
            content: title,
            videoLabel: `LIVE · ${title}`,
            privacy: 'public',
          })
        }
        pendingDeletePostId={pendingDeletePostId}
        onConfirmDeletePost={handleConfirmDeletePost}
        onCancelDeletePost={() => setPendingDeletePostId(null)}
        sheetsModalOpen={sheetsModalOpen}
        sheetsConfig={sheetsConfig}
        isGoogleConnected={isGoogleConnected}
        googleEmail={googleEmail}
        sheetsBusy={sheetsBusy}
        sheetsError={sheetsError}
        sheetsPreviewRows={sheetsPreviewRows}
        onCloseSheetsModal={() => setSheetsModalOpen(false)}
        onConnectGoogle={handleConnectGoogle}
        onCreateNewSheet={handleCreateNewSheet}
        onLinkSheetId={handleLinkSheetId}
        onPushSyncToSheets={handlePushSyncToSheets}
        onPreviewSheetTab={handlePreviewSheetTab}
        onSaveAppsScriptUrl={handleSaveAppsScriptUrl}
        onPushViaAppsScript={handlePushViaAppsScript}
        onPullViaAppsScript={handlePullViaAppsScript}
      />
    </div>
  );
}
