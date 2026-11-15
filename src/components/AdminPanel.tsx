import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  LayoutGrid,
  Megaphone,
  Navigation,
  Plus,
  Shield,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Users,
  FileText,
  Power,
} from 'lucide-react';
import {
  CustomFeature,
  GoogleSheetsConfig,
  Language,
  PostItem,
  UserAccount,
} from '../types';
import { getT } from '../i18n';

interface AdminPanelProps {
  lang: Language;
  users: UserAccount[];
  posts: PostItem[];
  customFeatures: CustomFeature[];
  sheetsConfig: GoogleSheetsConfig;
  isGoogleConnected: boolean;
  dbStatus: 'connected' | 'checking' | 'error';
  dbBusy: boolean;
  dbError: string;
  onAddCustomFeature: (feat: Omit<CustomFeature, 'id' | 'createdAt'>) => void;
  onToggleFeature: (id: string) => void;
  onDeleteFeature: (id: string) => void;
  onToggleUserVerified: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onSaveAppsScriptUrl: (url: string) => Promise<void>;
  onPullViaAppsScript: () => Promise<void>;
  onPushViaAppsScript: () => Promise<void>;
  onOpenSheetsModal: () => void;
  onReturnToFeed: () => void;
}

const FEATURE_TYPES: {
  type: CustomFeature['type'];
  ar: string;
  en: string;
  icon: React.ReactNode;
}[] = [
  { type: 'feed_widget', ar: 'بطاقة مخصصة في الموجز', en: 'Feed Widget Card', icon: <LayoutGrid className="w-4 h-4" /> },
  { type: 'nav_tab', ar: 'تبويب رئيسي في الشريط العلوي', en: 'Top Nav Tab', icon: <Navigation className="w-4 h-4" /> },
  { type: 'shortcut', ar: 'اختصار جانبي سريع', en: 'Sidebar Shortcut', icon: <Sparkles className="w-4 h-4" /> },
  { type: 'banner', ar: 'شريط إعلان ترحيبي', en: 'Announcement Banner', icon: <Megaphone className="w-4 h-4" /> },
  { type: 'post_category', ar: 'تصنيف منشورات جديد', en: 'Post Category', icon: <Tag className="w-4 h-4" /> },
  { type: 'marketplace_promo', ar: 'عرض مميز للماركت بليس', en: 'Marketplace Spotlight', icon: <Store className="w-4 h-4" /> },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  users,
  posts,
  customFeatures,
  sheetsConfig,
  isGoogleConnected,
  dbStatus,
  dbBusy,
  dbError,
  onAddCustomFeature,
  onToggleFeature,
  onDeleteFeature,
  onToggleUserVerified,
  onDeleteUser,
  onDeletePost,
  onSaveAppsScriptUrl,
  onPullViaAppsScript,
  onPushViaAppsScript,
  onOpenSheetsModal,
  onReturnToFeed,
}) => {
  const t = getT(lang);
  const [activeSection, setActiveSection] = useState<'builder' | 'users' | 'posts'>('builder');
  const [apiUrlDraft, setApiUrlDraft] = useState(sheetsConfig.appsScriptUrl || '');

  // Custom Feature Builder State
  const [featType, setFeatType] = useState<CustomFeature['type']>('banner');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [ctaAr, setCtaAr] = useState('اكتشف الآن');
  const [ctaEn, setCtaEn] = useState('Explore');
  const [accent, setAccent] = useState<'pink' | 'cyan' | 'turquoise'>('pink');
  const [createdMsg, setCreatedMsg] = useState('');

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() && !titleEn.trim()) return;
    onAddCustomFeature({
      type: featType,
      titleAr: titleAr.trim() || titleEn.trim(),
      titleEn: titleEn.trim() || titleAr.trim(),
      descriptionAr: descAr.trim(),
      descriptionEn: descEn.trim(),
      accentColor: accent,
      iconName: featType,
      ctaLabelAr: ctaAr.trim(),
      ctaLabelEn: ctaEn.trim(),
      isEnabled: true,
    });
    setTitleAr('');
    setTitleEn('');
    setDescAr('');
    setDescEn('');
    setCreatedMsg(
      lang === 'ar'
        ? 'تم إنشاء الميزة وإضافتها فوراً إلى منصة تواصل!'
        : 'Feature created and published live to Tawasol!'
    );
    setTimeout(() => setCreatedMsg(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-cyan-500 text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t.adminTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.adminSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenSheetsModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>
              {isGoogleConnected && sheetsConfig.spreadsheetId
                ? lang === 'ar'
                  ? 'Google Sheets متصل'
                  : 'Sheets Connected'
                : t.googleSheetsSync}
            </span>
          </button>

          <button
            type="button"
            onClick={onReturnToFeed}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            {lang === 'ar' ? 'معاينة الموقع الرئيسي' : 'Preview Main Feed'}
          </button>
        </div>
      </div>

      {/* Live Google Sheets Database Connection Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ar'
                  ? 'حالة الاتصال بقاعدة بيانات Google Sheets'
                  : 'Google Sheets Database Connection'}
              </h2>
              <p className="text-xs text-slate-500">
                {dbStatus === 'connected'
                  ? lang === 'ar'
                    ? 'الحالة: متصل ويعمل مع Google Apps Script'
                    : 'Status: Connected to Google Apps Script'
                  : dbStatus === 'checking'
                    ? lang === 'ar'
                      ? 'الحالة: جارٍ التحقق من الاتصال...'
                      : 'Status: Checking connection...'
                    : lang === 'ar'
                      ? 'الحالة: تعذر التحقق أو بانتظار المزامنة'
                      : 'Status: Needs check or offline cache active'}
                {sheetsConfig.lastSyncedAt && (
                  <span className="ms-2 tabular-nums">
                    · {new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPullViaAppsScript}
              disabled={dbBusy || !sheetsConfig.appsScriptUrl}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 text-teal-700 dark:text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-40 cursor-pointer"
            >
              {t.pullFromSheetBtn}
            </button>
            <button
              type="button"
              onClick={onPushViaAppsScript}
              disabled={dbBusy || !sheetsConfig.appsScriptUrl}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-40 cursor-pointer"
            >
              {t.syncNowBtn}
            </button>
          </div>
        </div>

        {dbError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {dbError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={apiUrlDraft}
            onChange={(e) => setApiUrlDraft(e.target.value)}
            dir="ltr"
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => onSaveAppsScriptUrl(apiUrlDraft.trim())}
            disabled={dbBusy || !apiUrlDraft.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 disabled:opacity-40 cursor-pointer shrink-0"
          >
            {dbBusy
              ? '...'
              : lang === 'ar'
                ? 'حفظ وفحص الرابط'
                : 'Save & Test URL'}
          </button>
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('builder')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSection === 'builder'
              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t.createCustomFeature}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('users')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSection === 'users'
              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            {t.usersDatabase} ({users.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('posts')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSection === 'posts'
              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>
            {t.postsModeration} ({posts.length})
          </span>
        </button>
      </div>

      {/* 1. Create / Add Custom Feature Builder */}
      {activeSection === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleCreateFeature}
            className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.createCustomFeature}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ar'
                  ? 'اختر نوع الميزة وأدخل الإعدادات المرنة لتظهر مباشرة في واجهة تواصل.'
                  : 'Pick a module type and configure fields to publish live inside Tawasol.'}
              </p>
            </div>

            {createdMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{createdMsg}</span>
              </div>
            )}

            {/* Feature Type Palette Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'ar' ? 'نوع الخاصية / الإضافة' : 'Feature Type'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEATURE_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    type="button"
                    onClick={() => setFeatType(ft.type)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold text-start transition cursor-pointer ${
                      featType === ft.type
                        ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ft.icon}
                    <span>{lang === 'ar' ? ft.ar : ft.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flexible Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: مسابقات تواصل الأسبوعية"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Weekly Contests"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر يظهر للمستخدمين..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={2}
                  placeholder="Short description..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'نص الزر (عربي)' : 'Button Label (AR)'}
                </label>
                <input
                  type="text"
                  value={ctaAr}
                  onChange={(e) => setCtaAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'نص الزر (إنجليزي)' : 'Button Label (EN)'}
                </label>
                <input
                  type="text"
                  value={ctaEn}
                  onChange={(e) => setCtaEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'اللون المميز' : 'Accent'}
                </label>
                <div className="flex items-center gap-2">
                  {(['pink', 'cyan', 'turquoise'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setAccent(col)}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-bold capitalize border cursor-pointer ${
                        accent === col
                          ? 'border-slate-900 dark:border-white ring-2 ring-offset-1 ring-cyan-400'
                          : 'border-transparent'
                      } ${
                        col === 'pink'
                          ? 'bg-pink-500 text-white'
                          : col === 'cyan'
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-teal-500 text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:opacity-95 shadow-md cursor-pointer"
            >
              {lang === 'ar' ? 'حفظ ونشر الميزة المخصصة فوراً' : 'Publish Custom Feature Live'}
            </button>
          </form>

          {/* Active Custom Features List */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'ar' ? 'الميزات المخصصة المنشورة' : 'Published Custom Features'} (
              {customFeatures.length})
            </h3>

            {customFeatures.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                {lang === 'ar'
                  ? 'لم تقم بإضافة ميزات مخصصة بعد. استخدم النموذج لإضافة أي ميزة جديدة!'
                  : 'No custom features added yet. Use the builder to create one!'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {customFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lang === 'ar' ? f.titleAr : f.titleEn}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {f.type} · {f.accentColor}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFeature(f.id)}
                        title={f.isEnabled ? 'Disable' : 'Enable'}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          f.isEnabled
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteFeature(f.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Users Database Registry */}
      {activeSection === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-3 px-4 text-start font-bold">{t.fullName}</th>
                  <th className="py-3 px-4 text-start font-bold">
                    {t.emailOption} / {t.mobileOption}
                  </th>
                  <th className="py-3 px-4 text-start font-bold">Hash</th>
                  <th className="py-3 px-4 text-start font-bold">{t.dob}</th>
                  <th className="py-3 px-4 text-start font-bold">{t.gender}</th>
                  <th className="py-3 px-4 text-end font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.contact}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {u.passwordHash.slice(0, 12)}...
                    </td>
                    <td className="py-3 px-4 tabular-nums">{u.dob}</td>
                    <td className="py-3 px-4">{u.gender}</td>
                    <td className="py-3 px-4 text-end space-x-2 rtl:space-x-reverse">
                      <button
                        type="button"
                        onClick={() => onToggleUserVerified(u.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                          u.isVerified
                            ? 'bg-cyan-500/15 text-teal-700 dark:text-cyan-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {u.isVerified ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 font-bold cursor-pointer"
                      >
                        {t.deletePost}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Posts Moderation */}
      {activeSection === 'posts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {p.authorName} · <span className="text-slate-400 font-normal">{p.privacy}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {p.content}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDeletePost(p.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 text-xs font-bold shrink-0 cursor-pointer"
              >
                {t.deletePost}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
