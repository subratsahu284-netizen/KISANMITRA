export interface Remedy {
  category: 'organic' | 'chemical' | 'cultural' | 'preventive';
  title: string;
  instructions: string;
  dosage?: string;
}

export interface UserAuth {
  id: string;
  name: string;
  phone: string;
  aadhaar?: string;
  role: 'farmer' | 'expert';
  location: string;
  avatarIcon: string;
}

export interface ProblemDef {
  name: string;
  type: 'disease' | 'deficiency' | 'healthy' | 'pest';
  category?: 'fungal' | 'bacterial' | 'viral' | 'macro-nutrient' | 'micro-nutrient';
  severity: string;
  confidenceDefault: number;
  symptoms: string;
  leafVisual: {
    baseColor: string;
    spotColor?: string;
    haloColor?: string;
    description: string;
  };
  remedies: Remedy[];
}

export interface VegetableInfo {
  id: string;
  name: string;
  hindiName: string;
  botanicalName: string;
  icon: string;
  varieties: string[];
  stages: { name: string; icon: string; color: string }[];
  problems: ProblemDef[];
}

export interface ScanRecord {
  id: string;
  createdAt: string;
  vegetable: string;
  variety: string;
  stage: string;
  problemType: 'disease' | 'deficiency' | 'healthy' | 'pest';
  problemName: string;
  severity: string;
  confidence: number;
  symptoms: string;
  remedies: Remedy[];
  notes?: string;
  imageUrl?: string;
  farmerName: string;
  location: string;
}

export interface FarmerProfile {
  id: string;
  fullName: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  landSize: number;
  landUnit: 'acres' | 'hectares' | 'bigha';
  mainCrop: string;
  growthStage: string;
  avatarIcon: string;
  avatarColor: string;
  weatherAlerts: boolean;
  mandiAlerts: boolean;
  diseaseAlerts: boolean;
  preferredLanguage: string;
}

export interface WeatherData {
  district: string;
  current: {
    humidity: number;
    temp: number;
    wind: number;
    rainChance: number;
  };
  availableDistricts: string[];
  hourlySprayForecast: {
    hour: string;
    humidity: number;
    windSpeed: number;
    rainChance: number;
    status: 'safe' | 'borderline' | 'dont_spray';
    riskLevel: number;
  }[];
  overallRisk: string;
}

export interface MandiCropData {
  icon: string;
  name: string;
  color: string;
  series: number[];
  minPrice: number;
  maxPrice: number;
  dailyVolume: string;
  changePercent: number;
  timingBadge: string;
  advice: string;
  defaultThreshold: number;
}

export interface Expert {
  id: number;
  name: string;
  icon: string;
  avatarBg: string;
  role: string;
  organization: string;
  location: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  focus: string;
  greeting: string;
}
