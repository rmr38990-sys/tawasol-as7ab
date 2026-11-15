import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Globe,
  Mail,
  Moon,
  Phone,
  Sun,
  X,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Gender, Language, ThemeMode, UserAccount } from '../types';
import { getT } from '../i18n';
import { ASSETS, LOGO_SRC } from '../data/seedData';
import { hashPassword } from '../services/googleSheets';

interface AuthPageProps {
  lang: Language;
  theme: ThemeMode;
  users: UserAccount[];
  googleConnectedEmail: string | null;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onAdminLogin: () => void;
  onRegisterUser: (user: UserAccount) => void;
  onUpdateUserPassword: (contact: string, newHash: string) => boolean;
  onGoogleConnect: () => Promise<void>;
  onLookupRemoteUser?: (contact: string) => Promise<UserAccount | null>;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  lang,
  theme,
  users,
  googleConnectedEmail,
  onToggleLang,
  onToggleTheme,
  onLoginSuccess,
  onAdminLogin,
  onRegisterUser,
  onUpdateUserPassword,
  onGoogleConnect,
  onLookupRemoteUser,
}) => {
  const t = getT(lang);

  // Panel Mode: login vs signup
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login State
  const [loginContact, setLoginContact] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regMethod, setRegMethod] = useState<'phone' | 'email'>('phone');
  const [regContact, setRegContact] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('2000-01-01');
  const [regGender, setRegGender] = useState<Gender>('male');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Recovery Modal State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recContact, setRecContact] = useState('');
  const [recStep, setRecStep] = useState<'input' | 'verify' | 'done'>('input');
  const [recCode, setRecCode] = useState('');
  const [recNewPass, setRecNewPass] = useState('');
  const [recError, setRecError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const normalized = loginContact.trim();
    // Exclusive Secret Admin Panel Gatekeeper
    if (normalized.toLowerCase() === 'admin' && loginPassword === 'aysel2020') {
      onAdminLogin();
      return;
    }

    if (normalized.toLowerCase() === 'admin') {
      setLoginError(t.loginError);
      return;
    }

    setLoginLoading(true);
    try {
      let found: UserAccount | undefined | null = users.find(
        (u) => u.contact.toLowerCase() === normalized.toLowerCase()
      );

      if (!found && onLookupRemoteUser) {
        found = await onLookupRemoteUser(normalized);
      }

      if (!found) {
        setLoginError(t.loginError);
        return;
      }

      const inputHash = await hashPassword(loginPassword);
      const isDemoSeedMatch =
        found.passwordHash === 'demo_hash_123' && loginPassword === '123456';
      if (found.passwordHash === inputHash || isDemoSeedMatch) {
        onLoginSuccess(found);
      } else {
        setLoginError(t.loginError);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regContact.trim() || regPassword.length < 4 || !regDob) {
      setRegError(
        lang === 'ar'
          ? 'يرجى إكمال جميع الحقول المطلوبة (كلمة المرور 4 أحرف على الأقل).'
          : 'Please complete all required fields (password min 4 chars).'
      );
      return;
    }

    if (
      regContact.trim().toLowerCase() === 'admin' ||
      regName.trim().toLowerCase() === 'admin'
    ) {
      setRegError(
        lang === 'ar'
          ? 'لا يمكن استخدام هذا الاسم أو المعرّف.'
          : 'This identifier is reserved.'
      );
      return;
    }

    const exists = users.some(
      (u) => u.contact.toLowerCase() === regContact.trim().toLowerCase()
    );
    if (exists) {
      setRegError(
        lang === 'ar'
          ? 'هذا البريد أو رقم الموبايل مسجل بالفعل.'
          : 'This email or mobile number is already registered.'
      );
      return;
    }

    const passwordHash = await hashPassword(regPassword);
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      name: regName.trim(),
      contact: regContact.trim(),
      contactType: regMethod,
      passwordHash,
      dob: regDob,
      gender: regGender,
      coverUrl: ASSETS.coverSunset,
      bio:
        lang === 'ar'
          ? 'مرحباً بكم في حسابي الجديد على تواصل! ✨'
          : 'Hello! New here on Tawasol ✨',
      city: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      work: lang === 'ar' ? 'عضو في مجتمع تواصل' : 'Tawasol Community Member',
      followersCount: 1,
      friendsIds: ['u_ahmed', 'u_sara'],
      isOnline: true,
      createdAt: new Date().toISOString(),
    };

    setRegSuccess(t.signupSuccessAutoLogin);
    setTimeout(() => {
      onRegisterUser(newUser);
    }, 600);
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecError('');
    if (!recContact.trim()) {
      setRecError(
        lang === 'ar' ? 'أدخل البريد الإلكتروني أو رقم الموبايل.' : 'Enter your email or mobile.'
      );
      return;
    }
    const found = users.find(
      (u) => u.contact.toLowerCase() === recContact.trim().toLowerCase()
    );
    if (!found) {
      setRecError(
        lang === 'ar'
          ? 'لم يتم العثور على حساب مرتبط بهذه البيانات.'
          : 'No account found matching this contact.'
      );
      return;
    }
    setRecStep('verify');
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError('');
    if (recCode.trim() !== '2026' && recCode.trim().length < 4) {
      setRecError(
        lang === 'ar' ? 'رمز التأكيد غير صحيح (أدخل 2026).' : 'Invalid code (enter 2026).'
      );
      return;
    }
    if (recNewPass.length < 4) {
      setRecError(
        lang === 'ar'
          ? 'يرجى إدخال كلمة مرور جديدة من 4 أحرف على الأقل.'
          : 'Enter a new password of at least 4 characters.'
      );
      return;
    }
    const newHash = await hashPassword(recNewPass);
    onUpdateUserPassword(recContact.trim(), newHash);
    setRecStep('done');
  };

  const handleGoogleLoginClick = async () => {
    setGoogleLoading(true);
    setLoginError('');
    try {
      await onGoogleConnect();
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : lang === 'ar'
            ? 'تعذر الاتصال بحساب Google.'
            : 'Failed to connect Google account.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-br from-pink-100 via-cyan-50 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 transition-colors duration-200 overflow-x-hidden">
      {/* Subtle Ambient Youthful Color Glows (Pink, Light Cyan, Turquoise) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-28 -start-24 w-96 h-96 rounded-full bg-pink-300/35 dark:bg-pink-600/15 blur-3xl" />
        <div className="absolute top-1/3 -end-24 w-96 h-96 rounded-full bg-cyan-300/40 dark:bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-28 start-1/3 w-96 h-96 rounded-full bg-teal-300/35 dark:bg-teal-500/15 blur-3xl" />
      </div>

      {/* Top Bar Controls for Language & Theme */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onToggleLang}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 dark:bg-slate-900/90 border border-cyan-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          <Globe className="w-4 h-4 text-cyan-500" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/90 dark:bg-slate-900/90 border border-pink-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-pink-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{t.lightMode}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-pink-500" />
              <span>{t.darkMode}</span>
            </>
          )}
        </button>
      </header>

      {/* Centered Clean, Independent Login & Sign-Up Panel with Large Logo */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-[450px] mx-auto bg-white dark:bg-slate-900 border border-cyan-100 dark:border-slate-800 rounded-3xl shadow-2xl shadow-pink-500/10 dark:shadow-black/40 p-6 sm:p-8 space-y-5">
          {/* Large Prominent Logo at Top of Login Card */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="w-72 sm:w-80 mx-auto">
              <img
                src={LOGO_SRC}
                alt="شعار موقع تواصل"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-pink-600 via-teal-600 to-cyan-600 dark:from-pink-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
              {t.tagline}
            </h1>
          </div>

          {/* Segmented Switcher: Login / Sign Up */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setRegError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.loginBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setLoginError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.createAccountBtn}
            </button>
          </div>

          {authMode === 'login' ? (
            <div className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    value={loginContact}
                    onChange={(e) => setLoginContact(e.target.value)}
                    placeholder={t.emailOrPhoneOrUser}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.password}
                    required
                    className="w-full px-4 py-3 pe-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:opacity-95 shadow-md shadow-pink-500/20 transition cursor-pointer disabled:opacity-60"
                >
                  {loginLoading
                    ? lang === 'ar'
                      ? 'جارٍ التحقق...'
                      : 'Signing in...'
                    : t.loginBtn}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRecStep('input');
                    setRecError('');
                    setShowRecovery(true);
                  }}
                  className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {t.forgotPassword}
                </button>
              </div>

              <div className="relative flex items-center py-0.5">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="mx-3 text-xs text-slate-400 font-medium">{t.orDivider}</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  disabled={googleLoading}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state" />
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {googleLoading
                        ? lang === 'ar'
                          ? 'جارٍ الربط...'
                          : 'Connecting...'
                        : t.signInGoogle}
                    </span>
                  </div>
                </button>
                {googleConnectedEmail && (
                  <p className="text-[11px] text-center text-teal-600 dark:text-cyan-400 font-medium">
                    {t.googleConnectedAs} {googleConnectedEmail}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRegError('');
                    setRegSuccess('');
                    setAuthMode('signup');
                  }}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-sm transition cursor-pointer"
                >
                  {t.createAccountBtn}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={t.fullName}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.registerMethod}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegMethod('phone');
                      setRegContact('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      regMethod === 'phone'
                        ? 'bg-cyan-500/10 border-cyan-500 text-teal-700 dark:text-cyan-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.mobileOption}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegMethod('email');
                      setRegContact('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      regMethod === 'email'
                        ? 'bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t.emailOption}</span>
                  </button>
                </div>

                <input
                  type={regMethod === 'email' ? 'email' : 'tel'}
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  placeholder={regMethod === 'email' ? t.enterEmail : t.enterMobile}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.newPassword}
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.dob}
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.gender}
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as Gender)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 shadow-md shadow-teal-500/20 transition cursor-pointer"
              >
                {t.signupSubmit}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Mandatory Footer ONLY on Login Page */}
      <footer className="relative z-10 w-full py-3.5 px-4 text-center border-t border-cyan-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {t.footerCopyright}
        </p>
      </footer>

      {/* Password / Username Recovery Modal */}
      {showRecovery && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-pink-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.recoveryTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {recError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {recError}
                </div>
              )}

              {recStep === 'input' && (
                <form onSubmit={handleSendRecovery} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.recoveryDesc}
                  </p>
                  <input
                    type="text"
                    value={recContact}
                    onChange={(e) => setRecContact(e.target.value)}
                    placeholder={t.recoveryPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-95 transition cursor-pointer"
                  >
                    {t.sendRecoveryCode}
                  </button>
                </form>
              )}

              {recStep === 'verify' && (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-teal-700 dark:text-cyan-300 text-xs font-medium">
                    {t.recoverySentMsg} <strong>{recContact}</strong>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.recoveryCodeLabel}
                    </label>
                    <input
                      type="text"
                      value={recCode}
                      onChange={(e) => setRecCode(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.newPasswordReset}
                    </label>
                    <input
                      type="password"
                      value={recNewPass}
                      onChange={(e) => setRecNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 transition cursor-pointer"
                  >
                    {t.resetPasswordBtn}
                  </button>
                </form>
              )}

              {recStep === 'done' && (
                <div className="text-center space-y-4 py-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t.resetSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 cursor-pointer"
                  >
                    {t.loginBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
