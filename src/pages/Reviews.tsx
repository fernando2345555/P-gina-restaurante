import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquareQuote, Plus, Send, X } from 'lucide-react';
import { Review } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Reviews: React.FC = () => {
  const { reviews, config } = useApp();
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newReview = {
      name,
      comment,
      rating,
      date: new Date().toLocaleDateString(),
      approved: false, 
    };

    try {
      await addDoc(collection(db, 'reviews'), newReview);
      setName('');
      setComment('');
      setRating(5);
      setShowForm(false);
      alert('Reseña enviada con éxito. Aparecerá una vez que el administrador la apruebe.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
    }
  };

  const publicReviews = reviews.filter(r => r.approved);

  return (
    <div className="pt-28 pb-20 px-4 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 relative">
          <div className="absolute -top-10 -left-10 text-[120px] font-black text-white/[0.015] italic leading-none select-none uppercase font-serif tracking-tighter pointer-events-none">Vibe</div>
          <div className="max-w-2xl text-center lg:text-left relative z-10">
            <h2 className="text-5xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter mb-6 font-serif">
              {config.reviewsPageTitle} <span className="accent-text">{config.reviewsPageSubTitle}</span>
            </h2>
            <p className="text-white/40 text-lg font-light italic max-w-lg mb-8">
              {config.reviewsPageDescription}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-10 py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--primary-color),0.5)] flex items-center gap-3 mx-auto lg:mx-0 group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Dejar Reseña
            </button>
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4 flex-shrink-0">
             <div className="w-40 h-40 glass shadow-2xl rounded-3xl" />
             <div className="w-40 h-40 glass shadow-2xl rounded-3xl mt-12" />
          </div>
        </header>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicReviews.length > 0 ? (
            publicReviews.slice().reverse().map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 glass-panel rounded-[40px] relative border border-white/5 group hover:border-primary/30 transition-all flex flex-col"
              >
                <div className="absolute top-8 right-10 text-white/[0.03]">
                  <MessageSquareQuote size={80} />
                </div>
                <div className="flex gap-1 mb-8 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < review.rating ? "var(--primary-color)" : "none"}
                      className={i < review.rating ? 'accent-text' : 'text-white/10'}
                    />
                  ))}
                </div>
                <p className="text-xl italic font-light mb-8 leading-relaxed text-white/80 group-hover:text-white transition-colors flex-1">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center font-black accent-text border border-white/10">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase text-xs tracking-widest">{review.name}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">{review.date}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-40 glass-panel rounded-[40px] border border-dashed border-white/10">
              <p className="text-white/20 italic uppercase tracking-[0.3em] text-sm">Sin testimonios registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-12 rounded-[48px] border-[#ff4e00]/20 shadow-[0_0_50px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Comparte tu <span className="accent-text">Veredicto</span></h3>
                <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] ml-1">Identidad</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#ff4e00]/40 font-bold transition-all"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] ml-1 block text-center">Nivel de Satisfacción</label>
                  <div className="flex justify-center gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`transition-all hover:scale-125 ${rating >= s ? 'text-[#ff4e00]' : 'text-white/10'}`}
                      >
                        <Star size={32} fill={rating >= s ? "currentColor" : "none"} strokeWidth={1} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] ml-1">Veredicto Final</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#ff4e00]/40 resize-none italic text-sm leading-relaxed transition-all"
                    placeholder="Cuéntanos sobre el punto de la carne y el ambiente..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#ff4e00] text-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,78,0,0.4)] hover:bg-[#ff6a00] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-xs"
                >
                  <Send size={18} /> Publicar en el Panel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
