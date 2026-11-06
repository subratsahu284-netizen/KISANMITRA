import { FarmerProfile, ScanRecord } from '../types.ts';
import { getUIText } from '../i18n/languages.ts';
import { ArrowRight, ShieldCheck, CloudRain, Droplets, Wind, ThermometerSun } from 'lucide-react';

interface DashboardTabProps {
  farmerProfile: FarmerProfile | null;
  scans?: ScanRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenVoice: () => void;
  langCode: string;
  showToast?: (msg: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  farmerProfile,
  onNavigateTab,
  onOpenVoice,
  langCode
}) => {
  const farmerName = farmerProfile?.fullName || 'Ramesh Patel';

  // The 7 Core Navigation Modules
  const NAV_MODULES = [
    {
      id: 'diagnosis',
      title: getUIText('cropDiagnosis', langCode),
      desc: getUIText('actDiagnosisDesc', langCode),
      icon: '🔬',
      badge: getUIText('badgeAiPathology', langCode),
      bgGrad: 'from-emerald-500/10 via-emerald-500/5 to-white',
      borderCol: 'hover:border-emerald-500',
      textCol: 'text-emerald-800',
      action: () => onNavigateTab('diagnosis')
    },
    {
      id: 'history',
      title: getUIText('scanHistory', langCode),
      desc: getUIText('actHistoryDesc', langCode),
      icon: '📋',
      badge: getUIText('badgePdfReports', langCode),
      bgGrad: 'from-sky-500/10 via-sky-500/5 to-white',
      borderCol: 'hover:border-sky-500',
      textCol: 'text-sky-800',
      action: () => onNavigateTab('history')
    },
    {
      id: 'weather',
      title: getUIText('weatherSpray', langCode),
      desc: getUIText('actWeatherDesc', langCode),
      icon: '⛅',
      badge: getUIText('badgeSafeSpray', langCode),
      bgGrad: 'from-amber-500/10 via-amber-500/5 to-white',
      borderCol: 'hover:border-amber-500',
      textCol: 'text-amber-800',
      action: () => onNavigateTab('weather')
    },
    {
      id: 'mandi',
      title: getUIText('mandiPrices', langCode),
      desc: getUIText('actMandiDesc', langCode),
      icon: '📈',
      badge: getUIText('badgeLiveApmc', langCode),
      bgGrad: 'from-rose-500/10 via-rose-500/5 to-white',
      borderCol: 'hover:border-rose-500',
      textCol: 'text-rose-800',
      action: () => onNavigateTab('mandi')
    },
    {
      id: 'experts',
      title: getUIText('agriExperts', langCode),
      desc: getUIText('actExpertsDesc', langCode),
      icon: '🧑‍🔬',
      badge: getUIText('badgeKvkScientists', langCode),
      bgGrad: 'from-purple-500/10 via-purple-500/5 to-white',
      borderCol: 'hover:border-purple-500',
      textCol: 'text-purple-800',
      action: () => onNavigateTab('experts')
    },
    {
      id: 'profile',
      title: getUIText('farmerProfile', langCode),
      desc: getUIText('actProfileDesc', langCode),
      icon: '👤',
      badge: getUIText('badgeFarmSetup', langCode),
      bgGrad: 'from-teal-500/10 via-teal-500/5 to-white',
      borderCol: 'hover:border-teal-500',
      textCol: 'text-teal-800',
      action: () => onNavigateTab('profile')
    },
    {
      id: 'voice',
      title: getUIText('voiceAssistant', langCode),
      desc: getUIText('actVoiceDesc', langCode),
      icon: '🎙️',
      badge: getUIText('badgeVoiceCopilot', langCode),
      bgGrad: 'from-emerald-500/10 via-teal-500/5 to-white',
      borderCol: 'hover:border-emerald-600',
      textCol: 'text-emerald-900',
      action: onOpenVoice
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28">
      {/* ======================================================== */}
      {/* 1. CLEAN ANIMATED CROP HERO GREETING WITH WEATHER        */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c4731] via-[#093524] to-[#122b1c] text-white border border-emerald-500/20 shadow-xl mb-7">
        {/* Animated Crop Ambient Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden select-none">
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-32 text-emerald-400"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            fill="currentColor"
          >
            <path
              d="M0,90 C150,50 300,110 450,65 C600,20 750,90 900,45 C1050,15 1200,80 1200,120 L0,120 Z"
              className="animate-pulse [animation-duration:4s]"
            />
          </svg>
          <span className="absolute top-6 left-10 text-3xl animate-bounce [animation-duration:5s]">🌾</span>
          <span className="absolute top-10 right-16 text-3xl animate-bounce [animation-duration:7s]">🍅</span>
          <span className="absolute bottom-8 left-1/3 text-2xl animate-spin [animation-duration:12s]">🍃</span>
          <span className="absolute bottom-10 right-1/4 text-2xl animate-pulse [animation-duration:4s]">🌱</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs mb-2.5 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{getUIText('aadhaarVerifiedActive', langCode)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-['Baloo_2'] tracking-tight">
              {getUIText('dashGreeting', langCode)}, <span className="text-[#3fc97a]">{farmerName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-1 max-w-xl font-medium">
              {getUIText('dashWelcomeSubtitle', langCode)}
            </p>
          </div>

          {/* Integrated Weather Forecast Box */}
          <div className="shrink-0 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md min-w-[260px]">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>📍 Sambalpur, Odisha</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded text-white">
                LIVE
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CloudRain className="w-8 h-8 text-sky-300" />
                <div>
                  <div className="text-2xl font-black font-['Baloo_2'] leading-none">29°C</div>
                  <div className="text-[11px] font-bold text-emerald-100/80">Partly Cloudy</div>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-l border-white/15 pl-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-50">
                  <Droplets className="w-3.5 h-3.5 text-sky-300" />
                  <span>78%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-50">
                  <Wind className="w-3.5 h-3.5 text-slate-300" />
                  <span>14 km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. FOCUSED, UNCLUTTERED NAVIGATION CARDS (EACH PAGE)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {NAV_MODULES.map(item => (
          <div
            key={item.id}
            onClick={item.action}
            className={`p-5 rounded-3xl bg-gradient-to-br ${item.bgGrad} border border-[#d3eadb] ${item.borderCol} hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="w-12 h-12 rounded-2xl bg-white shadow-md grid place-items-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>

                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-slate-700 shadow-xs border border-slate-100">
                  {item.badge}
                </span>
              </div>

              <h2 className="text-xl font-black font-['Baloo_2'] text-[#12392a] group-hover:text-[#0e9f5c] transition-colors leading-tight">
                {item.title}
              </h2>

              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>

            <div className={`mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-black ${item.textCol}`}>
              <span>{getUIText('openScreen', langCode)}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};