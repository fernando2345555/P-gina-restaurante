import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, X, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginBar: React.FC = () => {
  const { isAdmin, login } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'both' | 'email'>('both');

  if (isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      setIsOpen(false);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-[100] pointer-events-none no-print">
      <div className="flex justify-center">
        <AnimatePresence>
          {!isOpen ? (
            <motion.button
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              onClick={() => setIsOpen(true)}
              className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-b-2xl px-6 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:border-primary/30 transition-all shadow-2xl"
            >
              <LogIn size={12} /> Acceso Administrativo <ChevronDown size={12} />
            </motion.button>
          ) : (
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="pointer-events-auto w-full max-w-2xl bg-black/95 backdrop-blur-2xl border-x border-b border-white/10 p-4 rounded-b-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-black">
                    <User size={14} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Panel de Control</h3>
                </div>
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => setMode(mode === 'both' ? 'email' : 'both')}
                    className="text-[8px] font-bold uppercase tracking-widest text-white/20 hover:text-primary transition-colors"
                  >
                    {mode === 'both' ? 'Sólo Correo' : 'Correo y Pass'}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-all"
                  required
                />
                {mode === 'both' && (
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-all"
                    required
                  />
                )}
                <button
                  type="submit"
                  className="bg-primary text-black font-black uppercase tracking-widest text-[10px] px-8 py-2.5 rounded-xl hover:bg-white transition-all shadow-lg active:scale-95"
                >
                  Entrar
                </button>
              </form>
              <p className="mt-3 text-center text-[7px] text-white/20 uppercase tracking-[0.3em] font-medium leading-relaxed">
                Este panel es para uso exclusivo del administrador del sistema.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
