import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setTab: (tab: string) => void;
  setSelectedCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setTab, setSelectedCategory }) => {
  const { t } = useStore();
  const [showPopup, setShowPopup] = useState(false);

  const handleCategoryClick = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicyClick = (policyType: string) => {
    alert(`This is a demo store. In a production environment, this link would redirect to our comprehensive ${policyType} document.`);
  };

  return (
    <footer className="bg-[#1A1A1A] text-stone-300 border-t-2 border-[#C5A059]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] text-white ring-2 ring-[#C5A059]">
                <Sparkles className="h-5 w-5 text-[#C5A059]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-widest text-white uppercase block leading-none">
                {t('brand')}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 font-sans">
              Handcrafting standard heritage jewelry with 18k and 22k pure gold, precious gemstones, and organic pearls. Merging sacred geometries and modern aesthetics for eternal beauty.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 transition-colors hover:text-[#C5A059]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 transition-colors hover:text-[#C5A059]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 transition-colors hover:text-[#C5A059]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories links */}
          <div>
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-white border-b border-[#C5A059]/20 pb-2 mb-4">
              {t('navCategories')}
            </h3>
            <ul className="space-y-2 text-sm font-sans font-medium">
              <li>
                <button onClick={() => handleCategoryClick('rings')} className="hover:text-[#C5A059] transition-colors">Rings</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('necklaces')} className="hover:text-[#C5A059] transition-colors">Necklaces</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('earrings')} className="hover:text-[#C5A059] transition-colors">Earrings</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('bracelets')} className="hover:text-[#C5A059] transition-colors">Bracelets & Bangles</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('sets')} className="hover:text-[#C5A059] transition-colors">Jewellery Sets</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('anklets')} className="hover:text-[#C5A059] transition-colors">Anklets</button>
              </li>
            </ul>
          </div>

          {/* Quick Links / Policies */}
          <div>
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-white border-b border-[#C5A059]/20 pb-2 mb-4">
              Legal & Policies
            </h3>
            <ul className="space-y-2 text-sm font-sans font-medium">
              <li>
                <button onClick={() => handlePolicyClick('Privacy Policy')} className="hover:text-[#C5A059] transition-colors text-left">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('Terms & Conditions')} className="hover:text-[#C5A059] transition-colors text-left">Terms & Conditions</button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('Sales Policy')} className="hover:text-[#C5A059] transition-colors text-left">Sales & Refund Policy</button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('FAQ')} className="hover:text-[#C5A059] transition-colors text-left">Frequently Asked Questions</button>
              </li>
            </ul>
          </div>

          {/* Address & Contact Info */}
          <div>
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-white border-b border-[#C5A059]/20 pb-2 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm font-sans">
              <li className="flex items-start space-x-3 text-stone-400">
                <MapPin className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
                <span>House 42, Road 11, Banani, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-3 text-stone-400">
                <Phone className="h-5 w-5 text-[#C5A059] shrink-0" />
                <span>+880 1538-362226</span>
              </li>
              <li className="flex items-center space-x-3 text-stone-400">
                <Mail className="h-5 w-5 text-[#C5A059] shrink-0" />
                <span>bijoraforyou@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between font-sans text-xs text-stone-500 font-medium">
          <p>© {new Date().getFullYear()} Bijora Jewellers Ltd. All rights reserved by <button onClick={() => setShowPopup(true)} className="underline hover:text-[#C5A059] cursor-pointer focus:outline-none">Mahee Al Mahmud</button>.</p>
          <p className="mt-4 md:mt-0">Premium Ornate Masterpieces • Banani, Dhaka</p>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-stone-900 border border-[#C5A059]/40 p-6 text-center text-white shadow-xl animate-scaleIn">
            <h3 className="font-serif text-lg font-bold text-[#C5A059] mb-2">Developer Info</h3>
            <p className="font-sans text-sm text-stone-200 mb-4">
              Developed by <strong className="text-[#C5A059]">Mahee Al Mahmud</strong>
            </p>
            <p className="font-sans text-xs text-stone-400 mb-6">
              Contact for query: <a href="mailto:maheealmahmud@gmail.com" className="text-[#C5A059] underline hover:text-stone-200">maheealmahmud@gmail.com</a>
            </p>
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full rounded-lg bg-[#C5A059] py-2 text-xs font-bold text-stone-950 hover:bg-[#d6b76c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-stone-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
