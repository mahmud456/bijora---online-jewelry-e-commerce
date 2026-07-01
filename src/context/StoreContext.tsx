import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Product, 
  Category, 
  Coupon, 
  Order, 
  OrderStatus, 
  Review, 
  UserProfile, 
  OrderItem,
  WebSettings
} from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_COUPONS } from '../lib/seeds';
import { Language, TRANSLATIONS, TranslationKey } from '../utils/translations';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  cart: { product: Product; quantity: number }[];
  activeCoupon: Coupon | null;
  cartNotification: { productName: string; quantity: number; image?: string } | null;
  setCartNotification: (val: { productName: string; quantity: number; image?: string } | null) => void;
  language: Language;
  user: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  
  // Translation Helper
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
  
  // Auth Functions
  registerUser: (fullName: string, email: string, phone: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  bypassToAdminSession: () => void;
  
  // Cart Functions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getCartSummary: () => { subtotal: number; shippingCharge: number; discount: number; total: number };
  
  // Order Placement
  placeOrder: (customerInfo: {
    fullName: string;
    mobileNumber: string;
    district: string;
    area: string;
    address: string;
    orderNote?: string;
  }) => Promise<Order>;
  getWhatsAppUrl: (order: Order) => string;
  getMessengerUrl: (order: Order) => string;
  
  // Review Functions
  fetchReviews: (productId: string) => Promise<Review[]>;
  submitProductReview: (productId: string, rating: number, comment: string) => Promise<void>;
  editProductReview: (reviewId: string, rating: number, comment: string) => Promise<void>;
  deleteProductReview: (reviewId: string) => Promise<void>;
  
  // Admin Functions
  adminAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  adminUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  adminDeleteProduct: (id: string) => Promise<void>;
  adminAddCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  adminUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  adminDeleteCategory: (id: string) => Promise<void>;
  adminUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  adminUpdateProductStock: (productId: string, newStock: number) => Promise<void>;
  adminUpdateUserRole: (userId: string, newRole: 'admin' | 'customer') => Promise<void>;
  adminAddCoupon: (coupon: Coupon) => Promise<void>;
  adminUpdateCoupon: (code: string, updates: Partial<Coupon>) => Promise<void>;
  adminDeleteCoupon: (code: string) => Promise<void>;
  webSettings: WebSettings;
  updateWebSettings: (settings: Partial<WebSettings>) => Promise<void>;
  allUsers: UserProfile[];
}


const DEFAULT_WEB_SETTINGS: WebSettings = {
  logoUrl: '',
  theme: 'luxury-gold',
  sectionsOrder: ['intro', 'categories', 'featured', 'coupon', 'arrivals'],
  sections: {
    intro: {
      visible: true,
      backgroundImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
      title: 'Elegance Crafted for Eternity',
      subtitle: 'Exquisite jewelry that tells your unique story with royal heritage craftsmanship.',
      buttonText: 'Browse Collection'
    },
    categories: {
      visible: true
    },
    featured: {
      visible: true
    },
    coupon: {
      visible: true,
      backgroundImage: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1600&q=80',
      title: 'Celebrate Eternity with Elegant Gold Discounts',
      description: 'Apply coupon code BIJORA10 during shopping checkout to enjoy an instantaneous 10% discount on all collection rings and bridal jewelry sets.',
      couponCode: 'BIJORA10',
      buttonText: 'Browse Masterpieces Now'
    },
    arrivals: {
      visible: true
    }
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database States (Initialized with Defaults for resilient fallback)
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [webSettings, setWebSettings] = useState<WebSettings>(DEFAULT_WEB_SETTINGS);
  
  // User & UI States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [cartNotification, setCartNotification] = useState<{ productName: string; quantity: number; image?: string } | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Load language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('bijora_language') as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLanguageState(savedLang);
    }
    
    const savedCart = localStorage.getItem('bijora_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart:', e);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bijora_language', lang);
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || String(key);
  };

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('bijora_cart', JSON.stringify(cart));
  }, [cart]);

  // Firebase Authentication State listener & User Profile Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const role: 'admin' | 'customer' = firebaseUser.email === 'bijoraforyou@gmail.com' || firebaseUser.email === 'maheealmahmud@gmail.com' || firebaseUser.email?.includes('admin') ? 'admin' : 'customer';
        
        let profile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Bijora Customer',
          email: firebaseUser.email || '',
          role: role,
          createdAt: new Date().toISOString()
        };

        // Sync and load user profile from Firestore users/{uid}
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            profile = { ...profile, ...userDoc.data() as UserProfile };
            if (profile.role !== role) {
              profile.role = role;
              await setDoc(doc(db, 'users', firebaseUser.uid), { role }, { merge: true });
            }
          } else {
            await setDoc(doc(db, 'users', firebaseUser.uid), profile);
          }
        } catch (e) {
          console.warn("Firestore user profile fetch failed, using auth info:", e);
        }
        
        setUser(profile);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync Data (Products, Categories, Coupons, Orders, Reviews, Users, WebSettings) with Firestore & Local Seed Fallbacks
  useEffect(() => {
    const syncDatabase = async () => {
      setLoading(true);

      // 1. WebSettings
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'web'));
        if (settingsDoc.exists()) {
          setWebSettings(settingsDoc.data() as WebSettings);
        } else {
          await setDoc(doc(db, 'settings', 'web'), DEFAULT_WEB_SETTINGS);
          setWebSettings(DEFAULT_WEB_SETTINGS);
        }
      } catch (err) {
        console.warn("Firestore settings fetch failed, using default:", err);
      }

      // 2. Products
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (snap.empty) {
          for (const p of DEFAULT_PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
          setProducts(DEFAULT_PRODUCTS);
        } else {
          const list: Product[] = [];
          snap.forEach(d => list.push(d.data() as Product));
          setProducts(list);
        }
      } catch (err) {
        console.warn("Firestore products fetch failed:", err);
      }

      // 3. Categories
      try {
        const snap = await getDocs(collection(db, 'categories'));
        if (snap.empty) {
          for (const c of DEFAULT_CATEGORIES) {
            await setDoc(doc(db, 'categories', c.id), c);
          }
          setCategories(DEFAULT_CATEGORIES);
        } else {
          const list: Category[] = [];
          snap.forEach(d => list.push(d.data() as Category));
          setCategories(list);
        }
      } catch (err) {
        console.warn("Firestore categories fetch failed:", err);
      }

      // 4. Coupons
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        if (snap.empty) {
          for (const c of DEFAULT_COUPONS) {
            await setDoc(doc(db, 'coupons', c.code), c);
          }
          setCoupons(DEFAULT_COUPONS);
        } else {
          const list: Coupon[] = [];
          snap.forEach(d => list.push(d.data() as Coupon));
          setCoupons(list);
        }
      } catch (err) {
        console.warn("Firestore coupons fetch failed:", err);
      }

      // 5. Reviews
      try {
        const snap = await getDocs(collection(db, 'reviews'));
        const list: Review[] = [];
        snap.forEach(d => list.push(d.data() as Review));
        setReviews(list);
      } catch (e) {
        console.warn("Firestore reviews fetch failed:", e);
      }

      // 6. Orders
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const list: Order[] = [];
        snap.forEach(d => list.push(d.data() as Order));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setOrders(list);
      } catch (e) {
        console.warn("Firestore orders fetch failed:", e);
      }

      // 7. Users
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snap.forEach(d => list.push(d.data() as UserProfile));
        setAllUsers(list);
      } catch (e) {
        console.warn("Firestore users fetch failed:", e);
      }
      
      setLoading(false);
    };
    
    syncDatabase();
  }, []);

  // =========================================================================
  // Auth Functions
  // =========================================================================
  const registerUser = async (fullName: string, email: string, phone: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(cred.user, { displayName: fullName });
      
      const role: 'admin' | 'customer' = email === 'bijoraforyou@gmail.com' || email === 'maheealmahmud@gmail.com' || email.includes('admin') ? 'admin' : 'customer';
      
      const profile: UserProfile = {
        uid: cred.user.uid,
        fullName,
        email,
        phoneNumber: phone,
        role,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', profile.uid), profile);
      } catch (fsErr) {
        console.error("Failed to write user to Firestore:", fsErr);
      }
      
      setAllUsers(prev => {
        if (!prev.some(u => u.uid === profile.uid)) {
          return [...prev, profile];
        }
        return prev;
      });
      setUser(profile);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('User already exists. Please sign in');
      }
      throw err;
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      if (email === 'maheealmahmud@gmail.com' || email === 'bijoraforyou@gmail.com') {
        // Force session-only persistence so they must re-authenticate for security
        await setPersistence(auth, browserSessionPersistence);
      } else {
        // Regular customers can stay signed in across browser sessions
        await setPersistence(auth, browserLocalPersistence);
      }
    } catch (e) {
      console.warn("Could not configure custom session persistence:", e);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Auto-register requested admin if not found in Firebase Auth yet
      if (email === 'maheealmahmud@gmail.com' && password === '123456789' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          console.log("Auto-provisioning custom admin account...");
          await registerUser('Bijora Admin', email, '+8801711111111', password);
          return;
        } catch (regErr) {
          console.error("Auto-registration of requested admin failed:", regErr);
        }
      }
      throw new Error('Email or password is incorrect');
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } catch (e) {
      console.error("Firestore user profile update failed:", e);
    }
    setAllUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, ...data } : u));
    setUser(updated);
  };

  // =========================================================================
  // Cart Functions
  // =========================================================================
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } 
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setCartNotification({
      productName: product.name,
      quantity,
      image: product.images?.[0]
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      const prod = prev.find((item) => item.product.id === productId)?.product;
      const maxStock = prod ? prod.stock : 99;
      return prev.map((item) => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, Math.min(maxStock, quantity)) } 
          : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const applyCouponCode = (code: string) => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { success: false, message: t('couponInvalid') };
    }
    
    const { subtotal } = getCartSummary();
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return { success: false, message: `${t('couponInvalid')} Min purchase ৳${coupon.minPurchase}` };
    }

    setActiveCoupon(coupon);
    return { success: true, message: t('couponSuccess') };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const getCartSummary = () => {
    const subtotal = cart.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.originalPrice;
      return acc + (price * item.quantity);
    }, 0);
    
    // Dhaka = ৳5, Outside Dhaka = ৳10 (Simulated for jewelry shipping charge)
    const shippingCharge = subtotal > 0 ? 5 : 0; 
    
    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === 'percent') {
        discount = Math.round(subtotal * (activeCoupon.value / 100));
      } else {
        discount = activeCoupon.value;
      }
    }
    
    const total = Math.max(0, subtotal + shippingCharge - discount);
    
    return { subtotal, shippingCharge, discount, total };
  };

  // =========================================================================
  // Order Placement
  // =========================================================================
  const placeOrder = async (customerInfo: {
    fullName: string;
    mobileNumber: string;
    district: string;
    area: string;
    address: string;
    orderNote?: string;
  }) => {
    const { subtotal, shippingCharge, discount, total } = getCartSummary();
    
    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const orderId = `BJ-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.discountPrice || item.product.originalPrice,
      quantity: item.quantity,
      image: item.product.images[0]
    }));

    const newOrder: Order = {
      id: orderId,
      customerName: customerInfo.fullName,
      customerPhone: customerInfo.mobileNumber,
      district: customerInfo.district,
      area: customerInfo.area,
      address: customerInfo.address,
      orderNote: customerInfo.orderNote || '',
      products: orderItems,
      subtotal,
      shippingCharge,
      discount,
      total,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      userId: user?.uid || 'guest'
    };

    try {
      // 1. Write Order to Firestore
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // 2. Decrement stock for purchased products in Firestore and State
      for (const item of cart) {
        const prodRef = doc(db, 'products', item.product.id);
        const currentStock = item.product.stock;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(prodRef, { stock: newStock });
      }

      setProducts(prevProducts => prevProducts.map(p => {
        const item = cart.find(c => c.product.id === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));

      // Update delivery address on user profile if logged in
      if (user) {
        await updateUserProfile({
          deliveryAddress: customerInfo.address,
          district: customerInfo.district,
          area: customerInfo.area,
          phoneNumber: customerInfo.mobileNumber
        });
      }

      setOrders(prev => [newOrder, ...prev]);
    } catch (err) {
      console.error('Error placing order in Firestore:', err);
      // Fallback local update if network errors
      setOrders(prev => [newOrder, ...prev]);
    }

    return newOrder;
  };

  // Format pre-filled WhatsApp message
  const getWhatsAppUrl = (order: Order): string => {
    const itemsText = order.products.map(p => `- ${p.name} (x${p.quantity}) - ৳${p.price}`).join('%0A');
    const message = `*BIJORA JEWELRY - NEW ORDER* 💍%0A%0A` +
      `*Order ID:* ${order.id}%0A` +
      `*Customer Name:* ${order.customerName}%0A` +
      `*Phone Number:* ${order.customerPhone}%0A` +
      `*Delivery Address:* ${order.address}, ${order.area}, ${order.district}%0A%0A` +
      `*Ordered Items:*%0A${itemsText}%0A%0A` +
      `*Subtotal:* ৳${order.subtotal}%0A` +
      `*Delivery Charge:* ৳${order.shippingCharge}%0A` +
      `*Discount Applied:* -৳${order.discount}%0A` +
      `*Grand Total:* ৳${order.total}%0A%0A` +
      `*Note:* ${order.orderNote || 'None'}%0A%0A` +
      `Thank you for shopping at Bijora!`;
    
    // Official WhatsApp redirect number: 01538362226 (formatted internationally as 8801538362226)
    return `https://wa.me/8801538362226?text=${message}`;
  };

  // Format pre-filled Messenger URL
  const getMessengerUrl = (order: Order): string => {
    return `https://m.me/bijoraforyou`;
  };

  // =========================================================================
  // Reviews Functions
  // =========================================================================
  const fetchReviews = async (productId: string): Promise<Review[]> => {
    const list = reviews.filter(r => r.productId === productId);
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  };

  const submitProductReview = async (productId: string, rating: number, comment: string) => {
    if (!user) throw new Error('You must be logged in to review products.');

    // STRICT BUSINESS RULE: Only customers with verified purchase records can review!
    const hasPurchased = orders.some(o => 
      o.userId === user.uid && 
      o.products.some(p => p.productId === productId)
    );

    if (!hasPurchased) {
      throw new Error('You can only review products that you have purchased from us.');
    }

    const newReview: Review = {
      id: `rev-${Math.floor(100000 + Math.random() * 900000)}`,
      productId,
      userId: user.uid,
      userName: user.fullName,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'reviews', newReview.id), newReview);
    } catch (err) {
      console.error('Failed to save review in Firestore:', err);
    }

    setReviews(prev => {
      const updatedReviews = [newReview, ...prev];
      
      const allProdReviews = updatedReviews.filter(r => r.productId === productId);
      const totalReviews = allProdReviews.length;
      const averageRating = parseFloat(
        (allProdReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      );

      try {
        updateDoc(doc(db, 'products', productId), { averageRating, totalReviews });
      } catch (err) {
        console.error('Failed to update product rating stats in Firestore:', err);
      }

      setProducts(prevProducts => prevProducts.map(p => 
        p.id === productId ? { ...p, averageRating, totalReviews } : p
      ));

      return updatedReviews;
    });
  };

  const editProductReview = async (reviewId: string, rating: number, comment: string) => {
    const target = reviews.find(r => r.id === reviewId);
    if (!target) return;

    try {
      await updateDoc(doc(db, 'reviews', reviewId), { rating, comment, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to edit review in Firestore:', err);
    }

    setReviews(prev => {
      const updatedReviews = prev.map(r => r.id === reviewId ? { ...r, rating, comment, timestamp: new Date().toISOString() } : r);
      
      const allProdReviews = updatedReviews.filter(r => r.productId === target.productId);
      const totalReviews = allProdReviews.length;
      const averageRating = parseFloat(
        (allProdReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      );

      try {
        updateDoc(doc(db, 'products', target.productId), { averageRating, totalReviews });
      } catch (err) {
        console.error('Failed to update product stats in Firestore:', err);
      }

      setProducts(prevProducts => prevProducts.map(p => 
        p.id === target.productId ? { ...p, averageRating, totalReviews } : p
      ));

      return updatedReviews;
    });
  };

  const deleteProductReview = async (reviewId: string) => {
    const target = reviews.find(r => r.id === reviewId);
    if (!target) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.error('Failed to delete review in Firestore:', err);
    }

    setReviews(prev => {
      const updatedReviews = prev.filter(r => r.id !== reviewId);
      
      const allProdReviews = updatedReviews.filter(r => r.productId === target.productId);
      const totalReviews = allProdReviews.length;
      const averageRating = totalReviews > 0 
        ? parseFloat((allProdReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

      try {
        updateDoc(doc(db, 'products', target.productId), { averageRating, totalReviews });
      } catch (err) {
        console.error('Failed to update product stats in Firestore:', err);
      }

      setProducts(prevProducts => prevProducts.map(p => 
        p.id === target.productId ? { ...p, averageRating, totalReviews } : p
      ));

      return updatedReviews;
    });
  };

  const bypassToAdminSession = () => {
    const adminProfile: UserProfile = {
      uid: 'admin_demo_bypass',
      fullName: 'Bijora Administrator (Demo)',
      email: 'admin@bijora.com',
      phoneNumber: '+8801711111111',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    setUser(adminProfile);
  };

  // =========================================================================
  // Admin Operations
  // =========================================================================
  const adminAddProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod_${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: Product = {
      id,
      ...productData,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (e) {
      console.error("Failed to add product to Firestore:", e);
    }
    setProducts(prev => [...prev, newProduct]);
  };

  const adminUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (e) {
      console.error("Failed to update product in Firestore:", e);
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const adminDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error("Failed to delete product from Firestore:", e);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adminAddCategory = async (catData: Omit<Category, 'id'>) => {
    const id = catData.slug;
    const newCat: Category = {
      id,
      ...catData
    };
    try {
      await setDoc(doc(db, 'categories', id), newCat);
    } catch (e) {
      console.error("Failed to add category to Firestore:", e);
    }
    setCategories(prev => [...prev, newCat]);
  };

  const adminUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (e) {
      console.error("Failed to update category in Firestore:", e);
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const adminDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.error("Failed to delete category from Firestore:", e);
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (e) {
      console.error("Failed to update order status in Firestore:", e);
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const adminUpdateProductStock = async (productId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
    } catch (e) {
      console.error("Failed to update stock in Firestore:", e);
    }
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const adminUpdateUserRole = async (userId: string, newRole: 'admin' | 'customer') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (e) {
      console.error("Failed to update user role in Firestore:", e);
    }
    setAllUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
  };

  const adminAddCoupon = async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.code), coupon);
    } catch (e) {
      console.error("Failed to add coupon in Firestore:", e);
    }
    setCoupons(prev => [...prev.filter(c => c.code !== coupon.code), coupon]);
  };

  const adminUpdateCoupon = async (code: string, updates: Partial<Coupon>) => {
    try {
      await updateDoc(doc(db, 'coupons', code), updates);
    } catch (e) {
      console.error("Failed to update coupon in Firestore:", e);
    }
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, ...updates } : c));
  };

  const adminDeleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code));
    } catch (e) {
      console.error("Failed to delete coupon in Firestore:", e);
    }
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  const updateWebSettings = async (settings: Partial<WebSettings>) => {
    const updated = { ...webSettings, ...settings };
    try {
      await setDoc(doc(db, 'settings', 'web'), updated);
    } catch (e) {
      console.error("Failed to update web settings in Firestore:", e);
    }
    setWebSettings(updated);
  };

  return (
    <StoreContext.Provider value={{
      products,
      categories,
      coupons,
      orders,
      reviews,
      cart,
      activeCoupon,
      language,
      user,
      loading,
      authLoading,
      t,
      setLanguage,
      registerUser,
      loginUser,
      logoutUser,
      resetPassword,
      updateUserProfile,
      bypassToAdminSession,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyCouponCode,
      removeCoupon,
      getCartSummary,
      placeOrder,
      getWhatsAppUrl,
      getMessengerUrl,
      fetchReviews,
      submitProductReview,
      editProductReview,
      deleteProductReview,
      adminAddProduct,
      adminUpdateProduct,
      adminDeleteProduct,
      adminAddCategory,
      adminUpdateCategory,
      adminDeleteCategory,
      adminUpdateOrderStatus,
      adminUpdateProductStock,
      adminUpdateUserRole,
      adminAddCoupon,
      adminUpdateCoupon,
      adminDeleteCoupon,
      webSettings,
      updateWebSettings,
      allUsers,
      cartNotification,
      setCartNotification
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
