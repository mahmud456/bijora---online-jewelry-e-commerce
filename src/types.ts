export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  district?: string;
  area?: string;
  role: 'admin' | 'customer';
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  featured: boolean;
  newArrival: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  district: string;
  area: string;
  address: string;
  orderNote?: string;
  products: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  timestamp: any;
  userId?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: any;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  minPurchase?: number;
}

export interface WebSectionConfig {
  visible: boolean;
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  couponCode?: string;
  buttonText?: string;
}

export interface WebSettings {
  logoUrl: string;
  theme: string;
  sectionsOrder: string[];
  sections: {
    intro: WebSectionConfig;
    categories: WebSectionConfig;
    featured: WebSectionConfig;
    coupon: WebSectionConfig;
    arrivals: WebSectionConfig;
  };
}
