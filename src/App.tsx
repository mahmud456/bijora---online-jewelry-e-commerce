/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { AiStylist } from './components/AiStylist';
import { AdminPanel } from './components/AdminPanel';
import { Product, Order } from './types';
import { 
  Sparkles, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingBag, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  Star,
  MapPin,
  Lock,
  Heart,
  Eye,
  EyeOff,
  X,
  Languages
} from 'lucide-react';

function AppContent() {
  const { 
    products, 
    categories, 
    orders,
    addToCart, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    getCartSummary, 
    applyCouponCode, 
    removeCoupon,
    activeCoupon,
    placeOrder, 
    getWhatsAppUrl, 
    getMessengerUrl,
    language,
    user,
    loginUser,
    registerUser,
    logoutUser,
    resetPassword,
    fetchReviews,
    submitProductReview,
    editProductReview,
    deleteProductReview,
    webSettings,
    t
  } = useStore();

  const [currentTab, setTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Selected product for details view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [productReviews, setProductReviews] = useState<any[]>([]);

  // Review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');

  // Cart Drawer open state
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<boolean>(false);

  // Checkout inputs
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    mobileNumber: '',
    district: '',
    area: '',
    address: '',
    orderNote: ''
  });

  // Post checkout order confirmation modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Coupon entry state
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // User Authentication Forms State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isAuthRegister, setIsAuthRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [authError, setAuthError] = useState('');

  // Auto-fill checkout fields if user profile exists
  React.useEffect(() => {
    if (user) {
      setCheckoutForm({
        fullName: user.fullName,
        mobileNumber: user.phoneNumber || '',
        district: user.district || '',
        area: user.area || '',
        address: user.deliveryAddress || '',
        orderNote: ''
      });
    }
  }, [user]);

  // Handle viewing a product detail
  const handleViewProductDetails = async (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setActiveImageIdx(0);
    setTab('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch product reviews
    const reviews = await fetchReviews(product.id);
    setProductReviews(reviews);
  };

  // Submit product review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await submitProductReview(selectedProduct.id, userRating, userComment);
      setUserComment('');
      // Reload reviews
      const updated = await fetchReviews(selectedProduct.id);
      setProductReviews(updated);
    } catch (err: any) {
      alert('Review submission failed: ' + err.message);
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const finalPrice = p.discountPrice || p.originalPrice;
    const matchesPrice = finalPrice <= priceRange;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.originalPrice;
    const priceB = b.discountPrice || b.originalPrice;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // Default sorting
  });

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const result = applyCouponCode(couponCode);
    setCouponFeedback(result);
  };

  // Place Order Action
  const handlePlaceOrder = async (method: 'whatsapp' | 'messenger' | 'standard') => {
    // Basic validation
    if (!checkoutForm.fullName || !checkoutForm.mobileNumber || !checkoutForm.district || !checkoutForm.area || !checkoutForm.address) {
      alert(t('requiredFields'));
      return;
    }

    try {
      const order = await placeOrder(checkoutForm);
      setConfirmedOrder(order);
      clearCartInputs();
      setCartOpen(false);
      setCheckoutStep(false);

      if (method === 'whatsapp') {
        window.open(getWhatsAppUrl(order), '_blank');
      } else if (method === 'messenger') {
        window.open(getMessengerUrl(order), '_blank');
      }
    } catch (err: any) {
      alert('Order placement failed: ' + err.message);
    }
  };

  const clearCartInputs = () => {
    setCouponCode('');
    setCouponFeedback(null);
  };

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isAuthRegister) {
        await registerUser(authName, authEmail, authPhone, authPassword);
      } else {
        await loginUser(authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check inputs.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setResetSuccessMessage('');
    if (!authEmail) {
      setAuthError('Please enter your email address.');
      return;
    }
    try {
      await resetPassword(authEmail);
      setResetSuccessMessage('A password reset email has been sent. Please check your inbox.');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-stone-800 selection:bg-[#C5A059] selection:text-white">
      
      {/* Header element */}
      <Header 
        currentTab={currentTab} 
        setTab={(tab) => {
          setTab(tab);
          setSelectedProduct(null);
        }} 
        openCart={() => setCartOpen(true)} 
      />

      {/* Main viewport */}
      <main className="flex-1">

        {/* ===================================================================
            VIEW STATE 1: HOMEPAGE
            =================================================================== */}
        {currentTab === 'home' && (
          <div className="space-y-16 pb-20 animate-fadeIn">
            {(() => {
              const order = webSettings?.sectionsOrder || ['intro', 'categories', 'featured', 'coupon', 'arrivals'];
              const sections = webSettings?.sections || {
                intro: { visible: true, title: '', subtitle: '', buttonText: '', backgroundImage: '' },
                categories: { visible: true },
                featured: { visible: true },
                coupon: { visible: true, title: '', description: '', buttonText: '', backgroundImage: '' },
                arrivals: { visible: true }
              };

              return order.map(sectionId => {
                if (sectionId === 'intro') {
                  const conf = sections.intro;
                  if (conf && !conf.visible) return null;
                  const bg = conf?.backgroundImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80';
                  return (
                    <section 
                      key="intro"
                      className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center text-white border-b border-[#C5A059] bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `linear-gradient(to bottom, rgba(26, 10, 13, 0.85), rgba(64, 19, 27, 0.95)), url(${bg})` }}
                    >
                      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                        <div className="h-[500px] w-[500px] rounded-full border-8 border-dashed border-white animate-spin-slow" />
                      </div>
                      
                      <div className="relative mx-auto max-w-4xl">
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#C5A059]/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Exquisite Royal Heritage Jewelry</span>
                        </span>
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-white mt-6 mb-4 max-w-3xl mx-auto leading-tight">
                          {conf?.title || t('heroTitle')}
                        </h1>
                        <p className="font-sans text-sm sm:text-base font-medium text-stone-300 max-w-xl mx-auto leading-relaxed">
                          {conf?.subtitle || t('heroSubtitle')}
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                          <button 
                            onClick={() => setTab('shop')} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#C5A059] px-8 py-3.5 text-sm font-bold text-[#1A0A0D] shadow transition-all hover:bg-[#d6b76c] active:scale-95 cursor-pointer"
                          >
                            <span>{conf?.buttonText || t('shopCollection')}</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setTab('ai-stylist')} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-[#C5A059] bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4 text-[#C5A059]" />
                            <span>Styling Consult Assistant</span>
                          </button>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sectionId === 'categories') {
                  const conf = sections.categories;
                  if (conf && !conf.visible) return null;
                  return (
                    <section key="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-10">
                        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">{t('categoriesTitle')}</h2>
                        <p className="mt-2 text-sm font-medium text-stone-500 font-sans">{t('categoriesSubtitle')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {categories.map(cat => (
                          <div 
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setTab('shop');
                            }}
                            className="group cursor-pointer rounded-xl border border-stone-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#C5A059]"
                          >
                            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-stone-100 bg-stone-50 mb-3 group-hover:ring-2 group-hover:ring-[#C5A059]">
                              <img src={cat.image} alt={cat.name} referrerPolicy="no-referrer" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <h3 className="font-serif text-sm font-bold text-stone-800 group-hover:text-[#C5A059] transition-colors">{cat.name}</h3>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (sectionId === 'featured') {
                  const conf = sections.featured;
                  if (conf && !conf.visible) return null;
                  return (
                    <section key="featured" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Curated Masterpieces</span>
                        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 mt-1">{t('featuredTitle')}</h2>
                        <p className="mt-2 text-sm font-medium text-stone-500 font-sans">{t('featuredSubtitle')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                        {products.filter(p => p.featured).slice(0, 4).map(prod => (
                          <ProductCard 
                            key={prod.id} 
                            product={prod} 
                            onViewDetails={handleViewProductDetails} 
                          />
                        ))}
                      </div>
                    </section>
                  );
                }

                if (sectionId === 'coupon') {
                  const conf = sections.coupon;
                  if (conf && !conf.visible) return null;
                  const bg = conf?.backgroundImage || 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1600&q=80';
                  return (
                    <section key="coupon" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div 
                        className="relative overflow-hidden rounded-2xl p-10 sm:p-12 text-white shadow-lg border border-[#C5A059]/30 bg-cover bg-center"
                        style={{ backgroundImage: `linear-gradient(to right, rgba(26, 26, 26, 0.9), rgba(45, 45, 45, 0.8)), url(${bg})` }}
                      >
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-20 -translate-y-20">
                          <div className="h-96 w-96 rounded-full border-[15px] border-white" />
                        </div>
                        <div className="relative max-w-lg space-y-4">
                          <span className="font-sans text-xs font-bold uppercase tracking-wider bg-[#C5A059] text-[#1A0A0D] px-3 py-1 rounded-full">Limited Season Promo</span>
                          <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">{conf?.title || 'Celebrate Eternity with Elegant Gold Discounts'}</h3>
                          <p className="font-sans text-sm text-stone-200">
                            {conf?.description || 'Apply coupon code BIJORA10 during shopping checkout to enjoy an instantaneous 10% discount on all collection rings and bridal jewelry sets.'}
                          </p>
                          <div className="pt-2">
                            <button 
                              onClick={() => setTab('shop')} 
                              className="rounded-lg bg-[#C5A059] px-6 py-3 text-sm font-bold text-[#1A0A0D] shadow transition-colors hover:bg-[#d6b76c] cursor-pointer"
                            >
                              {conf?.buttonText || 'Browse Masterpieces Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sectionId === 'arrivals') {
                  const conf = sections.arrivals;
                  if (conf && !conf.visible) return null;
                  return (
                    <section key="arrivals" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Latest Additions</span>
                        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 mt-1">{t('newArrivalsTitle')}</h2>
                        <p className="mt-2 text-sm font-medium text-stone-500 font-sans">{t('newArrivalsSubtitle')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                        {products.filter(p => p.newArrival).slice(0, 4).map(prod => (
                          <ProductCard 
                            key={prod.id} 
                            product={prod} 
                            onViewDetails={handleViewProductDetails} 
                          />
                        ))}
                      </div>
                    </section>
                  );
                }

                return null;
              });
            })()}
          </div>
        )}

        {/* ===================================================================
            VIEW STATE 2: PRODUCT CATALOG (SHOP)
            =================================================================== */}
        {currentTab === 'shop' && (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Product Filtering Sidebar */}
              <aside className="w-full lg:w-64 shrink-0 space-y-6 font-sans text-sm">
                
                {/* Search Bar */}
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 pl-10 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>

                {/* Categories filtering list */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 border-b pb-2 mb-3">Categories</h4>
                  <div className="space-y-1.5 font-medium">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`block w-full text-left py-1 transition-colors ${selectedCategory === 'all' ? 'text-[#1A1A1A] font-bold border-l-2 border-[#C5A059] pl-2' : 'text-stone-600 hover:text-[#1A1A1A]'}`}
                    >
                      All Jewelry
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left py-1 transition-colors capitalize ${selectedCategory === cat.id ? 'text-[#1A1A1A] font-bold border-l-2 border-[#C5A059] pl-2' : 'text-stone-600 hover:text-[#1A1A1A]'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range filter */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 border-b pb-2 mb-3">Max Price Range</h4>
                  <input 
                    type="range" 
                    min={50} 
                    max={3000} 
                    value={priceRange} 
                    onChange={e => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#C5A059] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-stone-500 mt-2">
                    <span>৳50</span>
                    <span className="text-[#1A1A1A] font-extrabold">৳{priceRange}</span>
                  </div>
                </div>

                {/* Sort dropdown */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 border-b pb-2 mb-3">Sort Collection By</h4>
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  >
                    <option value="default">{t('sortDefault')}</option>
                    <option value="price-asc">{t('sortPriceAsc')}</option>
                    <option value="price-desc">{t('sortPriceDesc')}</option>
                    <option value="newest">{t('sortNewest')}</option>
                  </select>
                </div>
              </aside>

              {/* Products Display Grid */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b pb-3 font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
                  <span>{sortedProducts.length} masterpieces found</span>
                  {selectedCategory !== 'all' && (
                    <button 
                      onClick={() => setSelectedCategory('all')} 
                      className="text-[#1A1A1A] hover:text-[#C5A059] hover:underline"
                    >
                      Clear Category filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                  {sortedProducts.map(prod => (
                    <ProductCard 
                      key={prod.id} 
                      product={prod} 
                      onViewDetails={handleViewProductDetails} 
                    />
                  ))}
                </div>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-24 rounded-2xl border border-dashed border-stone-200 bg-white/50 p-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                    <h3 className="font-serif text-lg font-bold text-stone-800">No masterpieces match your filters</h3>
                    <p className="font-sans text-sm text-stone-500 mt-1">Try relaxing your price constraints or clear the search query.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW STATE 3: PRODUCT DETAILS (WITH REVIEW SECTIONS)
            =================================================================== */}
        {currentTab === 'product-details' && selectedProduct && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
            
            {/* Main Information Split */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 pb-16 border-b">
              
              {/* Product Gallery */}
              <div className="space-y-4">
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
                  <img 
                    src={selectedProduct.images[activeImageIdx] || selectedProduct.images[0]} 
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center" 
                  />
                </div>
                {/* Thumbnails */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-3">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition-all ${activeImageIdx === idx ? 'border-[#1A1A1A] scale-102' : 'border-stone-100'}`}
                      >
                        <img src={img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side metadata details */}
              <div className="flex flex-col space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] block mb-1">
                    {selectedProduct.category}
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-xs font-mono text-stone-400 mt-1">SKU: {selectedProduct.sku}</p>
                </div>

                {/* Rating average */}
                {selectedProduct.averageRating && (
                  <div className="flex items-center space-x-2 border-y py-2.5">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4.5 w-4.5 ${
                            star <= Math.round(selectedProduct.averageRating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-stone-700">{selectedProduct.averageRating} out of 5 stars</span>
                    <span className="text-xs font-semibold text-stone-400 font-sans">({selectedProduct.totalReviews || 0} customer reviews)</span>
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-baseline space-x-3.5">
                  {selectedProduct.discountPrice ? (
                    <>
                      <span className="font-serif text-3xl font-extrabold text-[#1A1A1A]">৳{selectedProduct.discountPrice}</span>
                      <span className="font-sans text-base text-stone-400 line-through">৳{selectedProduct.originalPrice}</span>
                    </>
                  ) : (
                    <span className="font-serif text-3xl font-extrabold text-[#1A1A1A]">৳{selectedProduct.originalPrice}</span>
                  )}
                </div>

                {/* Product Description */}
                <p className="font-sans text-sm leading-relaxed text-stone-600 font-medium">
                  {selectedProduct.description}
                </p>

                {/* Inventory Stock Indicator */}
                <div className="flex items-center space-x-2 font-sans text-xs">
                  <span className="font-bold text-stone-500">Availability:</span>
                  {selectedProduct.stock > 0 ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">{selectedProduct.stock} items remaining in vault</span>
                  ) : (
                    <span className="rounded bg-red-50 px-2 py-0.5 font-bold text-red-700">Out of Stock</span>
                  )}
                </div>

                {/* Quantity selector and Cart actions */}
                {selectedProduct.stock > 0 && (
                  <div className="flex items-center space-x-4 pt-4">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-[#FAF5EC]/30">
                      <button 
                        onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                        className="p-2.5 text-stone-600 hover:text-[#C5A059]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-bold text-stone-800">{productQuantity}</span>
                      <button 
                        onClick={() => setProductQuantity(Math.min(selectedProduct.stock, productQuantity + 1))}
                        className="p-2.5 text-stone-600 hover:text-[#C5A059]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => addToCart(selectedProduct, productQuantity)}
                      className="flex-1 rounded-sm bg-[#1A1A1A] py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#C5A059] text-center"
                    >
                      {t('addToCart')}
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Related/Recommended Products */}
            <div className="py-12 border-b">
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-8">{t('relatedProducts')}</h3>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                {products
                  .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map(prod => (
                    <ProductCard 
                      key={prod.id} 
                      product={prod} 
                      onViewDetails={handleViewProductDetails} 
                    />
                  ))
                }
              </div>
            </div>

            {/* Ratings & Reviews Thread */}
            <div className="py-12 space-y-8 max-w-4xl">
              <h3 className="font-serif text-2xl font-bold text-stone-900">{t('ratingReviews')}</h3>
              
              {/* Write Review Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm font-sans text-sm space-y-4">
                  <h4 className="font-serif text-base font-bold text-[#1A1A1A]">{t('writeReview')}</h4>
                  
                  {/* Star selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">{t('ratingLabel')}</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="p-0.5 text-[#C5A059] transition-transform hover:scale-110"
                        >
                          <Star className={`h-6 w-6 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">{t('commentLabel')}</label>
                    <textarea
                      rows={3}
                      required
                      value={userComment}
                      onChange={e => setUserComment(e.target.value)}
                      placeholder="Share your experience wearing this premium piece..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="rounded-lg bg-[#1A1A1A] px-5 py-2 font-bold text-white hover:bg-[#C5A059]"
                  >
                    {t('submitReview')}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-5 font-sans text-xs font-bold flex items-center justify-between text-stone-600">
                  <span>Sign in to write a review about this jewelry piece.</span>
                  <button onClick={() => setTab('account')} className="text-[#1A1A1A] underline hover:text-[#C5A059]">Go to Account Portal</button>
                </div>
              )}

              {/* Feedbacks Display */}
              <div className="space-y-4">
                {productReviews.map((rev, idx) => (
                  <div key={idx} className="rounded-xl border border-stone-50 bg-white p-5 shadow-sm font-sans text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-800">{rev.userName}</p>
                        <p className="text-[10px] text-stone-400">{new Date(rev.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-4 w-4 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 font-medium italic">"{rev.comment}"</p>
                  </div>
                ))}
                {productReviews.length === 0 && (
                  <p className="text-center font-sans text-sm text-stone-400 italic py-6">{t('noReviews')}</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            VIEW STATE 4: AI STYLIST CHAT
            =================================================================== */}
        {currentTab === 'ai-stylist' && <AiStylist />}

        {/* ===================================================================
            VIEW STATE 5: ADMIN DASHBOARD (CRUD / STATS)
            =================================================================== */}
        {currentTab === 'admin' && <AdminPanel />}

        {/* ===================================================================
            VIEW STATE 6: USER ACCOUNT / PROFILE / PREVIOUS ORDERS
            =================================================================== */}
        {currentTab === 'account' && (
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn font-sans text-sm">
            {user ? (
              <div className="space-y-8">
                {/* Profile detail card */}
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-white font-serif text-2xl font-bold ring-2 ring-[#C5A059]">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-stone-900">{user.fullName}</h2>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{user.role} Member</p>
                    </div>
                  </div>
                  <button 
                    onClick={logoutUser}
                    className="rounded-lg border border-stone-200 hover:bg-stone-50 px-4 py-2 font-bold text-stone-600"
                  >
                    {t('logout')}
                  </button>
                </div>

                {/* Profile detail tabs splits */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  
                  {/* Delivery Address profile settings */}
                  <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-1.5">
                      <MapPin className="h-5 w-5 text-[#C5A059]" />
                      <span>Saved Address</span>
                    </h3>
                    <div className="space-y-2 font-medium text-stone-600">
                      <p><span className="font-bold text-stone-500">Phone:</span> {user.phoneNumber || 'Not provided'}</p>
                      <p><span className="font-bold text-stone-500">District:</span> {user.district || 'Not provided'}</p>
                      <p><span className="font-bold text-stone-500">Area/Upazila:</span> {user.area || 'Not provided'}</p>
                      <p><span className="font-bold text-stone-500">Full Address:</span> {user.deliveryAddress || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Orders history list */}
                  <div className="md:col-span-2 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">{t('ordersHistory')}</h3>
                    
                    <div className="space-y-4">
                      {/* Search orders that belong to logged in user */}
                      {user && (
                        orders.filter(o => o.userId === user.uid).map(o => (
                          <div key={o.id} className="rounded-xl border border-stone-50 bg-stone-50/50 p-4 flex flex-col sm:flex-row justify-between gap-3 font-medium">
                            <div>
                              <p className="font-bold text-[#1A1A1A] font-mono text-xs">{o.id}</p>
                              <p className="text-stone-400 text-xs mt-0.5">{new Date(o.timestamp).toLocaleDateString()}</p>
                              <div className="mt-2 text-xs text-stone-600">
                                {o.products.map((item, idx) => (
                                  <span key={idx} className="block">• {item.name} (x{item.quantity})</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex flex-col justify-between items-end">
                              <span className="font-bold text-stone-800 text-base">৳{o.total}</span>
                              <span className={`rounded-full px-2.5 py-0.5 font-bold text-[9px] uppercase ${
                                o.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {orders.filter(o => o.userId === user.uid).length === 0 && (
                        <p className="text-center text-stone-400 italic py-8">{t('noOrders')}</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ) : isForgotPassword ? (
              // Forgot Password form
              <div className="mx-auto max-w-md rounded-2xl border border-amber-100 bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] text-white mb-3 shadow ring-4 ring-[#C5A059]/10">
                    <ShoppingBag className="h-5 w-5 text-[#C5A059]" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">Recover Password</h2>
                  <p className="mt-1.5 text-xs text-stone-500 font-medium">Please enter your email address and we will send you a secure link to reset your password.</p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 font-sans text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-semibold">{authError}</p>
                  )}

                  {resetSuccessMessage && (
                    <p className="text-xs text-green-600 bg-green-50 p-2.5 rounded-lg font-semibold">{resetSuccessMessage}</p>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded-lg bg-[#1A1A1A] py-2.5 font-bold text-white hover:bg-[#C5A059] transition-colors"
                  >
                    Send Reset Link
                  </button>
                </form>

                <div className="mt-4 text-center text-xs font-semibold">
                  <button 
                    onClick={() => {
                      setIsForgotPassword(false);
                      setAuthError('');
                      setResetSuccessMessage('');
                    }} 
                    className="text-[#1A1A1A] hover:underline"
                  >
                    Back to Log In
                  </button>
                </div>
              </div>
            ) : (
              // Auth forms
              <div className="mx-auto max-w-md rounded-2xl border border-amber-100 bg-white p-8 shadow-sm">
                <div className="text-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] text-white mb-3 shadow ring-4 ring-[#C5A059]/10">
                    <ShoppingBag className="h-5 w-5 text-[#C5A059]" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">{isAuthRegister ? t('register') : t('login')}</h2>
                  <p className="mt-1.5 text-xs text-stone-500 font-medium">Join Bijora to track royal purchases and unlock customer exclusive coupon gifts.</p>
                </div>

                <form onSubmit={handleUserAuth} className="space-y-4 font-sans text-sm">
                  {isAuthRegister && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="+88017..."
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Password</label>
                      {!isAuthRegister && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setAuthError('');
                            setResetSuccessMessage('');
                          }}
                          className="text-xs font-semibold text-stone-500 hover:text-[#1A1A1A] hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 pl-3 pr-10 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-[#1A1A1A] focus:outline-none"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-semibold">{authError}</p>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded-lg bg-[#1A1A1A] py-2.5 font-bold text-white hover:bg-[#C5A059] transition-colors"
                  >
                    {isAuthRegister ? 'Register Account' : 'Log In'}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs font-semibold">
                  <button 
                    onClick={() => {
                      setIsAuthRegister(!isAuthRegister);
                      setAuthError('');
                      setResetSuccessMessage('');
                    }} 
                    className="text-[#1A1A1A] hover:underline"
                  >
                    {isAuthRegister ? 'Already have an account? Login' : 'Create new account'}
                  </button>
                </div>
              </div>
            )/* auth_form_view_ends */}
          </div>
        )}

      </main>

      {/* Footer element */}
      <Footer 
        setTab={setTab} 
        setSelectedCategory={setSelectedCategory} 
      />

      {/* ===================================================================
          SLIDING SIDE CART DRAWER (WITH CHECKOUT SCREEN)
          =================================================================== */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs font-sans text-sm">
          <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col border-l">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {checkoutStep ? t('customerInfo') : t('navCart')}
              </h3>
              <button onClick={() => { setCartOpen(false); setCheckoutStep(false); }} className="p-1 text-stone-500 hover:text-stone-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Main Section */}
            {!checkoutStep ? (
              // STEP 1: View cart items list
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {cart.map((item, idx) => {
                  const price = item.product.discountPrice || item.product.originalPrice;
                  return (
                    <div key={idx} className="flex gap-3.5 border-b pb-4 last:border-b-0 font-medium">
                      <img src={item.product.images[0]} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-lg object-cover border border-stone-100" />
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800 line-clamp-1">{item.product.name}</h4>
                        <p className="text-[#1A1A1A] font-bold text-xs mt-0.5">৳{price}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-stone-500 hover:text-stone-800"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-stone-500 hover:text-stone-800"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-stone-400 hover:text-red-600">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {cart.length === 0 && (
                  <div className="text-center py-20 text-stone-400">
                    <ShoppingBag className="mx-auto h-12 w-12 text-stone-200 mb-2" />
                    <p className="font-sans italic">Your jewelry cart is empty.</p>
                  </div>
                )}
              </div>
            ) : (
              // STEP 2: Checkout Form
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 font-medium">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={checkoutForm.fullName} 
                      onChange={e => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Mobile Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g., 01712345678"
                      value={checkoutForm.mobileNumber} 
                      onChange={e => setCheckoutForm({ ...checkoutForm, mobileNumber: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-500 mb-1">District</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Dhaka"
                        value={checkoutForm.district} 
                        onChange={e => setCheckoutForm({ ...checkoutForm, district: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Area / Upazila</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Gulshan"
                        value={checkoutForm.area} 
                        onChange={e => setCheckoutForm({ ...checkoutForm, area: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Complete Delivery Address</label>
                    <textarea 
                      rows={2}
                      required 
                      placeholder="House, Road, Apartment..."
                      value={checkoutForm.address} 
                      onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Order Note (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Any specific delivery instructions..."
                      value={checkoutForm.orderNote} 
                      onChange={e => setCheckoutForm({ ...checkoutForm, orderNote: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 focus:border-[#1A1A1A] focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cart Footer Pricing & Action triggers */}
            {cart.length > 0 && (
              <div className="border-t bg-stone-50 p-5 space-y-4">
                
                {/* Coupon Applying form (only in view step) */}
                {!checkoutStep && (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={t('couponPlaceholder')}
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 rounded-lg border bg-white px-3 py-1.5 focus:outline-none font-sans font-medium"
                    />
                    <button type="submit" className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 font-bold text-white text-xs hover:bg-[#C5A059]">
                      {t('applyCoupon')}
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p className={`text-xs font-bold ${couponFeedback.success ? 'text-green-600' : 'text-red-600'}`}>
                    {couponFeedback.message}
                  </p>
                )}

                {activeCoupon && (
                  <div className="flex items-center justify-between text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                    <span>Coupon Applied: {activeCoupon.code}</span>
                    <button onClick={removeCoupon} className="text-red-500 hover:underline">Remove</button>
                  </div>
                )}

                {/* Subtotals breakdown */}
                <div className="space-y-1.5 text-xs font-semibold text-stone-500">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}:</span>
                    <span>৳{getCartSummary().subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('shipping')}:</span>
                    <span>৳{getCartSummary().shippingCharge}</span>
                  </div>
                  {getCartSummary().discount > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>{t('discount')}:</span>
                      <span>-৳{getCartSummary().discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t">
                    <span>{t('grandTotal')}:</span>
                    <span className="text-[#1A1A1A]">৳{getCartSummary().total}</span>
                  </div>
                </div>

                {/* Main checkout pathways */}
                {!checkoutStep ? (
                  <button 
                    onClick={() => setCheckoutStep(true)}
                    className="w-full rounded-lg bg-[#1A1A1A] py-2.5 font-bold text-white text-center shadow hover:bg-[#C5A059] transition-colors"
                  >
                    Proceed to Delivery Info
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={() => handlePlaceOrder('standard')}
                      className="w-full rounded-lg bg-[#1A1A1A] py-2.5 font-bold text-white text-center hover:bg-[#C5A059]"
                    >
                      {t('placeOrderStandard')}
                    </button>
                    <button 
                      onClick={() => handlePlaceOrder('whatsapp')}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{t('placeOrderWhatsApp')}</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceOrder('messenger')}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 font-bold text-white hover:bg-sky-700"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{t('placeOrderMessenger')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ===================================================================
          ORDER PLACEMENT CONFIRMATION SCREEN MODAL
          =================================================================== */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl font-sans text-sm relative animate-scaleIn text-center border-t-4 border-[#1A1A1A]">
            
            <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 shadow">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {t('orderSuccessTitle')}
            </h2>
            <p className="text-xs font-medium text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {t('orderSuccessDesc')}
            </p>

            {/* Receipt Summary details */}
            <div className="my-6 rounded-xl border border-stone-100 bg-stone-50/50 p-4 text-left font-medium text-stone-700 space-y-2.5">
              <p className="flex justify-between border-b pb-2"><span className="font-bold text-stone-500">{t('orderId')}:</span> <span className="font-mono font-bold text-stone-950">{confirmedOrder.id}</span></p>
              <p className="flex justify-between"><span className="font-bold text-stone-500">{t('fullName')}:</span> <span className="text-stone-950">{confirmedOrder.customerName}</span></p>
              <p className="flex justify-between"><span className="font-bold text-stone-500">{t('phone')}:</span> <span className="text-stone-950">{confirmedOrder.customerPhone}</span></p>
              <p className="flex justify-between"><span className="font-bold text-stone-500">Destination:</span> <span className="text-stone-950">{confirmedOrder.area}, {confirmedOrder.district}</span></p>
              <div className="border-t pt-2 space-y-1">
                {confirmedOrder.products.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-stone-600">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <p className="flex justify-between border-t pt-2 font-serif text-sm font-bold text-[#1A1A1A]"><span>{t('grandTotal')}:</span> <span>৳{confirmedOrder.total}</span></p>
            </div>

            <button 
              onClick={() => setConfirmedOrder(null)}
              className="rounded-lg bg-[#1A1A1A] px-8 py-2.5 font-bold text-white hover:bg-[#C5A059]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
