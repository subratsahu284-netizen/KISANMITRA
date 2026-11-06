import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { VEGETABLES_DATABASE, findVegetable } from './server/vegetablesData.ts';
import {
  diagnoseCropLeaf,
  translateBatchWithGemini,
  processVoiceQuestion,
  consultAgriSpecialistWithGemini,
  generateMandiAdviceWithGemini,
  generateWeatherSprayAdvisoryWithGemini,
  answerDiagnosisFollowupWithGemini
} from './server/geminiService.ts';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = portFromArg || (isProduction && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

// Allow large image uploads (e.g. leaf photos from mobile cameras)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Request logging for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Vegetables & Agronomic Knowledge Base ---
app.get('/api/vegetables', (req, res) => {
  res.json({
    success: true,
    total: VEGETABLES_DATABASE.length,
    vegetables: VEGETABLES_DATABASE
  });
});

app.get('/api/vegetables/:id', (req, res) => {
  const veg = findVegetable(req.params.id);
  if (!veg) {
    return res.status(404).json({ success: false, error: 'Vegetable not found' });
  }
  res.json({ success: true, vegetable: veg });
});

// --- AI Diagnosis Endpoint ---
app.post('/api/diagnose', async (req, res) => {
  try {
    const {
      vegetable,
      variety,
      growthStage,
      symptomsText,
      imageBase64,
      imageMimeType,
      language,
      langCode,
      autoSave = true
    } = req.body;

    if (!vegetable) {
      return res.status(400).json({ success: false, error: 'Vegetable name is required' });
    }

    const diagnosis = await diagnoseCropLeaf({
      vegetable,
      variety,
      growthStage,
      symptomsText,
      imageBase64,
      imageMimeType,
      language,
      langCode
    });

    let savedRecord = null;
    if (autoSave) {
      const profile = db.getProfile();
      savedRecord = db.addScan({
        vegetable,
        variety: variety || 'Standard',
        stage: growthStage || 'Vegetative',
        problemType: diagnosis.problemType,
        problemName: diagnosis.problemName,
        severity: diagnosis.severity,
        confidence: diagnosis.confidence,
        symptoms: diagnosis.symptoms,
        remedies: diagnosis.remedies,
        notes: symptomsText,
        imageUrl: imageBase64 ? imageBase64.substring(0, 400) + '...' : undefined,
        farmerName: profile.fullName,
        location: `${profile.district}, ${profile.state}`
      });
    }

    res.json({
      success: true,
      diagnosis,
      savedRecord
    });
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    res.status(500).json({ success: false, error: error.message || 'Diagnosis failed' });
  }
});

// --- Scan History Management ---
app.get('/api/scans', (req, res) => {
  const { vegetable, problemType } = req.query as { vegetable?: string; problemType?: string };
  const records = db.getScans(vegetable, problemType);
  res.json({ success: true, count: records.length, scans: records });
});

app.get('/api/scans/:id', (req, res) => {
  const record = db.getScanById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Scan not found' });
  }
  res.json({ success: true, scan: record });
});

app.post('/api/scans', (req, res) => {
  try {
    const newRecord = db.addScan(req.body);
    res.status(201).json({ success: true, scan: newRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/scans/:id', (req, res) => {
  const deleted = db.deleteScan(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Scan record not found' });
  }
  res.json({ success: true, message: 'Scan deleted successfully' });
});

// --- Farmer Profile ---
app.get('/api/profile', (req, res) => {
  const profile = db.getProfile();
  res.json({ success: true, profile });
});

app.put('/api/profile', (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- Weather & Spray Window API ---
const WEATHER_DATA: Record<string, { humidity: number; temp: number; wind: number; rainChance: number }> = {
  Sambalpur: { humidity: 78, temp: 29, wind: 14, rainChance: 40 },
  Nashik: { humidity: 54, temp: 31, wind: 9, rainChance: 10 },
  Warangal: { humidity: 62, temp: 34, wind: 18, rainChance: 20 },
  Karnal: { humidity: 48, temp: 27, wind: 22, rainChance: 5 },
  Pune: { humidity: 58, temp: 30, wind: 12, rainChance: 15 },
  Varanasi: { humidity: 72, temp: 32, wind: 11, rainChance: 35 }
};

app.get('/api/weather', (req, res) => {
  const district = (req.query.district as string) || 'Sambalpur';
  const data = WEATHER_DATA[district] || WEATHER_DATA['Sambalpur'];

  // Calculate 24-hr hourly safety forecast
  const hourly = [];
  for (let i = 0; i < 24; i++) {
    const wave = Math.sin(i / 3.5) * 12;
    const hum = Math.round(data.humidity + wave);
    const wind = Math.round(data.wind + Math.cos(i / 2) * 6);
    const rain = Math.round(Math.max(0, data.rainChance + Math.sin(i / 2.2) * 18));
    const risk = (hum > 75 ? 2 : hum > 62 ? 1 : 0) +
                 (wind > 20 ? 2 : wind > 14 ? 1 : 0) +
                 (rain > 35 ? 2 : rain > 20 ? 1 : 0);
    const status = risk >= 3 ? 'dont_spray' : risk >= 1 ? 'borderline' : 'safe';
    hourly.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      humidity: hum,
      windSpeed: wind,
      rainChance: rain,
      status,
      riskLevel: risk
    });
  }

  res.json({
    success: true,
    district,
    current: data,
    availableDistricts: Object.keys(WEATHER_DATA),
    hourlySprayForecast: hourly,
    overallRisk: data.humidity > 75 ? 'Severe risk' : data.humidity > 60 ? 'Moderate' : 'Low'
  });
});

// --- Mandi Market Prices ---
const MANDI_DATA: Record<string, any> = {
  Tomato: {
    icon: '🍅',
    name: 'Tomato • Hybrid Shivam (Grade A)',
    color: '#ff7a59',
    series: [2064, 2130, 2190, 2260, 2290, 2380, 2450],
    minPrice: 2100,
    maxPrice: 2750,
    dailyVolume: '42 tons',
    changePercent: 6.5,
    timingBadge: 'Sell now',
    advice: 'Mandi price is 8.2% above weekly average as rain delayed arrivals from neighboring states. Pick ripe fruit and sell today.',
    defaultThreshold: 2650
  },
  Chilli: {
    icon: '🌶️',
    name: 'Chilli • Dry Red (Grade A)',
    color: '#e5484d',
    series: [8200, 8100, 8350, 8400, 8300, 8550, 8620],
    minPrice: 8100,
    maxPrice: 9100,
    dailyVolume: '18 tons',
    changePercent: 0.8,
    timingBadge: 'Hold 3–4 days',
    advice: 'Wholesale prices are steadily climbing. Dry the harvested pods properly and hold for the upcoming auction.',
    defaultThreshold: 9000
  },
  Onion: {
    icon: '🧅',
    name: 'Onion • Red Nashik (Grade A)',
    color: '#b57aff',
    series: [1850, 1800, 1760, 1720, 1690, 1650, 1620],
    minPrice: 1580,
    maxPrice: 1900,
    dailyVolume: '65 tons',
    changePercent: -1.9,
    timingBadge: 'Store & wait',
    advice: 'Prices have slid for 6 consecutive days due to heavy fresh arrivals. If you possess dry storage, hold off on panic sales.',
    defaultThreshold: 1900
  },
  Paddy: {
    icon: '🌾',
    name: 'Paddy • Common (Grade A)',
    color: '#ffc533',
    series: [2180, 2185, 2190, 2190, 2200, 2205, 2210],
    minPrice: 2150,
    maxPrice: 2300,
    dailyVolume: '120 tons',
    changePercent: 0.2,
    timingBadge: 'Steady',
    advice: 'Government MSP procurement is steady. Sell once grain moisture content falls below 14% benchmark.',
    defaultThreshold: 2300
  },
  Potato: {
    icon: '🥔',
    name: 'Potato • Jyoti Fresh (Grade A)',
    color: '#9c7b4f',
    series: [1420, 1450, 1470, 1510, 1530, 1580, 1610],
    minPrice: 1400,
    maxPrice: 1750,
    dailyVolume: '55 tons',
    changePercent: 3.1,
    timingBadge: 'Good time to sell',
    advice: 'Cold storage dispatches are stabilizing. Demand in local city markets is firming up.',
    defaultThreshold: 1650
  },
  Brinjal: {
    icon: '🍆',
    name: 'Brinjal • Long Purple (Grade A)',
    color: '#7b3fa0',
    series: [1250, 1300, 1350, 1320, 1380, 1420, 1460],
    minPrice: 1200,
    maxPrice: 1600,
    dailyVolume: '22 tons',
    changePercent: 2.8,
    timingBadge: 'Sell fresh',
    advice: 'Vegetable freshness commands premium. Harvest early morning and bring to mandi before 9 AM.',
    defaultThreshold: 1500
  }
};

app.get('/api/mandi', (req, res) => {
  const crop = (req.query.crop as string) || 'Tomato';
  const selected = MANDI_DATA[crop] || MANDI_DATA['Tomato'];
  const alerts = db.getAlerts();

  res.json({
    success: true,
    crops: Object.keys(MANDI_DATA),
    allData: MANDI_DATA,
    selectedCrop: selected,
    alerts
  });
});

app.post('/api/mandi/alerts', (req, res) => {
  const { crop, thresholdPrice, enabled } = req.body;
  if (!crop || typeof thresholdPrice !== 'number') {
    return res.status(400).json({ success: false, error: 'Invalid alert payload' });
  }
  const alert = db.updateAlert(crop, thresholdPrice, enabled !== false);
  res.json({ success: true, alert });
});

// --- Verified Agri-Experts / KVK Scientists ---
const EXPERTS = [
  {
    id: 1,
    name: 'Dr. Debabrata Mohapatra',
    icon: '👨‍🔬',
    avatarBg: '#ffd6e7',
    role: 'Senior Scientist & Head (Plant Pathology)',
    organization: 'Krishi Vigyan Kendra Sambalpur, OUAT',
    location: 'Sambalpur, Odisha',
    experienceYears: 18,
    languages: ['Odia', 'Hindi', 'English'],
    rating: 4.9,
    focus: 'Fungal & bacterial leaf diseases in solanaceous vegetables',
    greeting: 'Namaste Ramesh ji! I am reviewing Sambalpur district tomato and vegetable plots today. Have you noticed any early blight lesions or leaf curling in your crops? You can attach a leaf photo for a prompt diagnosis.'
  },
  {
    id: 2,
    name: 'Dr. Sunita Deshmukh',
    icon: '👩‍🔬',
    avatarBg: '#ffe4c2',
    role: 'Horticulture & Pest Specialist',
    organization: 'Mahatma Phule Krishi Vidyapeeth Extension Center',
    location: 'Nashik, Maharashtra',
    experienceYears: 14,
    languages: ['Marathi', 'Hindi', 'English'],
    rating: 4.8,
    focus: 'Pest management, thrips, and vegetable nutrition',
    greeting: 'Namaste Ramesh ji! Tell me what symptoms or leaf damage you see on your vegetables, and share a photo. I will guide you on the safest next action.'
  },
  {
    id: 3,
    name: 'Er. Rajeshwar Rao',
    icon: '👨‍💼',
    avatarBg: '#d4ecff',
    role: 'Agricultural Extension Officer',
    organization: 'Department of Agriculture & Farmers Welfare',
    location: 'Warangal, Telangana',
    experienceYears: 12,
    languages: ['Telugu', 'English', 'Hindi'],
    rating: 4.7,
    focus: 'Extension guidance, government schemes & field practices',
    greeting: 'Hello Ramesh ji! I can guide you on crop rotation, drip irrigation fertigation, and farmer subsidy schemes. How can I assist you today?'
  },
  {
    id: 4,
    name: 'Dr. Harpreet Singh Sandhu',
    icon: '🧑🏽‍🔬',
    avatarBg: '#e3d9ff',
    role: 'Agronomy Consultant & Soil Scientist',
    organization: 'Regional Agronomy Services',
    location: 'Karnal, Haryana',
    experienceYears: 16,
    languages: ['Punjabi', 'Hindi', 'English'],
    rating: 4.9,
    focus: 'Soil health, micronutrients (Zn, B, Fe) and fertigation',
    greeting: 'Sat Sri Akal Ramesh ji! If your plants show leaf yellowing or poor fruit setting, a soil nutrient check is very helpful. Do you have a recent soil test?'
  }
];

app.get('/api/experts', (req, res) => {
  res.json({ success: true, count: EXPERTS.length, experts: EXPERTS });
});

app.post('/api/experts/chat', async (req, res) => {
  try {
    const { expertId, message, imageUrl, language = 'English', langCode } = req.body;
    const expert = EXPERTS.find(e => e.id === Number(expertId)) || EXPERTS[0];

    // Save user message
    const userMsg = db.addExpertMessage(expert.id, 'user', message || 'Image sent', imageUrl);

    const history = db.getExpertMessages(expert.id);
    const replyText = await consultAgriSpecialistWithGemini({
      expert,
      farmerMessage: message || (imageUrl ? 'Please diagnose this leaf photo' : 'Namaste'),
      imageUrl,
      history,
      language,
      langCode
    });

    const expertMsg = db.addExpertMessage(expert.id, 'expert', replyText);

    res.json({
      success: true,
      userMessage: userMsg,
      expertMessage: expertMsg
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/experts/:id/messages', (req, res) => {
  const messages = db.getExpertMessages(Number(req.params.id));
  res.json({ success: true, messages });
});

// --- Dynamic 30+ Languages Translation API ---
app.post('/api/translate', async (req, res) => {
  try {
    const { text, texts, targetLangName, targetLangCode } = req.body;
    if (!targetLangCode) {
      return res.status(400).json({ success: false, error: 'targetLangCode is required' });
    }

    if (texts && Array.isArray(texts)) {
      const translations = await translateBatchWithGemini(texts, targetLangName || targetLangCode, targetLangCode);
      return res.json({
        success: true,
        targetLanguage: targetLangCode,
        translations
      });
    }

    if (text) {
      const translations = await translateBatchWithGemini([text], targetLangName || targetLangCode, targetLangCode);
      return res.json({
        success: true,
        originalText: text,
        targetLanguage: targetLangCode,
        translatedText: translations[text] || text
      });
    }

    return res.status(400).json({ success: false, error: 'text or texts array is required' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Voice Copilot Assistant API ---
app.post('/api/voice/process', async (req, res) => {
  try {
    const { query, language = 'English', langCode } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query text is required' });
    }

    const analysis = await processVoiceQuestion(query, language, langCode);
    res.json({ success: true, result: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Real-Time Gemini AI Mandi Market Strategy API ---
app.post('/api/mandi/ai-advice', async (req, res) => {
  try {
    const { crop, district = 'Sambalpur', modalPrice, minPrice, maxPrice, changePercent, dailyVolume, language, langCode } = req.body;
    const cropData = MANDI_DATA[crop] || MANDI_DATA['Tomato'];
    const advice = await generateMandiAdviceWithGemini({
      crop: crop || 'Tomato',
      district,
      modalPrice: modalPrice || cropData.series[cropData.series.length - 1],
      minPrice: minPrice || cropData.minPrice,
      maxPrice: maxPrice || cropData.maxPrice,
      changePercent: changePercent !== undefined ? changePercent : cropData.changePercent,
      dailyVolume: dailyVolume || cropData.dailyVolume,
      language,
      langCode
    });
    res.json({ success: true, advice });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Real-Time Gemini AI Weather & Crop Risk Advisory API ---
app.post('/api/weather/ai-advisory', async (req, res) => {
  try {
    const { district = 'Sambalpur', crop = 'Tomato', growthStage = 'Flowering', language, langCode } = req.body;
    const weather = WEATHER_DATA[district] || WEATHER_DATA['Sambalpur'];
    const advisory = await generateWeatherSprayAdvisoryWithGemini({
      district,
      crop,
      growthStage,
      temperature: weather.temp,
      humidity: weather.humidity,
      rainProbability: weather.rainChance,
      windSpeed: weather.wind,
      condition: weather.rainChance > 40 ? 'Rainy / Overcast' : weather.humidity > 70 ? 'Humid / Hazy' : 'Partly Cloudy',
      language,
      langCode
    });
    res.json({ success: true, advisory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Gemini AI Crop Diagnosis Follow-up Agronomy API ---
app.post('/api/diagnose/followup', async (req, res) => {
  try {
    const { vegetable, variety, growthStage, problemName, problemType, symptoms, remedies, question, language, langCode } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }
    const result = await answerDiagnosisFollowupWithGemini({
      vegetable,
      variety,
      growthStage,
      problemName,
      problemType,
      symptoms,
      remedies: remedies || [],
      question,
      language,
      langCode
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Vite / Static Files Setup ---
async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve compiled assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KisanMitra AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
