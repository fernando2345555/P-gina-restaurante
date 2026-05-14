import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingCart, Info, Flame, ChevronRight } from 'lucide-react';
import { MenuItem, Category, OrderItem } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Menu: React.FC = () => {
  const { menu, config } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category>('Cortes');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const filteredMenu = menu.filter((item) => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    const orderItem: OrderItem = { ...item, quantity: 1 };
    setCart([...cart, orderItem]);
    setSelectedItem(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleWhatsAppInquiry = (item: MenuItem) => {
    const message = `Hola! 👋 Me gustaría consultar sobre el plato: *${item.name}* que vi en su menú. \n💰 Precio: $${item.price.toFixed(2)} \n\n¿Cómo puedo realizar el pago?`;
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const placeOrder = async () => {
    if (!customerName) {
      alert('Por favor ingrese su nombre para el pedido.');
      return;
    }
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder = {
      customerName,
      items: cart,
      total,
      status: 'pending' as const,
      date: new Date().toLocaleString(),
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      
      // Generate WhatsApp Message
      const orderItemsText = cart.map(item => 
        `• ${item.name} - $${item.price}`
      ).join('\n');

      const whatsappMessage = 
`🔥 *NUEVO PEDIDO - ${config.name}* 🔥
---------------------------
👤 *Cliente:* ${customerName}
📅 *Fecha:* ${newOrder.date}
---------------------------
🛒 *DETALLES:*
${orderItemsText}
---------------------------
💰 *TOTAL:* $${total.toFixed(2)}
---------------------------
📍 _Por favor contactar para coordinar entrega/retiro._`;

      const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      setCart([]);
      setCustomerName('');
      setShowCart(false);
      
      alert('Pedido realizado con éxito! Te estamos redirigiendo a WhatsApp para finalizar tu pedido.');
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 py-4 glass border border-white/10 hover:border-primary/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Info size={14} /> Detalles
                  </button>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-4 bg-primary text-black rounded-xl hover:shadow-[0_0_20px_rgba(255,78,0,0.4)] transition-all active:scale-90"
                    title="Agregar rápido"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-dark rounded-[40px] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>

              <div className="h-64 relative">
                <img src={selectedItem.image} className="w-full h-full object-cover" alt={selectedItem.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary mb-2 block">Selección Pro</span>
                  <h3 className="text-4xl font-black italic uppercase leading-none">{selectedItem.name}</h3>
                </div>
              </div>

              <div className="p-10">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                  <div className="text-3xl font-black text-primary font-mono italic">
                    ${selectedItem.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Disponible
                  </div>
                </div>

                <p className="text-white/50 mb-10 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                  {selectedItem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => addToCart(selectedItem)}
                    className="py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
                  >
                    <ShoppingCart size={18} /> Agregar al Pedido
                  </button>
                  <button
                    onClick={() => handleWhatsAppInquiry(selectedItem)}
                    className="py-5 glass-panel border-primary/30 text-primary font-black uppercase tracking-widest rounded-2xl hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Flame size={18} /> Consultar o Pagar
                  </button>
                </div>
              </div>
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
