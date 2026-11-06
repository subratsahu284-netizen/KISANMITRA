import React, { useRef } from 'react';
import { LayoutDashboard, CloudSun, Camera, TrendingUp, Users } from 'lucide-react';
import { getUIText } from '../i18n/languages.ts';

interface BottomBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCameraPhotoCaptured: (photoDataUrl: string, fileName: string) => void;
  langCode: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onTabChange,
  onCameraPhotoCaptured,
  langCode
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onCameraPhotoCaptured(reader.result as string, file.name);
      onTabChange('diagnosis');
      // Reset input so taking the same photo again fires onChange
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    // Open camera capture immediately
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    } else {
      onTabChange('diagnosis');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 select-none">
      {/* Hidden native camera capture input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Persistent Bottom Bar with frosted glass & shadow */}
      <div className="bg-white/95 backdrop-blur-md border-t border-[#d3eadb] shadow-[0_-8px_30px_rgba(18,57,42,0.12)]">
        <div className="max-w-2xl mx-auto px-2 sm:px-6">
          <div className="h-16 sm:h-18 flex items-center justify-between relative">
            {/* ========================================= */}
            {/* LEFT FEATURE 1: Dashboard                */}
            {/* ========================================= */}
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer group ${
                activeTab === 'dashboard' ? 'text-[#0e9f5c]' : 'text-[#5a7a69] hover:text-[#12392a]'
              }`}
              title={getUIText('navDashboard', langCode)}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-[#0e9f5c] scale-110 shadow-xs'
                    : 'group-hover:bg-[#f3faf5]'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                {activeTab === 'dashboard' && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0e9f5c]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate max-w-17 sm:max-w-21.25 leading-tight mt-0.5 ${
                  activeTab === 'dashboard' ? 'text-[#0e9f5c] font-extrabold' : 'text-[#5a7a69]'
                }`}
              >
                {getUIText('navDashboard', langCode)}
              </span>
            </button>

            {/* ========================================= */}
            {/* LEFT FEATURE 2: Weather & Spray          */}
            {/* ========================================= */}
            <button
              onClick={() => onTabChange('weather')}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer group ${
                activeTab === 'weather' ? 'text-[#0e9f5c]' : 'text-[#5a7a69] hover:text-[#12392a]'
              }`}
              title={getUIText('weatherSpray', langCode)}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'weather'
                    ? 'bg-emerald-50 text-[#0e9f5c] scale-110 shadow-xs'
                    : 'group-hover:bg-[#f3faf5]'
                }`}
              >
                <CloudSun className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={activeTab === 'weather' ? 2.5 : 2} />
                {activeTab === 'weather' && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0e9f5c]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate max-w-17 sm:max-w-[85px] leading-tight mt-0.5 ${
                  activeTab === 'weather' ? 'text-[#0e9f5c] font-extrabold' : 'text-[#5a7a69]'
                }`}
              >
                {getUIText('weatherSpray', langCode)}
              </span>
            </button>

            {/* ========================================= */}
            {/* CENTER FEATURE (MIDDLE): Camera Scanner  */}
            {/* ========================================= */}
            <div className="flex-1 flex flex-col items-center justify-center relative -mt-5 sm:-mt-6">
              <button
                onClick={handleCameraClick}
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#0b7a45] via-[#0e9f5c] to-[#2fbf71] text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 border-3 border-white ring-2 transition-all duration-200 hover:scale-108 active:scale-95 cursor-pointer group ${
                  activeTab === 'diagnosis' ? 'ring-[#0e9f5c] ring-offset-1' : 'ring-emerald-200/80 hover:ring-emerald-400'
                }`}
                aria-label="Capture leaf photo for AI diagnosis"
                title={getUIText('cameraScan', langCode)}
              >
                <div className="relative flex items-center justify-center">
                  <Camera className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-6 transition-transform duration-200" strokeWidth={2.3} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 ring-1 ring-white animate-pulse" />
                </div>
              </button>
              <button
                onClick={() => onTabChange('diagnosis')}
                className={`text-[10px] sm:text-[11px] font-black tracking-tight truncate max-w-[80px] sm:max-w-[90px] leading-tight mt-1 transition cursor-pointer ${
                  activeTab === 'diagnosis' ? 'text-[#0e9f5c]' : 'text-[#12392a] hover:text-[#0e9f5c]'
                }`}
              >
                {getUIText('cameraScan', langCode)}
              </button>
            </div>

            {/* ========================================= */}
            {/* RIGHT FEATURE 1: Mandi Prices            */}
            {/* ========================================= */}
            <button
              onClick={() => onTabChange('mandi')}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer group ${
                activeTab === 'mandi' ? 'text-[#0e9f5c]' : 'text-[#5a7a69] hover:text-[#12392a]'
              }`}
              title={getUIText('mandiPrices', langCode)}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'mandi'
                    ? 'bg-emerald-50 text-[#0e9f5c] scale-110 shadow-xs'
                    : 'group-hover:bg-[#f3faf5]'
                }`}
              >
                <TrendingUp className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={activeTab === 'mandi' ? 2.5 : 2} />
                {activeTab === 'mandi' && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0e9f5c]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate max-w-[68px] sm:max-w-[85px] leading-tight mt-0.5 ${
                  activeTab === 'mandi' ? 'text-[#0e9f5c] font-extrabold' : 'text-[#5a7a69]'
                }`}
              >
                {getUIText('mandiPrices', langCode)}
              </span>
            </button>

            {/* ========================================= */}
            {/* RIGHT FEATURE 2: Agri-Experts (KVK)       */}
            {/* ========================================= */}
            <button
              onClick={() => onTabChange('experts')}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer group ${
                activeTab === 'experts' ? 'text-[#0e9f5c]' : 'text-[#5a7a69] hover:text-[#12392a]'
              }`}
              title={getUIText('agriExperts', langCode)}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'experts'
                    ? 'bg-emerald-50 text-[#0e9f5c] scale-110 shadow-xs'
                    : 'group-hover:bg-[#f3faf5]'
                }`}
              >
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={activeTab === 'experts' ? 2.5 : 2} />
                {activeTab === 'experts' && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0e9f5c]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate max-w-[68px] sm:max-w-[85px] leading-tight mt-0.5 ${
                  activeTab === 'experts' ? 'text-[#0e9f5c] font-extrabold' : 'text-[#5a7a69]'
                }`}
              >
                {getUIText('agriExperts', langCode)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};