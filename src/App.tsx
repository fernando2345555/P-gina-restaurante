/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Reviews } from './pages/Reviews';
import { Location } from './pages/Location';
import { Admin } from './pages/Admin';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAdmin, config } = useApp();
  const [bgIndex, setBgIndex] = useState(0);

  const bgImages = [
    config.heroImage,
    ...(Array.isArray(config.galleryImages) ? config.galleryImages : [])
  ];

  // Rotate background on navigation
  useEffect(() => {
    if (bgImages.length > 0) {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }
  }, [currentPage, config.galleryImages]);

  // Protect admin route
  useEffect(() => {
    if (currentPage === 'admin' && !isAdmin) {
      setCurrentPage('home');
    }
  }, [isAdmin, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNav={setCurrentPage} />;
      case 'menu': return <Menu />;
      case 'reviews': return <Reviews />;
      case 'location': return <Location />;
      case 'admin': return <Admin />;
      default: return <Home onNav={setCurrentPage} />;
    }
  };

  return (
    <div className={`relative min-h-screen ${config.fontFamily ? `font-app-${config.fontFamily}` : 'font-sans'} bg-[#0a0a0a] overflow-x-hidden transition-all duration-700`}>
      {/* Animated Food Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImages[bgIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={bgImages[bgIndex]} 
              alt="Grill Mood"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80" />
        <div className="fire-orb top-[-100px] left-[-100px]" />
        <div className="fire-orb bottom-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          currentPage={currentPage} 
          onNav={setCurrentPage} 
          onLoginClick={() => setIsLoginOpen(true)} 
        />
        
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="w-full px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 bg-black/50 z-10 border-t border-white/5 no-print mt-auto gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p>{config.siteName} Management Pro v2.4.0</p>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[8px] opacity-40">Servidor Activo</span>
            </div>
          </div>
          
          <p>© {new Date().getFullYear()} - {config.name} | {config.adminEmail}</p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => isAdmin ? setCurrentPage('admin') : setIsLoginOpen(true)}
              className="opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#ff4e00]" />
              Soporte Técnico
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Sistema Protegido</span>
            </div>
          </div>
        </footer>
      </div>

      <WhatsAppButton />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
