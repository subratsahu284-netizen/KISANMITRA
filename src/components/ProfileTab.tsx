
import React, { useState, useEffect } from 'react';
import { FarmerProfile } from '../types.ts';
import { fetchFarmerProfile, updateFarmerProfile } from '../services/api.ts';
import {
  getUIText,
  getLocalizedGrowthStage,
  getLocalizedVegetableName
} from '../i18n/languages.ts';
import { Camera, Save } from 'lucide-react';

interface ProfileTabProps {
  langCode: string;
  showToast: (msg: string) => void;
  onProfileUpdated: (profile: FarmerProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  langCode,
  showToast,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [landSize, setLandSize] = useState<number>(3.5);
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares' | 'bigha'>('acres');
  const [mainCrop, setMainCrop] = useState('Tomato (Hybrid Shivam)');
  const [growthStage, setGrowthStage] = useState('Flowering');
  const [avatarIcon, setAvatarIcon] = useState('🧑‍🌾');
  const [avatarColor, setAvatarColor] = useState('#1d7a4a');
  const [customAvatarImg, setCustomAvatarImg] = useState<string | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [mandiAlerts, setMandiAlerts] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFarmerProfile().then(p => {
      if (p) {
        setProfile(p);
        setFullName(p.fullName);
        setPhone(p.phone);
        setLandSize(p.landSize);
        setLandUnit(p.landUnit);
        setMainCrop(p.mainCrop);
        setGrowthStage(p.growthStage);
        setAvatarIcon(p.avatarIcon);
        setAvatarColor(p.avatarColor);
        setWeatherAlerts(p.weatherAlerts);
        setMandiAlerts(p.mandiAlerts);
        setDiseaseAlerts(p.diseaseAlerts);
      }
    });
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomAvatarImg(reader.result as string);
      showToast(langCode === 'or' ? 'ପ୍ରୋଫାଇଲ ଫଟୋ ଅପଡେଟ୍ ହେଲା 📸' : 'Profile photo updated 📸');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateFarmerProfile({
        fullName,
        phone,
        landSize,
        landUnit,
        mainCrop,
        growthStage,
        avatarIcon,
        avatarColor,
        weatherAlerts,
        mandiAlerts,
        diseaseAlerts
      });
      setProfile(updated);
      onProfileUpdated(updated);
      showToast(
        langCode === 'or'
          ? 'ସେଭ୍ ହେଲା! ଚାଷୀ ବିବରଣୀ ସଫଳତାର ସହ ଅପଡେଟ୍ ହୋଇଛି ✅'
          : 'Saved! Your farm configuration is updated ✅'
      );
    } catch {
      showToast(langCode === 'or' ? 'ସେଟିଙ୍ଗ୍ ସେଭ୍ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା।' : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const STAGES = [
    { key: 'Seedling', icon: '🌱' },
    { key: 'Vegetative', icon: '🌿' },
    { key: 'Flowering', icon: '🌸' },
    { key: 'Fruiting', icon: '🍅' },
    { key: 'Harvesting', icon: '🧺' }
  ];

  const CROPS = [
    { id: 'tomato', defaultName: 'Tomato (Hybrid Shivam)' },
    { id: 'potato', defaultName: 'Potato (Kufri Jyoti)' },
    { id: 'chilli', defaultName: 'Chilli (G4 Dry Red)' },
    { id: 'brinjal', defaultName: 'Brinjal (Purple Round)' },
    { id: 'onion', defaultName: 'Onion (Nashik Red)' },
    { id: 'okra', defaultName: 'Okra / Ladyfinger' }
  ];

  const AVATARS = [
    { icon: '🧑‍🌾', color: '#1d7a4a' },
    { icon: '👩‍🌾', color: '#d2691e' },
    { icon: '👨🏽‍🌾', color: '#2b6cb0' },
    { icon: '🧔', color: '#7b3fa0' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-28">
      {/* Intro */}
      <section className="bg-gradient-to-r from-[#0b7a55] via-[#0f4a33] to-[#2b1f0b] text-white rounded-3xl p-6 sm:p-7 border border-[#0e7a4a]/30 shadow-lg mb-6">
        <span className="inline-block bg-white/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-2">
          👤 {getUIText('profileTagline', langCode)}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-['Baloo_2']">
          {getUIText('profileMainHeading', langCode)}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1">
          {getUIText('profileDesc', langCode)}
        </p>
      </section>

      {/* Profile Picture & Identity Card */}
      <section className="bg-white rounded-3xl p-6 border border-[#d3eadb] shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Avatar Ring */}
          <div className="relative w-32 h-32 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 via-sky-400 to-amber-400 animate-spin [animation-duration:8s] p-1 shadow-md">
              <div
                style={{ backgroundColor: customAvatarImg ? '#ffffff' : avatarColor }}
                className="w-full h-full rounded-full grid place-items-center text-5xl overflow-hidden"
              >
                {customAvatarImg ? (
                  <img src={customAvatarImg} alt="Farmer avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarIcon}</span>
                )}
              </div>
            </div>

            <label
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#2fbf71] border-2 border-white shadow-md grid place-items-center text-emerald-950 cursor-pointer hover:scale-110 transition-transform"
              title="Upload custom photo"
            >
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" capture="user" onChange={handleAvatarUpload} hidden />
            </label>
          </div>

          {/* Farmer Badges & Avatar Choice */}
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">{fullName}</h2>
            <p className="text-xs text-slate-500 font-semibold mb-3">
              {getUIText('registeredFarmer', langCode)}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                🌿 {getUIText('activeCultivator', langCode)}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-900">
                📱 {getUIText('realtimeSms', langCode)}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                ⭐ {getUIText('kisanMitraExp', langCode)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <span>{getUIText('orChooseAvatar', langCode)}</span>
              <div className="flex gap-1.5">
                {AVATARS.map((av, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAvatarIcon(av.icon);
                      setAvatarColor(av.color);
                      setCustomAvatarImg(null);
                    }}
                    style={{ backgroundColor: av.color }}
                    className={`w-9 h-9 rounded-full text-base grid place-items-center cursor-pointer transition ${
                      avatarIcon === av.icon && !customAvatarImg ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-85'
                    }`}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-xl">🌾</span>
          <b className="block text-2xl font-black font-['Baloo_2'] text-[#12392a] mt-1">
            {landSize} {landUnit === 'acres' ? getUIText('unitAcres', langCode) : landUnit === 'hectares' ? getUIText('unitHectares', langCode) : getUIText('unitBigha', langCode)}
          </b>
          <small className="text-xs font-bold text-slate-500">{getUIText('farmHolding', langCode)}</small>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
          <span className="text-xl">🍅</span>
          <b className="block text-xl font-black font-['Baloo_2'] text-[#12392a] mt-1 truncate">
            {getLocalizedVegetableName(mainCrop.toLowerCase().split(' ')[0], mainCrop.split(' (')[0], langCode)}
          </b>
          <small className="text-xs font-bold text-slate-500">{getUIText('mainMonitoredCrop', langCode)}</small>
        </div>

        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100">
          <span className="text-xl">🌸</span>
          <b className="block text-2xl font-black font-['Baloo_2'] text-[#12392a] mt-1">
            {getLocalizedGrowthStage(growthStage, langCode)}
          </b>
          <small className="text-xs font-bold text-slate-500">{getUIText('growthStageLabel', langCode)}</small>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
          <span className="text-xl">📍</span>
          <b className="block text-2xl font-black font-['Baloo_2'] text-[#12392a] mt-1">
            {langCode === 'or' ? 'ସମ୍ବଲପୁର' : 'Sambalpur'}
          </b>
          <small className="text-xs font-bold text-slate-500">{getUIText('odishaApmc', langCode)}</small>
        </div>
      </div>

      {/* 2-Column Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Section 1: Farmer Identity */}
        <section className="bg-white rounded-3xl p-6 border border-[#d3eadb] shadow-sm">
          <h2 className="text-lg font-black font-['Baloo_2'] text-[#12392a] flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-amber-300 text-emerald-950 grid place-items-center font-black text-xs">
              1
            </span>
            <span>{getUIText('farmerIdentitySection', langCode)}</span>
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#12392a] mb-1">{getUIText('fullNameLabel', langCode)}</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#0e9f5c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12392a] mb-1">
                {getUIText('mobileForSms', langCode)}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#0e9f5c]"
              />
            </div>

            {/* Notification Switches */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-[#12392a]">🌦️ {getUIText('weatherAlertsLabel', langCode)}</div>
                  <div className="text-[10px] text-slate-500">{getUIText('weatherAlertsDesc', langCode)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setWeatherAlerts(!weatherAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    weatherAlerts ? 'bg-[#0e9f5c]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      weatherAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-[#12392a]">💰 {getUIText('mandiAlertsLabel', langCode)}</div>
                  <div className="text-[10px] text-slate-500">{getUIText('mandiAlertsDesc', langCode)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMandiAlerts(!mandiAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    mandiAlerts ? 'bg-[#0e9f5c]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      mandiAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-[#12392a]">🦠 {getUIText('diseaseAlertsLabel', langCode)}</div>
                  <div className="text-[10px] text-slate-500">{getUIText('diseaseAlertsDesc', langCode)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setDiseaseAlerts(!diseaseAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    diseaseAlerts ? 'bg-[#0e9f5c]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      diseaseAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Farm Land & Crop */}
        <section className="bg-white rounded-3xl p-6 border border-[#d3eadb] shadow-sm">
          <h2 className="text-lg font-black font-['Baloo_2'] text-[#12392a] flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-emerald-300 text-emerald-950 grid place-items-center font-black text-xs">
              2
            </span>
            <span>{getUIText('farmLandAndCrop', langCode)}</span>
          </h2>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1">{getUIText('landSizeLabel', langCode)}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={landSize}
                  onChange={e => setLandSize(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#0e9f5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1">{getUIText('unitLabel', langCode)}</label>
                <select
                  value={landUnit}
                  onChange={e => setLandUnit(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#0e9f5c]"
                >
                  <option value="acres">{getUIText('unitAcres', langCode)}</option>
                  <option value="hectares">{getUIText('unitHectares', langCode)}</option>
                  <option value="bigha">{getUIText('unitBigha', langCode)}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12392a] mb-1">
                {getUIText('mainCropToMonitor', langCode)}
              </label>
              <select
                value={mainCrop}
                onChange={e => setMainCrop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#0e9f5c]"
              >
                {CROPS.map(c => (
                  <option key={c.id} value={c.defaultName}>
                    {getLocalizedVegetableName(c.id, c.defaultName, langCode)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12392a] mb-2">
                {getUIText('growthStageLabel', langCode)}
              </label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => {
                  const isSelected = growthStage === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setGrowthStage(s.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0e9f5c] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{getLocalizedGrowthStage(s.key, langCode)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Save Settings Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#19b36b] via-[#2fbf71] to-[#19b36b] text-emerald-950 font-black font-['Baloo_2'] text-xl hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Save className="w-5 h-5" />
        <span>{isSaving ? getUIText('savingToDb', langCode) : getUIText('saveSettings', langCode)}</span>
      </button>
    </div>
  );
};