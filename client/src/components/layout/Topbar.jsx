import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAlerts } from '../../services/api';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getAlerts().then(res => setUnread(res.data.unreadCount || 0)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost !px-2.5 !py-2"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-slate-400 text-sm">{greeting},</p>
          <p className="font-display font-semibold text-slate-100">{user?.name?.split(' ')[0] || 'User'} 👋</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/alerts" className="relative btn-ghost !px-2.5 !py-2">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <Link to="/profile" className="btn-ghost !px-2.5 !py-2">
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
}
