import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { Heart, MessageSquare, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: User;
  profile: UserProfile | null;
}

export default function Layout({ user, profile }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Heart, label: 'Discover' },
    { path: '/matches', icon: MessageSquare, label: 'Matches' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-rose-500 p-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">Spark</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {profile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 transition-colors",
                    isActive ? "text-rose-500" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
