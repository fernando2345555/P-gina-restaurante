import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Flame, ChevronRight, Star } from 'lucide-react';

interface HomeProps {
  onNav: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNav }) => {
  const { config } = useApp();

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center px-4 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImage} 
            alt="Grill background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-[#ff4e00] bg-[#ff4e00]/10 w-fit px-4 py-1.5 rounded-full border border-[#ff4e00]/20 mb-8 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Flame size={14} /> La Verdadera Parrilla
            </div>
            <h1 className="text-6xl md:text-9xl font-black font-serif leading-[0.85] tracking-tighter mb-8 uppercase italic">
              {config.name} <br />
              <span className="accent-text">Master Class</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 mb-12 leading-relaxed font-light font-sans max-w-xl">
              {config.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => onNav('menu')}
                className="group relative px-10 py-5 bg-[#ff4e00] text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_30px_rgba(255,78,0,0.5)] active:scale-95 transition-all"
              >
                <span className="relative z-10">Explorar Menú</span>
                <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNav('location')}
                className="px-10 py-5 glass hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center transition-all border border-white/10"
              >
                Ubicación
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-10%] top-[20%] w-[500px] h-[500px] bg-orange-fire/20 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4 md:px-20 bg-[#0a0a0a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Cortes Premium', desc: 'Seleccionamos los mejores ejemplares de campo para asegurar ternura y sabor.', icon: Flame },
            { title: 'Cocción Lenta', desc: 'Nuestra madera de quebracho aporta un aroma ahumado único en cada bocado.', icon: Flame },
            { title: 'Vinos de Autor', desc: 'Una cava privada con las mejores etiquetas nacionales e internacionales.', icon: Flame },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-8 glass-dark rounded-3xl group hover:border-[#ff4d00]/30 transition-all"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:text-orange-glow transition-colors">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
