import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Location: React.FC = () => {
  const { config } = useApp();

  return (
    <div className="pt-28 pb-20 px-4 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 relative">
          <div className="absolute -top-10 -left-10 text-[120px] font-black text-white/[0.015] italic leading-none select-none uppercase font-serif tracking-tighter pointer-events-none">Map</div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter relative z-10 leading-none font-serif">
            {config.locationPageTitle} <span className="accent-text">Sede</span>
          </h2>
          <p className="text-white/40 text-sm mt-4 font-mono tracking-[0.2em] uppercase max-w-xl">{config.locationPageDescription}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-12"
          >
            <div className="space-y-8">
              <div className="flex items-start gap-8 group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center accent-text border border-white/5 group-hover:bg-primary/10 transition-all group-hover:scale-105">
                  <MapPin size={32} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Punto de Encuentro</h4>
                  <p className="text-3xl font-light italic font-serif text-white/80">{config.address}</p>
                  <button className="text-primary text-xs font-bold mt-4 flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest">
                    Obtener Direcciones <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-8 group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center accent-text border border-white/5 group-hover:bg-primary/10 transition-all group-hover:scale-105">
                  <Phone size={32} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Línea Directa</h4>
                  <p className="text-3xl font-light italic font-serif text-white/80">+{config.whatsappNumber}</p>
                  <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Atención Prioritaria</p>
                </div>
              </div>

              <div className="flex items-start gap-8 group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center accent-text border border-white/5 group-hover:bg-primary/10 transition-all group-hover:scale-105">
                  <Clock size={32} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Ciclo de Brasa</h4>
                  <div className="space-y-2">
                    {config.operatingHours.map((hour) => (
                      <div key={hour.day} className="flex justify-between items-center max-w-[250px] group/item">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40 group-hover/item:text-primary transition-colors">{hour.day}</span>
                        <span className={`text-[11px] font-mono ${hour.isClosed ? 'text-red-500/50 italic' : 'text-white/70'}`}>
                          {hour.isClosed ? 'Cerrado' : `${hour.open} — ${hour.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 glass-panel rounded-[40px] border-primary/10 max-w-lg">
               <p className="text-sm italic text-white/40 leading-relaxed font-light">"{config.locationQuote}"</p>
               <p className="text-[10px] font-black accent-text uppercase tracking-[0.2em] mt-6">— {config.locationAuthor}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-5 h-[700px] glass-panel rounded-[60px] overflow-hidden relative group shadow-2xl border-white/10"
          >
            {/* Location View */}
            <div className="absolute inset-0 bg-[#0a0a0a]">
              {config.locationType === 'map' ? (
                <iframe
                  title="Restaurante Ubicación"
                  src={config.locationMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.6) contrast(1.2)' }}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full p-4">
                  {config.locationImage ? (
                    <img src={config.locationImage} alt="Location" className="w-full h-full object-cover rounded-[40px] opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-[40px]">
                       <p className="text-white/20 uppercase font-black text-xs">Sin Mapa/Imagen configurada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
            
            {config.locationType === 'map' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div 
                  animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl border-8 border-white/20"
                  style={{ backgroundColor: config.accentColor, boxShadow: `0 0 50px ${config.accentColor}b3` }}
                >
                  <MapPin size={40} strokeWidth={2.5} />
                </motion.div>
              </div>
            )}
            
            <div className="absolute bottom-12 left-12 right-12 p-8 glass backdrop-blur-3xl rounded-[32px] border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-10 group-hover:translate-y-0">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="font-black italic uppercase text-xs tracking-widest mb-1">{config.address}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Punto de Referencia Seleccionado</p>
                </div>
                {config.secondaryLocationImage && (
                  <div className="w-24 h-16 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                    <img src={config.secondaryLocationImage} alt="Secondary" className="w-full h-full object-cover" />
                  </div>
                )}
                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors accent-text">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Form Section */}
        <section className="mt-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[60px] overflow-hidden group"
            >
              <img 
                src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop" 
                alt="Zenith Hospitality"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 glass backdrop-blur-3xl rounded-[32px] border-white/5">
                <p className="text-2xl font-serif italic text-white/90 leading-tight">"Atención dedicada, fuego artesanal y el mejor ambiente."</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary">Soporte al Cliente 24/7</span>
                </div>
              </div>
            </motion.div>

            <div>
              <header className="mb-12">
                <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black mb-4 block">Contacto Corporativo</span>
                <h2 className="text-5xl font-black font-serif italic uppercase tracking-tighter leading-none mb-6">Envíanos un <span className="accent-text">Mensaje</span></h2>
                <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">¿Tienes alguna duda, propuesta o comentario? Nuestro equipo de gestión se pondrá en contacto contigo a la brevedad.</p>
              </header>

              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ContactForm: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const newMessage = {
      ...formData,
      date: new Date().toLocaleString(),
      read: false
    };

    try {
      await addDoc(collection(db, 'messages'), newMessage);
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-4">Nombre Completo</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
            placeholder="Ej. Juan Pérez"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-4">Correo Electrónico</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
            placeholder="juan@ejemplo.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-4">Asunto</label>
        <input 
          type="text" 
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-4">Mensaje</label>
        <textarea 
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-10 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10 resize-none"
          placeholder="Escribe aquí los detalles de tu consulta..."
        />
      </div>

      <button 
        type="submit"
        className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
          isSent ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-primary text-black shadow-[0_0_30px_rgba(255,78,0,0.3)] hover:shadow-[0_0_50px_rgba(255,78,0,0.5)] active:scale-95'
        }`}
      >
        {isSent ? '¡Mensaje Enviado!' : 'Enviar Mensaje Directo'}
      </button>
    </form>
  );
};
