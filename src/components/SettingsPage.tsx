import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Lock,
  Shield,
  Sliders,
  Trash2,
  User,
} from 'lucide-react';
import {
  GoogleSheetsConfig,
  Language,
  PrivacyLevel,
  PrivacySettings,
  UserAccount,
} from '../types';
import { getT } from '../i18n';
import { hashPassword } from '../services/googleSheets';

interface SettingsPageProps {
  lang: Language;
  currentUser: UserAccount;
  privacySettings: PrivacySettings;
  sheetsConfig: GoogleSheetsConfig;
  isGoogleConnected: boolean;
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onUpdatePassword: (newHash: string) => void;
  onUpdatePrivacy: (updates: Partial<PrivacySettings>) => void;
  onClearSearchHistory: () => void;
  onOpenSheetsModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  lang,
  currentUser,
  privacySettings,
  sheetsConfig,
  isGoogleConnected,
  onUpdateProfile,
  onUpdatePassword,
  onUpdatePrivacy,
  onClearSearchHistory,
  onOpenSheetsModal,
}) => {
  const t = getT(lang);
  const [section, setSection] = useState<'account' | 'feed' | 'privacy'>('account');
  const [name, setName] = useState(currentUser.name);
  const [contact, setContact] = useState(currentUser.contact);
  const [newPass, setNewPass] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name: name.trim() || currentUser.name, contact: contact.trim() });
    if (newPass.trim().length >= 4) {
      const h = await hashPassword(newPass.trim());
      onUpdatePassword(h);
      setNewPass('');
    }
    setSavedNotice(lang === 'ar' ? 'تم حفظ إعدادات الحساب بنجاح' : 'Account settings saved');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Settings Sidebar */}
      <aside className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-1 h-fit">
        <h1 className="text-base font-bold text-slate-900 dark:text-white px-3 py-2">
          {t.settingsPrivacy}
        </h1>

        <button
          type="button"
          onClick={() => setSection('account')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
            section === 'account'
              ? 'bg-gradient-to-r from-pink-500/12 to-cyan-500/12 text-pink-600 dark:text-cyan-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.accountsCenter}</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('feed')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
            section === 'feed'
              ? 'bg-gradient-to-r from-pink-500/12 to-cyan-500/12 text-pink-600 dark:text-cyan-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.feedPrefs}</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('privacy')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
            section === 'privacy'
              ? 'bg-gradient-to-r from-pink-500/12 to-cyan-500/12 text-pink-600 dark:text-cyan-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t.privacyCenter}</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        {savedNotice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}

        {section === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.accountsCenter}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ar'
                  ? 'إدارة معلومات حسابك، الأمان، وكلمة المرور وربط قاعدة البيانات.'
                  : 'Manage your account details, security, password, and live database sync.'}
              </p>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.emailOption} / {t.mobileOption}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.changePassword} ({lang === 'ar' ? 'اختياري' : 'Optional'})
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </form>

            {/* Google Sheets Card inside Accounts Center */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>{t.sheetsTitle}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isGoogleConnected && sheetsConfig.spreadsheetId
                    ? `${sheetsConfig.spreadsheetTitle} (${sheetsConfig.spreadsheetId.slice(0, 12)}...)`
                    : lang === 'ar'
                      ? 'قم بربط Google Sheets لمزامنة البيانات مباشرة.'
                      : 'Connect Google Sheets to synchronize live data.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSheetsModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shrink-0 cursor-pointer"
              >
                {t.googleSheetsSync}
              </button>
            </div>
          </div>
        )}

        {section === 'feed' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.feedPrefs}</h2>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'إعطاء الأولوية لمنشورات الأصدقاء' : 'Prioritize Friends in Feed'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'ar'
                    ? 'عرض تحديثات أصدقائك المقربين في أعلى موجز الأخبار.'
                    : 'Show updates from close friends at the top of your feed.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.prioritizeFriendsFeed}
                onChange={(e) => onUpdatePrivacy({ prioritizeFriendsFeed: e.target.checked })}
                className="w-5 h-5 accent-pink-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'إخفاء المنشورات الممولة' : 'Hide Sponsored Cards'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'ar'
                    ? 'تقليل البطاقات الترويجية في الشريط الجانبي.'
                    : 'Reduce promotional items in your sidebar.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.hideSponsored}
                onChange={(e) => onUpdatePrivacy({ hideSponsored: e.target.checked })}
                className="w-5 h-5 accent-cyan-500"
              />
            </label>
          </div>
        )}

        {section === 'privacy' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-500" />
              <span>{t.privacyCenter}</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ar'
                  ? 'من يمكنه رؤية منشوراتك المستقبلية افتراضياً؟'
                  : 'Default audience for your future posts'}
              </label>
              <select
                value={privacySettings.defaultPostPrivacy}
                onChange={(e) =>
                  onUpdatePrivacy({ defaultPostPrivacy: e.target.value as PrivacyLevel })
                }
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="public">{t.privacyPublic}</option>
                <option value="friends">{t.privacyFriends}</option>
                <option value="only_me">{t.privacyOnlyMe}</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ar'
                  ? 'من يمكنه البحث عنك باستخدام الإيميل أو الموبايل؟'
                  : 'Who can look you up using your email or phone?'}
              </label>
              <select
                value={privacySettings.whoCanFindByContact}
                onChange={(e) =>
                  onUpdatePrivacy({
                    whoCanFindByContact: e.target.value as 'everyone' | 'friends' | 'only_me',
                  })
                }
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="everyone">{t.privacyPublic}</option>
                <option value="friends">{t.privacyFriends}</option>
                <option value="only_me">{t.privacyOnlyMe}</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'قفل الملف الشخصي (Profile Lock)' : 'Lock Profile'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'ar'
                    ? 'حصر رؤية الصور والمنشورات على الأصدقاء فقط.'
                    : 'Restrict photos and full posts to friends only.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.profileLocked}
                onChange={(e) => onUpdatePrivacy({ profileLocked: e.target.checked })}
                className="w-5 h-5 accent-pink-500"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                onClearSearchHistory();
                setSavedNotice(lang === 'ar' ? 'تم مسح سجل البحث' : 'Search history cleared');
                setTimeout(() => setSavedNotice(''), 2000);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.clearHistory}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
