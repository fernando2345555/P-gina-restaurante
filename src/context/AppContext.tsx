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
  getDoc,
  where
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { googleProvider, signInWithPopup } from '../lib/firebase';
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
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync admin state with localStorage AND auth
  useEffect(() => {
    const storedAuth = localStorage.getItem('zenith_auth_token') === 'true';
    if (storedAuth && !user) {
      // Potentially admin, but wait for auth to fetch admin data
    }
  }, [user]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase();
        const isAdminEmail = email === 'farmamorta6666@gmail.com' || email === config.adminEmail.toLowerCase();
        if (isAdminEmail) {
          setIsAdmin(true);
          localStorage.setItem('zenith_auth_token', 'true');
        }
      } else {
        // If not authenticated in Firebase, we are effectively not an admin for DB purposes
        setIsAdmin(false);
        localStorage.removeItem('zenith_auth_token');
      }
    });
    return () => unsubscribe();
  }, [config.adminEmail]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const resetNewOrdersCount = () => setNewOrdersCount(0);

  // Seed Config if admin (in firebase) and not exists
  useEffect(() => {
    if (!isAdmin || !isLoaded || !user) return;
    
    const checkAndSeed = async () => {
      const configRef = doc(db, 'settings', 'config');
      try {
        const snap = await getDoc(configRef);
        if (!snap.exists()) {
          await setDoc(configRef, INITIAL_CONFIG);
        }
      } catch (err) {
        // Silently fail seeding if permission denied - rules are working
        console.log("Seeding skipped: Permissions");
      }
    };
    checkAndSeed();
  }, [isAdmin, isLoaded, user]);

  // Sync Config
  useEffect(() => {
    const configRef = doc(db, 'settings', 'config');
    const unsubscribe = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfigState(snapshot.data() as RestaurantConfig);
      }
      setIsLoaded(true);
    }, (err) => {
       // Allow public to load with default config
       setIsLoaded(true);
       if (isAdmin && user) handleFirestoreError(err, OperationType.GET, 'settings/config');
    });
    return () => unsubscribe();
  }, [isAdmin, user]);

  // Sync Menu
  useEffect(() => {
    const menuRef = collection(db, 'menu');
    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      
      // Seed menu only if admin in firebase and empty
      if (menuItems.length === 0 && isAdmin && isLoaded && user) {
        INITIAL_MENU.forEach(item => {
          addDoc(menuRef, item).catch(err => {
            // Only report if we are actually an admin in the UI but getting rejected
            if (isAdmin && user) handleFirestoreError(err, OperationType.CREATE, 'menu');
          });
        });
      }
      
      setMenuState(menuItems);
    }, (err) => {
      if (isAdmin && user) handleFirestoreError(err, OperationType.LIST, 'menu');
    });
    return () => unsubscribe();
  }, [isLoaded, isAdmin, user]);

  // Sync Reviews
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    // Public only sees approved reviews. Admin sees all.
    // CRITICAL: We only use the admin query IF we have a verified user session.
    const q = (isAdmin && user)
      ? query(reviewsRef, orderBy('date', 'desc'))
      : query(reviewsRef, where('approved', '==', true), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviewsState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    }, (err) => {
      if (isAdmin && user) handleFirestoreError(err, OperationType.LIST, 'reviews');
    });
    return () => unsubscribe();
  }, [isAdmin, user]);

  // Sync Orders
  useEffect(() => {
    if (!isAdmin || !user) {
      setOrdersState([]);
      return;
    }
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(query(ordersRef, orderBy('date', 'desc')), (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Notify new orders for admin
      if (orders.length > 0 && newOrders.length > orders.length) {
        setNewOrdersCount(prev => prev + (newOrders.length - orders.length));
      }
      
      setOrdersState(newOrders);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    return () => unsubscribe();
  }, [isAdmin, user, orders.length]);

  // Sync Messages
  useEffect(() => {
    if (!isAdmin || !user) {
      setMessagesState([]);
      return;
    }
    const messagesRef = collection(db, 'messages');
    const unsubscribe = onSnapshot(query(messagesRef, orderBy('date', 'desc')), (snapshot) => {
      setMessagesState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));
    return () => unsubscribe();
  }, [isAdmin, user]);

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
    auth.signOut();
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
      isAdmin, user, signInWithGoogle, signInWithEmail, resetPassword, login, logout,
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

