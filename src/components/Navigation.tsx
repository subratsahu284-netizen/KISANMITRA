import React from 'react';
import { getUIText } from '../i18n/languages.ts';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenVoice: () => void;
  onOpenLogin: () => void;
  farmerName: string;
  avatarIcon: string;
  langCode: string;
  scanCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenVoice,
  onOpenLogin,
  farmerName,
  avatarIcon,
  langCode,
  scanCount
}) => {
  return (
    <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-[#d3eadb] shadow-xs select-none sticky top-0 z-40 scrollbar-none">
      {/* App Logo */}
      <a
        href="#dashboard"
        onClick={e => {
          e.preventDefault();
          onTabChange('dashboard');
        }}
        className="flex items-center gap-2.5 mr-3 shrink-0 text-[#12392a] no-underline group cursor-pointer"
      >
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2fbf71] to-[#0e9f5c] grid place-items-center text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
          🌱
        </span>
        <div>
          <b className="font-extrabold text-xl font-['Baloo_2'] text-[#12392a] block leading-none">
            {getUIText('appTitle', langCode)}
          </b>
          <small className="block text-[#5a7a69] text-[11px] leading-tight font-medium">
            {getUIText('appSubtitle', langCode)}
          </small>
        </div>
      </a>

      {/* Tabs */}
      {/* 1. Dashboard Tab */}
      <button
        onClick={() => onTabChange('dashboard')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'dashboard'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>🏠</span>
        <span>{getUIText('navDashboard', langCode)}</span>
      </button>

      {/* 2. Crop Diagnosis */}
      <button
        onClick={() => onTabChange('diagnosis')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'diagnosis'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>🔬</span>
        <span>{getUIText('cropDiagnosis', langCode)}</span>
      </button>

      {/* 3. Scan History & PDF */}
      <button
        onClick={() => onTabChange('history')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'history'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>📋</span>
        <span>{getUIText('scanHistory', langCode)}</span>
        {scanCount > 0 && (
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeTab === 'history' ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {scanCount}
          </span>
        )}
      </button>

      {/* 4. Weather & Spray */}
      <button
        onClick={() => onTabChange('weather')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'weather'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>⛅</span>
        <span>{getUIText('weatherSpray', langCode)}</span>
      </button>

      {/* 5. Mandi Prices */}
      <button
        onClick={() => onTabChange('mandi')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'mandi'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>📈</span>
        <span>{getUIText('mandiPrices', langCode)}</span>
      </button>

      {/* 6. Agri-Experts */}
      <button
        onClick={() => onTabChange('experts')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'experts'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>🧑‍🔬</span>
        <span>{getUIText('agriExperts', langCode)}</span>
      </button>

      {/* 7. Farmer Profile */}
      <button
        onClick={() => onTabChange('profile')}
        className={`shrink-0 px-3.5 py-2 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'profile'
            ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white shadow-md shadow-[#0e9f5c]/30'
            : 'text-[#12392a] hover:bg-[#e9f7ee] hover:-translate-y-0.5'
        }`}
      >
        <span>👤</span>
        <span>{getUIText('farmerProfile', langCode)}</span>
      </button>

      {/* Voice Assistant Button */}
      <button
        onClick={onOpenVoice}
        className="ml-auto shrink-0 px-3.5 py-2 rounded-full font-bold text-sm border-1.5 border-[#0e9f5c] text-[#0b7a45] hover:bg-[#e9f7ee] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
      >
        <span>🎙️</span>
        <span className="hidden sm:inline">{getUIText('voiceAssistant', langCode)}</span>
      </button>

      {/* Farmer Avatar Quick Switch / Profile */}
      <button
        onClick={() => onTabChange('profile')}
        className="shrink-0 flex items-center gap-2 p-1 pr-3 rounded-full border border-[#d3eadb] hover:bg-[#f3faf5] text-[#12392a] font-bold text-sm transition cursor-pointer"
        title="View Farmer Profile"
      >
        <span className="w-8 h-8 rounded-full bg-[#d6f3e2] grid place-items-center text-base">
          {avatarIcon || '🧑‍🌾'}
        </span>
        <span className="hidden md:inline">{farmerName.split(' ')[0]}</span>
      </button>
    </nav>
  );
};
