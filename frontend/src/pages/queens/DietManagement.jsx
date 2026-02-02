import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Apple, Utensils, Leaf, Fish, Egg, 
    Coffee, AlertCircle, CheckCircle, Clock, Flame, 
    ChefHat, Heart, Baby, Droplet
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const DietManagement = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [selectedCondition, setSelectedCondition] = useState(null);
    const [activeTab, setActiveTab] = useState('plans');

    const conditions = [
        { id: 'pcos', label: 'PCOS/PCOD', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20', desc: 'Low GI, anti-inflammatory' },
        { id: 'pregnancy', label: 'Pregnancy', icon: Baby, color: 'text-purple-400', bg: 'bg-purple-500/20', desc: 'Nutrient-dense, folate-rich' },
        { id: 'anemia', label: 'Anemia', icon: Droplet, color: 'text-red-400', bg: 'bg-red-500/20', desc: 'Iron-rich, Vitamin C' },
        { id: 'general', label: 'General Wellness', icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/20', desc: 'Balanced nutrition' },
    ];

    const mealPlans = {
        pcos: {
            breakfast: [
                { name: 'Vegetable Poha', desc: 'Flattened rice with veggies and peanuts', calories: 280, protein: 8 },
                { name: 'Moong Dal Chilla', desc: 'Protein-rich lentil pancakes with mint chutney', calories: 220, protein: 14 },
                { name: 'Overnight Oats', desc: 'With chia seeds, cinnamon, and almonds', calories: 320, protein: 12 },
            ],
            lunch: [
                { name: 'Quinoa Pulao', desc: 'With mixed vegetables and raita', calories: 380, protein: 12 },
                { name: 'Dal Palak + Brown Rice', desc: 'Spinach lentils with fiber-rich rice', calories: 420, protein: 16 },
                { name: 'Chole Salad Bowl', desc: 'Chickpeas with cucumber, tomato, lemon dressing', calories: 350, protein: 14 },
            ],
            dinner: [
                { name: 'Grilled Paneer Tikka', desc: 'With mint chutney and salad', calories: 280, protein: 18 },
                { name: 'Vegetable Khichdi', desc: 'Light and easy to digest', calories: 300, protein: 10 },
                { name: 'Fish Curry (if non-veg)', desc: 'With steamed vegetables', calories: 320, protein: 24 },
            ],
            tips: [
                'Avoid refined carbs and white rice',
                'Include cinnamon to help regulate blood sugar',
                'Eat spearmint tea to reduce androgens',
                'Choose low-GI fruits like berries and apples',
                'Include healthy fats from nuts and seeds',
            ]
        },
        pregnancy: {
            breakfast: [
                { name: 'Ragi Porridge', desc: 'Calcium-rich finger millet with milk and dates', calories: 340, protein: 10, folate: 'High' },
                { name: 'Idli with Sambar', desc: 'Fermented rice cakes with lentil soup', calories: 280, protein: 12, folate: 'Medium' },
                { name: 'Banana Smoothie', desc: 'With milk, nuts, and seeds', calories: 320, protein: 14, folate: 'High' },
            ],
            lunch: [
                { name: 'Palak Paneer + Roti', desc: 'Iron and protein-rich meal', calories: 480, protein: 20, folate: 'Very High' },
                { name: 'Rajma Rice', desc: 'Kidney beans with rice and salad', calories: 450, protein: 16, folate: 'High' },
                { name: 'Curd Rice + Pickle', desc: 'Probiotic-rich, easy to digest', calories: 380, protein: 12, folate: 'Medium' },
            ],
            dinner: [
                { name: 'Methi Thepla', desc: 'Fenugreek flatbread with curd', calories: 320, protein: 10, folate: 'Very High' },
                { name: 'Chicken Soup', desc: 'Light protein-rich soup with vegetables', calories: 280, protein: 22, folate: 'Medium' },
                { name: 'Moong Dal Soup', desc: 'Gentle on stomach, high in folate', calories: 200, protein: 14, folate: 'High' },
            ],
            tips: [
                'Take prenatal vitamins with folic acid',
                'Stay hydrated - aim for 10-12 glasses water',
                'Eat small, frequent meals to avoid nausea',
                'Include DHA-rich foods for baby brain development',
                'Avoid raw papaya, pineapple, and unpasteurized dairy',
            ]
        },
        anemia: {
            breakfast: [
                { name: 'Spinach Paratha', desc: 'Iron-rich flatbread with curd', calories: 320, iron: '4mg' },
                { name: 'Dates & Nuts Smoothie', desc: 'With milk and jaggery', calories: 350, iron: '3mg' },
                { name: 'Poha with Jaggery', desc: 'Iron-fortified flattened rice', calories: 280, iron: '2.5mg' },
            ],
            lunch: [
                { name: 'Palak Dal + Rice', desc: 'Double iron boost from spinach and lentils', calories: 420, iron: '6mg' },
                { name: 'Chole Bhature (baked)', desc: 'Chickpeas with whole wheat bhatura', calories: 480, iron: '5mg' },
                { name: 'Chicken Liver Curry', desc: 'Highest iron source (if non-veg)', calories: 350, iron: '12mg' },
            ],
            dinner: [
                { name: 'Beetroot Soup', desc: 'With whole grain bread', calories: 220, iron: '3mg' },
                { name: 'Egg Curry + Roti', desc: 'Easy iron absorption with Vitamin C', calories: 340, iron: '4mg' },
                { name: 'Saag (mixed greens)', desc: 'With makki roti', calories: 300, iron: '5mg' },
            ],
            tips: [
                'Pair iron-rich foods with Vitamin C (lemon, amla)',
                'Avoid tea/coffee 1 hour before and after meals',
                'Cook in iron kadai (cast iron)',
                'Include jaggery instead of white sugar',
                'Soak and sprout legumes to increase iron absorption',
            ]
        },
        general: {
            breakfast: [
                { name: 'Upma with Vegetables', desc: 'Semolina porridge with mixed veggies', calories: 280, protein: 8 },
                { name: 'Dosa with Chutney', desc: 'Fermented crepes with coconut chutney', calories: 260, protein: 6 },
                { name: 'Fruit Bowl + Nuts', desc: 'Seasonal fruits with almonds and walnuts', calories: 220, protein: 6 },
            ],
            lunch: [
                { name: 'Thali Meal', desc: 'Roti, dal, sabzi, rice, salad, curd', calories: 550, protein: 18 },
                { name: 'Biryani (veg/chicken)', desc: 'With raita and salad', calories: 520, protein: 20 },
                { name: 'Buddha Bowl', desc: 'Grains, protein, veggies, healthy fats', calories: 450, protein: 16 },
            ],
            dinner: [
                { name: 'Vegetable Soup', desc: 'With whole grain bread', calories: 180, protein: 6 },
                { name: 'Roti + Sabzi', desc: 'Seasonal vegetables with whole wheat bread', calories: 320, protein: 10 },
                { name: 'Khichdi', desc: 'Comfort food with ghee', calories: 300, protein: 10 },
            ],
            tips: [
                'Eat seasonal and local produce',
                'Include all 6 tastes in your meals',
                'Practice mindful eating - no screens',
                'Stay hydrated throughout the day',
                'Listen to your body\'s hunger cues',
            ]
        }
    };

    const quickSnacks = [
        { name: 'Roasted Makhana', calories: 80, benefit: 'Low calorie, high fiber' },
        { name: 'Buttermilk (Chaas)', calories: 40, benefit: 'Probiotic, cooling' },
        { name: 'Fruit Chaat', calories: 100, benefit: 'Vitamins, fiber' },
        { name: 'Roasted Chana', calories: 120, benefit: 'Protein, iron' },
        { name: 'Coconut Water', calories: 45, benefit: 'Electrolytes' },
        { name: 'Dates (2-3)', calories: 70, benefit: 'Iron, energy' },
    ];

    const currentPlan = selectedCondition ? mealPlans[selectedCondition] : null;

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-green-50 to-pink-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'}`} style={{ animationDelay: '1s' }} />
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queens')} className={`p-2 border rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-green-400" />
                            <h1 className="text-xl font-black tracking-tight">DIET <span className="text-green-400">PLANNER</span></h1>
                        </div>
                        <span className="text-xs font-bold tracking-[0.1em] text-green-300 uppercase">Condition-Specific Nutrition</span>
                    </div>
                </div>
                <Link to="/queens" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <Crown className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-black hidden md:block">FOR <span className="text-pink-400">QUEENS</span></span>
                </Link>
            </header>

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-6 pb-24">
                {/* Condition Selection */}
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-white/20 backdrop-blur-xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-black mb-4">Select Your Condition</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {conditions.map(condition => (
                                <button
                                    key={condition.id}
                                    onClick={() => setSelectedCondition(condition.id)}
                                    className={`p-4 rounded-2xl border transition-all text-left ${
                                        selectedCondition === condition.id
                                            ? `${condition.bg} border-white/30`
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <condition.icon className={`w-5 h-5 ${condition.color}`} />
                                        <span className="font-bold text-white">{condition.label}</span>
                                    </div>
                                    <p className="text-xs text-green-300">{condition.desc}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {selectedCondition && (
                    <>
                        {/* Tab Navigation */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                            {['plans', 'snacks', 'tips'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                        activeTab === tab 
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                                            : 'text-green-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {tab === 'plans' ? 'Meal Plans' : tab === 'snacks' ? 'Healthy Snacks' : 'Diet Tips'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'plans' && currentPlan && (
                            <div className="space-y-6">
                                {/* Breakfast */}
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Coffee className="w-5 h-5 text-yellow-400" />
                                            <h4 className="font-black text-yellow-400">BREAKFAST</h4>
                                            <span className="text-xs text-yellow-300 ml-auto">7:00 - 9:00 AM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {currentPlan.breakfast.map((meal, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <h5 className="font-bold text-white">{meal.name}</h5>
                                                        <p className="text-xs text-green-300">{meal.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-yellow-400">{meal.calories} cal</span>
                                                        {meal.protein && <p className="text-xs text-green-400">{meal.protein}g protein</p>}
                                                        {meal.iron && <p className="text-xs text-red-400">{meal.iron} iron</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lunch */}
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Apple className="w-5 h-5 text-orange-400" />
                                            <h4 className="font-black text-orange-400">LUNCH</h4>
                                            <span className="text-xs text-orange-300 ml-auto">12:30 - 2:00 PM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {currentPlan.lunch.map((meal, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <h5 className="font-bold text-white">{meal.name}</h5>
                                                        <p className="text-xs text-green-300">{meal.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-orange-400">{meal.calories} cal</span>
                                                        {meal.protein && <p className="text-xs text-green-400">{meal.protein}g protein</p>}
                                                        {meal.iron && <p className="text-xs text-red-400">{meal.iron} iron</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Dinner */}
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ChefHat className="w-5 h-5 text-purple-400" />
                                            <h4 className="font-black text-purple-400">DINNER</h4>
                                            <span className="text-xs text-purple-300 ml-auto">7:00 - 8:30 PM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {currentPlan.dinner.map((meal, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <h5 className="font-bold text-white">{meal.name}</h5>
                                                        <p className="text-xs text-green-300">{meal.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-purple-400">{meal.calories} cal</span>
                                                        {meal.protein && <p className="text-xs text-green-400">{meal.protein}g protein</p>}
                                                        {meal.iron && <p className="text-xs text-red-400">{meal.iron} iron</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'snacks' && (
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <h4 className="font-black mb-4 flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-green-400" />
                                        Healthy Indian Snacks
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {quickSnacks.map((snack, idx) => (
                                            <div key={idx} className="p-4 bg-white/5 rounded-xl">
                                                <h5 className="font-bold text-white mb-1">{snack.name}</h5>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Flame className="w-3 h-3 text-orange-400" />
                                                    <span className="text-xs text-orange-400">{snack.calories} cal</span>
                                                </div>
                                                <p className="text-xs text-green-300">{snack.benefit}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'tips' && currentPlan && (
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <h4 className="font-black mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        Diet Tips for {conditions.find(c => c.id === selectedCondition)?.label}
                                    </h4>
                                    <div className="space-y-3">
                                        {currentPlan.tips.map((tip, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-green-200 text-sm">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Button 
                            onClick={() => navigate('/consultation')}
                            className="w-full bg-pink-500 hover:bg-pink-600 py-6 text-lg font-bold"
                        >
                            Get Personalized Diet Plan from AI Doctor
                        </Button>
                    </>
                )}
            </main>
        </div>
    );
};

export default DietManagement;
