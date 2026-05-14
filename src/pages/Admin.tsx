import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingBag, Utensils, MessageSquare, Settings, Check, Printer, Trash2, Edit3, X, Plus, Star, Clock, Calendar } from 'lucide-react';
import { Category, MenuItem, OperatingHour } from '../types';
import { CATEGORIES } from '../constants';

export const Admin: React.FC = () => {
  const { config, setConfig, menu, setMenu, orders, setOrders, reviews, setReviews, messages, setMessages, updatePassword, newOrdersCount, resetNewOrdersCount } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'config' | 'reviews' | 'messages'>('orders');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const pendingReviewsCount = reviews.filter(r => !r.approved).length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  // Trigger notification when new orders arrive
  React.useEffect(() => {
    if (newOrdersCount > 0 && activeTab !== 'orders') {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [newOrdersCount, activeTab]);

  // Reset count when viewing orders
  React.useEffect(() => {
    if (activeTab === 'orders' && newOrdersCount > 0) {
      resetNewOrdersCount();
    }
  }, [activeTab, newOrdersCount, resetNewOrdersCount]);

  // CMS/Config handlers
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHero, setIsDraggingHero] = useState(false);

  const handleFileUpload = (file: File, target: 'gallery' | 'hero' | 'logo' | 'location' | 'secondaryLocation' = 'gallery') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'hero') {
        setConfig({ ...config, heroImage: result });
      } else if (target === 'logo') {
        setConfig({ ...config, logoImage: result });
      } else if (target === 'location') {
        setConfig({ ...config, locationImage: result });
      } else if (target === 'secondaryLocation') {
        setConfig({ ...config, secondaryLocationImage: result });
      } else {
        setConfig({ ...config, galleryImages: [...config.galleryImages, result] });
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent, target: 'gallery' | 'hero' | 'logo' | 'location' | 'secondaryLocation' = 'gallery') => {
    e.preventDefault();
    setIsDragging(false);
    setIsDraggingHero(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (target === 'hero' || target === 'logo' || target === 'location' || target === 'secondaryLocation') {
        handleFileUpload(e.dataTransfer.files[0], target);
      } else {
        Array.from(e.dataTransfer.files).forEach((f: File) => handleFileUpload(f, 'gallery'));
      }
    }
  };

  const handleHourChange = (index: number, field: keyof OperatingHour, value: any) => {
    const newHours = [...config.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setConfig({ ...config, operatingHours: newHours });
  };

  const removeGalleryImage = (index: number) => {
    const newImages = config.galleryImages.filter((_, i) => i !== index);
    setConfig({ ...config, galleryImages: newImages });
  };

  const handlePasswordChange = () => {
    if (newPass.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    updatePassword(newPass);
    alert('Contraseña actualizada con éxito');
    setNewPass('');
  };

  // Menu CRUD
  const saveMenuItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: MenuItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as Category,
      image: formData.get('image') as string,
    };

    if (editingItem) {
      setMenu(menu.map(m => m.id === editingItem.id ? newItem : m));
    } else {
      setMenu([...menu, newItem]);
    }
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const deleteMenuItem = (id: string) => {
    if (confirm('¿Seguro que desea eliminar este plato?')) {
      setMenu(menu.filter(m => m.id !== id));
    }
  };

  // Order management
  const markOrderDelivered = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'delivered' } : o));
  };

  // Message management
  const deleteMessage = (id: string) => {
    if (confirm('¿Seguro que desea eliminar este mensaje?')) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const toggleMessageRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  const printTicket = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const ticketHtml = `
      <html>
        <head>
          <title>Ticket #${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 20px; }
            .header { text-align: center; border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { border-top: 1px solid black; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>${config.name}</h3>
            <p>${config.address}</p>
            <p>Ticket #${order.id}</p>
            <p>${order.date}</p>
          </div>
          <div>
            ${order.items.map((item: any) => `
              <div class="item">
                <span>${item.quantity}x ${item.name} ${item.cookingTerm ? `(${item.cookingTerm})` : ''}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <div class="item">
              <span>TOTAL</span>
              <span>$${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Atendido por: ${order.customerName}</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.print();
  };

  // Review moderation
  const toggleReviewApproval = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };  return (
    <div className="pt-28 pb-20 px-4 md:px-8 min-h-screen">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              Gestión <span className="accent-text">Zenith</span>
            </h2>
            <p className="text-white/40 text-xs font-mono mt-1 tracking-widest uppercase">{config.adminEmail} • v2.4.0</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'orders', label: 'Monitor', icon: ShoppingBag },
              { id: 'menu', label: 'Carta', icon: Utensils },
              { id: 'reviews', label: 'Feedback', icon: MessageSquare },
              { id: 'messages', label: 'Buzón', icon: LayoutDashboard },
              { id: 'config', label: 'Sístema', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all relative ${
                  activeTab === tab.id ? 'bg-[#ff4e00] text-black shadow-[0_0_15px_rgba(255,78,0,0.3)]' : 'glass text-white/50 border-white/5'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
                {tab.id === 'orders' && newOrdersCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full border border-black font-black"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      {newOrdersCount}
                    </motion.span>
                  </motion.span>
                )}
                {tab.id === 'reviews' && pendingReviewsCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[8px] flex items-center justify-center rounded-full border border-black font-black"
                  >
                    {pendingReviewsCount}
                  </motion.span>
                )}
                {tab.id === 'messages' && unreadMessagesCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[8px] flex items-center justify-center rounded-full border border-black font-black"
                  >
                    {unreadMessagesCount}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Insights */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#ff4e00] font-bold mb-6 italic">Ventas del Día</h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-light font-serif">${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
                <p className="text-[10px] text-green-400 uppercase tracking-tighter font-bold mt-1">● Activo y Sincronizado</p>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest">Pedidos Hoy</p>
                  <p className="text-2xl font-bold font-mono">{orders.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="w-16 h-8 bg-white/5 rounded flex items-center justify-center border border-white/5">
                  <div className="flex gap-1">
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-[#ff4e00] rounded-full" />
                    <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-[#ff4e00] rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-[#ff4e00] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#ff4e00] font-bold mb-6 italic">Configuración CRM</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] uppercase text-white/30 font-bold">WhatsApp Pro</p>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2 border-white/5">
                  <span className="text-green-500 text-[10px]">●</span>
                  <p className="text-xs font-mono">{config.whatsappNumber}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase text-white/30 font-bold">Estado Parrilla</p>
                <div className="glass-panel p-3 rounded-lg border-white/5 text-xs font-bold text-orange-glow">
                  Brasa Viva (Abierto)
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('config')}
                className="w-full py-3 bg-[#ff4e00] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#ff6a2a] transition-all"
              >
                Actualizar Sistema
              </button>
            </div>
          </div>
        </div>

        {/* Center/Main Column: Dynamic Content */}
        <div className="lg:col-span-9 glass-panel rounded-3xl min-h-[600px] overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 p-12 pointer-events-none">
            <span className="text-[160px] font-black text-white/[0.015] italic leading-none select-none uppercase font-serif tracking-tighter">Grill</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Context Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic uppercase leading-none">
                  {activeTab === 'orders' && 'Terminal de Pedidos'}
                  {activeTab === 'menu' && 'Gestor de Carta'}
                  {activeTab === 'reviews' && 'Reseñas Clientes'}
                  {activeTab === 'messages' && 'Bandeja de Entrada'}
                  {activeTab === 'config' && 'Sístema Core'}
                </h3>
                <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">Administrador: {config.name}</p>
              </div>
              {activeTab === 'menu' && (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="p-3 glass-panel rounded-full fire-glow text-[#ff4e00] hover:scale-105 transition-all"
                >
                  <Plus size={24} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto w-full">
              {/* Reuse existing tab logic with updated styling */}
              {activeTab === 'orders' && (
                <div className="p-8 space-y-4">
                  {orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.slice().reverse().map((order) => (
                        <div key={order.id} className="glass-panel p-6 rounded-2xl border-l-4 border-[#ff4e00] group flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-mono font-bold text-white/50">#{order.id}</p>
                              <h4 className="text-lg font-black uppercase italic">{order.customerName}</h4>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-[#ff4e00]/20 text-[#ff4e00]'
                            }`}>
                              {order.status === 'delivered' ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2 mb-6">
                            {order.items.map((item, i) => (
                              <div key={i} className="text-xs flex justify-between tracking-tight">
                                <span className="text-white/60">{item.quantity}x {item.name} {item.cookingTerm && `(${item.cookingTerm})`}</span>
                                <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="font-bold text-orange-glow">${order.total.toFixed(2)}</span>
                            <div className="flex gap-2">
                              {order.status !== 'delivered' && (
                                <button onClick={() => markOrderDelivered(order.id)} className="p-2 glass rounded-lg text-green-500 hover:bg-green-500 hover:text-black transition-all"><Check size={14} /></button>
                              )}
                              <button onClick={() => printTicket(order)} className="p-2 glass rounded-lg text-[#ff4e00] hover:bg-[#ff4e00] hover:text-black transition-all"><Printer size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-20 italic">Sin terminales activas</div>
                  )}
                </div>
              )}

              {activeTab === 'menu' && (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menu.map((item) => (
                    <div key={item.id} className="glass-panel p-4 rounded-xl border-l-4 border-[#ff4e00] flex gap-4 group">
                      <img src={item.image} className="w-20 h-20 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-[#ff4e00]/20 text-[#ff4e00] px-2 py-0.5 rounded uppercase font-bold tracking-tighter">{item.category}</span>
                          <span className="text-xs font-black text-white/50">${item.price.toFixed(2)}</span>
                        </div>
                        <h4 className="font-bold italic mt-1 truncate">{item.name}</h4>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setEditingItem(item)} className="text-[10px] uppercase font-bold text-white/30 hover:text-[#ff4e00]">Editar</button>
                          <button onClick={() => deleteMenuItem(item.id)} className="text-[10px] uppercase font-bold text-white/30 hover:text-red-500">Borrar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="p-8 space-y-4">
                  {reviews.length > 0 ? (
                    reviews.slice().reverse().map((review) => (
                      <div key={review.id} className={`glass-panel p-6 rounded-2xl flex gap-6 items-start border-l-4 ${review.approved ? 'border-green-500/30' : 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${review.approved ? 'bg-white/5 text-white/40' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-3">
                                <h5 className="font-black italic uppercase text-base">{review.name}</h5>
                                {!review.approved && (
                                  <span className="text-[7px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Pendiente de Moderación</span>
                                )}
                              </div>
                              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mt-1">{review.date}</p>
                            </div>
                            <div className="flex gap-0.5 text-primary">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "opacity-10"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-white/60 italic leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            "{review.comment}"
                          </p>
                          <div className="flex gap-6 mt-6">
                            <button 
                              onClick={() => toggleReviewApproval(review.id)} 
                              className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest transition-all ${
                                review.approved ? 'text-white/20 hover:text-yellow-500' : 'text-green-500 hover:scale-105'
                              }`}
                            >
                              <Check size={14} />
                              {review.approved ? 'Ocultar Reseña' : 'Aprobar y Publicar'}
                            </button>
                            <button 
                              onClick={() => deleteReview(review.id)} 
                              className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/10 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                              Eliminar Permanente
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 text-center opacity-20 italic font-light tracking-[0.2em] uppercase">No hay testimonios recibidos todavía</div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="p-8 space-y-4">
                  {messages.length > 0 ? (
                    messages.slice().reverse().map((msg) => (
                      <div key={msg.id} className={`glass-panel p-6 rounded-2xl flex gap-6 items-start border-l-4 ${msg.read ? 'border-white/5 opacity-60' : 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${msg.read ? 'bg-white/5 text-white/20' : 'bg-blue-500/20 text-blue-500'}`}>
                          {msg.read ? <Check size={20} /> : <MessageSquare size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-black italic uppercase text-base">{msg.name}</h5>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{msg.email} • {msg.date}</p>
                            </div>
                            {!msg.read && (
                              <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Nuevo</span>
                            )}
                          </div>
                          <div className="mb-4">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/5 px-3 py-1 rounded-lg w-fit mt-2">
                              Asunto: {msg.subject || 'Sin Asunto'}
                            </p>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <div className="flex gap-6 mt-6">
                            <button 
                              onClick={() => toggleMessageRead(msg.id)} 
                              className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest transition-all ${
                                msg.read ? 'text-white/20 hover:text-blue-500' : 'text-blue-500'
                              }`}
                            >
                              <Check size={14} />
                              {msg.read ? 'Marcar como no leído' : 'Marcar como leído'}
                            </button>
                            <button 
                              onClick={() => deleteMessage(msg.id)} 
                              className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/10 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                              Eliminar Conversación
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 text-center opacity-20 italic font-light tracking-[0.2em] uppercase">No hay mensajes directos todavía</div>
                  )}
                </div>
              )}

              {activeTab === 'config' && (
                <div className="p-12 max-w-4xl space-y-12">
                  <div className="space-y-12">
                    <section className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Edit3 size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Identidad & Tipografía</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Título de Branding</p>
                          <input 
                            name="siteName" 
                            value={config.siteName} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xl font-black italic focus:outline-none focus:border-primary transition-all" 
                            placeholder="ZENITH GRILL | EL TEMPLO"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Selección de Letra (Fuente)</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(['sans', 'serif', 'mono', 'display'] as const).map((font) => (
                              <button
                                key={font}
                                type="button"
                                onClick={() => setConfig({ ...config, fontFamily: font })}
                                className={`px-4 py-3 rounded-xl border text-[10px] uppercase font-bold tracking-widest transition-all ${
                                  config.fontFamily === font 
                                    ? 'border-primary bg-primary/10 text-white' 
                                    : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                                }`}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Color Principal (Branding)</p>
                          <div className="flex gap-4 items-center glass-panel p-3 rounded-2xl border-white/5">
                            <input 
                              name="primaryColor" 
                              type="color"
                              value={config.primaryColor} 
                              onChange={handleConfigChange} 
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden" 
                            />
                            <input 
                              name="primaryColor" 
                              type="text"
                              value={config.primaryColor} 
                              onChange={handleConfigChange} 
                              className="bg-transparent text-[10px] font-black uppercase focus:outline-none w-full" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Color de Fondo de Tarjetas</p>
                          <div className="flex gap-4 items-center glass-panel p-3 rounded-2xl border-white/5">
                            <input 
                              name="cardColor" 
                              type="color"
                              value={config.cardColor.startsWith('#') ? config.cardColor : '#1a1a1a'} 
                              onChange={handleConfigChange} 
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden" 
                            />
                            <input 
                              name="cardColor" 
                              type="text"
                              value={config.cardColor} 
                              onChange={handleConfigChange} 
                              className="bg-transparent text-[10px] font-black uppercase focus:outline-none w-full" 
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="h-px bg-white/5" />

                    <section className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <ShoppingBag size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Multimedia & Fondos</h4>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Identidad Visual (Logo)</p>
                        <div 
                          className="w-full max-w-sm h-[80px] border-2 border-dashed border-white/10 rounded-[24px] flex items-center px-6 gap-6 hover:border-primary/50 transition-all cursor-pointer bg-white/[0.02]"
                          onClick={() => document.getElementById('logo-upload-multimedia')?.click()}
                        >
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
                            {config.logoImage ? <img src={config.logoImage} className="w-full h-full object-cover" alt="Logo" /> : <Plus size={20} className="text-white/20" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase font-black text-white/60 mb-0.5">Subir Logo Oficial</p>
                            <p className="text-[8px] uppercase text-white/20 font-bold tracking-widest">Aparecerá en el Menú y Cabecera</p>
                          </div>
                          <input 
                            id="logo-upload-multimedia" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'logo');
                            }} 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Fondo de Inicio (Hero)</p>
                        <div className="relative group overflow-hidden rounded-[32px] border-2 border-dashed border-white/10 aspect-video max-w-2xl">
                          <img 
                            src={config.heroImage} 
                            alt="Background Preview" 
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <button 
                              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full shadow-2xl hover:scale-105 transition-transform"
                              onClick={() => document.getElementById('hero-upload')?.click()}
                            >
                              Seleccionar Foto de Fondo
                            </button>
                            <input 
                              id="hero-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'hero');
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Galería Rotativa de Comida</p>
                          <button 
                            onClick={() => document.getElementById('gallery-upload')?.click()}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                          >
                            + AÑADIR FOTOS
                          </button>
                          <input 
                            id="gallery-upload"
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => e.target.files && Array.from(e.target.files).forEach((f: File) => handleFileUpload(f, 'gallery'))}
                          />
                        </div>

                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => onDrop(e, 'gallery')}
                          className={`w-full h-32 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all ${
                            isDragging ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.02]'
                          }`}
                        >
                          <Plus className={`mb-1 ${isDragging ? 'text-primary' : 'text-white/10'}`} />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Arrastra fotos aquí para subir</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                          {Array.isArray(config.galleryImages) && config.galleryImages.map((img, i) => (
                            <div key={i} className="relative aspect-square group overflow-hidden rounded-2xl">
                              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gallery" />
                              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-2 gap-1 justify-center">
                                <button onClick={() => setConfig({ ...config, heroImage: img })} className="w-full py-1.5 bg-white text-black text-[7px] font-black uppercase rounded-lg">Fondo</button>
                                <button onClick={() => removeGalleryImage(i)} className="w-full py-1.5 bg-red-600 text-white text-[7px] font-black uppercase rounded-lg">Borrar</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <div className="h-px bg-white/5" />

                    <section className="space-y-8">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Settings size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Información de Negocio</h4>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold">Nombre del Propietario / Local</p>
                        <input name="name" value={config.name} onChange={handleConfigChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-all focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold">WhatsApp de Ventas</p>
                        <input name="whatsappNumber" value={config.whatsappNumber} onChange={handleConfigChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-all focus:outline-none" />
                      </div>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">Dirección Física</p>
                          <input name="address" value={config.address} onChange={handleConfigChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-all focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">Tipo de Ubicación Visual</p>
                          <div className="flex gap-2">
                            {(['map', 'image'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setConfig({ ...config, locationType: type })}
                                className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${config.locationType === type ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-white/30'}`}
                              >
                                {type === 'map' ? 'Google Maps' : 'Imagen/Foto'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">URL Google Maps (Embed/Share)</p>
                          <input name="locationMapUrl" value={config.locationMapUrl} onChange={handleConfigChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-primary transition-all focus:outline-none disabled:opacity-30" placeholder="https://maps.google..." disabled={config.locationType !== 'map'} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">Imagen de Ubicación (Croquis/Foto)</p>
                          <div 
                            className={`w-full h-[50px] border-2 border-dashed rounded-xl flex items-center justify-center px-4 gap-4 transition-all overflow-hidden ${config.locationType !== 'image' ? 'opacity-30 pointer-events-none' : 'hover:border-primary/50 cursor-pointer'}`}
                            onClick={() => config.locationType === 'image' && document.getElementById('location-upload')?.click()}
                          >
                             {config.locationImage ? <img src={config.locationImage} className="h-full w-full object-cover" /> : <><Plus size={14} className="text-white/20" /><span className="text-[9px] font-black uppercase text-white/20">Subir Ubicación 1</span></>}
                             <input 
                               id="location-upload" 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) handleFileUpload(file, 'location');
                               }} 
                             />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">Imagen Secundaria (Fachada/Interior)</p>
                          <div 
                            className="w-full h-[50px] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center px-4 gap-4 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('secondary-location-upload')?.click()}
                          >
                             {config.secondaryLocationImage ? <img src={config.secondaryLocationImage} className="h-full w-full object-cover" /> : <><Plus size={14} className="text-white/20" /><span className="text-[9px] font-black uppercase text-white/20">Subir Fachada</span></>}
                             <input 
                               id="secondary-location-upload" 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) handleFileUpload(file, 'secondaryLocation');
                               }} 
                             />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-white/30 font-bold">Color de Acento (Ubicación)</p>
                          <div className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <input 
                              name="accentColor" 
                              type="color"
                              value={config.accentColor} 
                              onChange={handleConfigChange} 
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" 
                            />
                            <input 
                              name="accentColor" 
                              type="text"
                              value={config.accentColor} 
                              onChange={handleConfigChange} 
                              className="bg-transparent text-[10px] font-black uppercase focus:outline-none w-full" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1 text-right flex flex-col justify-center">
                          <p className="text-[8px] uppercase text-white/20 font-bold">Personalización Localizada</p>
                          <p className="text-[7px] uppercase text-white/10">Este color afectará a los íconos de la página de ubicación.</p>
                        </div>
                      </div>
                    </section>

                    <div className="h-px bg-white/5" />

                    <section className="space-y-8">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Clock size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Horarios de Atención</h4>
                      </div>

                      <div className="glass-panel rounded-3xl overflow-x-auto border-white/5">
                        <div className="min-w-[600px]">
                          <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40">Día</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40">Apertura</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40">Cierre</th>
                              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {config.operatingHours.map((hour, idx) => (
                              <tr key={hour.day} className={hour.isClosed ? 'opacity-40' : ''}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Calendar size={14} className="text-primary" />
                                    <span className="text-xs font-black uppercase italic tracking-tight">{hour.day}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <input 
                                    type="time" 
                                    value={hour.open} 
                                    disabled={hour.isClosed}
                                    onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50 disabled:opacity-20"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input 
                                    type="time" 
                                    value={hour.close} 
                                    disabled={hour.isClosed}
                                    onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50 disabled:opacity-20"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleHourChange(idx, 'isClosed', !hour.isClosed)}
                                      className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                        hour.isClosed 
                                          ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                                          : 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30'
                                      }`}
                                    >
                                      {hour.isClosed ? 'Cerrado' : 'Abierto'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                      <p className="text-[9px] uppercase text-white/20 font-bold tracking-widest text-center italic">* Los cambios se guardan automáticamente en la configuración global.</p>
                    </section>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-8">
                    <h4 className="text-sm font-black uppercase italic tracking-tighter accent-text">Seguridad & Cuentas Co-Admin</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest">Email Administrativo Principal</p>
                        <input
                          name="adminEmail"
                          value={config.adminEmail}
                          onChange={handleConfigChange}
                          className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest">Color Secundario de Interfaz</p>
                        <div className="flex gap-4 items-center glass-panel p-3 rounded-2xl border-white/5">
                          <input 
                            name="secondaryColor" 
                            type="color"
                            value={config.secondaryColor} 
                            onChange={handleConfigChange} 
                            className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden" 
                          />
                          <input 
                            name="secondaryColor" 
                            type="text"
                            value={config.secondaryColor} 
                            onChange={handleConfigChange} 
                            className="bg-transparent text-[10px] font-black uppercase focus:outline-none w-full" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest">Email Co-Administrador (Invitado)</p>
                        <div className="flex gap-2">
                          <input
                            name="secondaryAdminEmail"
                            value={config.secondaryAdminEmail}
                            onChange={handleConfigChange}
                            placeholder="email@ejemplo.com"
                            className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                          />
                          <button 
                            onClick={() => setConfig({ ...config, secondaryAdminActive: !config.secondaryAdminActive })}
                            className={`px-4 rounded-xl text-[8px] font-black uppercase transition-all ${config.secondaryAdminActive ? 'bg-green-500 text-white' : 'bg-white/5 text-white/30'}`}
                          >
                            {config.secondaryAdminActive ? 'ACTIVO' : 'DAR PERMISO'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest">Nueva Contraseña de Acceso (Ambos)</p>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="****"
                            className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                          />
                          <button
                            type="button"
                            onClick={handlePasswordChange}
                            className="px-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary transition-all"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[8px] text-white/20 leading-relaxed italic uppercase tracking-widest">
                      Solo el email {config.adminEmail} y el usuario "Fernando" tienen permiso de entrada vía Soporte Técnico.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[300] glass-panel px-6 py-4 rounded-2xl border-primary/40 flex items-center gap-4 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onClick={() => {
              setActiveTab('orders');
              setShowNotification(false);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-primary">Nuevo Pedido Recibido</p>
              <p className="text-xs text-white/60">Se han recibido {newOrdersCount} pedido{newOrdersCount > 1 ? 's' : ''} nuevo{newOrdersCount > 1 ? 's' : ''}.</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowNotification(false); }} className="ml-4 text-white/20 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(editingItem || isAddingItem) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setEditingItem(null); setIsAddingItem(false); }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg glass-panel p-10 rounded-[32px] border-[#ff4e00]/20">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic uppercase">{editingItem ? 'Modificar' : 'Nuevo'} <span className="accent-text">Bocado</span></h3>
                <button onClick={() => { setEditingItem(null); setIsAddingItem(false); }} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
              </div>
              <form onSubmit={saveMenuItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30 mb-1 block">Nombre del Plato</label>
                    <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30 mb-1 block">Precio Unitario ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30 mb-1 block">Categoría</label>
                    <select name="category" defaultValue={editingItem?.category || 'Cortes'} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-bold text-[#ff4e00] appearance-none">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30 mb-1 block">Foto del Plato</label>
                  <div className="relative h-32 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            const input = document.getElementById('menu-item-image-input') as HTMLInputElement;
                            if (input) input.value = re.target?.result as string;
                            // Trigger a re-render or preview
                            const preview = document.getElementById('menu-item-preview') as HTMLImageElement;
                            if (preview) preview.src = re.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <img 
                      id="menu-item-preview"
                      src={editingItem?.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'} 
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
                      alt="Preview"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Plus className="text-white/20 mb-1" />
                      <p className="text-[8px] uppercase font-black text-white/40 tracking-widest">Subir Imagen</p>
                    </div>
                    <input type="hidden" name="image" id="menu-item-image-input" defaultValue={editingItem?.image} required />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30 mb-1 block">Nota de Cata / Descripción</label>
                  <textarea name="description" defaultValue={editingItem?.description} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 resize-none font-mono text-xs" rows={2} />
                </div>
                <button type="submit" className="w-full py-4 bg-[#ff4e00] text-black font-black rounded-2xl shadow-[0_0_30px_rgba(255,78,0,0.4)] hover:bg-[#ff6a00] transition-all uppercase tracking-[0.2em] text-xs">
                  Sincronizar Plato
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
