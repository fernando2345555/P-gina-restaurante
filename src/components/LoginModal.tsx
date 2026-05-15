import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Lock, X, Globe } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, signInWithGoogle, signInWithEmail, resetPassword } = useApp();
  const [userInput, setUserInput] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isResetMode) {
        await resetPassword(userInput);
        setResetSent(true);
        setTimeout(() => {
          setIsResetMode(false);
          setResetSent(false);
        }, 3000);
      } else {
        // Try Firebase Login first if it looks like an email
        if (userInput.includes('@')) {
          try {
            await signInWithEmail(userInput, pass);
            onClose();
          } catch (firebaseErr: any) {
            // If firebase fails, check if it's the legacy login
            if (!login(userInput, pass)) {
              throw new Error('Credenciales incorrectas. Verifique su usuario y contraseña.');
            }
            onClose();
          }
        } else {
          // Legacy/Simple login
          if (login(userInput, pass)) {
            onClose();
          } else {
            throw new Error('Credenciales incorrectas. Verifique su usuario y contraseña.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError('Error al iniciar sesión con Google. Intente nuevamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-white">
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
            className="relative w-full max-w-md p-8 glass-dark rounded-2xl overflow-hidden border border-white/5"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent" />
            
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff4d00]/20 text-[#ff4d00] mb-4">
                {isResetMode ? <Lock size={32} /> : <LogIn size={32} />}
              </div>
              <h2 className="text-2xl font-bold font-sans">
                {isResetMode ? 'Restablecer Clave' : 'Acceso Administrativo'}
              </h2>
              <p className="text-white/60 text-sm">
                {isResetMode ? 'Le enviaremos un correo para cambiar su clave' : 'Zenith Grill & Management Pro'}
              </p>
            </div>

            {resetSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/30 p-6 rounded-xl text-center"
              >
                <div className="text-green-400 font-bold mb-2 text-lg">¡Correo Enviado!</div>
                <p className="text-white/70 text-sm">Revise su bandeja de entrada para completar el proceso.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">
                    {isResetMode || userInput.includes('@') ? 'Correo Electrónico' : 'Usuario'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={isResetMode || userInput.includes('@') ? 'email' : 'text'}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-[#ff4d00]/50 transition-colors"
                      placeholder={isResetMode ? 'su@correo.com' : 'Ingrese su usuario'}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {!isResetMode && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-medium text-white/70">Contraseña</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setError(null);
                        }}
                        className="text-xs text-[#ff4d00] hover:underline"
                      >
                        ¿Olvidó su clave?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:border-[#ff4d00]/50 transition-colors"
                        placeholder="••••"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
                  >
                    <p className="text-red-400 text-xs text-center font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#ff4d00] hover:bg-[#ff6a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                    {isResetMode ? 'Enviar Instrucciones' : 'Entrar al Sistema'}
                  </button>

                  {isResetMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setError(null);
                      }}
                      className="w-full text-white/40 text-sm hover:text-white transition-colors"
                    >
                      Volver al inicio de sesión
                    </button>
                  )}
                </div>

                {!isResetMode && (
                  <>
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-950 px-2 text-white/40">O continuar con</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      {isGoogleLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-[#ff4d00]/30 border-t-[#ff4d00] rounded-full" />
                      ) : (
                        <Globe size={18} className="text-[#ff4d00]" />
                      )}
                      Google Workspace
                    </button>
                  </>
                )}
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
