import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, Order, OrderStatus } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  CheckCircle, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Tag,
  Lock,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const AdminPanel: React.FC = () => {
  const { 
    products, 
    categories, 
    orders, 
    allUsers, 
    adminAddProduct, 
    adminUpdateProduct, 
    adminDeleteProduct, 
    adminAddCategory, 
    adminUpdateCategory, 
    adminDeleteCategory, 
    adminUpdateOrderStatus, 
    adminUpdateProductStock,
    adminUpdateUserRole,
    coupons,
    adminAddCoupon,
    adminUpdateCoupon,
    adminDeleteCoupon,
    webSettings,
    updateWebSettings,
    registerUser,
    user,
    t
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'inventory' | 'customers' | 'coupons' | 'web-settings'>('dashboard');

  // Coupon state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'flat',
    value: 10,
    minPurchase: 0
  });

  // Add Admin state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [adminAddFeedback, setAdminAddFeedback] = useState('');

  // Web Settings state
  const [webForm, setWebForm] = useState({
    logoUrl: webSettings?.logoUrl || '',
    theme: webSettings?.theme || 'gold-burgundy',
    introTitle: webSettings?.sections?.intro?.title || '',
    introSubtitle: webSettings?.sections?.intro?.subtitle || '',
    introButtonText: webSettings?.sections?.intro?.buttonText || '',
    introBg: webSettings?.sections?.intro?.backgroundImage || '',
    introVisible: webSettings?.sections?.intro?.visible ?? true,
    couponTitle: webSettings?.sections?.coupon?.title || '',
    couponDesc: webSettings?.sections?.coupon?.description || '',
    couponButtonText: webSettings?.sections?.coupon?.buttonText || '',
    couponBg: webSettings?.sections?.coupon?.backgroundImage || '',
    couponVisible: webSettings?.sections?.coupon?.visible ?? true,
    categoriesVisible: webSettings?.sections?.categories?.visible ?? true,
    featuredVisible: webSettings?.sections?.featured?.visible ?? true,
    arrivalsVisible: webSettings?.sections?.arrivals?.visible ?? true,
  });

  React.useEffect(() => {
    if (webSettings) {
      setWebForm({
        logoUrl: webSettings.logoUrl || '',
        theme: webSettings.theme || 'gold-burgundy',
        introTitle: webSettings.sections?.intro?.title || '',
        introSubtitle: webSettings.sections?.intro?.subtitle || '',
        introButtonText: webSettings.sections?.intro?.buttonText || '',
        introBg: webSettings.sections?.intro?.backgroundImage || '',
        introVisible: webSettings.sections?.intro?.visible ?? true,
        couponTitle: webSettings.sections?.coupon?.title || '',
        couponDesc: webSettings.sections?.coupon?.description || '',
        couponButtonText: webSettings.sections?.coupon?.buttonText || '',
        couponBg: webSettings.sections?.coupon?.backgroundImage || '',
        couponVisible: webSettings.sections?.coupon?.visible ?? true,
        categoriesVisible: webSettings.sections?.categories?.visible ?? true,
        featuredVisible: webSettings.sections?.featured?.visible ?? true,
        arrivalsVisible: webSettings.sections?.arrivals?.visible ?? true,
      });
    }
  }, [webSettings]);

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    originalPrice: 0,
    discountPrice: 0,
    stock: 0,
    images: [''],
    featured: false,
    newArrival: false
  });

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    image: ''
  });

  // View Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Re-verify Admin Credentials State
  const [adminVerified, setAdminVerified] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setVerifyError('');
    setVerifying(true);
    try {
      await signInWithEmailAndPassword(auth, user.email, verifyPassword);
      setAdminVerified(true);
    } catch (err: any) {
      console.error(err);
      setVerifyError('Authentication failed. Invalid administrator password.');
    } finally {
      setVerifying(false);
    }
  };

  // Check if current user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 ring-4 ring-red-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Access Denied</h2>
          <p className="mt-3 text-sm text-stone-500 font-sans leading-relaxed">
            This panel is reserved for authorized administrators. Please navigate to the <strong>Account</strong> tab in the header and sign in with your administrative credentials to enter.
          </p>
          <div className="mt-6 rounded-lg bg-stone-50 p-4 border border-stone-100 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Administrative Credentials:</h4>
            <div className="text-xs font-mono text-stone-600 mt-2 space-y-1">
              <div><span className="font-semibold select-all">Email:</span> maheealmahmud@gmail.com</div>
              <div><span className="font-semibold select-all">Password:</span> 123456789</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Security Verification challenge
  if (user && user.role === 'admin' && !adminVerified) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 font-sans">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-md animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] text-white mb-3 ring-4 ring-[#C5A059]/10">
              <Lock className="h-6 w-6 text-[#C5A059]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Secure Admin Verification</h2>
            <p className="mt-1.5 text-xs text-stone-500 font-medium">
              You are signed in as {user.fullName}. Please enter your password to unlock the Admin Dashboard.
            </p>
          </div>

          <form onSubmit={handleVerifyAdmin} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Administrator Email</label>
              <input 
                type="email" 
                disabled
                value={user.email}
                className="w-full rounded-lg border border-stone-100 bg-stone-50 px-3 py-2.5 text-stone-500 font-semibold cursor-not-allowed outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Enter Password</label>
              <div className="relative">
                <input 
                  type={showAdminPassword ? "text" : "password"} 
                  required 
                  autoFocus
                  placeholder="••••••••"
                  value={verifyPassword} 
                  onChange={e => setVerifyPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 pl-3 pr-10 py-2.5 focus:border-[#1A1A1A] focus:outline-none font-semibold" 
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-[#1A1A1A] focus:outline-none"
                  title={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {verifyError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={verifying}
              className="w-full rounded-lg bg-[#1A1A1A] py-3 font-bold text-white transition-colors hover:bg-[#C5A059] disabled:bg-stone-300"
            >
              {verifying ? 'Authenticating...' : 'Verify & Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Product Form CRUD Handlers
  // =========================================================================
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      sku: '',
      category: categories[0]?.id || 'rings',
      description: '',
      originalPrice: 100,
      discountPrice: 0,
      stock: 10,
      images: [''],
      featured: false,
      newArrival: false
    });
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.description,
      originalPrice: p.originalPrice,
      discountPrice: p.discountPrice || 0,
      stock: p.stock,
      images: p.images.length > 0 ? p.images : [''],
      featured: p.featured,
      newArrival: p.newArrival
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...prodForm,
      originalPrice: Number(prodForm.originalPrice),
      discountPrice: prodForm.discountPrice ? Number(prodForm.discountPrice) : undefined,
      stock: Number(prodForm.stock),
      images: prodForm.images.filter(img => img.trim() !== '')
    };

    try {
      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, payload);
      } else {
        await adminAddProduct(payload);
      }
      setShowProductModal(false);
    } catch (err) {
      alert('Error updating product: ' + err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this jewelry item?')) {
      await adminDeleteProduct(id);
    }
  };

  // =========================================================================
  // Category Form CRUD Handlers
  // =========================================================================
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', slug: '', image: '' });
    setShowCategoryModal(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatForm({ name: c.name, slug: c.slug, image: c.image || '' });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminUpdateCategory(editingCategory.id, catForm);
      } else {
        await adminAddCategory(catForm);
      }
      setShowCategoryModal(false);
    } catch (e) {
      alert('Error saving category: ' + e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await adminDeleteCategory(id);
    }
  };

  // =========================================================================
  // Coupon CRUD Handlers
  // =========================================================================
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: couponForm.code.toUpperCase().trim(),
      discountType: couponForm.discountType,
      value: Number(couponForm.value),
      minPurchase: Number(couponForm.minPurchase) || 0
    };
    try {
      if (editingCoupon) {
        await adminUpdateCoupon(editingCoupon.code, payload);
      } else {
        await adminAddCoupon(payload);
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
    } catch (err: any) {
      alert('Error saving coupon: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      try {
        await adminDeleteCoupon(code);
      } catch (err: any) {
        alert('Error deleting coupon: ' + err.message);
      }
    }
  };

  const openAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discountType: 'percent',
      value: 10,
      minPurchase: 100
    });
    setShowCouponModal(true);
  };

  const openEditCoupon = (c: any) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      discountType: c.discountType,
      value: c.value,
      minPurchase: c.minPurchase || 0
    });
    setShowCouponModal(true);
  };

  // =========================================================================
  // Web Settings & Section Order Handlers
  // =========================================================================
  const handleUpdateHomepageOrder = async (sectionId: string, direction: 'up' | 'down') => {
    const order = [...(webSettings?.sectionsOrder || ['intro', 'categories', 'featured', 'coupon', 'arrivals'])];
    const idx = order.indexOf(sectionId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= order.length) return;
    
    // Swap
    const temp = order[idx];
    order[idx] = order[newIdx];
    order[newIdx] = temp;
    
    try {
      await updateWebSettings({ sectionsOrder: order });
    } catch (e: any) {
      alert('Error updating homepage order: ' + e.message);
    }
  };

  const handleToggleSectionVisibility = async (sectionId: string, currentVal: boolean) => {
    const currentSections = webSettings?.sections || {
      intro: { visible: true, title: '', subtitle: '', buttonText: '', backgroundImage: '' },
      categories: { visible: true },
      featured: { visible: true },
      coupon: { visible: true, title: '', description: '', buttonText: '', backgroundImage: '' },
      arrivals: { visible: true }
    };
    
    const updated = {
      ...currentSections,
      [sectionId]: {
        ...currentSections[sectionId as keyof typeof currentSections],
        visible: !currentVal
      }
    };
    
    try {
      await updateWebSettings({ sections: updated as any });
    } catch (e: any) {
      alert('Error saving section visibility: ' + e.message);
    }
  };

  const handleSaveSectionContent = async (sectionId: 'intro' | 'coupon' | 'general') => {
    const currentSections = webSettings?.sections || {
      intro: { visible: true, title: '', subtitle: '', buttonText: '', backgroundImage: '' },
      categories: { visible: true },
      featured: { visible: true },
      coupon: { visible: true, title: '', description: '', buttonText: '', backgroundImage: '' },
      arrivals: { visible: true }
    };

    let updated = { ...currentSections };

    if (sectionId === 'intro') {
      updated.intro = {
        title: webForm.introTitle,
        subtitle: webForm.introSubtitle,
        buttonText: webForm.introButtonText,
        backgroundImage: webForm.introBg,
        visible: webForm.introVisible
      };
    } else if (sectionId === 'coupon') {
      updated.coupon = {
        title: webForm.couponTitle,
        description: webForm.couponDesc,
        buttonText: webForm.couponButtonText,
        backgroundImage: webForm.couponBg,
        visible: webForm.couponVisible
      };
    }

    try {
      await updateWebSettings({ 
        sections: updated as any,
        logoUrl: webForm.logoUrl,
        theme: webForm.theme
      });
      alert('Settings updated successfully!');
    } catch (e: any) {
      alert('Error updating homepage content: ' + e.message);
    }
  };

  // =========================================================================
  // Admin Creator Handler
  // =========================================================================
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAddFeedback('');
    if (!adminForm.email.includes('admin') && !adminForm.email.includes('bijora') && adminForm.email !== 'maheealmahmud@gmail.com') {
      setAdminAddFeedback('For automatic promotion, please include "admin" in the email (e.g. maheeadmin@gmail.com). Or create the account and use the "Promote" button in the Customers tab.');
      return;
    }
    try {
      await registerUser(adminForm.fullName, adminForm.email, adminForm.phone, adminForm.password);
      setAdminAddFeedback('Administrator registered successfully!');
      setAdminForm({ fullName: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setAdminAddFeedback('Failed to register administrator: ' + err.message);
    }
  };

  // Statistics Computations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const totalSales = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Recharts Sales Data Preparation
  const chartData = orders
    .filter(o => o.status === 'Completed')
    .map(o => ({
      name: o.id,
      amount: o.total
    }))
    .slice(0, 10)
    .reverse();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-5 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900">{t('adminDashboard')}</h1>
          <p className="text-sm font-medium text-stone-500 font-sans">Role: Global Store Administrator ({user.fullName})</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={openAddProduct}
            className="flex items-center space-x-1.5 rounded-lg bg-[#1A1A1A] px-4 py-2.5 font-bold text-sm text-white hover:bg-[#C5A059]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Jewelry</span>
          </button>
          <button 
            onClick={openAddCategory}
            className="flex items-center space-x-1.5 rounded-lg border border-[#C5A059] bg-[#FAF5EC] px-4 py-2.5 font-bold text-sm text-[#1A1A1A] hover:bg-[#FAF5EC]/80"
          >
            <Tag className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-px mb-8 font-sans font-semibold text-sm">
        <button 
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'dashboard' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Overview & Stats
        </button>
        <button 
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'products' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Jewelry Items ({products.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'categories' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Categories ({categories.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'orders' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Customer Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'inventory' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Stock Inventory {lowStockCount > 0 && <span className="rounded bg-amber-500 text-white px-1.5 py-0.5 text-[10px] ml-1">{lowStockCount} Low</span>}
        </button>
        <button 
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'customers' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Customers ({allUsers.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('coupons')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'coupons' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Coupons ({coupons.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('web-settings')}
          className={`px-4 py-3 border-b-2 ${activeSubTab === 'web-settings' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Web Settings & Theme
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 1: OVERVIEW DASHBOARD
          ===================================================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-[#FAF5EC] p-3 text-[#C5A059]"><DollarSign className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide block">Total Earnings</span>
                <span className="text-xl font-bold text-stone-950">৳{totalSales}</span>
              </div>
            </div>
            <div className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-red-50 p-3 text-[#1A1A1A]"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide block">Total Orders</span>
                <span className="text-xl font-bold text-stone-950">{totalOrders}</span>
              </div>
            </div>
            <div className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Clock className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide block">Pending Orders</span>
                <span className="text-xl font-bold text-stone-950">{pendingOrders}</span>
              </div>
            </div>
            <div className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-green-50 p-3 text-green-600"><CheckCircle className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide block">Completed Orders</span>
                <span className="text-xl font-bold text-stone-950">{completedOrders}</span>
              </div>
            </div>
            <div className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-stone-100 p-3 text-stone-600"><Package className="h-6 w-6" /></div>
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide block">Products Listed</span>
                <span className="text-xl font-bold text-stone-950">{products.length}</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart and Quick Orders List split */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Sales Chart */}
            <div className="lg:col-span-2 rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">Completed Sales History</h3>
              <div className="h-[250px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} />
                      <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#1A1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-medium text-stone-400 italic">
                    Complete order transactions to compile sales history chart.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">Latest Activities</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between border-b border-stone-50 pb-2.5 last:border-0 font-sans text-xs">
                    <div>
                      <p className="font-bold text-stone-800">{o.customerName}</p>
                      <p className="text-stone-400">{o.id} • {o.products.length} Items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1A1A1A]">৳{o.total}</p>
                      <span className={`rounded-full px-2 py-0.5 font-bold text-[9px] uppercase ${
                        o.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center py-8 text-xs font-medium text-stone-400 italic">No order entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: PRODUCT MANAGEMENT CRUD
          ===================================================================== */}
      {activeSubTab === 'products' && (
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Featured / New</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-lg object-cover border" />
                      <div>
                        <p className="font-bold text-stone-800 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-stone-400">{p.id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-stone-600">{p.sku}</td>
                    <td className="p-4 text-xs text-[#C5A059] uppercase">{p.category}</td>
                    <td className="p-4">
                      {p.discountPrice ? (
                        <div>
                          <span className="text-[#1A1A1A] font-bold">৳{p.discountPrice} </span>
                          <span className="text-xs text-stone-400 line-through">৳{p.originalPrice}</span>
                        </div>
                      ) : (
                        <span className="text-stone-800 font-bold">৳{p.originalPrice}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.stock <= 5 ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-600'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-white uppercase">
                        {p.featured && <span className="bg-[#C5A059] px-2 py-0.5 rounded">Featured</span>}
                        {p.newArrival && <span className="bg-[#1A1A1A] px-2 py-0.5 rounded">New</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEditProduct(p)} className="p-1 text-stone-500 hover:text-[#1A1A1A] transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-stone-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: CATEGORY MANAGEMENT CRUD
          ===================================================================== */}
      {activeSubTab === 'categories' && (
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden animate-fadeIn max-w-3xl">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                <th className="p-4">Category Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-stone-50/50">
                  <td className="p-4">
                    <img src={c.image} alt={c.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-lg object-cover border" />
                  </td>
                  <td className="p-4 font-bold text-stone-800">{c.name}</td>
                  <td className="p-4 text-xs font-mono text-stone-500">{c.slug}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openEditCategory(c)} className="p-1 text-stone-500 hover:text-[#1A1A1A] transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-1 text-stone-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 4: ORDER MANAGEMENT
          ===================================================================== */}
      {activeSubTab === 'orders' && (
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Total Items</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="p-4 text-xs font-bold text-stone-800 font-mono">{o.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-stone-800">{o.customerName}</p>
                      <p className="text-xs text-stone-500">{o.customerPhone}</p>
                    </td>
                    <td className="p-4 text-xs text-stone-600">{o.products.length} Jewelry Items</td>
                    <td className="p-4 font-bold text-[#1A1A1A]">৳{o.total}</td>
                    <td className="p-4">
                      <select 
                        value={o.status}
                        onChange={(e) => adminUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider focus:outline-none ${
                          o.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="flex items-center space-x-1.5 rounded bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 text-xs text-stone-700 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-400 italic">No order entries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 5: INVENTORY MANAGEMENT
          ===================================================================== */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden animate-fadeIn max-w-4xl">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                <th className="p-4">Jewelry Details</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Modify Stock</th>
                <th className="p-4 text-right">Inventory Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-stone-50/50 text-stone-700">
                  <td className="p-4 flex items-center space-x-3">
                    <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-lg object-cover border" />
                    <span className="font-bold text-stone-800 line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-4 text-xs font-mono text-stone-500">{p.sku}</td>
                  <td className="p-4 font-bold">
                    <span className={p.stock <= 5 ? 'text-red-600 font-extrabold' : 'text-stone-800'}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => adminUpdateProductStock(p.id, Math.max(0, p.stock - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => adminUpdateProductStock(p.id, p.stock + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {p.stock === 0 ? (
                      <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 uppercase">Out of Stock</span>
                    ) : p.stock <= 5 ? (
                      <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 uppercase">Low Stock Alert</span>
                    ) : (
                      <span className="rounded bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 uppercase">Optimal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 6: CUSTOMERS VIEW
          ===================================================================== */}
      {activeSubTab === 'customers' && (
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden animate-fadeIn max-w-4xl">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">District / Location</th>
                <th className="p-4 text-right">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {allUsers.map(u => (
                <tr key={u.uid} className="hover:bg-stone-50/50 text-stone-700">
                  <td className="p-4 font-bold text-stone-800">{u.fullName}</td>
                  <td className="p-4 text-stone-600">{u.email}</td>
                  <td className="p-4 text-xs font-mono text-stone-500">{u.phoneNumber || 'Not provided'}</td>
                  <td className="p-4 text-xs text-stone-500">{u.district ? `${u.area || ''}, ${u.district}` : 'Not registered address'}</td>
                  <td className="p-4 text-right flex items-center justify-end space-x-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-[#1A1A1A] text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {u.role}
                    </span>
                    {u.uid !== user.uid && (
                      <button
                        onClick={async () => {
                          const newRole = u.role === 'admin' ? 'customer' : 'admin';
                          if (confirm(`Are you sure you want to change ${u.fullName}'s role to ${newRole}?`)) {
                            try {
                              await adminUpdateUserRole(u.uid, newRole);
                            } catch (e: any) {
                              alert(`Failed to change role: ${e.message}`);
                            }
                          }
                        }}
                        className="text-xs font-bold text-[#C5A059] hover:text-[#1A1A1A] border border-[#C5A059] rounded px-2 py-0.5 bg-[#FAF5EC] hover:bg-[#C5A059]/10 transition-colors"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 7: COUPONS VIEW
          ===================================================================== */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6 animate-fadeIn font-sans text-sm">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Discount Coupons</h3>
              <p className="text-xs text-stone-500 font-medium">Create promotional codes to deduct from the checkout balance.</p>
            </div>
            <button 
              onClick={openAddCoupon}
              className="flex items-center space-x-1 px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white font-bold rounded-lg transition-colors text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Coupon Code</span>
            </button>
          </div>

          <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EC] border-b border-amber-100 text-xs font-bold uppercase text-stone-500 tracking-wider">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Deduction Type</th>
                  <th className="p-4">Discount Value</th>
                  <th className="p-4">Min Purchase Required</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {coupons.map(c => (
                  <tr key={c.code} className="hover:bg-stone-50/50">
                    <td className="p-4 font-mono font-bold text-[#1A1A1A] text-base uppercase tracking-wider">{c.code}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${c.discountType === 'percent' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {c.discountType === 'percent' ? 'Percentage (%)' : 'Flat (৳)'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-stone-900">
                      {c.discountType === 'percent' ? `${c.value}%` : `৳${c.value}`}
                    </td>
                    <td className="p-4 text-stone-500">৳{c.minPurchase || 0}</td>
                    <td className="p-4 text-right space-x-3">
                      <button 
                        onClick={() => openEditCoupon(c)} 
                        className="text-[#C5A059] hover:text-[#1A1A1A] font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(c.code)} 
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center italic text-stone-400">No coupon codes registered yet. Click "Add Coupon Code" to seed your first discount.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 8: WEB SETTINGS & CUSTOM HOMEPAGE
          ===================================================================== */}
      {activeSubTab === 'web-settings' && (
        <div className="space-y-8 animate-fadeIn font-sans text-sm pb-12">
          
          {/* Card 1: Brand & Theme Logo settings */}
          <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b pb-2">Website Branding & Design Themes</h3>
              <p className="text-xs text-stone-500 mt-1">Configure your corporate logo assets and global website layout accents.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Company Logo URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/logo.png"
                  value={webForm.logoUrl}
                  onChange={e => setWebForm({ ...webForm, logoUrl: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
                <div className="mt-2.5 flex items-center space-x-3.5 bg-stone-50 p-2.5 rounded-lg border border-dashed border-stone-200">
                  <span className="text-xs text-stone-400 font-bold">Logo Preview:</span>
                  {webForm.logoUrl ? (
                    <img src={webForm.logoUrl} alt="Logo" referrerPolicy="no-referrer" className="h-8 max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-xs text-stone-500 italic">No custom logo configured. Default gold icon will render.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Global Color Theme</label>
                <select 
                  value={webForm.theme}
                  onChange={e => setWebForm({ ...webForm, theme: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                >
                  <option value="gold-burgundy">Imperial Gold & Burgundy (Default Royal)</option>
                  <option value="emerald-gold">Royal Emerald & Gold (Exquisite Green)</option>
                  <option value="midnight-dark">Midnight Slate & Charcoal (Modern High Contrast)</option>
                  <option value="rose-champagne">Soft Rose & Champagne (Gentle Romantic Elegance)</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">Dynamic design styles apply automatically across customer checkouts, headings, icons, buttons, and selection banners.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => handleSaveSectionContent('general')}
                className="rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] px-6 py-2.5 text-xs font-bold text-white transition-colors"
              >
                Save Theme & Brand Changes
              </button>
            </div>
          </div>

          {/* Card 2: Homepage sections sequence & toggle visual state */}
          <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b pb-2">Homepage Sections - Order & Visibility Controls</h3>
              <p className="text-xs text-stone-500 mt-1">Re-arrange or hide homepage sections dynamically using real-time database settings. No code rebuild necessary.</p>
            </div>

            <div className="space-y-3 max-w-2xl">
              {(() => {
                const order = webSettings?.sectionsOrder || ['intro', 'categories', 'featured', 'coupon', 'arrivals'];
                const currentSections = webSettings?.sections || {
                  intro: { visible: true },
                  categories: { visible: true },
                  featured: { visible: true },
                  coupon: { visible: true },
                  arrivals: { visible: true }
                };

                const sectionLabels: Record<string, string> = {
                  intro: 'Intro / Elegant Hero Banner Section',
                  categories: 'Browse Categories Section',
                  featured: 'Curated Featured Jewels Collection',
                  coupon: 'Promotional Banner & Season Coupons Section',
                  arrivals: 'Latest New Arrivals Section'
                };

                return order.map((sectionId, idx) => {
                  const sectionConf = currentSections[sectionId as keyof typeof currentSections] || { visible: true };
                  const isVisible = sectionConf.visible ?? true;

                  return (
                    <div 
                      key={sectionId}
                      className="flex items-center justify-between border border-stone-100 bg-stone-50/50 hover:bg-stone-50 p-4 rounded-xl shadow-sm transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded">Rank #{idx + 1}</span>
                        <span className="font-bold text-stone-800">{sectionLabels[sectionId] || sectionId}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Toggle show/hide checkmark button */}
                        <button 
                          onClick={() => handleToggleSectionVisibility(sectionId, isVisible)}
                          className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs font-bold border transition-colors ${
                            isVisible 
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                              : 'bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200'
                          }`}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        {/* Reordering Up/Down controls */}
                        <div className="flex items-center space-x-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => handleUpdateHomepageOrder(sectionId, 'up')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-white border"
                            title="Move section up"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button 
                            disabled={idx === order.length - 1}
                            onClick={() => handleUpdateHomepageOrder(sectionId, 'down')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-white border"
                            title="Move section down"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Card 3: Hero section text & BG configuration */}
          <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b pb-2">Custom Intro / Elegant Hero Banner Texts</h3>
              <p className="text-xs text-stone-500 mt-1">Adjust headers, subtitles, buttons, and backdrop assets dynamically on your landing banner.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Banner Title</label>
                <input 
                  type="text" 
                  value={webForm.introTitle}
                  onChange={e => setWebForm({ ...webForm, introTitle: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Background Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/... (must be a valid image link)"
                  value={webForm.introBg}
                  onChange={e => setWebForm({ ...webForm, introBg: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Banner Subtitle / Description</label>
                <textarea 
                  rows={2}
                  value={webForm.introSubtitle}
                  onChange={e => setWebForm({ ...webForm, introSubtitle: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Button Call-to-Action Text</label>
                <input 
                  type="text" 
                  value={webForm.introButtonText}
                  onChange={e => setWebForm({ ...webForm, introButtonText: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => handleSaveSectionContent('intro')}
                className="rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] px-6 py-2.5 text-xs font-bold text-white transition-colors"
              >
                Save Hero Banner Text & Image
              </button>
            </div>
          </div>

          {/* Card 4: Coupon section text & BG configuration */}
          <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b pb-2">Custom Promotional Coupon Section</h3>
              <p className="text-xs text-stone-500 mt-1">Adjust headers, details, background images, and button triggers for the seasonal discount card.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Coupon Block Title</label>
                <input 
                  type="text" 
                  value={webForm.couponTitle}
                  onChange={e => setWebForm({ ...webForm, couponTitle: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Promo Backdrop Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/... (must be a valid image link)"
                  value={webForm.couponBg}
                  onChange={e => setWebForm({ ...webForm, couponBg: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Promo Description Texts</label>
                <textarea 
                  rows={2}
                  value={webForm.couponDesc}
                  onChange={e => setWebForm({ ...webForm, couponDesc: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Promo CTA Button Text</label>
                <input 
                  type="text" 
                  value={webForm.couponButtonText}
                  onChange={e => setWebForm({ ...webForm, couponButtonText: e.target.value })}
                  className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => handleSaveSectionContent('coupon')}
                className="rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] px-6 py-2.5 text-xs font-bold text-white transition-colors"
              >
                Save Promotional Banner Details
              </button>
            </div>
          </div>

          {/* Card 5: Add Administrators panel */}
          <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b pb-2">Add Store Administrators</h3>
              <p className="text-xs text-stone-500 mt-1">Register new administrative accounts directly. Tip: Include 'admin' in their email to grant global administrative privileges on creation instantly.</p>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mahmudul Hasan"
                    value={adminForm.fullName}
                    onChange={e => setAdminForm({ ...adminForm, fullName: e.target.value })}
                    className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. hasanadmin@gmail.com"
                    value={adminForm.email}
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 01712345678"
                    value={adminForm.phone}
                    onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Secure Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Min 6 characters"
                    value={adminForm.password}
                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full text-sm rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
              </div>

              {adminAddFeedback && (
                <div className={`p-3 rounded-lg text-xs font-bold ${adminAddFeedback.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                  {adminAddFeedback}
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <button 
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] px-6 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Register Administrator
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* =====================================================================
          COUPON MODAL: CREATE/EDIT COUPON DETAIL
          ===================================================================== */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans text-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">
            <button 
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-[#1A1A1A]"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-serif text-2xl font-bold text-stone-950 mb-4">
              {editingCoupon ? 'Modify Coupon Code Details' : 'Add New Discount Coupon'}
            </h2>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Coupon Code (e.g. BIJORA10)</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingCoupon}
                  placeholder="BIJORA10"
                  value={couponForm.code}
                  onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none font-mono uppercase font-bold tracking-widest disabled:bg-stone-50 disabled:cursor-not-allowed" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Discount Type</label>
                  <select 
                    value={couponForm.discountType}
                    onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as 'percent' | 'fixed' })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={couponForm.value}
                    onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none font-bold" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Minimum Purchase Requirement (৳)</label>
                <input 
                  type="number" 
                  min={0}
                  placeholder="e.g. 500"
                  value={couponForm.minPurchase}
                  onChange={e => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] py-3 text-sm font-bold text-white transition-colors shadow mt-2"
              >
                {editingCoupon ? 'Apply Updates' : 'Add Coupon Code to Store'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ADD/EDIT PRODUCT
          ===================================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto font-sans text-sm">
            <button 
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-[#1A1A1A]"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-serif text-2xl font-bold text-stone-950 mb-6">
              {editingProduct ? 'Edit Jewelry Details' : 'Add New Jewelry Masterpiece'}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={prodForm.name}
                    onChange={e => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">SKU Code</label>
                  <input 
                    type="text" 
                    required
                    value={prodForm.sku}
                    onChange={e => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Category</label>
                  <select 
                    value={prodForm.category}
                    onChange={e => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Original Price (৳)</label>
                  <input 
                    type="number" 
                    required
                    value={prodForm.originalPrice}
                    onChange={e => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Discount Price (৳)</label>
                  <input 
                    type="number" 
                    value={prodForm.discountPrice}
                    onChange={e => setProdForm({ ...prodForm, discountPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={prodForm.stock}
                    onChange={e => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                  />
                </div>
                <div className="flex items-center space-x-6 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-stone-700">
                    <input 
                      type="checkbox" 
                      checked={prodForm.featured}
                      onChange={e => setProdForm({ ...prodForm, featured: e.target.checked })}
                      className="rounded border-stone-300 text-[#1A1A1A] focus:ring-[#1A1A1A]"
                    />
                    <span>Featured Item</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-stone-700">
                    <input 
                      type="checkbox" 
                      checked={prodForm.newArrival}
                      onChange={e => setProdForm({ ...prodForm, newArrival: e.target.checked })}
                      className="rounded border-stone-300 text-[#1A1A1A] focus:ring-[#1A1A1A]"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Product Description</label>
                <textarea 
                  rows={3}
                  required
                  value={prodForm.description}
                  onChange={e => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Image URL</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={prodForm.images[0]}
                  onChange={e => setProdForm({ ...prodForm, images: [e.target.value] })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="rounded-lg border px-4 py-2.5 font-bold text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-lg bg-[#1A1A1A] px-5 py-2.5 font-bold text-white hover:bg-[#C5A059]"
                >
                  Save Masterpiece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ADD/EDIT CATEGORY
          ===================================================================== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl font-sans text-sm">
            <button 
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-[#1A1A1A]"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-serif text-xl font-bold text-stone-950 mb-6">
              {editingCategory ? 'Edit Jewelry Category' : 'Create New Category'}
            </h2>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-') })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Slug Identifier</label>
                <input 
                  type="text" 
                  required
                  value={catForm.slug}
                  onChange={e => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none font-mono text-xs" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Cover Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  value={catForm.image}
                  onChange={e => setCatForm({ ...catForm, image: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 focus:border-[#1A1A1A] focus:outline-none" 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-lg border px-4 py-2.5 font-bold text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-lg bg-[#1A1A1A] px-5 py-2.5 font-bold text-white hover:bg-[#C5A059]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: VIEW ORDER DETAILS
          ===================================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto font-sans text-sm">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-[#1A1A1A]"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-serif text-2xl font-bold text-stone-950 mb-1">
              Order Receipt Overview
            </h2>
            <p className="text-xs text-stone-400 font-bold font-mono mb-6">{selectedOrder.id}</p>

            <div className="space-y-6">
              {/* Customer summary */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">Customer Deliveries</h4>
                <p className="font-bold text-stone-800">{selectedOrder.customerName}</p>
                <p className="text-xs text-stone-600">Mobile: {selectedOrder.customerPhone}</p>
                <p className="text-xs text-stone-600 mt-1">
                  Address: {selectedOrder.address}, {selectedOrder.area}, {selectedOrder.district}
                </p>
                {selectedOrder.orderNote && (
                  <p className="text-xs text-amber-800 italic mt-2">Note: {selectedOrder.orderNote}</p>
                )}
              </div>

              {/* Items summary */}
              <div>
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Ordered Items</h4>
                <div className="divide-y divide-stone-100">
                  {selectedOrder.products.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 font-medium">
                      <div className="flex items-center space-x-3">
                        <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="h-9 w-9 rounded object-cover" />
                        <div>
                          <p className="font-bold text-stone-800 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-stone-400">Qty: {p.quantity} @ ৳{p.price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#1A1A1A]">৳{p.price * p.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-stone-100 pt-4 space-y-1.5 font-sans text-xs">
                <div className="flex justify-between text-stone-500 font-semibold">
                  <span>Subtotal:</span>
                  <span>৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500 font-semibold">
                  <span>Shipping:</span>
                  <span>৳{selectedOrder.shippingCharge}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Discount:</span>
                    <span>-৳{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t">
                  <span>Total Bill:</span>
                  <span>৳{selectedOrder.total}</span>
                </div>
              </div>

              {/* Quick Status Mod */}
              <div className="pt-4 flex items-center justify-between border-t">
                <span className="text-xs font-bold text-stone-500">Modify Order Status:</span>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => {
                    adminUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value as OrderStatus });
                  }}
                  className="rounded-lg border px-3 py-1.5 font-semibold text-xs focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-stone-900 text-white px-5 py-2 font-bold hover:bg-stone-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
