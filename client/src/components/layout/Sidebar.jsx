import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Heart, Activity, UtensilsCrossed,
  Target, BellRing, User, LogOut, Dumbbell, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/health',    icon: Heart,           label: 'Health Metrics' },
  { to: '/activity',  icon: Activity,        label: 'Activity'       },
  { to: '/diet',      icon: UtensilsCrossed, label: 'Diet & Nutrition'},
  { to: '/goals',     icon: Target,          label: 'Goals'          },
  { to: '/alerts',    icon: BellRing,        label: 'Alerts'         },
  { to: '/profile',   icon: User,            label: 'Profile'        },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-surface border-r border-white/5 z-30 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Dumbbell size={16} className="text-bg" />
            </div>
            <span className="font-display font-bold text-lg text-slate-100">SmartFit</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="nav-item w-full text-danger hover:text-danger hover:bg-danger/10">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
