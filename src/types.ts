export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark';
export type Gender = 'male' | 'female' | 'other';
export type PrivacyLevel = 'public' | 'friends' | 'only_me';
export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export type ActiveTab =
  | 'home'
  | 'friends'
  | 'videos'
  | 'marketplace'
  | 'groups'
  | 'profile'
  | 'settings'
  | 'saved'
  | 'memories'
  | 'pages'
  | 'admin'
  | `custom_${string}`;

export type SearchFilter = 'all' | 'posts' | 'people' | 'photos' | 'videos' | 'groups' | 'marketplace';

export interface UserAccount {
  id: string;
  name: string;
  contact: string; // email or mobile
  contactType: 'email' | 'phone';
  passwordHash: string;
  dob: string;
  gender: Gender;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  city: string;
  work: string;
  followersCount: number;
  friendsIds: string[];
  isOnline?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  imageUrl?: string;
  gifLabel?: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  content: string;
  imageUrl?: string;
  videoLabel?: string;
  feeling?: string;
  category?: string;
  privacy: PrivacyLevel;
  createdAt: string;
  reactions: Record<string, ReactionType>; // userId -> reaction
  comments: CommentItem[];
  sharesCount: number;
  isSaved?: boolean;
  isSponsored?: boolean;
}

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  imageUrl?: string;
  gradient?: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
}

export interface ReelItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  coverUrl: string;
  duration: string;
  viewsCount: number;
  likesCount: number;
  isLiked?: boolean;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  mutualFriends: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  time: string;
  isRead: boolean;
  type: 'reaction' | 'comment' | 'friend' | 'system';
  actorName: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  location: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  description: string;
}

export interface GroupItem {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  coverUrl: string;
  isJoined: boolean;
  description: string;
}

export interface CustomFeature {
  id: string;
  type: 'feed_widget' | 'nav_tab' | 'shortcut' | 'banner' | 'post_category' | 'marketplace_promo';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  accentColor: 'pink' | 'cyan' | 'turquoise';
  iconName: string;
  ctaLabelAr: string;
  ctaLabelEn: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface PrivacySettings {
  defaultPostPrivacy: PrivacyLevel;
  whoCanFindByContact: 'everyone' | 'friends' | 'only_me';
  profileLocked: boolean;
  prioritizeFriendsFeed: boolean;
  hideSponsored: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  sheetTabs: string[];
  lastSyncedAt: string | null;
  autoSync: boolean;
  connectedEmail: string | null;
  appsScriptUrl?: string;
}

export interface ActivityLogItem {
  id: string;
  actionAr: string;
  actionEn: string;
  timestamp: string;
}
