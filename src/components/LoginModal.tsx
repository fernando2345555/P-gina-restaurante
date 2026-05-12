import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Lock, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md p-8 glass-dark rounded-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent" />
            
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff4d00]/20 text-[#ff4d00] mb-4">
                <LogIn size={32} />
              </div>
              <h2 className="text-2xl font-bold font-sans">Acceso Administrativo</h2>
              <p className="text-white/60 text-sm">Zenith Grill & Management Pro</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-[#ff4d00]/50 transition-colors"
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-[#ff4d00]/50 transition-colors"
                    placeholder="••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center font-medium"
                >
                  Credenciales incorrectas. Intente de nuevo.
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full bg-[#ff4d00] hover:bg-[#ff6a00] text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] active:scale-[0.98]"
              >
                Entrar al Sistema
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
