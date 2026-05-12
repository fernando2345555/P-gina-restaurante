import { RestaurantConfig, MenuItem, Review, Order } from './types';

export const INITIAL_CONFIG: RestaurantConfig = {
  name: "Zenith Grill",
  description: "La mejor experiencia en parrilla con cortes premium y sabor inigualable.",
  cuisineType: "Parrilla Argentina & BBQ",
  whatsappNumber: "5491112345678",
  address: "Av. de los Leones 456, Buenos Aires",
  heroImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format&fit=crop",
  primaryColor: "#ff4e00",
  adminEmail: "fernando31226477@gmail.com",
  siteName: "Zenith Grill | Templo de la Brasa",
  galleryImages: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529692236671-f1f6e946a8b8?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=1600&auto=format&fit=crop",
  ],
  fontFamily: 'sans',
  secondaryAdminEmail: "",
  secondaryAdminActive: false,
  locationMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0167132768406!2d-58.3815704!3d-34.6037389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa9f0a6da5edb%3A0x11bead4ee234f558!2sObelisco!5e0!3m2!1ses-419!2sar!4v1620000000000!5m2!1ses-419!2sar",
  logoImage: "",
  locationImage: "",
  locationType: 'map',
  secondaryLocationImage: "",
  secondaryColor: "#ffffff",
  accentColor: "#ff4e00",
  cardColor: "rgba(255,255,255,0.03)",
};

export const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Ojo de Bife veteado',
    description: '400g de puro sabor, con el marmoleado perfecto.',
    price: 25.50,
    category: 'Cortes',
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800&auto=format&fit=crop',
    needsCookingTerm: true
  },
  {
    id: '2',
    name: 'Provoleta al Hierro',
    description: 'Queso provolone fundido con especias y aceite de oliva.',
    price: 12.00,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Malbec Reserva',
    description: 'Vino tinto intenso, ideal para acompañar carnes rojas.',
    price: 35.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Panqueque con Dulce de Leche',
    description: 'El clásico postre argentino flambeado al ron.',
    price: 8.50,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&auto=format&fit=crop'
  }
];

export const COOKING_TERMS = ['Azul', 'Término Medio', 'Tres Cuartos', 'Bien Cocido'];
export const CATEGORIES: string[] = ['Cortes', 'Entradas', 'Bebidas', 'Postres'];
