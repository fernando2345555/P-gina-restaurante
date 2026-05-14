/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RestaurantConfig, MenuItem, Review, Order } from '../types';
import { INITIAL_CONFIG, INITIAL_MENU } from '../constants';

interface AppContextType {
  config: RestaurantConfig;
  setConfig: (config: RestaurantConfig) => void;
  menu: MenuItem[];
  setMenu: (menu: MenuItem[]) => void;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  newOrdersCount: number;
  resetNewOrdersCount: () => void;
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updatePassword: (pass: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<RestaurantConfig>(() => {
    const saved = localStorage.getItem('restaurant_config');
    if (!saved) return INITIAL_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      // Merge with INITIAL_CONFIG to ensure new properties like galleryImages exist
      return { ...INITIAL_CONFIG, ...parsed };
    } catch (e) {
      return INITIAL_CONFIG;
    }
  });

  const [menu, setMenuState] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restaurant_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [reviews, setReviewsState] = useState<Review[]>(() => {
    const saved = localStorage.getItem('restaurant_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restaurant_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const resetNewOrdersCount = () => setNewOrdersCount(0);

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('zenith_auth_token') === 'true';
  });

  const [adminPass, setAdminPass] = useState(() => {
    return localStorage.getItem('zenith_admin_pass') || '3126';
  });

  useEffect(() => {
    localStorage.setItem('restaurant_config', JSON.stringify(config));
    // Apply primary color to CSS variable
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    // Update site title
    document.title = config.siteName;
  }, [config]);

  useEffect(() => {
    localStorage.setItem('zenith_admin_pass', adminPass);
  }, [adminPass]);

  useEffect(() => {
    localStorage.setItem('restaurant_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('restaurant_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    // When orders change, check if it was an addition
    const savedOrdersStr = localStorage.getItem('restaurant_orders');
    const savedOrders: Order[] = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
    
    // If the new orders array is longer, we assume new orders came in (not just updates)
    if (orders.length > savedOrders.length) {
      setNewOrdersCount(prev => prev + (orders.length - savedOrders.length));
    }

    localStorage.setItem('restaurant_orders', JSON.stringify(orders));
  }, [orders]);

  const setConfig = (newConfig: RestaurantConfig) => setConfigState(newConfig);
  const setMenu = (newMenu: MenuItem[]) => setMenuState(newMenu);
  const setReviews = (newReviews: Review[]) => setReviewsState(newReviews);
  const setOrders = (newOrders: Order[]) => setOrdersState(newOrders);

  const login = (user: string, pass: string) => {
    const normalizedUser = user.trim().toLowerCase();
    const normalizedAdmin = 'fernando';
    const dynamicAdminEmail = config.adminEmail.toLowerCase();
    const secondaryAdminEmail = config.secondaryAdminEmail?.toLowerCase() || '';
    const userEmail = 'farmamorta6666@gmail.com'; 
    
    const isPrimary = normalizedUser === normalizedAdmin || normalizedUser === dynamicAdminEmail || normalizedUser === userEmail;
    const isSecondary = config.secondaryAdminActive && secondaryAdminEmail && normalizedUser === secondaryAdminEmail;

    if ((isPrimary || isSecondary) && pass.trim() === adminPass) {
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
    setAdminPass(newPass);
  };

  return (
    <AppContext.Provider value={{
      config, setConfig,
      menu, setMenu,
      reviews, setReviews,
      orders, setOrders,
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
