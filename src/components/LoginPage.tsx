import React, { useState, useEffect } from 'react';
import { getUIText, SUPPORTED_LANGUAGES, Language } from '../i18n/languages.ts';
import { UserAuth } from '../types.ts';
import {
  Lock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle,
  X,
  Globe
} from 'lucide-react';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAuth) => void;
  langCode: string;
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
  showToast: (msg: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  langCode,
  onLanguageChange,
  currentLanguage,
  showToast
}) => {
  if (!isOpen) return null;

  const [aadhaar, setAadhaar] = useState('4582 9104 7321');
  const [password, setPassword] = useState('kisan@sambalpur');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeRole, setActiveRole] = useState<'farmer' | 'expert'>('farmer');

  // Prevent background scrolling while login modal is open
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.classList.add('modal-open');

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Format Aadhaar into 4-digit groups (#### #### ####)
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setAadhaar(parts.join(' '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    if (cleanAadhaar.length < 12) {
      showToast(getUIText('enterValidAadhaarToast', langCode));
      return;
    }
    if (!password) {
      showToast(getUIText('enterPasswordToast', langCode));
      return;
    }

    const isOdia = langCode === 'or';
    const authUser: UserAuth = {
      id: activeRole === 'farmer' ? 'farmer_01' : 'expert_01',
      name: activeRole === 'farmer'
        ? (isOdia ? 'ରମେଶ ପଟେଲ' : 'Ramesh Patel')
        : (isOdia ? 'ଡକ୍ଟର ଦେବବ୍ରତ ମହାପାତ୍ର' : 'Dr. Debabrata Mohapatra'),
      phone: activeRole === 'farmer' ? '+91 98452 71023' : '+91 94370 12845',
      role: activeRole,
      location: isOdia ? 'ସମ୍ବଲପୁର, ଓଡ଼ିଶା' : 'Sambalpur, Odisha',
      avatarIcon: activeRole === 'farmer' ? '🧑‍🌾' : '👨‍🔬'
    };

    onLoginSuccess(authUser);
    showToast(`${getUIText('aadhaarVerifiedWelcome', langCode)}, ${authUser.name} ✅`);
    onClose();
  };

  const handleQuickDemoFarmer = () => {
    setAadhaar('4582 9104 7321');
    setPassword('kisan@sambalpur');
    setActiveRole('farmer');
    const isOdia = langCode === 'or';
    const authUser: UserAuth = {
      id: 'farmer_01',
      name: isOdia ? 'ରମେଶ ପଟେଲ' : 'Ramesh Patel',
      phone: '+91 98452 71023',
      role: 'farmer',
      location: isOdia ? 'ସମ୍ବଲପୁର, ଓଡ଼ିଶା' : 'Sambalpur, Odisha',
      avatarIcon: '🧑‍🌾'
    };
    onLoginSuccess(authUser);
    showToast(isOdia ? 'ଆଧାର ଯାଞ୍ଚ ସଫଳ: ରମେଶ ପଟେଲ (ଚାଷୀ) ✅' : 'Aadhaar Verified: Ramesh Patel (Farmer) ✅');
    onClose();
  };

  const handleQuickDemoExpert = () => {
    setAadhaar('9845 1023 6712');
    setPassword('kvk@pathology');
    setActiveRole('expert');
    const isOdia = langCode === 'or';
    const authUser: UserAuth = {
      id: 'expert_01',
      name: isOdia ? 'ଡକ୍ଟର ଦେବବ୍ରତ ମହାପାତ୍ର' : 'Dr. Debabrata Mohapatra',
      phone: '+91 94370 12845',
      role: 'expert',
      location: isOdia ? 'OUAT ସମ୍ବଲପୁର, ଓଡ଼ିଶା' : 'OUAT Sambalpur, Odisha',
      avatarIcon: '👨‍🔬'
    };
    onLoginSuccess(authUser);
    showToast(isOdia ? 'ଆଧାର ଯାଞ୍ଚ ସଫଳ: ଡକ୍ଟର ଦେବବ୍ରତ (KVK ବୈଜ୍ଞାନିକ) ✅' : 'Aadhaar Verified: Dr. Debabrata (KVK Scientist) ✅');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-300 overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-12 max-h-[92vh] animate-in zoom-in-95 duration-200 overscroll-contain"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-slate-700 grid place-items-center transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* LEFT COLUMN: ANIMATED CROP LANDSCAPE                     */}
        {/* ======================================================== */}
        <div className="md:col-span-5 relative bg-gradient-to-br from-[#0b7a45] via-[#094d2c] to-[#072c1a] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden select-none">
          {/* Animated Agricultural Background */}
          <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
            {/* Swaying Golden Wheat SVG */}
            <svg
              className="absolute bottom-0 left-0 right-0 w-full h-56"
              viewBox="0 0 400 220"
              preserveAspectRatio="none"
            >
              <g className="animate-pulse [animation-duration:3.5s]">
                <path d="M40 220 Q65 120 85 45" stroke="#f6d365" strokeWidth="4.5" fill="none" />
                <ellipse cx="85" cy="45" rx="9" ry="16" fill="#fda085" />
                <path d="M110 220 Q145 110 165 30" stroke="#f6d365" strokeWidth="5" fill="none" />
                <ellipse cx="165" cy="30" rx="10" ry="18" fill="#f6d365" />
                <path d="M210 220 Q190 130 205 55" stroke="#2fbf71" strokeWidth="4.5" fill="none" />
                <ellipse cx="205" cy="55" rx="9" ry="15" fill="#2fbf71" />
                <path d="M275 220 Q305 120 325 50" stroke="#f6d365" strokeWidth="4.5" fill="none" />
                <ellipse cx="325" cy="50" rx="9" ry="16" fill="#fda085" />
                <path d="M350 220 Q340 140 365 75" stroke="#2fbf71" strokeWidth="4" fill="none" />
                <ellipse cx="365" cy="75" rx="8" ry="14" fill="#2fbf71" />
              </g>
            </svg>

            {/* Floating Crop Particles */}
            <span className="absolute top-10 left-6 text-3xl animate-bounce [animation-duration:4s]">🌾</span>
            <span className="absolute top-20 right-8 text-3xl animate-bounce [animation-duration:6s]">🍅</span>
            <span className="absolute bottom-28 left-10 text-2xl animate-spin [animation-duration:10s]">🌱</span>
            <span className="absolute bottom-16 right-10 text-3xl animate-pulse [animation-duration:3s]">🌶️</span>
            <span className="absolute top-1/2 left-1/3 text-xl animate-bounce [animation-duration:8s]">🍃</span>
          </div>

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2fbf71] to-[#0e9f5c] grid place-items-center text-2xl shadow-lg mb-3">
              🌱
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Baloo_2'] leading-tight">
              {getUIText('appTitle', langCode)}
            </h2>
            <p className="text-xs text-emerald-200 mt-1 font-semibold">
              {getUIText('uidaiBadge', langCode)}
            </p>
          </div>

          {/* Testimonial & Features */}
          <div className="relative z-10 my-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-50 leading-relaxed font-medium">
              "{getUIText('loginQuote', langCode)}"
            </div>

            <div className="space-y-1.5 text-xs text-emerald-100/90 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{getUIText('featAadhaarDirect', langCode)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{getUIText('featHeuristics', langCode)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{getUIText('featLanguages', langCode)}</span>
              </div>
            </div>
          </div>

          {/* Aadhaar Security Assurance */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-emerald-200 font-bold bg-black/25 p-2.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{getUIText('govtProtection', langCode)}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: AADHAAR & PASSWORD FORM                    */}
        {/* ======================================================== */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Language Quick Switch */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0e9f5c] bg-emerald-50 px-2.5 py-1 rounded-full">
                {getUIText('aadhaarEkyc', langCode)}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  value={currentLanguage.code}
                  onChange={e => {
                    const match = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                    if (match) onLanguageChange(match);
                  }}
                  className="bg-transparent text-xs font-bold text-emerald-900 outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {getUIText('loginTitle', langCode)}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {getUIText('loginInstructions', langCode)}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => setActiveRole('farmer')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  activeRole === 'farmer'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧑‍🌾 {getUIText('farmerBadge', langCode)}
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('expert')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  activeRole === 'expert'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍🔬 {getUIText('agriExperts', langCode)}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Aadhaar Input */}
              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1">
                  {getUIText('aadhaarFieldLabel', langCode)}
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={aadhaar}
                    onChange={handleAadhaarChange}
                    maxLength={14} // 12 digits + 2 spaces
                    placeholder="4582 9104 7321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-900 tracking-wider outline-none focus:border-[#0e9f5c] focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{getUIText('aadhaarDigitsNotice', langCode)}</span>
                  <span>{aadhaar.replace(/\s/g, '').length} / 12</span>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1">
                  {getUIText('loginPassLabel', langCode)}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={getUIText('enterPasswordPlaceholder', langCode)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0e9f5c] focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{getUIText('rememberAadhaar', langCode)}</span>
                </label>

                <button
                  type="button"
                  onClick={() => showToast(langCode === 'or' ? 'ଆଧାର ସଂଲଗ୍ନ ମୋବାଇଲ ନମ୍ବରକୁ OTP ପଠାଯାଇଛି।' : 'OTP has been dispatched to Aadhaar linked mobile.')}
                  className="text-[#0e9f5c] hover:underline cursor-pointer font-bold"
                >
                  {getUIText('forgotPassOtp', langCode)}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white font-extrabold font-['Baloo_2'] text-base shadow-lg shadow-emerald-600/30 hover:brightness-105 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{getUIText('verifyAadhaarSignIn', langCode)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* One-Click Quick Demo Logins with Aadhaar */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                {getUIText('instantDemoAccess', langCode)}
              </span>

              <button
                type="button"
                onClick={handleQuickDemoFarmer}
                className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div>🌾 {langCode === 'or' ? 'ରମେଶ ପଟେଲ (ଚାଷୀ • ସମ୍ବଲପୁର)' : 'Ramesh Patel (Farmer • Sambalpur)'}</div>
                  <div className="text-[10px] text-emerald-700 font-normal">Aadhaar: 4582 9104 7321</div>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={handleQuickDemoExpert}
                className="w-full text-left p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div>👨‍🔬 {langCode === 'or' ? 'ଡକ୍ଟର ଦେବବ୍ରତ ମହାପାତ୍ର (KVK ପାଥୋଲୋଜିଷ୍ଟ)' : 'Dr. Debabrata Mohapatra (KVK Pathologist)'}</div>
                  <div className="text-[10px] text-purple-700 font-normal">Aadhaar: 9845 1023 6712</div>
                </div>
                <Sparkles className="w-4 h-4 text-purple-700" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              {getUIText('loginBackHome', langCode)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
