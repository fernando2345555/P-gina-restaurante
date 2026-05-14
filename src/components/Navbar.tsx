import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Utensils, Info, Star, MapPin, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  onNav: (page: string) => void;
  currentPage: string;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNav, currentPage, onLoginClick }) => {
  const { isAdmin, logout, config, newOrdersCount } = useApp();

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Info },
    { id: 'menu', label: 'Menú', icon: Utensils },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'location', label: 'Ubicación', icon: MapPin },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-20 z-[80] flex items-center justify-between px-8 glass-panel border-b border-white/10 no-print">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNav('home')}>
        <div className="w-10 h-10 bg-[#ff4e00] rounded-lg flex items-center justify-center font-bold text-black text-xl shadow-[0_0_15px_rgba(255,78,0,0.4)] overflow-hidden">
          {config.logoImage ? (
            <img src={config.logoImage} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            (config.name || 'Z').charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tighter uppercase hidden sm:block">
          {config.name.split(' ')[0]} <span className="accent-text">{config.name.split(' ').slice(1).join(' ')}</span>
        </h1>
      </div>

      <nav className="flex gap-2 sm:gap-6 text-sm font-medium uppercase tracking-widest text-white/50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`transition-all relative pb-1 ${
              currentPage === item.id 
                ? 'text-[#ff4e00] border-b-2 border-[#ff4e00]' 
                : 'hover:text-white'
            }`}
          >
            <span className="hidden md:inline">{item.label}</span>
            <item.icon size={18} className="md:hidden" />
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNav('admin')}
              className={`p-2 rounded-xl transition-all relative ${
                currentPage === 'admin' 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'hover:bg-white/5 text-white/50 border border-transparent'
              }`}
            >
              <LayoutDashboard size={20} />
              {newOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-black">
                  {newOrdersCount}
                </span>
              )}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">Admin Session</p>
              <p className="text-xs font-semibold text-white/80">Fernando Manager</p>
            </div>
            <button
              onClick={() => onNav('home')}
              className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all overflow-hidden border-white/10`}
            >
              <div className="w-full h-full bg-[#333] rounded-full flex items-center justify-center text-[10px] font-bold tracking-tighter">F31</div>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-500/20 text-red-500/60 hover:text-red-500 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
