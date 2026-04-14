import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { logFood, getTodayDiet, deleteDietEntry, searchFoods } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calcDailyCaloricNeed } from '../utils/health';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Plus, Trash2, Search, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
ChartJS.register(ArcElement, Tooltip, Legend);

const MEALS = ['Breakfast','Lunch','Dinner','Snacks'];
const MEAL_ICONS = { Breakfast:'🌅', Lunch:'☀️', Dinner:'🌙', Snacks:'🍎' };

export default function DietPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue, watch, formState:{ isSubmitting } } = useForm({
    defaultValues: { mealType:'Breakfast', quantityGrams:100 }
  });
  const [todayData,   setTodayData]   = useState({ entries:[], totals:{ calories:0, protein:0, carbs:0, fat:0 } });
  const [foods,       setFoods]       = useState([]);
  const [searchQ,     setSearchQ]     = useState('');
  const [selFood,     setSelFood]     = useState(null);
  const [hydration,   setHydration]   = useState(0); // glasses (250ml each)
  const [showDropdown,setShowDropdown]= useState(false);
  const [loading,     setLoading]     = useState(true);
  const dailyCal = calcDailyCaloricNeed(user);
  const qty      = watch('quantityGrams');
  const searchRef= useRef(null);

  useEffect(() => {
    getTodayDiet().then(r => setTodayData(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQ.length < 2) { setFoods([]); setShowDropdown(false); return; }
    const t = setTimeout(() => {
      searchFoods(searchQ).then(r => { setFoods(r.data); setShowDropdown(true); });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  const selectFood = (food) => {
    setSelFood(food);
    setSearchQ(food.name);
    setValue('foodName', food.name);
    setShowDropdown(false);
  };

  const getNutriPreview = () => {
    if (!selFood || !qty) return null;
    const q = parseFloat(qty) / 100;
    return {
      calories: Math.round(selFood.per100gCalories * q),
      protein:  Math.round(selFood.protein * q * 10) / 10,
      carbs:    Math.round(selFood.carbs   * q * 10) / 10,
      fat:      Math.round(selFood.fat     * q * 10) / 10,
    };
  };

  const onSubmit = async (data) => {
    if (!selFood && !data.foodName) { toast.error('Search and select a food item'); return; }
    const preview = getNutriPreview();
    try {
      const payload = {
        ...data,
        foodName: data.foodName || selFood?.name,
        quantityGrams: parseFloat(data.quantityGrams),
        ...(preview || {}),
      };
      const res = await logFood(payload);
      setTodayData(prev => ({
        entries: [...prev.entries, res.data],
        totals: {
          calories: prev.totals.calories + (preview?.calories || 0),
          protein:  prev.totals.protein  + (preview?.protein  || 0),
          carbs:    prev.totals.carbs    + (preview?.carbs    || 0),
          fat:      prev.totals.fat      + (preview?.fat      || 0),
        }
      }));
      toast.success('Food logged! 🥗');
      reset({ mealType: data.mealType, quantityGrams: 100 });
      setSearchQ(''); setSelFood(null);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleDelete = async (id, entry) => {
    await deleteDietEntry(id);
    setTodayData(prev => ({
      entries: prev.entries.filter(e => e._id !== id),
      totals: {
        calories: prev.totals.calories - entry.calories,
        protein:  prev.totals.protein  - entry.protein,
        carbs:    prev.totals.carbs    - entry.carbs,
        fat:      prev.totals.fat      - entry.fat,
      }
    }));
    toast.success('Removed');
  };

  const t = todayData.totals;
  const macroData = {
    labels: ['Protein','Carbs','Fat'],
    datasets: [{ data: [t.protein, t.carbs, t.fat],
      backgroundColor: ['#10B981','#6366F1','#F97316'], borderWidth: 0 }],
  };

  const grouped = MEALS.reduce((acc, meal) => {
    acc[meal] = todayData.entries.filter(e => e.mealType === meal);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="page-title">Diet & Nutrition</h1>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Calories',  val:`${Math.round(t.calories)} kcal`, pct: Math.min((t.calories/dailyCal)*100,100), color:'bg-primary' },
          { label:'Protein',   val:`${Math.round(t.protein)}g`,      pct: Math.min((t.protein/50)*100,100),      color:'bg-success' },
          { label:'Carbs',     val:`${Math.round(t.carbs)}g`,        pct: Math.min((t.carbs/250)*100,100),       color:'bg-secondary' },
          { label:'Fat',       val:`${Math.round(t.fat)}g`,          pct: Math.min((t.fat/65)*100,100),          color:'bg-warning' },
        ].map(m => (
          <div key={m.label} className="card">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</p>
            <p className="text-xl font-bold text-slate-100 mt-1">{m.val}</p>
            <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width:`${m.pct}%` }}/>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Food Form */}
        <div className="lg:col-span-2 card">
          <p className="section-title">Add Food Entry</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Meal Type */}
            <div>
              <label className="label">Meal Type</label>
              <div className="flex gap-2 flex-wrap">
                {MEALS.map(m => (
                  <label key={m} className="flex-1 min-w-[6rem]">
                    <input type="radio" value={m} {...register('mealType')} className="hidden peer"/>
                    <div className="peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary border border-white/10 rounded-xl py-2.5 text-center text-sm font-medium text-slate-400 cursor-pointer hover:border-white/20 transition-all">
                      {MEAL_ICONS[m]} {m}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Food Search */}
            <div className="relative" ref={searchRef}>
              <label className="label">Search Food</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input
                  type="text" value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); setValue('foodName', e.target.value); }}
                  placeholder="Type food name... (e.g. Rice, Banana)"
                  className="input pl-10"
                />
              </div>
              {showDropdown && foods.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {foods.map(f => (
                    <button key={f._id} type="button" onClick={() => selectFood(f)}
                      className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-white/5 transition-colors text-sm border-b border-white/5 last:border-0">
                      <span className="text-slate-200 font-medium">{f.name}</span>
                      <span className="text-slate-500 text-xs">{f.per100gCalories} kcal/100g</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="label">Quantity (grams)</label>
              <input type="number" min="1" {...register('quantityGrams')} className="input" placeholder="100"/>
            </div>

            {/* Nutritional Preview */}
            {getNutriPreview() && (
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nutritional Preview for {qty}g</p>
                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  {Object.entries(getNutriPreview()).map(([k, v]) => (
                    <div key={k}>
                      <p className="font-bold text-slate-100">{v}{k === 'calories' ? '' : 'g'}</p>
                      <p className="text-slate-500 text-xs capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <Plus size={18}/>}
              Add to Log
            </button>
          </form>
        </div>

        {/* Right Column: Macro Chart + Hydration */}
        <div className="space-y-4">
          <div className="card">
            <p className="section-title">Macro Breakdown</p>
            <div className="relative h-36">
              <Doughnut data={macroData} options={{
                cutout:'72%', responsive:true, maintainAspectRatio:false,
                plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx=>`${ctx.raw}g` }}}
              }}/>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-slate-100">{Math.round(t.calories)}</span>
                <span className="text-xs text-slate-400">kcal</span>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              {[['Protein','#10B981',t.protein,'g'],['Carbs','#6366F1',t.carbs,'g'],['Fat','#F97316',t.fat,'g']].map(([l,c,v,u]) => (
                <div key={l} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:c}}/>{l}</span>
                  <span className="font-semibold text-slate-200">{Math.round(v)}{u}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{Math.round(t.calories)} kcal</span><span>{dailyCal} goal</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width:`${Math.min((t.calories/dailyCal)*100,100)}%` }}/>
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className="card">
            <p className="section-title">Hydration Tracker</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <button key={i} onClick={() => setHydration(i+1)}
                  className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all
                    ${i < hydration ? 'bg-info/20 text-info border border-info/30' : 'bg-white/5 text-slate-600 border border-white/5 hover:border-white/20'}`}>
                  💧
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-300 font-semibold">{hydration * 0.25} / {user?.weight ? Math.round(user.weight * 0.035 * 4) / 4 : 2.5} L</p>
            <button onClick={() => setHydration(h => Math.min(h+1, 8))}
              className="btn-secondary w-full justify-center mt-2 !py-2 text-sm">
              <Droplets size={15}/> + 250ml glass
            </button>
          </div>
        </div>
      </div>

      {/* Today's Food Log */}
      <div className="card">
        <p className="section-title">Today's Food Log</p>
        {loading ? <div className="skeleton h-40 rounded-xl"/> : (
          <div className="space-y-4">
            {MEALS.map(meal => grouped[meal]?.length > 0 && (
              <div key={meal}>
                <p className="text-sm font-semibold text-slate-400 mb-2">{MEAL_ICONS[meal]} {meal}</p>
                <div className="space-y-2">
                  {grouped[meal].map(e => (
                    <div key={e._id} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-2.5 text-sm">
                      <div>
                        <span className="text-slate-200 font-medium">{e.foodName}</span>
                        <span className="text-slate-500 ml-2">{e.quantityGrams}g</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-warning font-semibold">{e.calories} kcal</span>
                        <button onClick={() => handleDelete(e._id, e)} className="text-slate-600 hover:text-danger">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {todayData.entries.length === 0 && (
              <p className="text-slate-500 text-center py-6">No food logged today. Start tracking your meals! 🥗</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
