import { ScanRecord, FarmerProfile, WeatherData, MandiCropData, Expert, VegetableInfo } from '../types.ts';

const API_BASE = '/api';

export async function fetchVegetables(): Promise<VegetableInfo[]> {
  const res = await fetch(`${API_BASE}/vegetables`);
  const data = await res.json();
  return data.vegetables || [];
}

export async function runCropDiagnosis(params: {
  vegetable: string;
  variety?: string;
  growthStage?: string;
  symptomsText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  autoSave?: boolean;
  language?: string;
  langCode?: string;
}): Promise<{
  success: boolean;
  diagnosis: any;
  savedRecord?: ScanRecord;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchScanHistory(vegetable?: string, problemType?: string): Promise<ScanRecord[]> {
  const params = new URLSearchParams();
  if (vegetable && vegetable !== 'all') params.append('vegetable', vegetable);
  if (problemType && problemType !== 'all') params.append('problemType', problemType);

  const res = await fetch(`${API_BASE}/scans?${params.toString()}`);
  const data = await res.json();
  return data.scans || [];
}

export async function deleteScanRecord(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/scans/${id}`, { method: 'DELETE' });
  const data = await res.json();
  return data.success;
}

export async function fetchFarmerProfile(): Promise<FarmerProfile> {
  const res = await fetch(`${API_BASE}/profile`);
  const data = await res.json();
  return data.profile;
}

export async function updateFarmerProfile(updates: Partial<FarmerProfile>): Promise<FarmerProfile> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  return data.profile;
}

export async function fetchWeatherData(district?: string): Promise<WeatherData> {
  const url = district ? `${API_BASE}/weather?district=${encodeURIComponent(district)}` : `${API_BASE}/weather`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchMandiData(crop?: string): Promise<{
  success: boolean;
  crops: string[];
  allData: Record<string, MandiCropData>;
  selectedCrop: MandiCropData;
  alerts: any[];
}> {
  const url = crop ? `${API_BASE}/mandi?crop=${encodeURIComponent(crop)}` : `${API_BASE}/mandi`;
  const res = await fetch(url);
  return res.json();
}

export async function saveMandiAlert(crop: string, thresholdPrice: number, enabled: boolean) {
  const res = await fetch(`${API_BASE}/mandi/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop, thresholdPrice, enabled })
  });
  return res.json();
}

export async function fetchExperts(): Promise<Expert[]> {
  const res = await fetch(`${API_BASE}/experts`);
  const data = await res.json();
  return data.experts || [];
}

export async function sendExpertMessage(
  expertId: number,
  message: string,
  imageUrl?: string,
  language?: string,
  langCode?: string
) {
  const res = await fetch(`${API_BASE}/experts/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expertId, message, imageUrl, language, langCode })
  });
  return res.json();
}

export async function fetchAiMandiAdvice(params: {
  crop: string;
  district?: string;
  modalPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  changePercent?: number;
  dailyVolume?: string;
  language?: string;
  langCode?: string;
}) {
  const res = await fetch(`${API_BASE}/mandi/ai-advice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchAiWeatherAdvisory(params: {
  district?: string;
  crop?: string;
  growthStage?: string;
  language?: string;
  langCode?: string;
}) {
  const res = await fetch(`${API_BASE}/weather/ai-advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function askDiagnosisFollowup(params: {
  vegetable: string;
  variety?: string;
  growthStage?: string;
  problemName: string;
  problemType: string;
  symptoms: string;
  remedies: any[];
  question: string;
  language?: string;
  langCode?: string;
}) {
  const res = await fetch(`${API_BASE}/diagnose/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function translateText(text: string, targetLangName: string, targetLangCode: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLangName, targetLangCode })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    console.error('Translation call failed:', e);
    return text;
  }
}

export async function translateBatch(texts: string[], targetLangName: string, targetLangCode: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLangName, targetLangCode })
    });
    const data = await res.json();
    return data.translations || {};
  } catch (e) {
    console.error('Batch translation call failed:', e);
    const fallback: Record<string, string> = {};
    texts.forEach(t => { fallback[t] = t; });
    return fallback;
  }
}

export async function processVoiceQuery(query: string, language?: string, langCode?: string) {
  const res = await fetch(`${API_BASE}/voice/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language, langCode })
  });
  return res.json();
}
