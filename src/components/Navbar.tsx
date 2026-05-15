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
    <header className="fixed top-0 left-0 w-full h-24 z-[80] flex items-center justify-between px-8 md:px-16 no-print transition-all duration-500">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-b border-white/5" />
      
      <div className="relative flex items-center gap-4 cursor-pointer group" onClick={() => onNav('home')}>
        <div className="w-12 h-12 bg-[#ff4e00] rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_10px_30px_rgba(255,78,0,0.3)] group-hover:scale-110 transition-transform duration-500 overflow-hidden">
          {config.logoImage ? (
            <img src={config.logoImage} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            (config.name || 'Z').charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">
            {config.name.split(' ')[0]}
          </h1>
          <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-white/30 group-hover:text-[#ff4e00] transition-colors">Templo de la Brasa</span>
        </div>
      </div>

      <nav className="relative flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`transition-all relative py-1 ${
              currentPage === item.id 
                ? 'text-white' 
                : 'hover:text-white/60'
            }`}
          >
            <span className="hidden md:inline">{item.label}</span>
            <item.icon size={18} className="md:hidden" />
            {currentPage === item.id && (
              <motion.div layoutId="navline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
        ))}
      </nav>

      <div className="relative hidden md:flex items-center gap-6">
        <button 
          onClick={() => window.open(`https://wa.me/${config.whatsappNumber}`, '_blank')}
          className="text-[10px] font-black uppercase tracking-widest px-6 py-3 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
        >
          Reserva YA
        </button>
      </div>
    </header>
  );
};
