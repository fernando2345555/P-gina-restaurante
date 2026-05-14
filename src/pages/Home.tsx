import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Flame, ChevronRight, Star } from 'lucide-react';

interface HomeProps {
  onNav: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNav }) => {
  const { config, reviews } = useApp();

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center px-4 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImage} 
            alt="Grill background"
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 text-[#ff4e00] bg-[#ff4e00]/10 w-fit px-5 py-2 rounded-full border border-[#ff4e00]/20 mb-10 font-mono text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
              <Flame size={16} className="animate-pulse" /> La Excelencia en la Brasa
            </div>
            <h1 className="text-7xl md:text-[11rem] font-black font-serif leading-[0.75] tracking-tighter mb-10 uppercase italic">
              {config.name} <br />
              <span className="accent-text opacity-90">Grill Pro</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 mb-12 leading-relaxed font-light font-sans max-w-2xl border-l border-[#ff4e00]/30 pl-8">
              {config.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => onNav('menu')}
                className="group relative px-12 py-6 bg-[#ff4e00] text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden shadow-[0_20px_50px_rgba(255,78,0,0.4)] hover:shadow-[0_25px_60px_rgba(255,78,0,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-500"
              >
                <span className="relative z-10">Explorar la Carta</span>
                <ChevronRight size={22} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
              <button
                onClick={() => onNav('location')}
                className="px-12 py-6 glass hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center transition-all border border-white/10 hover:border-white/30 backdrop-blur-2xl"
              >
                Visítanos
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating background text */}
        <div className="absolute right-[-5%] bottom-[10%] select-none pointer-events-none opacity-[0.02]">
           <h2 className="text-[30vw] font-black italic uppercase leading-none font-serif">Parrilla</h2>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 md:px-20 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,78,0,0.05)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
          {[
            { val: '15+', lab: 'Años de Experiencia' },
            { val: '40+', lab: 'Cortes Seleccionados' },
            { val: '10k+', lab: 'Clientes Felices' },
            { val: '24h', lab: 'Maduración Dry-Aged' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h4 className="text-5xl font-black italic accent-text mb-2 font-serif">{stat.val}</h4>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">{stat.lab}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section (Chef's Choice) */}
      <section className="py-32 px-4 md:px-20 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#ff4e00] font-black mb-4 block">Selección de Autor</span>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase font-serif tracking-tighter">Nuestros Secretos <br /> <span className="accent-text">Mejor Guardados</span></h2>
            </div>
            <p className="text-white/40 max-w-sm text-sm italic font-light leading-relaxed">
              Cada bocado es el resultado de un proceso artesanal donde el fuego y el tiempo son los únicos protagonistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Cortes Premium', desc: 'Seleccionamos los mejores ejemplares de campo para asegurar ternura y sabor superior.', icon: Flame },
              { title: 'Cocción Lenta', desc: 'Nuestra madera de quebracho aporta un aroma ahumado profundo y único.', icon: Flame },
              { title: 'Vinos de Autor', desc: 'Una cava privada con las etiquetas más exclusivas de la región.', icon: Flame },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="p-12 glass-dark rounded-[40px] group hover:border-[#ff4d00]/30 transition-all duration-700 flex flex-col items-center text-center border border-white/5"
              >
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-[#ff4e00] group-hover:text-black transition-all duration-500 shadow-xl">
                  <feature.icon size={30} />
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 font-light text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Star size={16} className="text-[#ff4e00] fill-[#ff4e00]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-40 px-4 md:px-20 bg-[#0a0a0a] relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-8xl font-black italic uppercase font-serif mb-8 tracking-tighter leading-none">¿Listo para la <br /><span className="accent-text">Experiencia Zenith?</span></h2>
          <p className="text-xl text-white/40 mb-12 font-light italic">
            Asegura tu mesa ahora y déjate envolver por la maestría del fuego. <br />
            No es solo una cena, es un ritual.
          </p>
          <a
            href={`https://wa.me/${config.whatsappNumber}?text=Hola!%20Me%20gustaría%20reservar%20una%20mesa.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all duration-500 shadow-2xl"
          >
            Reservar Vía WhatsApp <Flame size={20} />
          </a>
        </motion.div>
      </section>

      {/* Public Reviews Section */}
      <section className="pb-40 px-4 md:px-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#ff4e00] font-black mb-4 block">Experiencias Reales</span>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase font-serif tracking-tighter">La Comunidad <br /><span className="accent-text">Zenith Grill</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.filter(r => r.approved).slice(0, 3).map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 glass-panel rounded-[40px] border border-white/5 flex flex-col relative overflow-hidden group"
              >
                <div className="flex text-primary mb-6">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} size={10} fill={starIdx < review.rating ? "currentColor" : "none"} className={starIdx < review.rating ? "" : "opacity-10"} />
                  ))}
                </div>
                <p className="text-lg italic font-light text-white/70 mb-8 leading-relaxed flex-1">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                     {review.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest italic">{review.name}</p>
                     <p className="text-[8px] text-white/20 font-bold uppercase">{review.date}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={() => onNav('reviews')}
              className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 hover:text-primary transition-colors flex items-center gap-2 mx-auto group"
            >
              Ver Todas las Reseñas <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
