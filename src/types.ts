/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  needsCookingTerm?: boolean;
}

export interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number; // 1-5
  date: string;
  approved: boolean;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  cookingTerm?: CookingTerm;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'delivered';
  date: string;
}

export interface RestaurantConfig {
  name: string;
  description: string;
  cuisineType: string;
  whatsappNumber: string;
  address: string;
  heroImage: string;
  primaryColor: string;
  adminEmail: string;
  siteName: string;
  galleryImages: string[];
  fontFamily: 'sans' | 'serif' | 'mono' | 'display';
  secondaryAdminEmail: string;
  secondaryAdminActive: boolean;
  locationMapUrl: string;
  logoImage: string;
  locationImage: string;
  locationType: 'map' | 'image';
  secondaryLocationImage: string;
  secondaryColor: string;
  accentColor: string;
  cardColor: string;
}

export type Category = 'Cortes' | 'Entradas' | 'Bebidas' | 'Postres';
export type CookingTerm = 'Azul' | 'Término Medio' | 'Tres Cuartos' | 'Bien Cocido';
