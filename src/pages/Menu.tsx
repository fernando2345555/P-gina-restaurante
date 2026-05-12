import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingCart, Info, Flame, ChevronRight } from 'lucide-react';
import { MenuItem, Category, CookingTerm, OrderItem } from '../types';
import { COOKING_TERMS, CATEGORIES } from '../constants';

export const Menu: React.FC = () => {
  const { menu, setOrders, orders } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category>('Cortes');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cookingTerm, setCookingTerm] = useState<CookingTerm>('Término Medio');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const filteredMenu = menu.filter((item) => item.category === activeCategory);

  const addToCart = (item: MenuItem, term?: CookingTerm) => {
    const orderItem: OrderItem = { ...item, quantity: 1, cookingTerm: term };
    setCart([...cart, orderItem]);
    setSelectedItem(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const placeOrder = () => {
    if (!customerName) {
      alert('Por favor ingrese su nombre para el pedido.');
      return;
    }
    const newOrder = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName,
      items: cart,
      total,
      status: 'pending' as const,
      date: new Date().toLocaleString(),
    };
    setOrders([...orders, newOrder]);
    setCart([]);
    setCustomerName('');
    setShowCart(false);
    alert('Pedido realizado con éxito! Nuestro personal lo atenderá pronto.');
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 relative">
          <div className="absolute -top-10 -left-10 text-[120px] font-black text-white/[0.015] italic leading-none select-none uppercase font-serif tracking-tighter pointer-events-none">Grill</div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter relative z-10 leading-none font-serif">
            Nuestra <span className="accent-text">Carta</span>
          </h2>
          <p className="text-white/40 text-sm mt-4 font-mono tracking-[0.2em] uppercase max-w-xl">Selección premium de cortes madurados y sellados a la brasa con sal marina.</p>
          
                <div className="flex gap-3 mt-12 overflow-x-auto pb-4 no-print scrollbar-hide">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === category 
                    ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--primary-color),0.4)]' 
                    : 'glass text-white/50 border-white/5 hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredMenu.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group glass-panel rounded-3xl overflow-hidden flex flex-col hover:border-primary/30 transition-all border border-white/5"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold border border-white/10 text-xs">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black italic uppercase mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-xs text-white/40 mb-6 flex-1 italic leading-relaxed">{item.description}</p>
                <button
                  onClick={() => item.needsCookingTerm ? setSelectedItem(item) : addToCart(item)}
                  className="w-full py-4 glass border border-primary/20 hover:bg-primary hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> {item.needsCookingTerm ? 'Seleccionar Término' : 'Agregar al Pedido'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cooking Term Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-dark p-8 rounded-3xl border border-[#ff4d00]/30"
            >
              <h3 className="text-2xl font-bold mb-2 uppercase italic">Punto de Cocción</h3>
              <p className="text-white/60 text-sm mb-6">Para el {selectedItem.name}</p>
              
              <div className="space-y-3 mb-8">
                {COOKING_TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setCookingTerm(term as CookingTerm)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                      cookingTerm === term 
                        ? 'bg-[#ff4d00]/20 border-[#ff4d00] text-white shadow-[0_0_15px_rgba(255,77,0,0.2)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="font-bold">{term}</span>
                    {cookingTerm === term && <Flame size={18} className="text-[#ff4d00]" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => addToCart(selectedItem, cookingTerm)}
                className="w-full py-4 bg-[#ff4d00] hover:bg-[#ff6a00] text-white font-bold rounded-2xl shadow-xl transition-all"
              >
                Confirmar y Agregar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB Cart Button */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-[#ff4d00] rounded-full flex items-center justify-center text-white shadow-2xl z-40 no-print"
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#ff4d00]">
            {cart.length}
          </span>
        </motion.button>
      )}

      {/* Cart Sidebar/Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[120] flex justify-end no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full glass-dark border-l border-white/10 p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black italic uppercase">Tu <span className="text-orange-glow">Pedido</span></h3>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-10">
                {cart.map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold">{item.name}</h4>
                      {item.cookingTerm && (
                        <p className="text-xs text-[#ff4d00] font-mono uppercase tracking-tighter">{item.cookingTerm}</p>
                      )}
                      <p className="text-sm text-white/50">${item.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors">
                      <Plus size={18} className="rotate-45" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4d00]/50"
                    placeholder="Ej: Fernando"
                  />
                </div>

                <div className="flex items-center justify-between text-2xl font-black italic uppercase">
                  <span>Total</span>
                  <span className="text-orange-glow">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={placeOrder}
                  className="w-full py-4 bg-[#ff4d00] hover:bg-[#ff6a00] text-white font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(255,77,0,0.4)] transition-all"
                >
                  Confirmar Pedido
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase tracking-tighter">Incluye impuestos y servicio de cubierto</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
