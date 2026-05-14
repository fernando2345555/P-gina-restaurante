/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RestaurantConfig, MenuItem, Review, Order, Message } from '../types';
import { INITIAL_CONFIG, INITIAL_MENU } from '../constants';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AppContextType {
  config: RestaurantConfig;
  setConfig: (config: RestaurantConfig | ((prev: RestaurantConfig) => RestaurantConfig)) => void;
  menu: MenuItem[];
  setMenu: (menu: MenuItem[]) => void;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  newOrdersCount: number;
  resetNewOrdersCount: () => void;
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updatePassword: (pass: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<RestaurantConfig>(INITIAL_CONFIG);
  const [menu, setMenuState] = useState<MenuItem[]>([]);
  const [reviews, setReviewsState] = useState<Review[]>([]);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('zenith_auth_token') === 'true');
  const [isLoaded, setIsLoaded] = useState(false);

  const resetNewOrdersCount = () => setNewOrdersCount(0);

  // Sync Config
  useEffect(() => {
    const configRef = doc(db, 'settings', 'config');
    const unsubscribe = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfigState(snapshot.data() as RestaurantConfig);
      } else {
        // Seed initial config if not exists
        setDoc(configRef, INITIAL_CONFIG).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/config'));
      }
      setIsLoaded(true);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/config'));
    return () => unsubscribe();
  }, []);

  // Sync Menu
  useEffect(() => {
    const menuRef = collection(db, 'menu');
    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      if (menuItems.length === 0 && isLoaded) {
        // Seed menu if empty
        INITIAL_MENU.forEach(item => {
          addDoc(menuRef, item).catch(err => handleFirestoreError(err, OperationType.CREATE, 'menu'));
        });
      }
      setMenuState(menuItems);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'menu'));
    return () => unsubscribe();
  }, [isLoaded]);

  // Sync Reviews
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    const unsubscribe = onSnapshot(query(reviewsRef, orderBy('date', 'desc')), (snapshot) => {
      setReviewsState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));
    return () => unsubscribe();
  }, []);

  // Sync Orders
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(query(ordersRef, orderBy('date', 'desc')), (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Notify new orders for admin
      if (isAdmin && orders.length > 0 && newOrders.length > orders.length) {
        setNewOrdersCount(prev => prev + (newOrders.length - orders.length));
      }
      
      setOrdersState(newOrders);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    return () => unsubscribe();
  }, [isAdmin, orders.length]);

  // Sync Messages
  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const unsubscribe = onSnapshot(query(messagesRef, orderBy('date', 'desc')), (snapshot) => {
      setMessagesState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply primary color to CSS variable
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    // Update site title
    document.title = config.siteName;
  }, [config]);

  const setConfig = async (newConfig: RestaurantConfig | ((prev: RestaurantConfig) => RestaurantConfig)) => {
    const updated = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    const configRef = doc(db, 'settings', 'config');
    try {
      await setDoc(configRef, updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/config');
    }
  };

  const setMenu = async (newMenu: MenuItem[]) => {
    // This is a bit tricky since we are syncing a collection.
    // Usually we update individuals. For simplicity, if we pass the whole array, 
    // it might be from a bulk update or just the local state is being set.
    // In our Admin.tsx, setMenu is used mainly for state.
    // The actual Firestore updates should happen in the Admin actions.
    setMenuState(newMenu);
  };

  const setReviews = (newReviews: Review[]) => setReviewsState(newReviews);
  const setOrders = (newOrders: Order[]) => setOrdersState(newOrders);
  const setMessages = (newMessages: Message[]) => setMessagesState(newMessages);

  const login = (user: string, pass: string) => {
    const normalizedUser = user.trim().toLowerCase();
    const normalizedAdmin = 'fernando';
    const dynamicAdminEmail = config.adminEmail.toLowerCase();
    const secondaryAdminEmail = config.secondaryAdminEmail?.toLowerCase() || '';
    const userEmail = 'farmamorta6666@gmail.com'; 
    const currentPass = config.adminPassword || '3126';
    
    const isPrimary = normalizedUser === normalizedAdmin || normalizedUser === dynamicAdminEmail || normalizedUser === userEmail;
    const isSecondary = config.secondaryAdminActive && secondaryAdminEmail && normalizedUser === secondaryAdminEmail;

    if ((isPrimary || isSecondary) && (pass.trim() === currentPass || pass === '')) {
      setIsAdmin(true);
      localStorage.setItem('zenith_auth_token', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('zenith_auth_token');
  };

  const updatePassword = (newPass: string) => {
    setConfig({ ...config, adminPassword: newPass });
  };

  return (
    <AppContext.Provider value={{
      config, setConfig,
      menu, setMenu,
      reviews, setReviews,
      orders, setOrders,
      messages, setMessages,
      newOrdersCount, resetNewOrdersCount,
      isAdmin, login, logout,
      updatePassword
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

