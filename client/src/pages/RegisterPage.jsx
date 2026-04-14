import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { calcBMI, classifyBMI } from '../utils/health';
import { Dumbbell, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState:{ isSubmitting, errors } } = useForm({
    defaultValues: { activityLevel: 'Moderate', gender: 'Male' }
  });
  const [showPw, setShowPw]  = useState(false);
  const [step, setStep]      = useState(1);

  const pw     = watch('password', '');
  const weight = watch('weight');
  const height = watch('height');
  const bmi    = calcBMI(parseFloat(weight), parseFloat(height));
  const bmiCls = classifyBMI(bmi);

  const pwStrength = pw.length === 0 ? 0 : pw.length < 8 ? 1 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 3 : 2;
  const pwColors   = ['','bg-danger','bg-warning','bg-success'];
  const pwLabels   = ['','Too short','Fair','Strong'];

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      toast.success('Account created! Welcome to SmartFit 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Dumbbell size={18} className="text-bg"/>
          </div>
          <span className="font-display font-bold text-xl">SmartFit</span>
        </div>

        <h2 className="font-display font-bold text-3xl text-slate-100 mb-1">Create your account</h2>
        <p className="text-slate-400 mb-8">Join SmartFit — free, no hardware needed</p>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1,2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step >= s ? 'bg-primary text-bg' : 'bg-white/10 text-slate-400'}`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-0.5 w-12 rounded ${step > s ? 'bg-primary' : 'bg-white/10'}`}/>}
            </div>
          ))}
          <p className="text-slate-400 text-sm ml-2">{step === 1 ? 'Account Info' : 'Health Profile'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`space-y-4 ${step !== 1 ? 'hidden' : ''}`}>
            <div>
              <label className="label">Full Name</label>
              <input {...register('name', { required:'Name is required' })} placeholder="Magesh P" className="input"/>
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" {...register('email', { required:'Email is required' })} placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'}
                  {...register('password', { required:'Password is required', minLength:{ value:8, message:'Minimum 8 characters'} })}
                  placeholder="Minimum 8 characters" className="input pr-12"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {pw.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pwColors[pwStrength]}`} style={{ width:`${(pwStrength/3)*100}%` }}/>
                  </div>
                  <span className="text-xs text-slate-400">{pwLabels[pwStrength]}</span>
                </div>
              )}
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full justify-center py-3">
              Continue →
            </button>
          </div>

          <div className={`space-y-4 ${step !== 2 ? 'hidden' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input type="number" min="1" max="120" {...register('age')} placeholder="22" className="input"/>
              </div>
              <div>
                <label className="label">Gender</label>
                <select {...register('gender')} className="input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" min="50" max="300" {...register('height')} placeholder="170" className="input"/>
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" step="0.1" min="1" max="500" {...register('weight')} placeholder="70" className="input"/>
              </div>
            </div>

            {/* BMI Preview */}
            {bmi && (
              <div className={`rounded-xl px-4 py-3 border flex items-center justify-between ${bmiCls.bg} ${bmiCls.border}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Your BMI</p>
                  <p className={`text-2xl font-bold ${bmiCls.color}`}>{bmi}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${bmiCls.bg} ${bmiCls.color}`}>{bmiCls.label}</span>
              </div>
            )}

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

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center">← Back</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center py-3">
                {isSubmitting ? <span className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <UserPlus size={18}/>}
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
