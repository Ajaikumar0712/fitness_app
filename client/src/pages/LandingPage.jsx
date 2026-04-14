import { Link } from 'react-router-dom';
import { Dumbbell, Heart, Activity, UtensilsCrossed, Target, BellRing, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Heart,           title: 'Real-Time Health Metrics', desc: 'Track heart rate, BP, BMI, SpO2, sleep & hydration with instant WHO-threshold alerts.', color: 'text-danger' },
  { icon: Activity,        title: 'Activity Logging',          desc: 'Log 10 activity types. Calories auto-calculated using the MET formula (ACSM standard).', color: 'text-primary' },
  { icon: UtensilsCrossed, title: 'Diet & Nutrition',          desc: 'Search 50+ foods, track macros, and monitor your daily caloric balance vs BMR-based goal.', color: 'text-success' },
  { icon: Target,          title: 'SMART Goal Setting',        desc: 'Set Specific, Measurable, Time-bound fitness goals with animated circular progress rings.', color: 'text-secondary' },
  { icon: BellRing,        title: 'Intelligent Alerts',        desc: 'Automated severity-classified health alerts when your metrics deviate from normal ranges.', color: 'text-warning' },
  { icon: CheckCircle,     title: 'Secure & Private',          desc: 'JWT authentication, bcrypt password hashing. Your data stays private and protected.', color: 'text-info' },
];

const STATS = [
  { val: '50+',  label: 'Food Items' },
  { val: '10',   label: 'Activity Types' },
  { val: '6',    label: 'Health Vitals' },
  { val: '100%', label: 'Free to Use' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Dumbbell size={16} className="text-bg"/>
            </div>
            <span className="font-display font-bold text-lg">SmartFit</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-ghost text-sm">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-semibold mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
              Real-Time Health Monitoring
            </div>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl leading-tight mb-6">
              Take Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Health</span> in Real Time
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              SmartFit is your all-in-one web-based health management platform. Track vitals, log activities, monitor diet, set goals, and receive intelligent WHO-threshold alerts — all for free.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary animate-pulse-glow text-base px-7 py-3">
                Start Tracking Free <ArrowRight size={18}/>
              </Link>
              <Link to="/login" className="btn-ghost text-base px-7 py-3">
                Sign In
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              {['No hardware required', 'No subscription', 'Works on any browser'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success"/>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Animated Dashboard Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl"/>
            <div className="relative bg-surface border border-white/10 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-danger/70"/><div className="w-3 h-3 rounded-full bg-warning/70"/><div className="w-3 h-3 rounded-full bg-success/70"/>
                <span className="text-slate-500 text-xs ml-2">SmartFit Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label:'Heart Rate', val:'72 bpm',  color:'border-success', badge:'✓ Normal', bc:'text-success' },
                  { label:'BMI',        val:'22.8',     color:'border-primary', badge:'✓ Normal', bc:'text-primary' },
                  { label:'Blood Pressure',val:'118/76',color:'border-success', badge:'✓ Normal', bc:'text-success' },
                  { label:'SpO2',       val:'98%',      color:'border-primary', badge:'✓ Normal', bc:'text-primary' },
                ].map(c => (
                  <div key={c.label} className={`bg-bg rounded-xl p-3 border-l-4 ${c.color}`}>
                    <p className="text-slate-400 text-xs">{c.label}</p>
                    <p className="text-xl font-bold text-slate-100 my-0.5">{c.val}</p>
                    <span className={`text-xs font-semibold ${c.bc}`}>{c.badge}</span>
                  </div>
                ))}
              </div>
              {/* Mini chart simulation */}
              <div className="bg-bg rounded-xl p-3 border border-white/5">
                <p className="text-xs text-slate-400 mb-2">Heart Rate Trend</p>
                <svg viewBox="0 0 280 60" className="w-full">
                  <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00D4AA" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,40 C30,35 50,20 80,25 S130,40 160,30 S220,15 280,20" stroke="#00D4AA" strokeWidth="2" fill="none"/>
                  <path d="M0,40 C30,35 50,20 80,25 S130,40 160,30 S220,15 280,20 L280,60 L0,60 Z" fill="url(#lg)"/>
                </svg>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-bg rounded-xl p-2.5 border border-white/5 text-center">
                  <p className="text-primary font-bold">280</p><p className="text-slate-500 text-xs">kcal burned</p>
                </div>
                <div className="flex-1 bg-bg rounded-xl p-2.5 border border-white/5 text-center">
                  <p className="text-secondary font-bold">3/5</p><p className="text-slate-500 text-xs">goals active</p>
                </div>
                <div className="flex-1 bg-bg rounded-xl p-2.5 border border-white/5 text-center">
                  <p className="text-warning font-bold">1,840</p><p className="text-slate-500 text-xs">kcal today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-surface/50 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-extrabold text-primary">{s.val}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl mb-4">Everything You Need to Stay Healthy</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">One unified platform to monitor all your health metrics, track fitness, manage nutrition, and set goals — no wearable required.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${f.color} mb-4`}>
                  <f.icon size={24}/>
                </div>
                <h3 className="font-semibold text-slate-100 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl mb-12">Get Started in 3 Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n:'01', title:'Create Account',       desc:'Register free. Add your basic profile: age, height, weight, activity level.', icon:'📋' },
              { n:'02', title:'Log Daily Metrics',     desc:'Enter health vitals, activity sessions, food intake from any browser, any device.', icon:'📊' },
              { n:'03', title:'Track & Improve',       desc:'View trends, track goal progress, get WHO-based alerts and health insights.', icon:'🚀' },
            ].map(s => (
              <div key={s.n} className="card relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-bg text-sm font-bold rounded-full flex items-center justify-center">{s.n}</div>
                <div className="text-4xl mb-3 mt-2">{s.icon}</div>
                <h3 className="font-semibold text-slate-100 mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-4xl mb-4">Start Your Health Journey Today</h2>
          <p className="text-slate-400 mb-8">No credit card. No hardware. Just open your browser and start tracking.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 mx-auto animate-pulse-glow">
            Get Started Free <ArrowRight size={20}/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© 2026 SmartFit — Developed by Magesh P | Prathyusha Engineering College</p>
        <p className="mt-1">Built with MERN Stack · MongoDB Atlas · React.js · Node.js</p>
      </footer>
    </div>
  );
}
