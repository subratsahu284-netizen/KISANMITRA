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
  remedies: {
    category: 'organic' | 'chemical' | 'cultural' | 'preventive';
    title: string;
    instructions: string;
    dosage?: string;
  }[];
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

export const VEGETABLES_DATABASE: VegetableInfo[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर (Tamatar)',
    botanicalName: 'Solanum lycopersicum',
    icon: '🍅',
    varieties: ['Hybrid Shivam', 'Pusa Ruby', 'Arka Rakshak', 'Abhinav', 'Local Desi'],
    stages: [
      { name: 'Seedling / Nursery', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative growth', icon: '🌿', color: '#3fc97a' },
      { name: 'Flowering stage', icon: '🌸', color: '#ff7ab8' },
      { name: 'Fruit development', icon: '🍅', color: '#ff7a59' },
      { name: 'Harvesting stage', icon: '🧺', color: '#ffc533' }
    ],
    problems: [
      {
        name: 'Early Blight (Alternaria solani)',
        type: 'disease',
        category: 'fungal',
        severity: 'Moderate to Severe',
        confidenceDefault: 88,
        symptoms: 'Concentric dark-brown target-board rings on lower mature leaves, surrounded by yellow chlorotic halos.',
        leafVisual: {
          baseColor: '#3f8f3a',
          spotColor: '#3b1d0c',
          haloColor: '#e6c229',
          description: 'Dark target rings on mature leaves with yellow chlorotic perimeter.'
        },
        remedies: [
          {
            category: 'cultural',
            title: 'Remove Lower Infected Foliage',
            instructions: 'Clip off infected lower leaves using sanitized pruning shears. Never throw infected leaves in compost heap.'
          },
          {
            category: 'organic',
            title: 'Trichoderma viride & Neem Oil Spray',
            instructions: 'Apply cold pressed neem oil (3000 ppm) with mild soap emulsifier or spray Trichoderma viride culture.',
            dosage: '5 ml / Liter water'
          },
          {
            category: 'chemical',
            title: 'Mancozeb or Chlorothalonil',
            instructions: 'Foliar spray of Mancozeb 75% WP or Azoxystrobin 23% SC on clear, dry mornings.',
            dosage: '2.5g / Liter water'
          }
        ]
      },
      {
        name: 'Calcium (Ca) Deficiency - Blossom End Rot',
        type: 'deficiency',
        category: 'macro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 86,
        symptoms: 'Water-soaked sunken black leathery spots at the blossom end of fruits; young leaves deformed and cupping downward.',
        leafVisual: {
          baseColor: '#4f9f4a',
          spotColor: '#2b1a0e',
          haloColor: '#d6c84a',
          description: 'Distorted young foliage, tip burning and black leathery bottoms on tomato fruit.'
        },
        remedies: [
          {
            category: 'organic',
            title: 'Bone Meal & Eggshell Extract',
            instructions: 'Drench soil with vinegar-dissolved eggshell water or add bone meal to root zone before flowering.'
          },
          {
            category: 'chemical',
            title: 'Calcium Nitrate Foliar Application',
            instructions: 'Spray water-soluble Calcium Nitrate (19:0:0 + 18.8% Ca) directly on leaves and developing fruit clusters.',
            dosage: '4-5g / Liter water'
          },
          {
            category: 'cultural',
            title: 'Consistent Irrigation Schedule',
            instructions: 'Maintain steady soil moisture using drip or mulch. Irregular wet-dry cycles prevent roots from taking up calcium.'
          }
        ]
      },
      {
        name: 'Tomato Leaf Curl Virus (ToLCV)',
        type: 'disease',
        category: 'viral',
        severity: 'Severe',
        confidenceDefault: 81,
        symptoms: 'Upward curling, puckering and severe reduction in leaflet size; leaves feel thick and leathery, stunted plant growth.',
        leafVisual: {
          baseColor: '#6aa03a',
          description: 'Severe upward curling with thick yellowed leaf edges spread by whiteflies.'
        },
        remedies: [
          {
            category: 'cultural',
            title: 'Yellow Sticky Traps',
            instructions: 'Install 15-20 yellow sticky traps per acre at crop canopy height to capture adult whitefly vectors.'
          },
          {
            category: 'organic',
            title: 'Neem Seed Kernel Extract (NSKE 5%)',
            instructions: 'Spray NSKE 5% or Beauveria bassiana bio-insecticide to suppress whitefly nymph populations.',
            dosage: '5g / Liter water'
          },
          {
            category: 'chemical',
            title: 'Imidacloprid or Diafenthiuron',
            instructions: 'Spray Imidacloprid 17.8% SL or Acetamiprid 20% SP to control whitefly vector transmission.',
            dosage: '0.5ml / Liter water'
          }
        ]
      },
      {
        name: 'Healthy Leaf',
        type: 'healthy',
        severity: 'None',
        confidenceDefault: 95,
        symptoms: 'Vibrant green coloration, turgid foliage with no lesions, curling, mottling or nutrient deficiency markings.',
        leafVisual: {
          baseColor: '#2fbf71',
          description: 'Uniform deep green leaf lamina with clean veins and strong vigor.'
        },
        remedies: [
          {
            category: 'preventive',
            title: 'Maintain Balanced Nutrition',
            instructions: 'Continue regular fertigation with balanced 19:19:19 NPK and weekly scouting.'
          }
        ]
      }
    ]
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू (Aaloo)',
    botanicalName: 'Solanum tuberosum',
    icon: '🥔',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Bahar', 'Kufri Chipsona', 'Local Pahadi'],
    stages: [
      { name: 'Sprouting / Emergence', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative growth', icon: '🌿', color: '#3fc97a' },
      { name: 'Tuber initiation', icon: '🥔', color: '#ffc533' },
      { name: 'Tuber bulking', icon: '📦', color: '#ff7a59' },
      { name: 'Maturity / Senescence', icon: '🍂', color: '#a08154' }
    ],
    problems: [
      {
        name: 'Late Blight (Phytophthora infestans)',
        type: 'disease',
        category: 'fungal',
        severity: 'Severe',
        confidenceDefault: 91,
        symptoms: 'Water-soaked irregular pale-green spots quickly turning dark purplish-brown; white downy mildew on leaf undersides in high humidity.',
        leafVisual: {
          baseColor: '#366e33',
          spotColor: '#1d231d',
          haloColor: '#8ca846',
          description: 'Dark water-soaked purplish lesions with white mildew on undersides.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Metalaxyl + Mancozeb (Ridomil MZ)',
            instructions: 'Spray Metalaxyl-M 4% + Mancozeb 64% WP immediately when cool foggy or cloudy weather persists.',
            dosage: '2.5g / Liter water'
          },
          {
            category: 'cultural',
            title: 'Proper Earthing-up',
            instructions: 'Ensure thick ridge soil cover (earthing up) to protect underground tubers from spore wash-off.'
          },
          {
            category: 'organic',
            title: 'Bordeaux Mixture Spray',
            instructions: 'Apply 1% freshly prepared Bordeaux mixture (copper sulfate + slaked lime) as prophylactic barrier.'
          }
        ]
      },
      {
        name: 'Potassium (K) Deficiency',
        type: 'deficiency',
        category: 'macro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 84,
        symptoms: 'Marginal scorching and bronzing on older leaves; leaf tips curl downward and turn necrotic brown.',
        leafVisual: {
          baseColor: '#538234',
          spotColor: '#633917',
          haloColor: '#d6b83c',
          description: 'Scorched brown leaf margins and curled tips on mature leaves.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Potassium Schoenite / SOP 0:0:50',
            instructions: 'Foliar spray of water-soluble Sulphate of Potash to enhance tuber bulking and starch formation.',
            dosage: '10g / Liter water'
          },
          {
            category: 'organic',
            title: 'Bio-Potash (Frateuria aurantia)',
            instructions: 'Drench rhizosphere with liquid Potash Mobilizing Bacteria (KMB) to unlock native soil potassium.'
          }
        ]
      }
    ]
  },
  {
    id: 'chilli',
    name: 'Chilli & Capsicum',
    hindiName: 'मिर्च (Mirch)',
    botanicalName: 'Capsicum annuum',
    icon: '🌶️',
    varieties: ['G4 Teja', 'Byadgi', 'Pusa Jwala', 'Indam 5', 'California Wonder (Bell)'],
    stages: [
      { name: 'Nursery stage', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative branching', icon: '🌿', color: '#3fc97a' },
      { name: 'Flowering', icon: '🌸', color: '#ff7ab8' },
      { name: 'Green pod harvest', icon: '🌶️', color: '#2fbf71' },
      { name: 'Red ripe drying', icon: '🔴', color: '#e5484d' }
    ],
    problems: [
      {
        name: 'Chilli Thrips & Mite Murda Complex (Leaf Curl)',
        type: 'pest',
        severity: 'Moderate to Severe',
        confidenceDefault: 87,
        symptoms: 'Upward boat-shaped cupping (thrips) or downward inverted boat cupping (mites); leaves become elongated and brittle.',
        leafVisual: {
          baseColor: '#4f8c36',
          description: 'Boat-shaped leaf curling, puckered lamina, bronze cast on underside.'
        },
        remedies: [
          {
            category: 'organic',
            title: 'Sour Buttermilk & Hing Spray',
            instructions: 'Ferment 1 Liter sour churned buttermilk with 5g hing (asafoetida) for 4 days and spray as potent natural acaricide.'
          },
          {
            category: 'chemical',
            title: 'Fipronil or Diafenthiuron',
            instructions: 'Spray Fipronil 5% SC (2ml/L) or Spiromesifen 22.9% SC (1ml/L) targeted at leaf undersides.'
          }
        ]
      },
      {
        name: 'Anthracnose / Dieback (Colletotrichum capsici)',
        type: 'disease',
        category: 'fungal',
        severity: 'Severe',
        confidenceDefault: 83,
        symptoms: 'Tips of branches dry from top downwards (dieback); circular sunken spots on ripening chillies with black concentric rings.',
        leafVisual: {
          baseColor: '#497530',
          spotColor: '#2b1b11',
          haloColor: '#c7b33c',
          description: 'Dieback from branch tip down with dark necrotic lesions.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Azoxystrobin + Difenoconazole',
            instructions: 'Spray Amistar Top (Azoxystrobin + Difenoconazole) at 1ml/L during pod formation.',
            dosage: '1ml / Liter water'
          },
          {
            category: 'organic',
            title: 'Copper Hydroxide Bio-film',
            instructions: 'Spray bio-copper or copper hydroxide 77% WP to prevent fungal sporulation on pods.'
          }
        ]
      },
      {
        name: 'Nitrogen (N) Deficiency',
        type: 'deficiency',
        category: 'macro-nutrient',
        severity: 'Mild to Moderate',
        confidenceDefault: 79,
        symptoms: 'General pale yellowing starting strictly from older bottom leaves, progressing upward; stunted weak spindly stems.',
        leafVisual: {
          baseColor: '#9ec43f',
          haloColor: '#d6de4e',
          description: 'Uniform pale light-green to yellow cast across older leaves.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Urea Foliar Spray (1-2%)',
            instructions: 'Dissolve low-biuret urea in water and spray on foliage in evening for immediate greening.',
            dosage: '15-20g / Liter water'
          },
          {
            category: 'organic',
            title: 'Vermiwash or Jeevamrit Drench',
            instructions: 'Apply aged vermiwash (1:5 dilution) or fermented Jeevamrit to boost active beneficial soil microbial nitrogen.'
          }
        ]
      }
    ]
  },
  {
    id: 'brinjal',
    name: 'Brinjal / Eggplant',
    hindiName: 'बैंगन (Baingan)',
    botanicalName: 'Solanum melongena',
    icon: '🍆',
    varieties: ['Pusa Purple Long', 'Pusa Purple Round', 'Arka Anand', 'Pusa Kranti', 'Utkal Anushree'],
    stages: [
      { name: 'Seedling', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative growth', icon: '🌿', color: '#3fc97a' },
      { name: 'Flowering & branching', icon: '🌸', color: '#b57aff' },
      { name: 'Fruiting & picking', icon: '🍆', color: '#7b3fa0' }
    ],
    problems: [
      {
        name: 'Little Leaf Disease (Phytoplasma)',
        type: 'disease',
        category: 'bacterial',
        severity: 'Severe',
        confidenceDefault: 89,
        symptoms: 'Extremely tiny, narrow, crowded pale leaves giving a bushy broom-like appearance; plants stay sterile with no flowers.',
        leafVisual: {
          baseColor: '#8aa63c',
          description: 'Mass of diminutive micro-leaves forming a compact bushy rosette.'
        },
        remedies: [
          {
            category: 'cultural',
            title: 'Rogue Out Infected Plants',
            instructions: 'Uproot and burn infected plants immediately. They cannot be cured and act as infection reservoirs.'
          },
          {
            category: 'chemical',
            title: 'Vector Control (Leafhopper)',
            instructions: 'Spray Dimethoate 30% EC (1.5ml/L) or Thiamethoxam 25% WG (0.3g/L) to kill the vector jassids/leafhoppers.'
          }
        ]
      },
      {
        name: 'Iron (Fe) Deficiency',
        type: 'deficiency',
        category: 'micro-nutrient',
        severity: 'Mild to Moderate',
        confidenceDefault: 81,
        symptoms: 'Distinct interveinal chlorosis on the youngest new top leaves; veins remain dark green while leaf blade turns creamy yellow/white.',
        leafVisual: {
          baseColor: '#b0d64f',
          spotColor: '#f2f0a2',
          description: 'Youngest leaves show bright yellow blade with fine sharp green veins.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Chelated Iron (Fe-EDTA 12%)',
            instructions: 'Apply foliar spray of Chelated Iron EDTA early in the morning to restore chlorophyll synthesis.',
            dosage: '1g / Liter water'
          },
          {
            category: 'organic',
            title: 'Ferrous Sulfate + Citric Acid Soil Flush',
            instructions: 'Drench root zone with Ferrous Sulfate (19% Fe) combined with lemon juice to acidify alkaline soils.'
          }
        ]
      }
    ]
  },
  {
    id: 'onion',
    name: 'Onion & Garlic',
    hindiName: 'प्याज और लहसुन (Pyaz & Lahsun)',
    botanicalName: 'Allium cepa',
    icon: '🧅',
    varieties: ['Nashik Red', 'Bhima Super', 'Agrifound Dark Red', 'Pusa White Flat', 'Yamuna Safed (Garlic)'],
    stages: [
      { name: 'Transplanting', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative leafing', icon: '🌿', color: '#3fc97a' },
      { name: 'Bulb initiation', icon: '🧅', color: '#b57aff' },
      { name: 'Bulb maturity', icon: '📦', color: '#ffc533' },
      { name: 'Curing & storage', icon: '🧺', color: '#d2691e' }
    ],
    problems: [
      {
        name: 'Purple Blotch (Alternaria porri)',
        type: 'disease',
        category: 'fungal',
        severity: 'Severe',
        confidenceDefault: 87,
        symptoms: 'Small water-soaked lesions that turn brown to dark purplish with reddish-purple margins; leaf girdles and collapses.',
        leafVisual: {
          baseColor: '#4f8c47',
          spotColor: '#451838',
          haloColor: '#d1b93f',
          description: 'Elliptical purple blotch with yellow halo on cylindrical onion tubular leaves.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Tebuconazole 25.9% EC',
            instructions: 'Spray Tebuconazole (1ml/L) or Difenoconazole (1ml/L) mixed with a silicone sticker for tubular leaves.',
            dosage: '1ml / Liter water + 0.5ml sticker'
          },
          {
            category: 'organic',
            title: 'Garlic-Chilli Extract + Pseudomonas',
            instructions: 'Spray Pseudomonas fluorescens (5g/L) bio-agent mixed with jaggery water.'
          }
        ]
      },
      {
        name: 'Zinc (Zn) Deficiency',
        type: 'deficiency',
        category: 'micro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 80,
        symptoms: 'Yellow striping along onion tubular leaves, twisted and curled tips, delayed bulb development.',
        leafVisual: {
          baseColor: '#7ba842',
          spotColor: '#e0df65',
          description: 'Longitudinal yellow striping with twist and crinkling of leaf tips.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Zinc Sulfate (ZnSO4 21% or 33%)',
            instructions: 'Foliar spray of Zinc Sulfate heptahydrate (2.5g/L) neutralised with slaked lime, or Chelated Zinc EDTA (1g/L).',
            dosage: '1g Chelated Zn / Liter water'
          }
        ]
      }
    ]
  },
  {
    id: 'cabbage',
    name: 'Cabbage & Cauliflower',
    hindiName: 'पत्तागोभी और फूलगोभी (Gobhi)',
    botanicalName: 'Brassica oleracea',
    icon: '🥬',
    varieties: ['Golden Acre (Cabbage)', 'Pusa Snowball (Cauliflower)', 'Pusa Deepali', 'Green Express'],
    stages: [
      { name: 'Seedling establishment', icon: '🌱', color: '#7ee08a' },
      { name: 'Foliage development', icon: '🌿', color: '#3fc97a' },
      { name: 'Curd / Head initiation', icon: '🥬', color: '#ffc533' },
      { name: 'Head firming & harvest', icon: '📦', color: '#2fbf71' }
    ],
    problems: [
      {
        name: 'Black Rot (Xanthomonas campestris)',
        type: 'disease',
        category: 'bacterial',
        severity: 'Severe',
        confidenceDefault: 90,
        symptoms: 'V-shaped chlorotic to necrotic yellow lesions on leaf margins with black blackened veins extending toward midrib.',
        leafVisual: {
          baseColor: '#4d8745',
          spotColor: '#2b231c',
          haloColor: '#d4c73f',
          description: 'Classic V-shaped yellow wedge at leaf edge with blackened internal veins.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Streptocycline + Copper Oxychloride',
            instructions: 'Spray Streptocycline antibiotic (0.1g/L) + Copper Oxychloride 50% WP (2g/L) at first notice of V-shaped lesions.',
            dosage: '1g Streptocycline in 10L water + 20g COC'
          },
          {
            category: 'cultural',
            title: 'Avoid Overhead Sprinklers',
            instructions: 'Do not work in wet fields; splash irrigation rapidly distributes bacterial slime.'
          }
        ]
      },
      {
        name: 'Boron (B) Deficiency - Hollow Stem & Browning',
        type: 'deficiency',
        category: 'micro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 85,
        symptoms: 'Hollow water-soaked stem cavities; curd turns rusty brown with bitter taste; leaves become brittle and curl.',
        leafVisual: {
          baseColor: '#608c4a',
          spotColor: '#8a5c24',
          description: 'Rusty brown discoloration on curd head and brittle thickened leaves.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Solubor / Borax (20% B) Spray',
            instructions: 'Spray Solubor (Disodium Octaborate Tetrahydrate) on foliage 30 days and 45 days after planting.',
            dosage: '1.5g / Liter water'
          },
          {
            category: 'organic',
            title: 'Compost enriched with Borax',
            instructions: 'Soil application of agricultural Borax (10 kg / acre) mixed with FYM at transplanting.'
          }
        ]
      }
    ]
  },
  {
    id: 'okra',
    name: 'Okra / Ladyfinger',
    hindiName: 'भिंडी (Bhindi)',
    botanicalName: 'Abelmoschus esculentus',
    icon: '🥒',
    varieties: ['Pusa Sawani', 'Arka Anamika', 'Radhika Hybrid', 'Parbhani Kranti', 'Mahyco 10'],
    stages: [
      { name: 'Germination', icon: '🌱', color: '#7ee08a' },
      { name: 'Vegetative', icon: '🌿', color: '#3fc97a' },
      { name: 'Flowering', icon: '🌸', color: '#ff7ab8' },
      { name: 'Pod harvesting', icon: '🥒', color: '#2fbf71' }
    ],
    problems: [
      {
        name: 'Yellow Vein Mosaic Virus (YVMV)',
        type: 'disease',
        category: 'viral',
        severity: 'Severe',
        confidenceDefault: 94,
        symptoms: 'Vein clearing followed by complete yellow network of veins over entire green lamina; pods become yellow, small, fibrous.',
        leafVisual: {
          baseColor: '#3d7a36',
          spotColor: '#f7f254',
          description: 'Prominent bright yellow vein network across whole leaf blade.'
        },
        remedies: [
          {
            category: 'cultural',
            title: 'Resistant Cultivars & Traps',
            instructions: 'Grow resistant varieties like Arka Anamika or Parbhani Kranti; install yellow sticky cards for whitefly control.'
          },
          {
            category: 'chemical',
            title: 'Acetamiprid or Thiamethoxam',
            instructions: 'Spray Thiamethoxam 25% WG (0.5g/L) to suppress the Bemisia tabaci whitefly vector.',
            dosage: '0.5g / Liter water'
          }
        ]
      },
      {
        name: 'Powdery Mildew (Erysiphe cichoracearum)',
        type: 'disease',
        category: 'fungal',
        severity: 'Moderate',
        confidenceDefault: 86,
        symptoms: 'White powdery patches on both leaf surfaces, turning greyish; leaves turn yellow and drop prematurely.',
        leafVisual: {
          baseColor: '#4f8c47',
          spotColor: '#e8ece8',
          description: 'White flour-like powdery talc spots scattered over leaf surface.'
        },
        remedies: [
          {
            category: 'organic',
            title: 'Wettable Sulfur or Baking Soda',
            instructions: 'Spray Wettable Sulfur 80% WDG (2.5g/L) or Potassium Bicarbonate (3g/L) with edible oil.',
            dosage: '2.5g / Liter water'
          }
        ]
      }
    ]
  },
  {
    id: 'cucumber',
    name: 'Cucumber & Gourd',
    hindiName: 'खीरा और ककड़ी (Kheera)',
    botanicalName: 'Cucumis sativus',
    icon: '🥒',
    varieties: ['Pusa Sanyog', 'Malini Hybrid', 'Kalyanpur Green', 'Japanese Long Green'],
    stages: [
      { name: 'Seedling / Vine emergence', icon: '🌱', color: '#7ee08a' },
      { name: 'Vigorous trailing vine', icon: '🌿', color: '#3fc97a' },
      { name: 'Yellow bloom flowering', icon: '🌼', color: '#ffc533' },
      { name: 'Fruit setting & picking', icon: '🥒', color: '#2fbf71' }
    ],
    problems: [
      {
        name: 'Downy Mildew (Pseudoperonospora cubensis)',
        type: 'disease',
        category: 'fungal',
        severity: 'Severe',
        confidenceDefault: 88,
        symptoms: 'Angular bright yellow chlorotic lesions bound strictly by leaf veins on upper leaf; purplish-grey felt-like downy growth underneath.',
        leafVisual: {
          baseColor: '#457a38',
          spotColor: '#d6c624',
          description: 'Geometric angular yellow blocks framed rigidly by leaf veins.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Cymoxanil + Mancozeb (Curzate)',
            instructions: 'Spray Cymoxanil 8% + Mancozeb 64% WP at first appearance of angular yellow angular mosaic.',
            dosage: '2g / Liter water'
          },
          {
            category: 'cultural',
            title: 'Trellising & Drip Irrigation',
            instructions: 'Train vines on vertical wire trellises to elevate leaves from damp soil and improve aeration.'
          }
        ]
      },
      {
        name: 'Magnesium (Mg) Deficiency',
        type: 'deficiency',
        category: 'macro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 82,
        symptoms: 'Interveinal yellowing on older mature crown leaves, with leaf margins curling upward into a cup shape.',
        leafVisual: {
          baseColor: '#7ba638',
          spotColor: '#d9d343',
          description: 'Pronounced yellowing between veins on older vine leaves.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Epsom Salt Foliar Spray',
            instructions: 'Spray Magnesium Sulfate (5g/L) twice at 10-day intervals.',
            dosage: '5g / Liter water'
          }
        ]
      }
    ]
  },
  {
    id: 'spinach',
    name: 'Spinach / Palak',
    hindiName: 'पालक (Palak)',
    botanicalName: 'Spinacia oleracea',
    icon: '🍃',
    varieties: ['All Green', 'Pusa Bharati', 'Pusa Jyoti', 'Jobner Green'],
    stages: [
      { name: 'Emergence', icon: '🌱', color: '#7ee08a' },
      { name: 'Rosette formation', icon: '🌿', color: '#3fc97a' },
      { name: 'Successive leaf cuttings', icon: '🍃', color: '#2fbf71' }
    ],
    problems: [
      {
        name: 'Cercospora Leaf Spot',
        type: 'disease',
        category: 'fungal',
        severity: 'Moderate',
        confidenceDefault: 84,
        symptoms: 'Small circular greyish spots with distinct red or purple borders; centers may fall out leaving shot-holes.',
        leafVisual: {
          baseColor: '#2f7a30',
          spotColor: '#421a2c',
          haloColor: '#b8c942',
          description: 'Circular grey eye-spots with reddish-purple perimeter ring.'
        },
        remedies: [
          {
            category: 'organic',
            title: 'Neem Oil + Panchagavya',
            instructions: 'Spray 3% Panchagavya with 5ml neem oil; observe 5-day safe withholding period before harvesting edible greens.'
          }
        ]
      },
      {
        name: 'Nitrogen (N) Deficiency',
        type: 'deficiency',
        category: 'macro-nutrient',
        severity: 'Mild to Moderate',
        confidenceDefault: 88,
        symptoms: 'Entire spinach plant looks pale light-green to yellow; leaves are thin, papery and small.',
        leafVisual: {
          baseColor: '#8fb837',
          description: 'Uniform pale yellowish-green hue with slow leaf expansion.'
        },
        remedies: [
          {
            category: 'organic',
            title: 'Compost Tea / Cow Urine Drench',
            instructions: 'Apply fermented cow urine (1:10 dilution in water) as a rapid organic nitrogen boost.'
          }
        ]
      }
    ]
  },
  {
    id: 'carrot',
    name: 'Carrot & Radish',
    hindiName: 'गाजर और मूली (Gajar & Mooli)',
    botanicalName: 'Daucus carota',
    icon: '🥕',
    varieties: ['Pusa Rudhira (Red)', 'Pusa Kesar', 'Nantes', 'Pusa Chetki (Radish)'],
    stages: [
      { name: 'Germination', icon: '🌱', color: '#7ee08a' },
      { name: 'Foliage canopy', icon: '🌿', color: '#3fc97a' },
      { name: 'Root enlargement', icon: '🥕', color: '#ff7a59' },
      { name: 'Harvest', icon: '🧺', color: '#ffc533' }
    ],
    problems: [
      {
        name: 'Alternaria Leaf Blight (Alternaria dauci)',
        type: 'disease',
        category: 'fungal',
        severity: 'Moderate to Severe',
        confidenceDefault: 83,
        symptoms: 'Brown-black spots with yellow margins on carrot leaf tips, causing whole fronds to look burned and scorched.',
        leafVisual: {
          baseColor: '#3c6e33',
          spotColor: '#2b1b11',
          description: 'Scorched brown tips on finely divided carrot leaflets.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Iprodione or Mancozeb',
            instructions: 'Spray Mancozeb (2.5g/L) or Iprodione 50% WP (2g/L) to preserve foliage essential for root fattening.'
          }
        ]
      },
      {
        name: 'Boron (B) Deficiency - Root Splitting',
        type: 'deficiency',
        category: 'micro-nutrient',
        severity: 'Moderate',
        confidenceDefault: 82,
        symptoms: 'Longitudinal splitting and cracks along the carrot taproot; foliage develops reddish-purple pigmentation.',
        leafVisual: {
          baseColor: '#52662c',
          spotColor: '#8a2d48',
          description: 'Reddish-bronze pigmentation on foliage with brittle leaf stems.'
        },
        remedies: [
          {
            category: 'chemical',
            title: 'Boron Soil Incorporation',
            instructions: 'Apply 10 kg Borax per acre during soil bed preparation before sowing.'
          }
        ]
      }
    ]
  }
];

export function findVegetable(nameOrId: string): VegetableInfo | undefined {
  const q = nameOrId.toLowerCase().trim();
  return VEGETABLES_DATABASE.find(v => 
    v.id.toLowerCase() === q || 
    v.name.toLowerCase().includes(q) ||
    v.hindiName.toLowerCase().includes(q)
  ) || VEGETABLES_DATABASE[0];
}
