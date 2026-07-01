import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu, X, ShoppingCart, User, Settings, Sparkles, Languages, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  openCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setTab, openCart }) => {
  const { cart, language, setLanguage, user, t, cartNotification, setCartNotification, webSettings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (cartNotification) {
      const timer = setTimeout(() => {
        setCartNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [cartNotification, setCartNotification]);

  const handleTabClick = (tab: string) => {
    setTab(tab);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E5E5] bg-[#FDFCFB]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <div 
          onClick={() => handleTabClick('home')} 
          className="flex cursor-pointer items-center space-x-3 transition-transform hover:scale-[1.02]"
        >
          {webSettings?.logoUrl ? (
            <img src={webSettings.logoUrl} alt="Logo" className="h-11 w-auto object-contain max-w-[120px]" referrerPolicy="no-referrer" />
          ) : (
            /* Circular Mandala Icon Representation */
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A] text-white ring-2 ring-[#C5A059] ring-offset-1">
              <Sparkles className="h-5 w-5 text-[#C5A059] animate-pulse" />
            </div>
          )}
          <div>
            <span className="font-serif text-2xl font-bold tracking-widest text-[#1A1A1A] uppercase block leading-none">
              {t('brand')}
            </span>
            <span className="text-[10px] tracking-wider text-[#C5A059] uppercase block font-medium">
              {t('brandSubtitle')}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-sans text-sm font-medium tracking-wide">
          <button 
            onClick={() => handleTabClick('home')}
            className={`transition-colors hover:text-[#C5A059] ${currentTab === 'home' ? 'text-[#1A1A1A] font-bold border-b-2 border-[#C5A059] pb-1' : 'text-stone-600'}`}
          >
            {t('navHome')}
          </button>
          <button 
            onClick={() => handleTabClick('shop')}
            className={`transition-colors hover:text-[#C5A059] ${currentTab === 'shop' ? 'text-[#1A1A1A] font-bold border-b-2 border-[#C5A059] pb-1' : 'text-stone-600'}`}
          >
            {t('navShop')}
          </button>
          <button 
            onClick={() => handleTabClick('ai-stylist')}
            className={`flex items-center space-x-1.5 transition-colors hover:text-[#C5A059] ${currentTab === 'ai-stylist' ? 'text-[#1A1A1A] font-bold border-b-2 border-[#C5A059] pb-1' : 'text-stone-600'}`}
          >
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            <span>{t('navAiStylist')}</span>
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => handleTabClick('admin')}
              className={`flex items-center space-x-1.5 transition-colors text-amber-800 hover:text-[#1A1A1A] ${currentTab === 'admin' ? 'text-[#1A1A1A] font-bold border-b-2 border-[#C5A059] pb-1' : ''}`}
            >
              <Settings className="h-4 w-4" />
              <span>{t('navAdmin')}</span>
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 text-stone-600 transition-colors hover:text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider bg-stone-100 hover:bg-[#FAF5EC] px-3 py-1.5 rounded-full border border-stone-200"
          >
            <Languages className="h-3.5 w-3.5 text-[#C5A059]" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Account Link */}
          <button 
            onClick={() => handleTabClick('account')}
            className={`flex items-center space-x-1.5 transition-colors hover:text-[#1A1A1A] ${currentTab === 'account' ? 'text-[#1A1A1A] font-bold' : 'text-stone-600'}`}
            title="User Profile"
          >
            <User className="h-5 w-5" />
            {user && <span className="text-xs max-w-[80px] truncate">{user.fullName.split(' ')[0]}</span>}
          </button>

          {/* Cart Icon Container */}
          <div className="relative">
            <button 
              onClick={openCart}
              className="relative flex items-center justify-center p-2 text-[#1A1A1A] transition-transform hover:scale-105"
              aria-label="Open Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-[10px] font-bold text-white ring-2 ring-[#FDFCFB]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            <AnimatePresence>
              {cartNotification && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-76 rounded-xl border border-stone-100 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 text-stone-900"
                >
                  {/* Speech Bubble Arrow pointing to the shopping cart icon */}
                  <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-stone-100 bg-white" />
                  
                  <div className="flex items-start space-x-3">
                    {cartNotification.image ? (
                      <img 
                        src={cartNotification.image} 
                        alt={cartNotification.productName} 
                        className="h-12 w-12 rounded-lg object-cover border border-stone-100 bg-stone-50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FAF5EC] border border-[#FAF5EC]">
                        <ShoppingCart className="h-5 w-5 text-[#C5A059]" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 text-[11px] font-bold tracking-wider text-[#C5A059] uppercase">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{t('addedToCartSuccess')}</span>
                      </div>
                      <h4 className="mt-1 text-xs font-semibold text-stone-800 truncate">
                        {cartNotification.productName}
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Qty: {cartNotification.quantity}
                      </p>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartNotification(null);
                      }}
                      className="text-stone-400 hover:text-stone-600 transition-colors p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartNotification(null);
                      }}
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-700 transition-colors px-2.5 py-1.5"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartNotification(null);
                        openCart();
                      }}
                      className="text-[11px] font-bold bg-[#1A1A1A] hover:bg-[#C5A059] text-white transition-colors px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      {t('viewCart')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation controls */}
        <div className="flex md:hidden items-center space-x-4">
          <button 
            onClick={toggleLanguage}
            className="text-xs font-bold uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border border-stone-200"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>

          {/* Mobile Cart Button Container */}
          <div className="relative">
            <button 
              onClick={openCart}
              className="relative p-1 text-[#1A1A1A]"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A059] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Notification Popover */}
            <AnimatePresence>
              {cartNotification && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-72 rounded-xl border border-stone-100 bg-white p-3.5 shadow-xl ring-1 ring-black/5 z-50 text-stone-900"
                >
                  {/* Arrow pointing up */}
                  <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-stone-100 bg-white" />
                  
                  <div className="flex items-start space-x-3">
                    {cartNotification.image ? (
                      <img 
                        src={cartNotification.image} 
                        alt={cartNotification.productName} 
                        className="h-10 w-10 rounded-lg object-cover border border-stone-100 bg-stone-50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF5EC] border border-[#FAF5EC]">
                        <ShoppingCart className="h-4 w-4 text-[#C5A059]" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 text-[10px] font-bold tracking-wider text-[#C5A059] uppercase">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{t('addedToCartSuccess')}</span>
                      </div>
                      <h4 className="mt-0.5 text-xs font-semibold text-stone-800 truncate">
                        {cartNotification.productName}
                      </h4>
                      <p className="text-[10px] text-stone-500">
                        Qty: {cartNotification.quantity}
                      </p>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartNotification(null);
                      }}
                      className="text-stone-400 hover:text-stone-600 transition-colors p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartNotification(null);
                        openCart();
                      }}
                      className="w-full text-center text-[10px] font-bold bg-[#1A1A1A] hover:bg-[#C5A059] text-white transition-colors py-1.5 rounded-lg shadow-sm"
                    >
                      {t('viewCart')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[#1A1A1A]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-[#FDFCFB] px-4 py-4 space-y-3 shadow-lg">
          <button 
            onClick={() => handleTabClick('home')}
            className={`block w-full text-left py-2 font-medium ${currentTab === 'home' ? 'text-[#1A1A1A] font-bold' : 'text-stone-600'}`}
          >
            {t('navHome')}
          </button>
          <button 
            onClick={() => handleTabClick('shop')}
            className={`block w-full text-left py-2 font-medium ${currentTab === 'shop' ? 'text-[#1A1A1A] font-bold' : 'text-stone-600'}`}
          >
            {t('navShop')}
          </button>
          <button 
            onClick={() => handleTabClick('ai-stylist')}
            className={`flex items-center space-x-1.5 w-full text-left py-2 font-medium ${currentTab === 'ai-stylist' ? 'text-[#1A1A1A] font-bold' : 'text-stone-600'}`}
          >
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            <span>{t('navAiStylist')}</span>
          </button>
          <button 
            onClick={() => handleTabClick('account')}
            className={`block w-full text-left py-2 font-medium ${currentTab === 'account' ? 'text-[#1A1A1A] font-bold' : 'text-stone-600'}`}
          >
            {t('navAccount')} ({user ? user.fullName : 'Guest'})
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => handleTabClick('admin')}
              className={`block w-full text-left py-2 font-medium text-amber-800 ${currentTab === 'admin' ? 'text-[#1A1A1A] font-bold' : ''}`}
            >
              {t('navAdmin')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
