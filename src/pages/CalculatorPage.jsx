import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Clipboard, Building2, Grid3x3, BarChart3, ShoppingCart, 
  Settings, Upload, Zap, ChevronLeft, ArrowLeft, FileText,
  Recycle
} from 'lucide-react';
import { getAiCalculatorResponse } from '../lib/calculatorservice';

// Icon mapping for lucide-react
const iconMap = {
  'clipboard': Clipboard,
  'building': Building2,
  'apps': Grid3x3,
  'chart-bar': BarChart3,
  'squares-plus': Grid3x3,
  'cart': ShoppingCart,
  'cog': Settings,
  'upload': Upload,
  'bolt': Zap,
  'chevron-down': ChevronLeft,
  'document-text': FileText,
  'refresh': Recycle,
};

// Generic Icon Component
const Icon = ({ name, className, ...props }) => {
  const LucideIcon = iconMap[name] || Clipboard;
  return <LucideIcon className={className} {...props} />;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center my-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
    />
  </div>
);

const GenericAiCalculator = ({ type, systemInstruction, placeholder }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim() && !image) return;
        
        setLoading(true);
        setError(null);
        setResult(null);

        try {
             const response = await getAiCalculatorResponse(query, systemInstruction, image || undefined);
             setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
             const reader = new FileReader();
             reader.onloadend = () => {
                 setImage(reader.result);
             };
             reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-4">
                 <div className="relative">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-full ${image ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 transition-colors`}
                            title="Upload Image/Plan"
                        >
                            <Icon name="upload" className="h-5 w-5" />
                        </button>
                        <button 
                            type="submit"
                            disabled={loading || (!query && !image)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                        >
                            <Icon name="bolt" className="h-5 w-5" />
                            {loading ? 'Calculating...' : 'Calculate'}
                        </button>
                    </div>
                </div>
                {image && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <Icon name="document-text" className="h-4 w-4" />
                        <span>Image attached</span>
                        <button type="button" onClick={() => setImage(null)} className="text-red-500 ml-auto hover:underline">Remove</button>
                    </div>
                )}
            </form>

            {loading && <LoadingSpinner />}
            
            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-8 prose max-w-none bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Estimation Result</h3>
                    <div className="whitespace-pre-wrap font-mono text-sm text-gray-800">{result}</div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 italic">
                        * This estimation is generated by AI. Please verify with a professional before purchasing materials.
                    </div>
                </div>
            )}
        </div>
    );
};

const ConcreteCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are an expert construction estimator specializing in concrete works. Provided with dimensions (length, width, depth/thickness) or a description of a concrete member (slab, column, beam, footing), calculate the volume of concrete in cubic meters and cubic feet. Then, using a standard mix ratio (assume M20 1:1.5:3 unless specified), calculate the required quantity of Cement (in bags of 50kg), Sand (in cubic feet/cft and kg), and Aggregate (in cubic feet/cft and kg). Format the output clearly." 
        placeholder="e.g., I have a slab 10m x 12m with 150mm thickness. Using M20 concrete." 
    />
);

const BricksCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are an expert construction estimator. Calculate the number of bricks required for a wall based on dimensions provided by the user. Assume standard brick size (190x90x90 mm) with 10mm mortar unless specified. Also estimate the cement and sand required for mortar. Provide the total brick count, cement bags, and sand quantity." 
        placeholder="e.g., Wall length 5 meters, height 3 meters, thickness 230mm (9 inches)." 
    />
);

const PlasterCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are an expert construction estimator. Calculate the quantity of cement and sand required for plastering a wall. Ask for wall dimensions and plaster thickness (usually 12mm, 15mm, or 20mm). Assume a mix ratio of 1:4 or 1:6. Output cement in bags and sand in cft." 
        placeholder="e.g., Plastering for 2000 sqft internal walls, 12mm thickness." 
    />
);

const TilesCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are an expert construction estimator. Calculate the number of tiles required for flooring or wall cladding. Ask for floor/wall area and individual tile size. Add a standard 5-10% wastage margin. Also estimate the grout and adhesive required." 
        placeholder="e.g., Flooring for a room 15ft x 20ft using 600x600mm tiles." 
    />
);

const MaterialEstimationCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are a versatile construction material estimator. Identify the materials described by the user (wood, steel, paint, etc.) and estimate quantities based on dimensions and standard industry coverage rates/densities." 
        placeholder="e.g., How much paint do I need for 3000 sqft of wall area? or How much steel for a 1000 sqft slab?" 
    />
);

const RightAngleCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are a construction math expert. Solve geometry problems related to right angles, such as stair stringers, rafter lengths, roofing slopes, and squaring building layouts (3-4-5 method). Show step-by-step calculations." 
        placeholder="e.g., Calculate rafter length for a span of 4m and rise of 1.5m." 
    />
);

const RakeWallCalculator = () => (
    <GenericAiCalculator 
        systemInstruction="You are a construction framing expert. Calculate the stud lengths for a rake wall (sloped wall) given the pitch, run, and stud spacing. Output a cut list for the studs." 
        placeholder="e.g., Rake wall with 4m length, starting height 2.4m, roof pitch 30 degrees, studs at 600mm centers." 
    />
);

const AiCalculator = (props) => {
    let instruction = "You are a helpful construction assistant. Help the user with their construction-related queries, calculations, or estimations.";
    if (props.type === 'cost') instruction = "You are a construction cost estimator. Estimate the cost of materials and labor for the described work based on current average market rates in Kerala, India. Provide a breakdown.";
    if (props.type === 'quantity') instruction = "You are a quantity surveyor. Perform a detailed quantity takeoff from the description or image provided.";
    if (props.type === 'carbon') instruction = "You are a sustainability consultant. Analyze the described materials or project and estimate the embodied carbon. Suggest low-carbon alternatives.";
    
    return (
        <GenericAiCalculator 
            type={props.type}
            systemInstruction={instruction} 
            placeholder="Describe your project or requirement in detail..." 
        />
    );
};

const CALCULATOR_LIST = [
    {
        id: 'concrete',
        name: 'ConcreteCalc Pro',
        description: 'Calculate cement, sand, and aggregate volume for slabs, columns, and footings.',
        icon: 'building',
        gradient: 'from-blue-500 to-cyan-500',
        category: 'Essential Estimators',
        component: ConcreteCalculator
    },
    {
        id: 'bricks',
        name: 'Brick Estimator',
        description: 'Estimate the number of bricks and mortar quantity required for walls of any size.',
        icon: 'apps',
        gradient: 'from-red-500 to-orange-500',
        category: 'Essential Estimators',
        component: BricksCalculator
    },
    {
        id: 'plaster',
        name: 'Plastering Calculator',
        description: 'Calculate cement and sand quantities needed for internal and external wall plastering.',
        icon: 'chart-bar',
        gradient: 'from-yellow-500 to-amber-600',
        category: 'Essential Estimators',
        component: PlasterCalculator
    },
    {
        id: 'tiles',
        name: 'Tiles & Grout',
        description: 'Estimate floor and wall tiles including grout gaps and wastage.',
        icon: 'squares-plus',
        gradient: 'from-cyan-500 to-sky-600',
        category: 'Finishing & Interiors',
        component: TilesCalculator
    },
    {
        id: 'materials',
        name: 'Material Estimator',
        description: 'Estimate sheet goods, lumber, rebar, or general materials with wastage and cost.',
        icon: 'cart',
        gradient: 'from-orange-400 to-red-500',
        category: 'Essential Estimators',
        component: MaterialEstimationCalculator
    },
    {
        id: 'framing',
        name: 'Framing & Roofing',
        description: 'Solve right-angle geometry for rafters, stairs, rake walls, and squaring layouts.',
        icon: 'cog',
        gradient: 'from-indigo-500 to-purple-600',
        category: 'Structural & Framing',
        component: RightAngleCalculator
    },
    {
        id: 'rake_wall',
        name: 'Rake Wall Calculator',
        description: 'Calculate stud lengths and height differences for sloped walls.',
        icon: 'chart-bar',
        gradient: 'from-pink-500 to-rose-500',
        category: 'Structural & Framing',
        component: RakeWallCalculator
    },
    {
        id: 'quantity',
        name: 'AI Quantity Takeoff',
        description: 'Upload plans or describe projects to extract detailed material quantities using AI.',
        icon: 'clipboard',
        gradient: 'from-emerald-500 to-teal-600',
        category: 'AI Intelligence',
        component: AiCalculator
    },
    {
        id: 'cost',
        name: 'AI Cost Estimator',
        description: 'Get instant cost estimates for construction items and labor rates in your region.',
        icon: 'cart',
        gradient: 'from-green-600 to-emerald-700',
        category: 'AI Intelligence',
        component: AiCalculator
    },
    {
        id: 'carbon',
        name: 'Carbon Calculator',
        description: 'Analyze the embodied carbon footprint of materials to make sustainable choices.',
        icon: 'refresh',
        gradient: 'from-teal-500 to-green-500',
        category: 'Sustainability',
        component: AiCalculator
    },
    {
        id: 'general',
        name: 'General AI Helper',
        description: 'Ask any construction-related math question, unit conversion, or estimation query.',
        icon: 'bolt',
        gradient: 'from-violet-600 to-indigo-700',
        category: 'AI Intelligence',
        component: AiCalculator
    },
];

export const CalculatorPage = () => {
    const [activeCalculatorId, setActiveCalculatorId] = useState(null);
    
    const activeCalcConfig = CALCULATOR_LIST.find(c => c.id === activeCalculatorId);
    const ActiveComponent = activeCalcConfig?.component;

    const groupedCalculators = useMemo(() => {
        const groups = {};
        CALCULATOR_LIST.forEach(calc => {
            if (!groups[calc.category]) groups[calc.category] = [];
            groups[calc.category].push(calc);
        });
        
        const orderedGroups = {};
        const order = ['Essential Estimators', 'Finishing & Interiors', 'Structural & Framing', 'AI Intelligence', 'Sustainability'];
        
        order.forEach(key => {
            if(groups[key]) orderedGroups[key] = groups[key];
        });
        
        Object.keys(groups).forEach(key => {
            if(!orderedGroups[key]) orderedGroups[key] = groups[key];
        });

        return orderedGroups;
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             <div className="bg-white shadow-sm relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {!activeCalculatorId ? (
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Construction Calculators</h1>
                            <p className="mt-4 text-xl text-gray-600">
                                Professional tools for estimating materials, costs, and structural requirements.
                                Select a tool below to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setActiveCalculatorId(null)}
                                className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                title="Back to Calculators"
                            >
                                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    {activeCalcConfig?.name}
                                </h1>
                                <p className="text-gray-500 mt-1">{activeCalcConfig?.description}</p>
                            </div>
                        </div>
                    )}
                </div>
             </div>

             <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!activeCalculatorId ? (
                    <div className="space-y-12">
                        {Object.entries(groupedCalculators).map(([category, calculators]) => (
                            <div key={category} className="animate-fade-in">
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight whitespace-nowrap">{category}</h2>
                                    <div className="h-px bg-gray-200 w-full rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                                    {calculators.map((calc) => (
                                        <button 
                                            key={calc.id}
                                            onClick={() => setActiveCalculatorId(calc.id)}
                                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-green-100 transition-all duration-300 p-6 text-left flex flex-col h-full relative overflow-hidden"
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${calc.gradient} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
                                            
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${calc.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                                <Icon name={calc.icon} className="h-7 w-7 text-white" />
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors relative z-10">
                                                {calc.name}
                                            </h3>
                                            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed relative z-10">
                                                {calc.description}
                                            </p>
                                            
                                            <div className="flex items-center text-green-600 font-bold text-sm mt-auto relative z-10 group-hover:underline decoration-2 underline-offset-4">
                                                Open Tool
                                                <ChevronLeft className="h-4 w-4 ml-1 rotate-180 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 animate-fade-in">
                         {ActiveComponent && <ActiveComponent type={activeCalculatorId} />}
                    </div>
                )}
             </main>
        </div>
    );
};

export default CalculatorPage;
