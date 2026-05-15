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
import { SEO } from './components/SEO';
import { AnimatePresence, motion } from 'motion/react';
import { Flame } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAdmin, config, isLoaded } = useApp();
  const [bgIndex, setBgIndex] = useState(0);

  const bgImages = [
    config.heroImage,
    ...(Array.isArray(config.galleryImages) ? config.galleryImages : [])
  ].filter(Boolean);

  const currentBg = config.currentBackground || bgImages[bgIndex];

  // Rotate background on navigation if no explicit background is set
  useEffect(() => {
    if (!config.currentBackground && bgImages.length > 0) {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }
  }, [currentPage, config.galleryImages, config.currentBackground, bgImages.length]);

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
      case 'admin': return <Admin onNav={setCurrentPage} />;
      default: return <Home onNav={setCurrentPage} />;
    }
  };

  return (
    <div className={`relative min-h-screen ${config.fontFamily ? `font-app-${config.fontFamily}` : 'font-sans'} bg-[#0a0a0a] overflow-x-hidden transition-all duration-700`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen flex flex-col"
      >
        {/* Animated Food Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBg}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.15, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={currentBg} 
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
          {currentPage !== 'admin' && (
            <Navbar 
              currentPage={currentPage} 
              onNav={setCurrentPage} 
              onLoginClick={() => setIsLoginOpen(true)} 
            />
          )}
          
          <main className={`flex-1 ${currentPage === 'admin' ? 'w-full h-screen' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: currentPage === 'admin' ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: currentPage === 'admin' ? 0 : -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={currentPage === 'admin' ? 'h-full' : ''}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>

          {currentPage !== 'admin' && (
            <footer className="py-20 px-4 md:px-20 bg-black/80 backdrop-blur-3xl border-t border-white/5 relative z-10 no-print mt-auto">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex flex-col items-center md:items-start gap-4">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter font-serif">
                    Zenith Grill
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">
                      © {new Date().getFullYear()} Templo de la Brasa | All Rights Reserved
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <button onClick={() => setCurrentPage('home')} className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">Inicio</button>
                  <button onClick={() => setCurrentPage('menu')} className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">Menú</button>
                  <button onClick={() => setCurrentPage('reviews')} className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">Reseñas</button>
                  <button onClick={() => setCurrentPage('location')} className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">Ubicación</button>
                </div>

                <div className="flex items-center gap-4">
                   {/* Hidden Admin Access Trigger - Clickable subtle text */}
                   <button 
                     onClick={() => isAdmin ? setCurrentPage('admin') : setIsLoginOpen(true)}
                     className="text-[8px] text-white/10 uppercase tracking-[0.5em] font-black italic hover:text-white/20 transition-all cursor-default"
                   >
                     Handcrafted with Fire
                   </button>
                </div>
              </div>
            </footer>
          )}
        </div>

        {currentPage !== 'admin' && <WhatsAppButton />}
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </motion.div>
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
