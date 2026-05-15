import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingBag, Utensils, MessageSquare, Settings, Check, Printer, Trash2, Edit3, X, Plus, Star, Clock, Calendar } from 'lucide-react';
import { Category, MenuItem, OperatingHour, Review, Message, Order } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Admin: React.FC<{ onNav: (page: string) => void }> = ({ onNav }) => {
  const { config, setConfig, menu, setMenu, orders, setOrders, reviews, setReviews, messages, setMessages, updatePassword, newOrdersCount, resetNewOrdersCount, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'config' | 'reviews' | 'messages'>('orders');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'order' | 'success' } | null>(null);
  const pendingReviewsCount = reviews.filter(r => !r.approved).length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  // Trigger notification when new orders arrive
  React.useEffect(() => {
    if (newOrdersCount > 0 && activeTab !== 'orders') {
      setNotification({
        title: 'Nuevo Pedido Recibido',
        message: `Se han recibido ${newOrdersCount} pedido${newOrdersCount > 1 ? 's' : ''} nuevo${newOrdersCount > 1 ? 's' : ''}.`,
        type: 'order'
      });
      const timer = setTimeout(() => setNotification(null), 5000);
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
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHero, setIsDraggingHero] = useState(false);

  const handleFileUpload = (file: File, target: 'gallery' | 'hero' | 'logo' | 'location' | 'secondaryLocation' = 'gallery') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setConfig(prev => {
        if (target === 'hero') return { ...prev, heroImage: result };
        if (target === 'logo') return { ...prev, logoImage: result };
        if (target === 'location') return { ...prev, locationImage: result };
        if (target === 'secondaryLocation') return { ...prev, secondaryLocationImage: result };
        return { ...prev, galleryImages: [...prev.galleryImages, result] };
      });
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
    setConfig(prev => {
      const newHours = [...prev.operatingHours];
      newHours[index] = { ...newHours[index], [field]: value };
      return { ...prev, operatingHours: newHours };
    });
  };

  const removeGalleryImage = (index: number) => {
    setConfig(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
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
  const saveMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || Math.random().toString(36).substr(2, 9);
    const newItem = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as Category,
      image: formData.get('image') as string,
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'menu', id), newItem);
      } else {
        await setDoc(doc(db, 'menu', id), newItem);
      }
      setNotification({
        title: 'Carta Actualizada',
        message: `El bocado "${newItem.name}" ha sido sincronizado.`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu/${id}`);
    }
    
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const deleteMenuItem = async (id: string) => {
    if (confirm('¿Seguro que desea eliminar este plato?')) {
      try {
        await deleteDoc(doc(db, 'menu', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `menu/${id}`);
      }
    }
  };

  // Order management
  const markOrderDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: 'delivered' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  };

  // Message management
  const deleteMessage = async (id: string) => {
    if (confirm('¿Seguro que desea eliminar este mensaje?')) {
      try {
        await deleteDoc(doc(db, 'messages', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
      }
    }
  };

  const toggleMessageRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    try {
      await updateDoc(doc(db, 'messages', id), { read: !msg.read });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
    }
  };

  const toggleReviewApproval = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: !review.approved });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const deleteReview = async (id: string) => {
    if (confirm('¿Seguro que desea eliminar esta reseña?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      }
    }
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

  const handleLogout = () => {
    logout();
    onNav('home');
  };

  const navItems = [
    { id: 'orders', label: 'Monitor Pedidos', icon: ShoppingBag, count: newOrdersCount, color: 'text-primary' },
    { id: 'menu', label: 'Gestión Carta', icon: Utensils, count: 0, color: 'text-orange-400' },
    { id: 'reviews', label: 'Feedback', icon: Star, count: pendingReviewsCount, color: 'text-yellow-400' },
    { id: 'messages', label: 'Buzón Mensajes', icon: MessageSquare, count: unreadMessagesCount, color: 'text-blue-400' },
    { id: 'config', label: 'Configuración', icon: Settings, count: 0, color: 'text-white/40' },
  ];

  return (
    <>
      <div className="flex bg-[#050505] min-h-screen text-white font-sans overflow-hidden">
      {/* PROFESSIONAL DASHBOARD SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/5 flex flex-col z-50 shrink-0">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] italic">Dash<span className="text-primary">Zenith</span></h1>
          </div>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-none">Management v2.4.0</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full group flex items-center justify-between p-4 rounded-[20px] transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-primary text-black shadow-[0_10px_20px_rgba(255,78,0,0.15)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} className={activeTab === item.id ? 'text-black' : item.color} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-black text-white' : 'bg-primary/20 text-primary'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3">
          <button 
            onClick={() => onNav('home')}
            className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-primary transition-all flex items-center justify-center gap-2 border border-white/5 rounded-2xl hover:border-primary/30"
          >
            ← Volver al Sitio
          </button>
          <button 
            onClick={handleLogout}
            className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 shrink-0 z-40">
          <div>
            <h2 className="text-[9px] uppercase font-black tracking-[0.4em] text-white/20">Administrador</h2>
            <p className="text-xs font-bold uppercase italic tracking-[0.1em]">
              {activeTab === 'orders' && 'Monitor de Terminales Activas'}
              {activeTab === 'menu' && 'Catálogo de Productos y Precios'}
              {activeTab === 'reviews' && 'Gestión de Reputación y Moderación'}
              {activeTab === 'messages' && 'Bandeja de Entrada Directa'}
              {activeTab === 'config' && 'Configuración Core del Sistema'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-xl border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Sistema Online</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-primary leading-none mb-1">{config.adminEmail}</p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Fernando Manager</p>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-white/40">
                <Settings size={18} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#080808] relative custom-scrollbar">
          <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.02]">
            <span className="text-[180px] font-black italic select-none uppercase font-serif tracking-tighter">ZENITH</span>
          </div>
          
          <div className="relative z-10 p-10 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* DYNAMIC CONTENT LOADER */}
                {activeTab === 'orders' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                      <div>
                        <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Pedidos <span className="accent-text">Hoy</span></h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Clock size={12} /> Actualizado: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-2xl border-white/5 min-w-[140px]">
                           <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Ventas</p>
                           <p className="text-2xl font-black italic">${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl border-white/5 min-w-[140px]">
                           <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Pedidos</p>
                           <p className="text-2xl font-black italic">{orders.length.toString().padStart(2, '0')}</p>
                        </div>
                      </div>
                    </div>
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
              </div>
            )}

              {activeTab === 'menu' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Carta <span className="accent-text">Grill</span></h3>
                    <button
                      onClick={() => setIsAddingItem(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                      <Plus size={16} /> Añadir Plato
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menu.map((item) => (
                      <div key={item.id} className="glass-panel p-4 rounded-3xl border-white/5 flex flex-col gap-4 group hover:border-primary/20 transition-all">
                        <div className="relative h-40 rounded-2xl overflow-hidden">
                          <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                          <div className="absolute top-2 left-2">
                            <span className="text-[8px] bg-primary text-black px-2 py-0.5 rounded font-black uppercase">{item.category}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black italic uppercase text-sm truncate">{item.name}</h4>
                            <span className="text-sm font-mono font-bold text-primary">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-white/30 line-clamp-2 h-8 leading-relaxed italic">{item.description}</p>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button onClick={() => setEditingItem(item)} className="flex-1 py-2 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                             <Edit3 size={12} /> Editar
                          </button>
                          <button onClick={() => deleteMenuItem(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                             <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Feedback <span className="accent-text">Clientes</span></h3>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">{pendingReviewsCount} reseñas pendientes de aprobación</p>
                  </div>
                  <div className="space-y-4">
                    {reviews.slice().reverse().map((review) => (
                      <div key={review.id} className={`glass-panel p-6 rounded-3xl flex gap-6 items-start border-l-4 transition-all ${review.approved ? 'border-primary/20 opacity-60' : 'border-primary shadow-[0_0_30px_rgba(255,78,0,0.1)]'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${review.approved ? 'bg-white/5 text-white/20' : 'bg-primary/20 text-primary'}`}>
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <h5 className="font-black italic uppercase text-sm">{review.name}</h5>
                               <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mt-1">{review.date}</p>
                            </div>
                            <div className="flex gap-1 text-primary">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "opacity-10"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-white/60 italic leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">"{review.comment}"</p>
                          <div className="flex gap-6 mt-6">
                            <button onClick={() => toggleReviewApproval(review.id)} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${review.approved ? 'text-white/20' : 'text-primary'}`}>
                              <Check size={14} /> {review.approved ? 'Retirar' : 'Aprobar'}
                            </button>
                            <button onClick={() => deleteReview(review.id)} className="text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-red-500">
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Buzón <span className="accent-text">Directo</span></h3>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">{unreadMessagesCount} mensajes nuevos</p>
                  </div>
                  <div className="space-y-4">
                    {messages.slice().reverse().map((msg) => (
                      <div key={msg.id} className={`glass-panel p-6 rounded-3xl flex gap-6 items-start border-l-4 transition-all opacity-100 ${msg.read ? 'border-white/5 grayscale' : 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${msg.read ? 'bg-white/5 text-white/20' : 'bg-blue-500/20 text-blue-500'}`}>
                          <MessageSquare size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                               <h5 className="font-black italic uppercase text-sm">{msg.name}</h5>
                               <p className="text-[9px] text-white/40 font-bold tracking-widest uppercase">{msg.email}</p>
                             </div>
                             <span className="text-[9px] text-white/20 font-mono">{msg.date}</span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5 mt-4 whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex gap-6 mt-6">
                             <button onClick={() => toggleMessageRead(msg.id)} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${msg.read ? 'text-white/20' : 'text-blue-500'}`}>
                               <Check size={14} /> {msg.read ? 'Leído' : 'Marcar como leído'}
                             </button>
                             <button onClick={() => deleteMessage(msg.id)} className="text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-red-500">
                               <Trash2 size={14} /> Borrar
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="space-y-12">
                   {/* CMS Config content will be rendered here */}
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter">Sístema <span className="accent-text">Core</span></h3>
                   </div>
                   {/* Restoring the original config sections but with dashboard container padding/spacing */}
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
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Fondo Global (para todos)</p>
                          <div className="flex gap-2">
                             <select 
                               name="currentBackground"
                               value={config.currentBackground || ''}
                               onChange={handleConfigChange}
                               className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase focus:outline-none focus:border-primary transition-all text-[#ff4e00]"
                             >
                               <option value="" className="bg-zinc-900">Rotación Automática</option>
                               <option value={config.heroImage} className="bg-zinc-900">Hero Image (Default)</option>
                               {config.galleryImages.map((img, idx) => (
                                 <option key={idx} value={img} className="bg-zinc-900">Galería #{idx + 1}</option>
                               ))}
                             </select>
                             <button 
                               onClick={() => setConfig({ ...config, currentBackground: '' })}
                               className="px-4 bg-white/5 text-white/30 text-[8px] font-black uppercase rounded-2xl hover:text-white border border-white/5 transition-colors"
                             >
                               Reset
                             </button>
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
                          <LayoutDashboard size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Contenido de Inicio</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Tagline Hero</p>
                          <input 
                            name="heroTagline" 
                            value={config.heroTagline} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Subtítulo Hero</p>
                          <input 
                            name="heroSubTitle" 
                            value={config.heroSubTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Estadísticas (Stats)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {config.stats.map((stat, i) => (
                            <div key={i} className="flex gap-2">
                              <input 
                                value={stat.val} 
                                onChange={(e) => {
                                  const newStats = [...config.stats];
                                  newStats[i].val = e.target.value;
                                  setConfig({ ...config, stats: newStats });
                                }}
                                className="w-1/3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-primary" 
                              />
                              <input 
                                value={stat.lab} 
                                onChange={(e) => {
                                  const newStats = [...config.stats];
                                  newStats[i].lab = e.target.value;
                                  setConfig({ ...config, stats: newStats });
                                }}
                                className="w-2/3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Título Destacado</p>
                          <input 
                            name="featuredTitle" 
                            value={config.featuredTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Subtítulo Destacado</p>
                          <input 
                            name="featuredSubTitle" 
                            value={config.featuredSubTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Descripción Destacada</p>
                        <textarea 
                          name="featuredDescription" 
                          value={config.featuredDescription} 
                          onChange={handleConfigChange} 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                        />
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Características (Features Icons)</p>
                        <div className="space-y-4">
                          {config.features.map((feature, i) => (
                            <div key={i} className="glass-panel p-6 rounded-[32px] border-white/5 space-y-4">
                              <input 
                                value={feature.title} 
                                onChange={(e) => {
                                  const newFeatures = [...config.features];
                                  newFeatures[i].title = e.target.value;
                                  setConfig({ ...config, features: newFeatures });
                                }}
                                className="w-full bg-transparent text-sm font-black uppercase italic accent-text focus:outline-none" 
                              />
                              <textarea 
                                value={feature.desc} 
                                onChange={(e) => {
                                  const newFeatures = [...config.features];
                                  newFeatures[i].desc = e.target.value;
                                  setConfig({ ...config, features: newFeatures });
                                }}
                                className="w-full bg-transparent text-xs text-white/40 focus:outline-none resize-none h-16" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">CTA Título</p>
                          <input 
                            name="ctaTitle" 
                            value={config.ctaTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">CTA Subtítulo</p>
                          <input 
                            name="ctaSubTitle" 
                            value={config.ctaSubTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">CTA Descripción (Home)</p>
                        <textarea 
                          name="ctaDescription" 
                          value={config.ctaDescription} 
                          onChange={handleConfigChange} 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Reseñas Título</p>
                          <input 
                            name="reviewsTitle" 
                            value={config.reviewsTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Reseñas Subtítulo</p>
                          <input 
                            name="reviewsSubTitle" 
                            value={config.reviewsSubTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
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
                          <MessageSquare size={20} />
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter accent-text">Páginas de Reseñas & Ubicación</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Reseñas: Título Principal</p>
                          <input 
                            name="reviewsPageTitle" 
                            value={config.reviewsPageTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Reseñas: Subtítulo (Acento)</p>
                          <input 
                            name="reviewsPageSubTitle" 
                            value={config.reviewsPageSubTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Reseñas: Descripción de Cabecera</p>
                        <textarea 
                          name="reviewsPageDescription" 
                          value={config.reviewsPageDescription} 
                          onChange={handleConfigChange} 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                        />
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Ubicación: Título Principal</p>
                          <input 
                            name="locationPageTitle" 
                            value={config.locationPageTitle} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Cita del Autor (Ubicación)</p>
                          <input 
                            name="locationAuthor" 
                            value={config.locationAuthor} 
                            onChange={handleConfigChange} 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-bold focus:outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Ubicación: Descripción de Cabecera</p>
                        <textarea 
                          name="locationPageDescription" 
                          value={config.locationPageDescription} 
                          onChange={handleConfigChange} 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase text-white/30 font-bold tracking-widest pl-1">Ubicación: Cita Inspiracional</p>
                        <textarea 
                          name="locationQuote" 
                          value={config.locationQuote} 
                          onChange={handleConfigChange} 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                        />
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
                  </div>
                </div>
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  </div>

      {/* Dynamic Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[300] glass-panel px-6 py-4 rounded-2xl border-white/10 flex items-center gap-4 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
              notification.type === 'order' ? 'border-primary/40' : 'border-green-500/40'
            }`}
            onClick={() => {
              if (notification.type === 'order') setActiveTab('orders');
              setNotification(null);
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center animate-pulse ${
              notification.type === 'order' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'
            }`}>
              {notification.type === 'order' ? <ShoppingBag size={20} /> : <Check size={20} />}
            </div>
            <div>
              <p className={`text-[10px] uppercase font-black tracking-widest ${
                notification.type === 'order' ? 'text-primary' : 'text-green-500'
              }`}>{notification.title}</p>
              <p className="text-xs text-white/60">{notification.message}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} className="ml-4 text-white/20 hover:text-white transition-colors">
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
    </>
  );
};
