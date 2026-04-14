import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const { register, handleSubmit, formState:{ isSubmitting, errors } } = useForm();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back! 💚');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface to-bg/50 items-center justify-center p-12 border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"/>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell size={28} className="text-bg"/>
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-100 mb-4">SmartFit</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Your real-time health and activity tracking companion.
          </p>
          <div className="space-y-3 text-left">
            {[
              '📊 Real-time health dashboards',
              '🔥 Activity & calorie tracking',
              '🥗 Diet & nutrition logging',
              '🎯 SMART goal progress rings',
              '🔔 WHO threshold health alerts',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-slate-300 text-sm bg-white/3 rounded-xl px-4 py-2.5">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Dumbbell size={16} className="text-bg"/>
            </div>
            <span className="font-display font-bold text-lg">SmartFit</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-slate-100 mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your SmartFit account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" autoComplete="email"
                {...register('email', { required:'Email is required' })}
                placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  {...register('password', { required:'Password is required' })}
                  placeholder="••••••••" className="input pr-12"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 text-base">
              {isSubmitting ? <span className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <LogIn size={18}/>}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>
          <p className="text-center mt-4">
            <Link to="/" className="text-slate-500 text-xs hover:text-slate-300 transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
