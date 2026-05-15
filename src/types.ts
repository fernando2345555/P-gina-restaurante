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
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'delivered';
  date: string;
}

export interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
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
  adminPassword?: string;
  currentBackground?: string;
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
  operatingHours: OperatingHour[];
  // Home Page Content
  heroTagline: string;
  heroSubTitle: string;
  stats: { val: string; lab: string }[];
  featuredTitle: string;
  featuredSubTitle: string;
  featuredDescription: string;
  features: { title: string; desc: string }[];
  ctaTitle: string;
  ctaSubTitle: string;
  reviewsTitle: string;
  reviewsSubTitle: string;
  // Reviews Page
  reviewsPageTitle: string;
  reviewsPageSubTitle: string;
  reviewsPageDescription: string;
  // Location Page
  locationPageTitle: string;
  locationPageDescription: string;
  ctaDescription: string;
  locationQuote: string;
  locationAuthor: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export type Category = 'Cortes' | 'Entradas' | 'Bebidas' | 'Postres';
