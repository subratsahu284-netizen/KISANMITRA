import React, { useState, useEffect } from 'react';
import { MandiCropData } from '../types.ts';
import { fetchMandiData, saveMandiAlert, fetchAiMandiAdvice } from '../services/api.ts';
import { getUIText, getLocalizedVegetableName } from '../i18n/languages.ts';
import { TrendingUp, TrendingDown, Bell, BellRing, Plus, Minus, ArrowUpRight, Sparkles, RefreshCw } from 'lucide-react';

interface MandiTabProps {
  langCode: string;
  showToast: (msg: string) => void;
}

export const MandiTab: React.FC<MandiTabProps> = ({ langCode, showToast }) => {
  const [crops, setCrops] = useState<string[]>([]);
  const [allData, setAllData] = useState<Record<string, MandiCropData>>({});
  const [selectedCropKey, setSelectedCropKey] = useState<string>('Tomato');
  const [activeCrop, setActiveCrop] = useState<MandiCropData | null>(null);
  const [threshold, setThreshold] = useState<number>(2650);
  const [isAlertOn, setIsAlertOn] = useState<boolean>(true);
  const [hoveredDot, setHoveredDot] = useState<{ day: string; price: number; x: number; y: number } | null>(null);
  const [geminiAdvice, setGeminiAdvice] = useState<any | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);

  useEffect(() => {
    setGeminiAdvice(null);
    fetchMandiData(selectedCropKey).then(res => {
      if (res.success) {
        setCrops(res.crops);
        setAllData(res.allData);
        setActiveCrop(res.selectedCrop);
        setThreshold(res.selectedCrop.defaultThreshold || 2650);
      }
    });
  }, [selectedCropKey]);

  const handleToggleAlert = async () => {
    const newState = !isAlertOn;
    setIsAlertOn(newState);
    await saveMandiAlert(selectedCropKey, threshold, newState);
    showToast(
      newState
        ? `SMS price alert activated for ${selectedCropKey} at ₹${threshold}/Q`
        : `SMS alert deactivated for ${selectedCropKey}`
    );
  };

  const handleAdjustThreshold = (delta: number) => {
    const nextVal = Math.max(500, threshold + delta);
    setThreshold(nextVal);
    saveMandiAlert(selectedCropKey, nextVal, isAlertOn);
  };

  const handleFetchGeminiMarketAdvice = async () => {
    if (!activeCrop) return;
    setIsLoadingAdvice(true);
    try {
      const res = await fetchAiMandiAdvice({
        crop: selectedCropKey,
        district: 'Sambalpur',
        modalPrice: activeCrop.series[activeCrop.series.length - 1],
        minPrice: activeCrop.minPrice,
        maxPrice: activeCrop.maxPrice,
        changePercent: activeCrop.changePercent,
        dailyVolume: activeCrop.dailyVolume,
        language: langCode === 'or' ? 'Odia' : 'English',
        langCode
      });
      if (res.success && res.advice) {
        setGeminiAdvice(res.advice);
        showToast(langCode === 'or' ? 'Gemini AI ବଜାର ପରାମର୍ଶ ପ୍ରସ୍ତୁତ ✅' : 'Gemini AI Market Strategy generated ✅');
      }
    } catch {
      showToast(langCode === 'or' ? 'AI ପରାମର୍ଶ ଲୋଡ୍ କରିବାରେ ବିଫଳ ହେଲା' : 'Failed to generate AI advice');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const dates = ['Oct 30', 'Oct 31', 'Nov 01', 'Nov 02', 'Nov 03', 'Nov 04', 'Nov 05'];

  // SVG Chart points calculation
  const series = activeCrop?.series || [2064, 2130, 2190, 2260, 2290, 2380, 2450];
  const minVal = Math.min(...series) - 60;
  const maxVal = Math.max(activeCrop?.maxPrice || 2750, ...series) + 60;
  const getX = (idx: number) => 50 + idx * 88;
  const getY = (val: number) => 220 - ((val - minVal) / (maxVal - minVal || 1)) * 170;

  const pathD = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const areaD = `${pathD} L ${getX(series.length - 1)} 220 L ${getX(0)} 220 Z`;
  const isUp = (activeCrop?.changePercent || 0) >= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
      {/* Intro Header */}
      <section className="bg-gradient-to-r from-[#0b7a55] via-[#0f4a33] to-[#2b1f0b] text-white rounded-3xl p-6 sm:p-7 border border-[#0e7a4a]/30 shadow-lg mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-white/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-2">
              📈 {getUIText('mandiIntelligence', langCode)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-['Baloo_2']">
              {getUIText('mandiTitleHeader', langCode)}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1">
              {getUIText('mandiSubHeader', langCode)}
            </p>
          </div>

          {/* Crop Selector Chips */}
          <div className="flex flex-wrap gap-2">
            {crops.map(c => {
              const data = allData[c];
              const isSelected = selectedCropKey === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCropKey(c)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-emerald-950 shadow-md scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span>{data?.icon || '🌱'}</span>
                  <span>{getLocalizedVegetableName(c.toLowerCase(), c, langCode)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ticker marquee */}
      <div className="w-full overflow-hidden bg-white rounded-full py-2.5 px-4 border border-[#d3eadb] shadow-xs mb-6 flex items-center gap-6">
        <span className="text-[11px] font-black uppercase text-slate-400 shrink-0">Live Mandi:</span>
        <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto scrollbar-none text-xs font-bold text-slate-800">
          {crops.map(k => {
            const c = allData[k];
            if (!c) return null;
            const currentP = c.series[c.series.length - 1];
            const positive = c.changePercent >= 0;
            return (
              <span key={k} className="inline-flex items-center gap-1.5 shrink-0">
                <span>{c.icon}</span>
                <span>{getLocalizedVegetableName(k.toLowerCase(), k, langCode)}:</span>
                <span className="font-extrabold">₹{currentP}</span>
                <span className={`text-[10px] font-black ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {positive ? '▲' : '▼'} {Math.abs(c.changePercent)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      {activeCrop && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Selected Crop Rate & SMS Alerts */}
          <section className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#d3eadb] shadow-sm">
            <div className="flex items-center justify-between text-slate-400 font-bold text-xs mb-2">
              <span>📌 {langCode === 'or' ? 'ମନୋନୀତ ଫସଲ' : 'Selected Mandi Commodity'}</span>
              <span>🕒 Today, 09:15 AM</span>
            </div>

            <div className="text-xl sm:text-2xl font-black font-['Baloo_2'] text-[#12392a] flex items-center gap-2">
              <span>{activeCrop.icon}</span>
              <span>{getLocalizedVegetableName(activeCrop.name.toLowerCase(), activeCrop.name, langCode)}</span>
            </div>
            <div className="text-xs text-sky-600 font-bold mt-0.5">
              📍 Sambalpur Main APMC, Sambalpur (Odisha)
            </div>

            {/* Wholesale Modal Box */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-200">
              <span className="text-xs font-bold text-slate-500">{getUIText('modalRate', langCode)}</span>
              <div className="text-3xl sm:text-4xl font-black font-['Baloo_2'] text-[#12392a] mt-1">
                ₹{activeCrop.series[activeCrop.series.length - 1]}
                <span className="text-xs text-slate-500 font-semibold ml-2">
                  {langCode === 'or' ? 'କ୍ୱିଣ୍ଟାଲ ପିଛା (୧୦୦ କେଜି)' : 'per quintal (100 kg)'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold mt-2 pt-2 border-t border-slate-100">
                <span className="text-slate-600">
                  {langCode === 'or' ? 'ଖୁଚୁରା ଆକଳନ:' : 'Retail est:'} ₹{(activeCrop.series[activeCrop.series.length - 1] / 100).toFixed(1)}/kg
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isUp ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>
                    {isUp ? '+' : ''}
                    {activeCrop.changePercent}%
                  </span>
                </span>
              </div>
            </div>

            {/* AI Mandi Timing Advice */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#06301f] to-[#0e4a47] text-white relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-extrabold text-emerald-300">{getUIText('aiTimingAdvice', langCode)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    {geminiAdvice?.timingBadge || (activeCrop.timingBadge === 'Sell now'
                      ? getUIText('sellNow', langCode)
                      : activeCrop.timingBadge === 'Hold 3–4 days'
                      ? getUIText('holdAdvice', langCode)
                      : activeCrop.timingBadge === 'Store & wait'
                      ? getUIText('storeAdvice', langCode)
                      : activeCrop.timingBadge)}
                  </span>
                  <button
                    onClick={handleFetchGeminiMarketAdvice}
                    disabled={isLoadingAdvice}
                    title="Generate Live Gemini AI Market Intelligence"
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition cursor-pointer text-emerald-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdvice ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {geminiAdvice ? (
                <div className="space-y-2 mt-2">
                  <div className="text-xs font-bold text-amber-300 bg-black/30 p-2 rounded-lg border border-white/10">
                    🎯 {geminiAdvice.summary}
                  </div>
                  <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                    {geminiAdvice.detailedAdvice}
                  </p>
                  <div className="text-[11px] text-sky-200 font-semibold">
                    📈 {langCode === 'or' ? 'ଦର ପୂର୍ବାନୁମାନ' : '5-Day Outlook'}: {geminiAdvice.priceOutlook}
                  </div>
                  {geminiAdvice.actionItems && geminiAdvice.actionItems.length > 0 && (
                    <ul className="space-y-1 pt-1 border-t border-white/10">
                      {geminiAdvice.actionItems.map((act: string, i: number) => (
                        <li key={i} className="text-[11px] text-emerald-100 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                    {langCode === 'or'
                      ? activeCrop.timingBadge === 'Sell now'
                        ? 'ଉଚ୍ଚ ମଣ୍ଡି ଚାହିଦା ଏବଂ ପାଇକାରୀ ଦର ଭଲ ରହିଛି। ଆଗାମୀ ଦିନରେ ଅଧିକ ଆମଦାନୀ ହେଲେ ଦର ଖସିପାରେ, ତେଣୁ ଏବେ ବିକ୍ରି କରିବା ଲାଭଜନକ।'
                        : activeCrop.timingBadge === 'Hold 3–4 days'
                        ? 'ଆସନ୍ତା ୩-୪ ଦିନରେ ବଜାର ଦର ଆହୁରି ବଢ଼ିବାର ଆଶଙ୍କା ଅଛି। ଉତ୍ପାଦିତ ଫସଲକୁ ସାଇତି ରଖନ୍ତୁ ଏବଂ ଅନୁକୂଳ ଦରରେ ବିକ୍ରି କରନ୍ତୁ।'
                        : 'ବର୍ତ୍ତମାନ ବଜାରରେ ଅତ୍ୟଧିକ ଆମଦାନୀ କାରଣରୁ ଦର କମ ରହିଛି। ଶୀତଳ ଭଣ୍ଡାର କିମ୍ବା ଉପଯୁକ୍ତ ସ୍ଥାନରେ ରଖି ଭାଉ ବଢ଼ିବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ।'
                      : activeCrop.advice}
                  </p>
                  <button
                    onClick={handleFetchGeminiMarketAdvice}
                    disabled={isLoadingAdvice}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 transition text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isLoadingAdvice ? (langCode === 'or' ? 'Gemini AI ବିଶ୍ଳେଷଣ ଚାଲିଛି...' : 'Analyzing with Gemini AI...') : (langCode === 'or' ? '✨ ଲାଇଭ୍ Gemini ବଜାର ପରାମର୍ଶ ପାଆନ୍ତୁ' : '✨ Generate Live Gemini Market Strategy')}</span>
                  </button>
                </>
              )}
            </div>

            {/* SMS Price Alert Setting */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base text-amber-600">
                  {isAlertOn ? <BellRing className="w-4 h-4 text-emerald-600" /> : <Bell className="w-4 h-4 text-slate-400" />}
                </span>
                <span>{getUIText('smsAlert', langCode)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustThreshold(-50)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 grid place-items-center hover:bg-slate-100 transition font-black"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <b className="min-w-[60px] text-center font-['Baloo_2'] text-sm">₹{threshold}</b>
                <button
                  onClick={() => handleAdjustThreshold(50)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 grid place-items-center hover:bg-slate-100 transition font-black"
                >
                  <Plus className="w-3 h-3" />
                </button>

                <button
                  onClick={handleToggleAlert}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ml-1 ${
                    isAlertOn ? 'bg-[#0e9f5c]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      isAlertOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: 7-Day Trend Chart & Min/Max */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#d3eadb] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-sm text-[#12392a] flex items-center gap-1.5">
                <span>📊 7-Day Price Trend (₹ per quintal)</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                Daily volume: <b>{activeCrop.dailyVolume}</b>
              </span>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative mt-2 p-2 bg-[#f8fcf9] rounded-2xl border border-emerald-100 overflow-hidden">
              {hoveredDot && (
                <div
                  style={{ left: `${hoveredDot.x}px`, top: `${hoveredDot.y - 35}px` }}
                  className="absolute z-20 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
                >
                  {hoveredDot.day}: ₹{hoveredDot.price}
                </div>
              )}

              <svg viewBox="0 0 600 260" className="w-full h-auto">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#12a150' : '#e5484d'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isUp ? '#12a150' : '#e5484d'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.5, 1].map(f => {
                  const val = Math.round(minVal + (maxVal - minVal) * f);
                  const yPos = getY(val);
                  return (
                    <g key={f}>
                      <line
                        x1="40"
                        x2="580"
                        y1={yPos}
                        y2={yPos}
                        stroke="rgba(11,122,69,0.15)"
                        strokeDasharray="4 4"
                      />
                      <text x="5" y={yPos + 4} className="fill-slate-400 text-[10px] font-bold">
                        ₹{val}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <path d={areaD} fill="url(#areaGrad)" />

                {/* Trend Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isUp ? '#12a150' : '#e5484d'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {series.map((val, idx) => {
                  const x = getX(idx);
                  const y = getY(val);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#ffffff"
                      stroke={isUp ? '#12a150' : '#e5484d'}
                      strokeWidth="3"
                      className="cursor-pointer hover:r-8 transition-all"
                      onMouseEnter={e => {
                        const rect = (e.target as SVGElement).getBoundingClientRect();
                        const parent = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        if (parent) {
                          setHoveredDot({
                            day: dates[idx],
                            price: val,
                            x: rect.left - parent.left + rect.width / 2,
                            y: rect.top - parent.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDot(null)}
                    />
                  );
                })}

                {/* Date Labels on X Axis */}
                {dates.map((d, i) => (
                  <text
                    key={d}
                    x={getX(i)}
                    y="250"
                    textAnchor="middle"
                    className="fill-slate-400 text-[11px] font-bold"
                  >
                    {d}
                  </text>
                ))}
              </svg>
            </div>

            {/* Min / Modal / Max Summary Boxes */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-sky-50 text-center border border-sky-100">
                <span className="text-[11px] font-bold text-sky-700 block">⬇️ Min Price</span>
                <b className="text-lg font-black font-['Baloo_2'] text-sky-900">
                  ₹{activeCrop.minPrice}
                </b>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 text-center border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 block">🎯 Modal Rate</span>
                <b className="text-lg font-black font-['Baloo_2'] text-emerald-900">
                  ₹{activeCrop.series[activeCrop.series.length - 1]}
                </b>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50 text-center border border-pink-100">
                <span className="text-[11px] font-bold text-pink-700 block">⬆️ Max Price</span>
                <b className="text-lg font-black font-['Baloo_2'] text-pink-900">
                  ₹{activeCrop.maxPrice}
                </b>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
