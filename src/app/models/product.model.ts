export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  name: string;
  category: 
    | 'Blusas' 
    | 'Tops' 
    | 'Sudaderas' 
    | 'Suéteres' 
    | 'Cardigans' 
    | 'Shorts' 
    | 'Pantalones' 
    | 'Calcetines' 
    | 'Calzado' 
    | 'Accesorios';
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  stock: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  specs?: { [key: string]: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  taxes: number;
  total: number;
  shippingDetails: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
}