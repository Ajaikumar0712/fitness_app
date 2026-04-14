import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { updateMe, deleteMe } from '../services/api';
import { calcBMI, calcBMR, calcDailyCaloricNeed, classifyBMI } from '../utils/health';
import { User, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { register, handleSubmit, formState:{ isSubmitting } } = useForm({ defaultValues: {
    name: user?.name, age: user?.age, gender: user?.gender,
    height: user?.height, weight: user?.weight, activityLevel: user?.activityLevel,
  }});
  const [showDel, setShowDel] = useState(false);

  const bmi     = calcBMI(user?.weight, user?.height);
  const bmr     = calcBMR(user);
  const dailyCal= calcDailyCaloricNeed(user);
  const bmiCls  = classifyBMI(bmi);

  const onSubmit = async (data) => {
    try {
      const res = await updateMe(data);
      updateUser(res.data);
      toast.success('Profile updated! ✅');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('This will permanently delete your account and ALL health data. Are you sure?')) return;
    try {
      await deleteMe();
      logout();
    } catch (err) { toast.error('Failed to delete account'); }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-slide-up">
      <h1 className="page-title">My Profile</h1>

      {/* Avatar + Stats */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold text-slate-100">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <p className="text-slate-500 text-xs mt-1">
            Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { year:'numeric', month:'long' })}
          </p>
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { label:'BMI', val: bmi ?? '—', sub: bmiCls.label, color: bmiCls.color },
            { label:'BMR', val: bmr, sub:'kcal/day', color:'text-primary' },
            { label:'Daily Goal', val: dailyCal, sub:'kcal/day', color:'text-secondary' },
          ].map(s => (
            <div key={s.label} className="bg-white/3 rounded-xl px-4 py-3">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
              <p className="text-slate-500 text-xs">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <p className="section-title">Personal Information</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} className="input" placeholder="Your name"/>
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" min="1" max="120" {...register('age')} className="input" placeholder="25"/>
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="input">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Activity Level</label>
              <select {...register('activityLevel')} className="input">
                <option value="Sedentary">Sedentary (little/no exercise)</option>
                <option value="Light">Light (1–3 days/week)</option>
                <option value="Moderate">Moderate (3–5 days/week)</option>
                <option value="Active">Active (6–7 days/week)</option>
                <option value="VeryActive">Very Active (2x/day training)</option>
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" min="50" max="300" {...register('height')} className="input" placeholder="170"/>
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" step="0.1" min="1" max="500" {...register('weight')} className="input" placeholder="70"/>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <Save size={16}/>}
            {isSubmitting ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Health Summary */}
      {bmi && (
        <div className="card">
          <p className="section-title">Your Health Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label:'BMI',            val:`${bmi} kg/m²`,     color: bmiCls.color,    note: bmiCls.label },
              { label:'Basal Met. Rate',val:`${bmr} kcal/day`,  color:'text-primary',   note:'At complete rest' },
              { label:'Daily Caloric Need',val:`${dailyCal} kcal`,color:'text-secondary',note:'Based on activity' },
              { label:'Height',         val:`${user?.height} cm`,color:'text-slate-300', note:'' },
              { label:'Weight',         val:`${user?.weight} kg`,color:'text-slate-300', note:'' },
              { label:'Activity Level', val:user?.activityLevel, color:'text-slate-300', note:'' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
                <p className={`text-base font-bold mt-1 ${s.color}`}>{s.val}</p>
                {s.note && <p className="text-xs text-slate-600">{s.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border border-danger/20">
        <p className="section-title text-danger">Danger Zone</p>
        <p className="text-sm text-slate-400 mb-4">Deleting your account will permanently remove all your health data, activities, goals, and alerts. This action cannot be undone.</p>
        <button onClick={handleDeleteAccount} className="btn-danger">
          <Trash2 size={16}/> Delete My Account
        </button>
      </div>
    </div>
  );
}
