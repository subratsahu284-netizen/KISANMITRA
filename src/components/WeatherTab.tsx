import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types.ts';
import { fetchWeatherData, fetchAiWeatherAdvisory } from '../services/api.ts';
import { getUIText } from '../i18n/languages.ts';
import { CloudRain, Wind, Droplets, Thermometer, ShieldAlert, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface WeatherTabProps {
  onNavigateTab: (tab: string) => void;
  langCode: string;
  showToast: (msg: string) => void;
}

export const WeatherTab: React.FC<WeatherTabProps> = ({
  onNavigateTab,
  langCode,
  showToast
}) => {
  const [district, setDistrict] = useState('Sambalpur');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [riskGauge, setRiskGauge] = useState(0);
  const [aiAdvisory, setAiAdvisory] = useState<any | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);

  useEffect(() => {
    setAiAdvisory(null);
    fetchWeatherData(district).then(data => {
      setWeatherData(data);
    });
  }, [district]);

  const handleFetchGeminiWeatherAdvisory = async () => {
    setIsLoadingAdvisory(true);
    try {
      const res = await fetchAiWeatherAdvisory({
        district,
        crop: 'Tomato',
        growthStage: 'Flowering',
        language: langCode === 'or' ? 'Odia' : 'English',
        langCode
      });
      if (res.success && res.advisory) {
        setAiAdvisory(res.advisory);
        showToast(langCode === 'or' ? 'Gemini AI ପାଣିପାଗ ପରାମର୍ଶ ପ୍ରସ୍ତୁତ ✅' : 'Gemini AI Weather & Spray Advisory ready ✅');
      }
    } catch {
      showToast(langCode === 'or' ? 'AI ପରାମର୍ଶ ଲୋଡ୍ କରିବାରେ ବିଫଳ ହେଲା' : 'Failed to generate advisory');
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  // Animate risk gauge count-up
  useEffect(() => {
    setRiskGauge(0);
    const target = district === 'Sambalpur' ? 78 : district === 'Warangal' ? 62 : 45;
    const interval = setInterval(() => {
      setRiskGauge(prev => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        return prev + 2;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [district]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
      {/* Hero Decision Support Section */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0f4a33] via-[#0b2a1f] to-[#2b1f0b] text-white border border-[#0e7a4a]/30 shadow-2xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-block bg-[#ffc533] text-[#3a2700] font-black text-xs px-3 py-1 rounded-full mb-2.5 shadow">
              🧠 {getUIText('integratedSupport', langCode)}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-['Baloo_2'] leading-tight">
              {langCode === 'or' ? 'ଟମାଟୋ (ହାଇବ୍ରିଡ୍ ଶିଭମ)' : 'Tomato (Hybrid Shivam)'} <span className="text-[#2fbf71]">· {getUIText('stageFlowering', langCode)}</span>
            </h1>
            <p className="text-sky-300 font-bold text-sm mt-1 flex items-center gap-1">
              <span>📍</span>
              <span>{district}, {getUIText('agriDistrict', langCode)}</span>
            </p>
          </div>

          {/* Risk Gauge Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
              <circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="rgba(11,122,69,0.25)"
                strokeWidth="13"
              />
              <circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="url(#riskGradient)"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray="390"
                strokeDashoffset={390 - (390 * riskGauge) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffc533" />
                  <stop offset="100%" stopColor="#e5484d" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <b className="font-extrabold text-3xl font-['Baloo_2'] text-rose-400 leading-none">
                {riskGauge}
              </b>
              <small className="text-[11px] font-bold text-rose-300 mt-0.5">
                {riskGauge > 70 ? getUIText('severeRisk', langCode) : riskGauge > 50 ? getUIText('moderateRisk', langCode) : getUIText('lowRisk', langCode)}
              </small>
            </div>
          </div>
        </div>

        {/* 3 Decision Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Card 1: Crop Protection */}
          <article className="rounded-2xl p-5 bg-white text-slate-800 border-t-4 border-amber-500 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-extrabold text-sm text-[#12392a] flex items-center gap-1.5">
                <span className="text-base">🍂</span>
                <span>{getUIText('cropProtection', langCode)}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {getUIText('activeSymptoms', langCode)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {langCode === 'or'
                ? 'ପତ୍ର ପୋଡ଼ା ରୋଗ (Early Blight) ଦ୍ୱାରା ଆକ୍ରାନ୍ତ ତଳ ପତ୍ରଗୁଡ଼ିକୁ କାଟି କ୍ଷେତରୁ ଦୂରରେ ପୋତି ଦିଅନ୍ତୁ।'
                : 'Prune lower leaves infected with Early Blight and isolate the foliage to limit spore spread.'}
            </p>
            <button
              onClick={() => onNavigateTab('diagnosis')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{langCode === 'or' ? 'ନିଦାନ ପରୀକ୍ଷା ଦେଖନ୍ତୁ' : 'View full diagnosis report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>

          {/* Card 2: Spray Window */}
          <article className="rounded-2xl p-5 bg-white text-slate-800 border-t-4 border-rose-500 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-extrabold text-sm text-[#12392a] flex items-center gap-1.5">
                <span className="text-base">🚫</span>
                <span>{getUIText('safeSprayWindow', langCode)}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 animate-pulse">
                {weatherData?.current.humidity && weatherData.current.humidity > 70
                  ? getUIText('dontSpray', langCode)
                  : getUIText('spraySafe', langCode)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {langCode === 'or'
                ? `ଅତ୍ୟଧିକ ଆର୍ଦ୍ରତା (${weatherData?.current.humidity || 78}%) ରୋଗ ବ୍ୟାପିବା ବଢ଼ାଏ। ପବନ ଗତି ଯାଞ୍ଚ କରି ସ୍ପ୍ରେ କରନ୍ତୁ।`
                : `High humidity (${weatherData?.current.humidity || 78}%) raises spore spread. Weather is borderline, check wind.`}
            </p>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
              <span>{getUIText('optimalTomorrow', langCode)}</span>
            </span>
          </article>

          {/* Card 3: Mandi & Harvest */}
          <article className="rounded-2xl p-5 bg-white text-slate-800 border-t-4 border-sky-500 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-extrabold text-sm text-[#12392a] flex items-center gap-1.5">
                <span className="text-base">🧺</span>
                <span>{getUIText('marketTiming', langCode)}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">
                {getUIText('holdAdvice', langCode)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {langCode === 'or'
                ? 'ଫସଲ ଏପର୍ଯ୍ୟନ୍ତ ସମ୍ପୂର୍ଣ୍ଣ ପାକଳ ହୋଇନାହିଁ। ଫଳ ଲାଲ୍ ରଙ୍ଗ ଧରିବା ପର୍ଯ୍ୟନ୍ତ କୃଷି ଯତ୍ନ ଜାରି ରଖନ୍ତୁ।'
                : 'The crop hasn\'t reached full maturity. Keep up agronomic care until breaker fruit is ready to pick.'}
            </p>
            <button
              onClick={() => onNavigateTab('mandi')}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{langCode === 'or' ? 'ଲାଇଭ ମଣ୍ଡି ଦର ଦେଖନ୍ତୁ' : 'Check live mandi rates'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        </div>

        {/* Gemini AI Real-Time Spray & Weather Advisory */}
        <div className="relative z-10 mt-6 p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                {langCode === 'or' ? 'Gemini AI ସମନ୍ୱିତ ପାଣିପାଗ ଓ ସ୍ପ୍ରେ ସୁରକ୍ଷା ବିଶ୍ଳେଷଣ' : 'Gemini AI Integrated Spray & Weather Advisory'}
              </h2>
            </div>
            <button
              onClick={handleFetchGeminiWeatherAdvisory}
              disabled={isLoadingAdvisory}
              className="px-3 py-1.5 rounded-xl bg-[#2fbf71] hover:bg-[#28a863] text-emerald-950 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdvisory ? 'animate-spin' : ''}`} />
              <span>{isLoadingAdvisory ? (langCode === 'or' ? 'ବିଶ୍ଳେଷଣ ଚାଲିଛି...' : 'Analyzing...') : (langCode === 'or' ? '✨ AI ପାଣିପାଗ ପରାମର୍ଶ ପାଆନ୍ତୁ' : '✨ Generate AI Spray Advisory')}</span>
            </button>
          </div>

          {aiAdvisory ? (
            <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/10 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-amber-300 text-sm sm:text-base">
                  ⚡ {aiAdvisory.headline}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  aiAdvisory.sprayDecision === 'Safe to Spray' ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-500 text-white'
                }`}>
                  {aiAdvisory.sprayDecision}
                </span>
              </div>
              <div className="text-emerald-200 text-xs">
                🕒 <b>{langCode === 'or' ? 'ଉପଯୁକ୍ତ ସ୍ପ୍ରେ ସମୟ' : 'Optimal Spray Window'}:</b> {aiAdvisory.bestSprayWindow}
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                🔬 <b>{langCode === 'or' ? 'ରୋଗ ଆଶଙ୍କା' : 'Infection Risk'}:</b> {aiAdvisory.fungalDiseaseRisk}
              </p>
              {aiAdvisory.actionSteps && (
                <ul className="space-y-1 pt-2 border-t border-white/10">
                  {aiAdvisory.actionSteps.map((step: string, idx: number) => (
                    <li key={idx} className="text-xs text-emerald-100 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-xs text-emerald-100 flex items-center justify-between gap-2">
              <span>{langCode === 'or' ? 'ଆପଣଙ୍କ ଜିଲ୍ଲାର ତାପମାତ୍ରା, ବର୍ଷା ସମ୍ଭାବନା ଓ ଆର୍ଦ୍ରତା ଉପରେ ଆଧାରିତ AI ସ୍ପ୍ରେ ସୁପାରିଶ ପାଇବାକୁ ଉପର ବଟନ କ୍ଲିକ୍ କରନ୍ତୁ।' : 'Click the button above to generate real-time agronomic spray safety recommendations using Gemini AI.'}</span>
            </div>
          )}
        </div>

        {/* Advisory Warning */}
        <div className="relative z-10 mt-5 p-3.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <b>Key guidance:</b> AI diagnosis is advisory, based on visible symptoms. Disease signs
            can look like stress or nutrient deficiency. Confirm with your local Krishi Vigyan
            Kendra (KVK) or extension specialist before buying or applying chemicals.
          </div>
        </div>
      </section>

      {/* Weather & Field Advisory Section */}
      <section className="mt-6 rounded-3xl p-6 bg-white border border-[#d3eadb] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
              🌦️ Weather & field advisory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check blight risk, safe spraying windows, and best days for field operations.
            </p>
          </div>

          {/* District Chips */}
          <div className="flex flex-wrap gap-2">
            {['Sambalpur', 'Nashik', 'Warangal', 'Karnal', 'Pune', 'Varanasi'].map(d => (
              <button
                key={d}
                onClick={() => {
                  setDistrict(d);
                  showToast(`Location updated: ${d}`);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  district === d
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Stat Cards */}
        {weatherData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <Droplets className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {weatherData.current.humidity}%
              </div>
              <span className="text-[11px] font-bold text-slate-500">{getUIText('airHumidity', langCode)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
              <Thermometer className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {weatherData.current.temp}°C
              </div>
              <span className="text-[11px] font-bold text-slate-500">{getUIText('airTemperature', langCode)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
              <Wind className="w-6 h-6 text-sky-600 mx-auto mb-1" />
              <div className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {weatherData.current.wind} km/h
              </div>
              <span className="text-[11px] font-bold text-slate-500">{getUIText('windSpeed', langCode)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
              <CloudRain className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {weatherData.current.rainChance}%
              </div>
              <span className="text-[11px] font-bold text-slate-500">{getUIText('rainProbability', langCode)}</span>
            </div>
          </div>
        )}

        {/* Next 24 Hours Spray Safety Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-sm text-[#12392a]">
              {getUIText('sprayWindow24h', langCode)}
            </h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12a150]" />
                <span>{getUIText('spraySafe', langCode)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffc533]" />
                <span>{getUIText('sprayBorderline', langCode)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5484d]" />
                <span>{getUIText('dontSpray', langCode)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-28 bg-[#f7fcf9] p-3 rounded-2xl border border-emerald-100 overflow-x-auto">
            {weatherData?.hourlySprayForecast.map(h => {
              const barColor =
                h.status === 'dont_spray'
                  ? '#e5484d'
                  : h.status === 'borderline'
                  ? '#ffc533'
                  : '#12a150';
              const heightPx = 28 + Math.min(h.riskLevel, 4) * 16;

              return (
                <div
                  key={h.hour}
                  className="flex-1 min-w-[20px] flex flex-col items-center justify-end group relative"
                  title={`${h.hour}: ${h.status.replace('_', ' ')} (Humidity ${h.humidity}%, Rain ${h.rainChance}%)`}
                >
                  <div
                    style={{ height: `${heightPx}px`, backgroundColor: barColor }}
                    className="w-full rounded-t-md hover:brightness-110 transition-all cursor-pointer"
                  />
                  <span className="text-[9px] font-bold text-slate-400 mt-1">{h.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
