import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { config } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    const url = `https://wa.me/${config.whatsappNumber}?text=Hola! Quisiera realizar un pedido o reservar una mesa.`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-2 p-4 glass-dark rounded-2xl shadow-2xl max-w-[200px]"
          >
            <p className="text-sm font-medium">¿En qué podemos ayudarte?</p>
            <p className="text-xs text-white/60 mt-1">Escríbenos directamente por WhatsApp.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
      >
        <MessageCircle size={28} />
      </motion.button>
    </div>
  );
};

import { AnimatePresence } from 'motion/react';
