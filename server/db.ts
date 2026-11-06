import fs from 'fs';
import path from 'path';
import 'dotenv/config';

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
  remedies: {
    category: 'organic' | 'chemical' | 'cultural' | 'preventive';
    title: string;
    instructions: string;
    dosage?: string;
  }[];
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

export interface MandiAlert {
  id: string;
  crop: string;
  thresholdPrice: number;
  enabled: boolean;
}

interface DatabaseSchema {
  scans: ScanRecord[];
  profile: FarmerProfile;
  mandiAlerts: MandiAlert[];
  expertMessages: {
    expertId: number;
    sender: 'user' | 'expert';
    text: string;
    timestamp: string;
    imageUrl?: string;
  }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kisanmitra_db.json');

const INITIAL_PROFILE: FarmerProfile = {
  id: 'farmer_01',
  fullName: 'Ramesh Patel',
  phone: '+91 98452 71023',
  village: 'Khetrajpur',
  district: 'Sambalpur',
  state: 'Odisha',
  landSize: 3.5,
  landUnit: 'acres',
  mainCrop: 'Tomato (Hybrid Shivam)',
  growthStage: 'Flowering',
  avatarIcon: '🧑‍🌾',
  avatarColor: '#1d7a4a',
  weatherAlerts: true,
  mandiAlerts: true,
  diseaseAlerts: false,
  preferredLanguage: 'en',
};

const INITIAL_SCANS: ScanRecord[] = [
  {
    id: 'scan_001',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    vegetable: 'Tomato',
    variety: 'Hybrid Shivam',
    stage: 'Flowering',
    problemType: 'disease',
    problemName: 'Early Blight (Alternaria solani)',
    severity: 'Moderate',
    confidence: 88,
    symptoms: 'Concentric dark brown target-board rings on lower mature foliage with chlorotic yellow halo.',
    remedies: [
      {
        category: 'cultural',
        title: 'Prune Lower Foliage',
        instructions: 'Carefully prune infected bottom 2-3 leaf branches. Sterilize shears with 70% alcohol and burn or bury infected residue away from compost.'
      },
      {
        category: 'organic',
        title: 'Neem & Trichoderma Spray',
        instructions: 'Spray Trichoderma viride (10g/L) or cold-pressed Neem Oil (5ml/L) emulsified with mild soap every 7 days.',
        dosage: '5ml neem oil / Liter water'
      },
      {
        category: 'chemical',
        title: 'Fungicidal Protection',
        instructions: 'Apply Mancozeb 75% WP or Copper Oxychloride 50% WP during a dry morning window.',
        dosage: '2.5g / Liter water'
      }
    ],
    notes: 'Noticed concentric rings after continuous rainy spell in Sambalpur.',
    farmerName: 'Ramesh Patel',
    location: 'Sambalpur, Odisha'
  },
  {
    id: 'scan_002',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    vegetable: 'Chilli',
    variety: 'G4 Dry Red',
    stage: 'Vegetative growth',
    problemType: 'deficiency',
    problemName: 'Magnesium (Mg) Deficiency',
    severity: 'Mild to Moderate',
    confidence: 82,
    symptoms: 'Interveinal chlorosis on older mature leaves; leaf veins remain green while leaf lamina turns yellow.',
    remedies: [
      {
        category: 'chemical',
        title: 'Magnesium Sulfate Foliar Spray',
        instructions: 'Dissolve Agricultural grade Epsom Salt (Magnesium Sulphate MgSO4) in water and spray on foliage early morning.',
        dosage: '5g / Liter water (0.5% solution)'
      },
      {
        category: 'organic',
        title: 'Dolomite Lime Soil Incorporation',
        instructions: 'Broadcast powdered dolomite lime around root zones to balance soil pH and supply slow-release magnesium and calcium.',
        dosage: '50-100 kg / acre'
      }
    ],
    notes: 'Leaves showed pale yellowing between green veins after heavy irrigation.',
    farmerName: 'Ramesh Patel',
    location: 'Sambalpur, Odisha'
  },
  {
    id: 'scan_003',
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    vegetable: 'Potato',
    variety: 'Kufri Jyoti',
    stage: 'Tuber initiation',
    problemType: 'deficiency',
    problemName: 'Potassium (K) Deficiency',
    severity: 'Moderate',
    confidence: 85,
    symptoms: 'Marginal browning and leaf tip scorch on older leaves; curling of leaf margins downwards.',
    remedies: [
      {
        category: 'organic',
        title: 'Hardwood Ash or Bio-Potash',
        instructions: 'Apply hardwood wood ash or potash mobilizing bacteria (KMB) near the root zone.',
        dosage: '2 kg KMB biofertilizer / acre'
      },
      {
        category: 'chemical',
        title: 'Sulphate of Potash (SOP 0:0:50)',
        instructions: 'Apply 00:00:50 foliar spray to rapidly restore potassium reserves without adding unwanted chloride.',
        dosage: '8-10g / Liter water'
      }
    ],
    notes: 'Brown edges around leaf margins.',
    farmerName: 'Ramesh Patel',
    location: 'Sambalpur, Odisha'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          scans: parsed.scans || INITIAL_SCANS,
          profile: parsed.profile || INITIAL_PROFILE,
          mandiAlerts: parsed.mandiAlerts || [],
          expertMessages: parsed.expertMessages || []
        };
      }
    } catch (err) {
      console.error('Error reading database file, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      scans: INITIAL_SCANS,
      profile: INITIAL_PROFILE,
      mandiAlerts: [
        { id: 'al_01', crop: 'Tomato', thresholdPrice: 2650, enabled: true },
        { id: 'al_02', crop: 'Chilli', thresholdPrice: 9000, enabled: true }
      ],
      expertMessages: []
    };
    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically write database file:', err);
    }
  }

  // --- Scan Operations ---
  public getScans(vegetable?: string, problemType?: string): ScanRecord[] {
    let results = [...this.data.scans];
    if (vegetable && vegetable !== 'all') {
      results = results.filter(s => s.vegetable.toLowerCase() === vegetable.toLowerCase());
    }
    if (problemType && problemType !== 'all') {
      results = results.filter(s => s.problemType.toLowerCase() === problemType.toLowerCase());
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getScanById(id: string): ScanRecord | undefined {
    return this.data.scans.find(s => s.id === id);
  }

  public addScan(scan: Omit<ScanRecord, 'id' | 'createdAt'>): ScanRecord {
    const newRecord: ScanRecord = {
      ...scan,
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.scans.unshift(newRecord);
    this.saveData(this.data);
    return newRecord;
  }

  public deleteScan(id: string): boolean {
    const prevLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter(s => s.id !== id);
    if (this.data.scans.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Profile Operations ---
  public getProfile(): FarmerProfile {
    return this.data.profile;
  }

  public updateProfile(updates: Partial<FarmerProfile>): FarmerProfile {
    this.data.profile = {
      ...this.data.profile,
      ...updates
    };
    this.saveData(this.data);
    return this.data.profile;
  }

  // --- Mandi Alerts ---
  public getAlerts(): MandiAlert[] {
    return this.data.mandiAlerts;
  }

  public updateAlert(crop: string, thresholdPrice: number, enabled: boolean): MandiAlert {
    let alert = this.data.mandiAlerts.find(a => a.crop.toLowerCase() === crop.toLowerCase());
    if (alert) {
      alert.thresholdPrice = thresholdPrice;
      alert.enabled = enabled;
    } else {
      alert = {
        id: `alt_${Date.now()}`,
        crop,
        thresholdPrice,
        enabled
      };
      this.data.mandiAlerts.push(alert);
    }
    this.saveData(this.data);
    return alert;
  }

  // --- Expert Chat History ---
  public getExpertMessages(expertId: number) {
    return this.data.expertMessages.filter(m => m.expertId === expertId);
  }

  public addExpertMessage(expertId: number, sender: 'user' | 'expert', text: string, imageUrl?: string) {
    const msg = {
      expertId,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl
    };
    this.data.expertMessages.push(msg);
    this.saveData(this.data);
    return msg;
  }
}

export const db = new DatabaseService();
