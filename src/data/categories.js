// src/data/categories.js

export const CATEGORIES_DATA = {
  'Cement Sector': ['Cement Dealers', 'Bulk Cement', 'Ready-Mix Concrete (RMC)'],
  'Steel Sector': ['TMT Dealers', 'Structural Steel', 'Cut & Bend Facilities'],
  'Construction Equipment': ['JCB/Excavators', 'Transit Mixers', 'Concrete Pumps', 'Tower Cranes'],
  'Construction Materials': ['Aggregates & Crushers', 'M-Sand/P-Sand', 'Bricks/Blocks', 'Chemicals'],
  'Contractors': ['Civil (GC/Sub)', 'MEP', 'Plumbers', 'Electricians', 'Painters', 'Interiors', 'Waterproofing', 'Piling', 'Roads'],
  'Consultants': ['Architects', 'Structural', 'MEP', 'PMC', 'QS/Estimators', 'Interior Designers', 'Interior Decorators'],
  'Suppliers & Manufacturers': ['Elevators/Lifts', 'Furniture', 'Aluminium/Glass', 'Tiles/Sanitaryware'],
  'Technology & Services': ['ERP/Estimating/BIM', 'AI Tools', 'IoT', 'IT Services', 'HR/Manpower'],
  'Professional Services': ['Real Estate Agents'],
  'Other': []
};

export const ALL_SUBCATEGORIES = Object.values(CATEGORIES_DATA).flat();

// Create a reverse map for quick lookups from sub-category to main category
export const SUB_TO_MAIN_CATEGORY_MAP = {};
for (const mainCategory in CATEGORIES_DATA) {
  for (const subCategory of CATEGORIES_DATA[mainCategory]) {
    SUB_TO_MAIN_CATEGORY_MAP[subCategory] = mainCategory;
  }
}

export const KERALA_DISTRICTS = [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod"
];

export const DIRECTORY_CATEGORIES = [
    {
        title: 'Steel Sector',
        description: 'TMT steel dealers, structural steel, steel distributors.',
        icon: 'cog',
        count: 142,
        color: 'from-gray-600 to-slate-700'
    },
    {
        title: 'Cement Sector',
        description: 'Cement dealers, bulk cement suppliers, cement manufacturers.',
        icon: 'crane',
        count: 208,
        color: 'from-sky-500 to-blue-600'
    },
    {
        title: 'Ready-Mix Concrete',
        description: 'RMC suppliers, concrete batching plants.',
        icon: 'truck',
        count: 39,
        color: 'from-amber-500 to-orange-600'
    },
    {
        title: 'Construction Equipment',
        description: 'Equipment rental, JCB, excavators, cranes.',
        icon: 'tractor',
        count: 0,
        color: 'from-red-500 to-rose-600'
    },
    {
        title: 'Architects & Consultants',
        description: 'Architects, structural engineers, design consultants.',
        icon: 'chart-bar',
        count: 224,
        color: 'from-emerald-500 to-green-600'
    },
    {
        title: 'Construction Services',
        description: 'Construction companies, contractors, builders.',
        icon: 'user-hard-hat',
        count: 3,
        color: 'from-fuchsia-500 to-purple-600'
    },
    {
        title: 'Rentals & Services',
        description: 'Vehicle rentals, equipment rentals, service providers.',
        icon: 'refresh',
        count: 33,
        color: 'from-indigo-500 to-blue-600'
    },
    {
        title: 'Other',
        description: 'Miscellaneous services, suppliers, and other listings.',
        icon: 'apps',
        count: 0,
        color: 'from-slate-500 to-gray-600'
    }
];
