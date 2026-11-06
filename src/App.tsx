import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { DashboardTab } from './components/DashboardTab.tsx';
import { DiagnosisTab } from './components/DiagnosisTab.tsx';
import { ScanHistoryTab } from './components/ScanHistoryTab.tsx';
import { WeatherTab } from './components/WeatherTab.tsx';
import { MandiTab } from './components/MandiTab.tsx';
import { ExpertsTab } from './components/ExpertsTab.tsx';
import { ProfileTab } from './components/ProfileTab.tsx';
import { VoiceModal } from './components/VoiceModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { AnimatedCropBackground } from './components/AnimatedCropBackground.tsx';
import { BottomBar } from './components/BottomBar.tsx';
import { SUPPORTED_LANGUAGES, Language, getUIText, cacheTranslation, UI_TRANSLATIONS } from './i18n/languages.ts';
import { VegetableInfo, ScanRecord, FarmerProfile, UserAuth } from './types.ts';
import { fetchVegetables, fetchScanHistory, fetchFarmerProfile, translateBatch } from './services/api.ts';
import { Mic } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [, setLangVersion] = useState<number>(0);
  const [vegetables, setVegetables] = useState<VegetableInfo[]>([]);
  const [selectedVegId, setSelectedVegId] = useState<string>('tomato');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAuth | null>({
    id: 'farmer_01',
    name: 'Ramesh Patel',
    phone: '+91 98452 71023',
    aadhaar: '[Aadhaar Redacted]',
    role: 'farmer',
    location: 'Sambalpur, Odisha',
    avatarIcon: '🧑‍🌾'
  });
  
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [capturedLeafPhoto, setCapturedLeafPhoto] = useState<{ url: string; name: string } | null>(null);

  // --- Splash Screen States ---
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [animateElements, setAnimateElements] = useState<boolean>(false);
  const [fadeSplash, setFadeSplash] = useState<boolean>(false);

  useEffect(() => {
    // 1. Trigger the entrance animation immediately after mount
    const entranceTimer = setTimeout(() => {
      setAnimateElements(true);
    }, 50);

    // 2. Start fading out the whole screen after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 2500);
    
    // 3. Completely remove from DOM after 3.2 seconds
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Show Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCameraPhotoCaptured = (url: string, name: string) => {
    setCapturedLeafPhoto({ url, name });
    setActiveTab('diagnosis');
    showToast(currentLanguage.code === 'or' ? 'କ୍ୟାମେରା ଫଟୋ ଲୋଡ୍ ହେଲା! AI ସ୍କାନ ପାଇଁ ପ୍ରସ୍ତୁତ ✅' : 'Camera photo captured! Ready for AI diagnosis ✅');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full website translation handler with authentic vocabulary words
  const handleLanguageChange = async (lang: Language) => {
    setCurrentLanguage(lang);
    if (lang.code === 'or') {
      showToast('ଶୁଦ୍ଧ ଓଡ଼ିଆ ଭାଷାକୁ ଅନୁବାଦ କରାଯାଉଛି...');
    } else {
      showToast(`Translating interface into ${lang.nativeName} (${lang.name})...`);
    }

    // If language is not in predefined dictionary, translate batch via backend AI
    if (!UI_TRANSLATIONS[lang.code]) {
      try {
        const enDictionary = UI_TRANSLATIONS.en || {};
        const keys = Object.keys(enDictionary);
        const englishTexts = keys.map(k => enDictionary[k]);
        const translatedMap = await translateBatch(englishTexts, lang.name, lang.code);

        keys.forEach(k => {
          const original = enDictionary[k];
          if (translatedMap[original]) {
            cacheTranslation(lang.code, k, translatedMap[original]);
          }
        });

        // Trigger re-render to display authentic vocabulary
        setLangVersion((v: number) => v + 1);
        if (lang.code === 'or') {
          showToast('ୱେବସାଇଟ୍ ସଫଳତାର ସହ ଓଡ଼ିଆରେ ଅନୁବାଦ ହେଲା ✅');
        } else {
          showToast(`Website fully translated to ${lang.nativeName} (${lang.name}) ✅`);
        }
      } catch (err) {
        console.warn('Batch translation warning:', err);
        showToast(lang.code === 'or' ? `ଭାଷା ସେଟ୍ ହେଲା: ${lang.nativeName}` : `Language set to ${lang.nativeName}`);
      }
    } else {
      if (lang.code === 'or') {
        showToast('ୱେବସାଇଟ୍ ସଫଳତାର ସହ ଓଡ଼ିଆରେ ଅନୁବାଦ ହେଲା ✅');
      } else {
        showToast(`Website translated to ${lang.nativeName} (${lang.name}) ✅`);
      }
    }
  };

  // Load initial backend data
  useEffect(() => {
    fetchVegetables().then((list: VegetableInfo[]) => {
      if (list && list.length > 0) {
        setVegetables(list);
        setSelectedVegId(list[0].id);
      }
    });

    fetchScanHistory().then((history: ScanRecord[]) => {
      setScans(history);
    });

    fetchFarmerProfile().then((p: FarmerProfile) => {
      if (p) {
        setProfile(p);
        if (p.preferredLanguage) {
          const matchLang = SUPPORTED_LANGUAGES.find((l: Language) => l.code === p.preferredLanguage);
          if (matchLang) setCurrentLanguage(matchLang);
        }
      }
    });

    // Handle hash change
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'voice') {
        setIsVoiceOpen(true);
      } else if (hash === 'login') {
        setIsLoginOpen(true);
      } else if (['dashboard', 'diagnosis', 'history', 'weather', 'mandi', 'experts', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshScans = () => {
    fetchScanHistory().then((history: ScanRecord[]) => {
      setScans(history);
    });
  };

  const handleNewScanSaved = (newScan: ScanRecord) => {
    setScans((prev: ScanRecord[]) => [newScan, ...prev.filter((s: ScanRecord) => s.id !== newScan.id)]);
  };

  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
    if (profile) {
      setProfile({
        ...profile,
        fullName: user.name,
        phone: user.phone,
        avatarIcon: user.avatarIcon
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3faf5] text-[#12392a] flex flex-col font-['Nunito',system-ui,sans-serif] relative">
      
      {/* Intro Splash Screen */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f3faf5] transition-opacity duration-700 ease-in-out ${
            fadeSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Pulsing Background Glow */}
          <div className={`absolute w-72 h-72 bg-emerald-400/20 blur-3xl rounded-full transition-opacity duration-1000 ${
            animateElements ? 'opacity-100 animate-pulse' : 'opacity-0'
          }`} />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Logo Box */}
            <div 
              className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#2fbf71] to-[#0e9f5c] grid place-items-center text-5xl shadow-2xl shadow-emerald-600/40 transition-all duration-700 ease-out ${
                animateElements ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-8'
              }`}
            >
              🌱
            </div>
            
            {/* App Name */}
            <h1 
              className={`mt-6 text-4xl sm:text-5xl font-black font-['Baloo_2'] text-[#12392a] tracking-tight transition-all duration-700 ease-out delay-150 ${
                animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              KisanMitra <span className="text-[#0e9f5c]">AI</span>
            </h1>
            
            {/* Subtitle */}
            <p 
              className={`mt-2 text-sm sm:text-base font-bold text-[#5a7a69] tracking-wide uppercase transition-all duration-700 ease-out delay-300 ${
                animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Crop Risk Decision Support
            </p>
          </div>
        </div>
      )}

      {/* Animated Agricultural Background */}
      <AnimatedCropBackground />

      {/* Top Header Bar with Live Location & 34+ Language Selector */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        location={`${profile?.district || 'Sambalpur'}, ${profile?.state || 'Odisha'}`}
        langCode={currentLanguage.code}
      />

      {/* Main Navigation Bar with Dashboard */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        farmerName={currentUser?.name || profile?.fullName || 'Ramesh Patel'}
        avatarIcon={currentUser?.avatarIcon || profile?.avatarIcon || '🧑‍🌾'}
        langCode={currentLanguage.code}
        scanCount={scans.length}
      />

      {/* Main Active Tab Screen */}
      <main className="flex-1 relative z-10 pb-24 sm:pb-28">
        {activeTab === 'dashboard' && (
          <DashboardTab
            farmerProfile={profile}
            scans={scans}
            onNavigateTab={handleTabChange}
            onOpenVoice={() => setIsVoiceOpen(true)}
            langCode={currentLanguage.code}
            showToast={showToast}
          />
        )}

        {activeTab === 'diagnosis' && (
          <DiagnosisTab
            vegetables={vegetables}
            selectedVegId={selectedVegId}
            onVegetableChange={(id: string) => setSelectedVegId(id)}
            langCode={currentLanguage.code}
            onScanSaved={handleNewScanSaved}
            onViewHistory={() => handleTabChange('history')}
            showToast={showToast}
            capturedLeafPhoto={capturedLeafPhoto}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistoryTab
            scans={scans}
            onRefresh={handleRefreshScans}
            langCode={currentLanguage.code}
            showToast={showToast}
            onNewScan={() => handleTabChange('diagnosis')}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherTab
            onNavigateTab={handleTabChange}
            langCode={currentLanguage.code}
            showToast={showToast}
          />
        )}

        {activeTab === 'mandi' && (
          <MandiTab langCode={currentLanguage.code} showToast={showToast} />
        )}

        {activeTab === 'experts' && (
          <ExpertsTab langCode={currentLanguage.code} showToast={showToast} />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            langCode={currentLanguage.code}
            showToast={showToast}
            onProfileUpdated={(updated: FarmerProfile) => setProfile(updated)}
          />
        )}
      </main>

      {/* Floating Voice Assistant Trigger */}
      <button
        onClick={() => setIsVoiceOpen(true)}
        className="fixed right-4 bottom-20 sm:right-6 sm:bottom-22 z-40 flex items-center gap-2.5 p-2 pr-4 sm:pr-5 rounded-full bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Open Voice Assistant"
      >
        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-emerald-950 grid place-items-center shadow-inner relative">
          <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-700" />
          <span className="absolute inset-0 rounded-full border-2 border-[#2fbf71] animate-ping" />
        </span>
        <div className="text-left leading-tight hidden xs:block">
          <div className="font-['Baloo_2'] font-bold text-xs sm:text-sm">
            {getUIText('voiceAssistant', currentLanguage.code)}
          </div>
          <small className="text-[10px] opacity-85 block">
            {currentLanguage.code === 'or' ? 'AI ଭଏସ୍ ସହାୟକ' : 'AI voice copilot'}
          </small>
        </div>
      </button>

      {/* Persistent Fixed Bottom Bar */}
      <BottomBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCameraPhotoCaptured={handleCameraPhotoCaptured}
        langCode={currentLanguage.code}
      />

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        langName={currentLanguage.name}
        langCode={currentLanguage.code}
        showToast={showToast}
      />

      {/* Login Modal */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        langCode={currentLanguage.code}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        showToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed left-1/2 bottom-24 -translate-x-1/2 z-[100] bg-[#12392a] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 max-w-[90vw] text-center border border-emerald-500/20">
          <span>🌱</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}