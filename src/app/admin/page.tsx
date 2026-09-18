'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, ShopSettings, Product, CustomerFeedback, ProductVariant, ComboTier, Category } from '@/types';
import { formatVND } from '@/lib/utils';
import { INITIAL_PRODUCTS } from '@/data/products';
import { compressImage } from '@/lib/imageCompress';
import { 
  Package, 
  Sparkles, 
  Settings, 
  Layers, 
  BellRing,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  Lock,
  LogOut,
  KeyRound,
  Plus,
  Trash2,
  Edit3,
  X,
  Tag,
  Star,
  MessageSquare,
  Instagram,
  Share2,
  CheckCircle2,
  Truck,
  Palette,
  Boxes,
  DollarSign,
  Info,
  UploadCloud,
  ImagePlus,
  Search,
  AlertTriangle,
  ArrowRight,
  Clock,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Calendar,
  CreditCard,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ADMIN_PIN = '123456';
const PIN_CODE = '123456';
const PIN_CODE_ALT = 'omachi888';

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Omachi 🌸 Phụ Kiện Handmade & Charm',
  brandTitle: 'OMACHI HANDMADE STORE',
  slogan: 'Vòng cườm, kẹp tóc pastel, charm hoa xinh lấp lánh custom theo yêu cầu ✨',
  hotline: '0398445122',
  zaloPhone: '0398445122',
  zaloOfficialUrl: 'https://zalo.me/0375408256',
  instagramUrl: 'https://instagram.com/omachii18',
  instagramHandle: '@omachii18',
  tiktokUrl: 'https://tiktok.com/@omachi_charm',
  tiktokHandle: '@omachi_charm',
  heroTitle: 'Vòng Charm, Kẹp Tóc & Phụ Kiện Pastel',
  heroSubtitle: 'Khám phá thế giới charm trong veo, kẹp hoa kem bơ và vòng tay handmade đan thủ công theo phong cách của riêng bạn ✨',
  bannerText: '🌸 Tiệm Phụ Kiện Handmade Omachi • Nhận làm vòng tay & charm theo yêu cầu ✨',
  showFeedbacks: true,
  shopAddress: 'Hà Nội, Việt Nam',
  workingHours: '08:30 - 22:00 Hàng ngày',
  freeShippingThreshold: 200000,
  prepaidFreeShipThreshold: 10000,
  enablePrepaidFreeShip: true,
  bankId: 'VCB',
  bankAccount: '1018880066',
  bankOwner: 'DUong QUOC KHANH',
  telegramBotToken: '8643883325:AAFtYvON3zYNH6D8K1Mf8bTtHclR1ha92SQ',
  telegramChatId: '8941847464',
  enableTelegramNotify: true,
  websiteUrl: '',
  autoReplyTemplate: 'Chào bạn, Shop Omachi đã nhận được đơn hàng #{orderCode}. Shop sẽ kiểm tra mẫu và báo lại bạn ngay nhé!',
  heroImage: '/images/charm_feed_1.jpg',
  heroBadge: 'Ảnh thật tại tiệm 100% ✨',
  purchasePolicies: [
    {
      icon: '📦',
      title: 'Đồng Kiểm Khi Nhận Hàng',
      desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.',
    },
    {
      icon: '🔄',
      title: 'Đổi Trả 1-1 Trong 48 Giờ',
      desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.',
    },
    {
      icon: '🎀',
      title: '100% Ảnh Thật Tại Xưởng',
      desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.',
    },
    {
      icon: '🚚',
      title: 'Gói Quà Pastel & Giao Nhanh',
      desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.',
    },
  ],
  purchasePolicyDetail: 'Khách hàng vui lòng quay video khi bóc mở kiện hàng để được hỗ trợ giải quyết nhanh nhất khi có phát sinh lỗi hoặc thiếu mẫu.',
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'revenue' | 'categories' | 'feedbacks' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isStatusComboboxOpen, setIsStatusComboboxOpen] = useState(false);
  const statusComboboxRef = useRef<HTMLDivElement>(null);
  const [revenuePeriodFilter, setRevenuePeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [revenuePaymentFilter, setRevenuePaymentFilter] = useState<'all' | 'PAID' | 'UNPAID'>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [testZaloStatus, setTestZaloStatus] = useState<string>('');
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [shippingFeeInputs, setShippingFeeInputs] = useState<{ [orderId: string]: string }>({});

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (statusComboboxRef.current && !statusComboboxRef.current.contains(e.target as Node)) {
        setIsStatusComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Packing checklist state for admin orders
  const [checkedPackingItems, setCheckedPackingItems] = useState<{ [key: string]: boolean }>({});
  const toggleCheckPackingItem = (key: string) => {
    setCheckedPackingItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupOrderItems = (items: any[]) => {
    const groups: {
      [key: string]: {
        productId: string;
        productName: string;
        image?: string;
        basePrice: number;
        totalQty: number;
        totalAmount: number;
        items: any[];
      };
    } = {};

    (items || []).forEach((it: any) => {
      const pId = it.productId || it.product?.id || it.productName || 'unknown';
      if (!groups[pId]) {
        groups[pId] = {
          productId: pId,
          productName: it.product?.name || it.productName || 'Sản phẩm',
          image: it.product?.images?.[0] || it.productImage || '/images/charm_feed_1.jpg',
          basePrice: Number(it.originalUnitPrice || it.product?.basePrice || it.appliedUnitPrice || 0),
          totalQty: 0,
          totalAmount: 0,
          items: [],
        };
      }
      groups[pId].items.push(it);
      groups[pId].totalQty += Number(it.quantity || 1);
      groups[pId].totalAmount += Number(it.totalPrice || 0);
    });

    return Object.values(groups);
  };

  // Inventory & Product Filters
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState<string>('');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productModalTab, setProductModalTab] = useState<'BASIC' | 'PRICING' | 'MEDIA'>('BASIC');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Supabase Cloud Database state
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  const handleSyncSupabase = async () => {
    setSupabaseSyncing(true);
    setSupabaseStatusMsg('Đang đồng bộ dữ liệu lên Supabase Cloud Database...');
    try {
      const res = await fetch('/api/admin/supabase-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSupabaseConnected(true);
        setSupabaseStatusMsg(`✅ ${data.message}`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else {
        setSupabaseStatusMsg(`⚠️ ${data.error || 'Đồng bộ thất bại'}`);
      }
    } catch (err: any) {
      setSupabaseStatusMsg(`❌ Lỗi kết nối: ${err.message || err}`);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const handleCheckSupabase = async () => {
    setSupabaseSyncing(true);
    setSupabaseStatusMsg('Đang kiểm tra kết nối Supabase...');
    try {
      const res = await fetch('/api/admin/supabase-sync');
      const data = await res.json();
      if (data.success && data.tablesCreated) {
        setSupabaseConnected(true);
        setSupabaseStatusMsg(`✅ Supabase hoạt động hoàn hảo! (${data.stats?.ordersCount ?? 0} đơn, ${data.stats?.productsCount ?? 0} sản phẩm, ${data.stats?.categoriesCount ?? 0} danh mục)`);
      } else if (data.connected && !data.tablesCreated) {
        setSupabaseConnected(false);
        setSupabaseStatusMsg('⚠️ Đã kết nối Supabase nhưng bảng chưa được tạo. Vui lòng dán file supabase-schema.sql vào Supabase SQL Editor và nhấn Run!');
      } else {
        setSupabaseConnected(false);
        setSupabaseStatusMsg(`⚠️ ${data.error || 'Chưa thể kết nối tới Supabase'}`);
      }
    } catch (err: any) {
      setSupabaseConnected(false);
      setSupabaseStatusMsg(`❌ Lỗi: ${err.message || err}`);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  // Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Partial<CustomerFeedback> | null>(null);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setImageUploadError('');

    try {
      const fileList = Array.from(files);
      const uploadPromises = fileList.map(async (rawFile) => {
        try {
          const compressed = await compressImage(rawFile, 900, 0.8);
          const formData = new FormData();
          formData.append('file', compressed.file);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.url) {
            return data.url as string;
          } else if (compressed.dataUrl) {
            return compressed.dataUrl as string;
          }
        } catch (singleErr) {
          console.error('Upload single error:', singleErr);
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter((url): url is string => Boolean(url));

      if (validUrls.length > 0) {
        if (editingProduct) {
          const existing = (editingProduct.images || []).filter(Boolean);
          setEditingProduct({
            ...editingProduct,
            images: [...existing, ...validUrls],
          });
        }
      } else {
        setImageUploadError('Không thể tải ảnh lên. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setImageUploadError('Lỗi kết nối khi tải ảnh: ' + (err.message || err));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Hero banner image upload state
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [heroImageUploadError, setHeroImageUploadError] = useState('');

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHeroImage(true);
    setHeroImageUploadError('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        let fileToUpload = rawFile;
        let fallbackUrl = '';

        try {
          const compressed = await compressImage(rawFile, 1600, 0.82);
          fileToUpload = compressed.file;
          fallbackUrl = compressed.dataUrl;
        } catch (compErr) {
          console.warn('Lỗi nén ảnh banner:', compErr);
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.url) {
            uploadedUrls.push(data.url);
          } else if (fallbackUrl) {
            uploadedUrls.push(fallbackUrl);
          }
        } catch {
          if (fallbackUrl) {
            uploadedUrls.push(fallbackUrl);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        setSettings((prev) => {
          const existing = (prev.heroImages && prev.heroImages.length > 0)
            ? prev.heroImages.filter(Boolean)
            : (prev.heroImage ? [prev.heroImage] : []);
          const combined = [...existing, ...uploadedUrls];
          return {
            ...prev,
            heroImage: combined[0],
            heroImages: combined,
          };
        });
        setActionSuccessMsg(`Đã tải lên +${uploadedUrls.length} ảnh banner thành công! Hãy bấm Lưu Cài Đặt ✨`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        setHeroImageUploadError('Lỗi khi tải ảnh banner');
      }
    } catch (err: any) {
      setHeroImageUploadError('Lỗi kết nối khi tải ảnh: ' + (err.message || err));
    } finally {
      setUploadingHeroImage(false);
      e.target.value = '';
    }
  };

  // Wholesale Template Helpers
  const handleSaveCurrentTiersAsShopDefault = async () => {
    if (!editingProduct?.comboTiers || editingProduct.comboTiers.length === 0) {
      alert('Vui lòng thêm ít nhất 1 mốc sỉ trước khi lưu làm mẫu!');
      return;
    }
    const base = Number(editingProduct.basePrice) || 1;
    const tiersToSave = editingProduct.comboTiers.map(t => {
      const discountPercent = Math.max(1, Math.min(99, Math.round((1 - (t.unitPrice || 0) / base) * 100)));
      return {
        minQuantity: Number(t.minQuantity) || 10,
        discountPercent: discountPercent > 0 ? discountPercent : 10,
        unitPrice: Number(t.unitPrice) || 0,
        label: t.label || `Mốc ${t.minQuantity} cái`,
        badge: t.badge || `Tiết kiệm ${discountPercent}%`,
      };
    });

    const updatedSettings = {
      ...settings,
      customWholesaleTiers: tiersToSave,
    };
    setSettings(updatedSettings);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg('Đã lưu cấu hình các mốc này làm "Mẫu của Shop" thành công! 🎉');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        confetti({ particleCount: 35, spread: 60 });
      }
    } catch (err) {
      console.error('Lỗi khi lưu mẫu sỉ:', err);
    }
  };

  const applyShopCustomTemplate = () => {
    if (!editingProduct) return;
    const customTiers = settings.customWholesaleTiers && settings.customWholesaleTiers.length > 0
      ? settings.customWholesaleTiers
      : [
          { minQuantity: 10, discountPercent: 10, label: 'Mốc 10 cái', badge: 'Sỉ nhẹ 10%' },
          { minQuantity: 50, discountPercent: 25, label: 'Mốc 50 cái', badge: 'Tiết kiệm 25%' },
          { minQuantity: 100, discountPercent: 40, label: 'Mốc 100 cái (Sỉ VIP)', badge: 'Hot Bán Chạy 🔥' },
        ];
    const base = Number(editingProduct.basePrice) || 2000;
    const newTiers = customTiers.map(t => {
      const discount = t.discountPercent ?? (t.unitPrice && base ? Math.max(5, Math.round((1 - t.unitPrice / base) * 100)) : 10);
      const unitPrice = t.unitPrice && t.unitPrice > 0 ? t.unitPrice : Math.round(base * (1 - discount / 100));
      return {
        minQuantity: Number(t.minQuantity) || 10,
        unitPrice: unitPrice,
        label: t.label || `Mốc ${t.minQuantity} cái`,
        badge: t.badge || `Tiết kiệm ${discount}%`,
      };
    });
    setEditingProduct({
      ...editingProduct,
      comboTiers: newTiers,
    });
  };

  // Quick Restock State
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantities, setRestockQuantities] = useState<{ [key: number]: number }>({});
  const [isRestocking, setIsRestocking] = useState(false);

  const handleOpenRestock = (prod: Product) => {
    setRestockProduct(prod);
    const initial: { [key: number]: number } = {};
    prod.variants?.forEach((_, i) => { initial[i] = 0; });
    setRestockQuantities(initial);
  };

  const handleRestockPreset = (idx: number, amount: number) => {
    setRestockQuantities(prev => ({
      ...prev,
      [idx]: (prev[idx] || 0) + amount
    }));
  };

  const handleSaveRestock = async () => {
    if (!restockProduct) return;
    setIsRestocking(true);
    try {
      let addedTotal = 0;
      const updatedVariants = (restockProduct.variants || []).map((v, i) => {
        const add = Number(restockQuantities[i]) || 0;
        addedTotal += add;
        return {
          ...v,
          stock: (v.stock || 0) + add
        };
      });

      const updatedProduct: Product = {
        ...restockProduct,
        variants: updatedVariants,
        stock: (restockProduct.stock || 0) + addedTotal
      };

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setActionSuccessMsg(`✅ Nhập kho thành công +${addedTotal} sản phẩm cho "${restockProduct.name}"!`);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setRestockProduct(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestocking(false);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  const handleQuickAddStock = async (product: Product, variantIndex: number, amount: number) => {
    try {
      const updatedVariants = (product.variants || []).map((v, i) => {
        if (i === variantIndex) {
          return { ...v, stock: (v.stock || 0) + amount };
        }
        return v;
      });
      const newTotalStock = (product.stock || 0) + amount;
      const updatedProduct: Product = {
        ...product,
        variants: updatedVariants.length > 0 ? updatedVariants : undefined,
        stock: newTotalStock,
      };

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setActionSuccessMsg(`✅ Đã nhập nhanh +${amount} cái cho phân loại "${product.variants?.[variantIndex]?.name || product.name}"!`);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('omachii_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN || pinInput === 'omachi888') {
      setIsAuthenticated(true);
      sessionStorage.setItem('omachii_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Mã PIN không chính xác! Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('omachii_admin_auth');
    setPinInput('');
  };

  const fetchSettings = async () => {
    let localSaved: Partial<ShopSettings> | null = null;
    try {
      const cached = localStorage.getItem('omachi_shop_settings');
      if (cached) {
        localSaved = JSON.parse(cached);
        setSettings((prev) => ({ ...prev, ...localSaved }));
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        const merged = {
          ...DEFAULT_SETTINGS,
          ...data.data,
          websiteUrl: data.data.websiteUrl || currentOrigin,
        };
        setSettings(merged);
        try {
          localStorage.setItem('omachi_shop_settings', JSON.stringify(merged));
        } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let localOrders: Order[] = [];
      try {
        const cached = localStorage.getItem('omachi_admin_orders_v2');
        if (cached) {
          localOrders = JSON.parse(cached);
        }
        const custCached = localStorage.getItem('omachi_customer_orders');
        if (custCached) {
          const parsedCust: Order[] = JSON.parse(custCached);
          const existingIds = new Set(localOrders.map((o) => (o.id || o.code || '').toLowerCase().replace(/^#/, '').trim()));
          parsedCust.forEach((co) => {
            const k = (co.id || co.code || '').toLowerCase().replace(/^#/, '').trim();
            if (k && !existingIds.has(k)) {
              localOrders.push(co);
            }
          });
        }
      } catch (e) {}

      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const serverOrders: Order[] = data.data;
        const map = new Map<string, Order>();

        // Put server orders in map
        serverOrders.forEach((o) => {
          const key = (o.id || o.code || '').toLowerCase().replace(/^#/, '').trim();
          if (key) map.set(key, o);
        });

        // Merge local orders (recover orders created during cold-starts or with newer client edits)
        const missingOnServer: Order[] = [];
        localOrders.forEach((lo) => {
          const key = (lo.id || lo.code || '').toLowerCase().replace(/^#/, '').trim();
          if (!key) return;
          if (!map.has(key)) {
            map.set(key, lo);
            missingOnServer.push(lo);
          } else {
            const serverO = map.get(key)!;
            const sTime = new Date(serverO.updatedAt || serverO.createdAt || 0).getTime();
            const lTime = new Date(lo.updatedAt || lo.createdAt || 0).getTime();
            if (lTime > sTime) {
              map.set(key, lo);
            }
          }
        });

        const mergedOrders = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        setOrders(mergedOrders);
        try {
          localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(mergedOrders));
        } catch (e) {}

        // Auto background sync any local orders back to the server container
        if (missingOnServer.length > 0) {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ syncOrders: missingOnServer }),
          }).catch(() => {});
        }
      } else if (localOrders.length > 0) {
        setOrders(localOrders);
      }
    } catch (err) {
      console.error(err);
      try {
        const cached = localStorage.getItem('omachi_admin_orders_v2');
        if (cached) setOrders(JSON.parse(cached));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedbacks');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchCategories();
      fetchFeedbacks();
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Category CRUD Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory({
      name: '',
      icon: '🌸',
      description: '',
      displayOrder: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    setSavingCategory(true);
    try {
      const isEdit = Boolean(editingCategory.id);
      const url = '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccessMsg(isEdit ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục mới thành công! ✨');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        await fetchCategories();
        setIsCategoryModalOpen(false);

        // If user is currently editing a product, auto-select this category!
        if (editingProduct && data.data) {
          setEditingProduct((prev) => prev ? ({
            ...prev,
            category: data.data.slug,
            categoryId: data.data.id,
            categoryName: data.data.name,
          }) : null);
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra khi lưu danh mục');
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + (err.message || err));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const productsInCat = products.filter((p) => p.categoryId === id || p.category === id);
    const confirmMsg = productsInCat.length > 0
      ? `Danh mục "${name}" đang có ${productsInCat.length} sản phẩm. Bạn vẫn muốn xóa chứ?`
      : `Bạn có chắc chắn muốn xóa danh mục "${name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Đã xóa danh mục "${name}" thành công!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        await fetchCategories();
      } else {
        alert(data.error || 'Lỗi khi xóa danh mục');
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + (err.message || err));
    }
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    const timestamp = Date.now();
    const defaultCat = categories[0] || { id: 'cat-1', slug: 'beads-haul', name: 'Hạt Cườm & Beads' };
    setProductModalTab('BASIC');
    setEditingProduct({
      name: '',
      sku: `OM-PROD-${timestamp.toString().slice(-4)}`,
      category: defaultCat.slug,
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      basePrice: 0,
      originalPrice: 0,
      costPrice: 0,
      material: '',
      dimensions: '',
      weight: 50,
      images: [],
      description: '',
      isHot: false,
      isNewArrival: true,
      isCustomizable: false,
      stock: 100,
      soldCount: 0,
      rating: 5.0,
      reviewCount: 0,
      variants: [],
      comboTiers: [],
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductModalTab('BASIC');
    setEditingProduct({
      ...prod,
      variants: prod.variants || [],
      comboTiers: prod.comboTiers || [],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const trimmedName = (editingProduct.name || '').trim();
    if (!trimmedName) {
      alert('⚠️ Vui lòng nhập Tên Mẫu Charm / Sản Phẩm trước khi lưu!');
      setProductModalTab('BASIC');
      return;
    }

    setIsSavingProduct(true);

    // Coi giá lẻ là giá gốc luôn
    const finalProduct = { ...editingProduct, name: trimmedName };
    finalProduct.originalPrice = Number(finalProduct.basePrice) || 0;
    finalProduct.basePrice = Number(finalProduct.basePrice) || 0;
    finalProduct.costPrice = Number(finalProduct.costPrice) || 0;
    finalProduct.weight = Number(finalProduct.weight) > 0 ? Number(finalProduct.weight) : 50;

    // Auto calculate total stock if variants exist
    if (finalProduct.variants && finalProduct.variants.length > 0) {
      const sumVariantStock = finalProduct.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      if (sumVariantStock > 0) {
        finalProduct.stock = sumVariantStock;
      }
    }

    try {
      const isNew = !finalProduct.id;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(isNew ? 'Đã thêm mẫu charm mới thành công! ✨' : 'Đã lưu sản phẩm thành công! ✨');
        setTimeout(() => setActionSuccessMsg(''), 3500);
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        alert('❌ Không thể lưu sản phẩm: ' + (data.message || 'Lỗi không xác định từ máy chủ'));
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      alert('❌ Lỗi kết nối khi lưu sản phẩm: ' + (err.message || 'Vui lòng kiểm tra lại mạng'));
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mẫu charm "${name}" không?`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Đã xóa mẫu charm "${name}"!`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Feedback CRUD Handlers
  const handleOpenAddFeedback = () => {
    setEditingFeedback({
      customerName: '',
      customerLocation: 'Hà Nội',
      comment: '',
      rating: 5,
      purchasedProduct: 'Vòng tay cườm handmade',
    });
    setIsFeedbackModalOpen(true);
  };

  const handleOpenEditFeedback = (fb: CustomerFeedback) => {
    setEditingFeedback({ ...fb });
    setIsFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback || !editingFeedback.customerName || !editingFeedback.comment) return;

    try {
      const isNew = !editingFeedback.id;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/feedbacks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFeedback),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(isNew ? 'Đã thêm feedback mới thành công! ✨' : 'Đã cập nhật feedback thành công! ✨');
        setTimeout(() => setActionSuccessMsg(''), 3000);
        setIsFeedbackModalOpen(false);
        fetchFeedbacks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đánh giá của khách "${name}" không?`)) return;
    try {
      const res = await fetch(`/api/feedbacks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Đã xóa feedback của "${name}"!`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
        fetchFeedbacks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order Status Handler
  const handleUpdateStatus = async (orderId: string, newStatus?: OrderStatus, paymentStatus?: 'UNPAID' | 'PAID') => {
    const cleanId = (orderId || '').toLowerCase().replace(/^#/, '').trim();
    const currentOrder = orders.find(o => 
      (o.id && o.id.toLowerCase().replace(/^#/, '').trim() === cleanId) || 
      (o.code && o.code.toLowerCase().replace(/^#/, '').trim() === cleanId)
    );

    // Optimistic update
    let updatedTargetOrder: Order | undefined;
    setOrders(prev => {
      const updatedList = prev.map(o => {
        const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
        const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
        if (oId === cleanId || oCode === cleanId) {
          const updated = {
            ...o,
            ...(newStatus ? { orderStatus: newStatus } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            updatedAt: new Date().toISOString(),
          };
          updatedTargetOrder = updated;
          return updated;
        }
        return o;
      });
      try {
        localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    try {
      const payload: any = {
        id: orderId,
        order: updatedTargetOrder || currentOrder,
      };
      if (newStatus) payload.orderStatus = newStatus;
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActionSuccessMsg(`Đã cập nhật đơn #${data.data.code} thành công! ✨`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
        setOrders(prev => {
          const list = prev.map(o => {
            const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
            const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
            return (oId === cleanId || oCode === cleanId) ? { ...o, ...data.data } : o;
          });
          try {
            localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(list));
          } catch (e) {}
          return list;
        });
      } else {
        // Fallback to /api/orders
        const resFallback = await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const dataFallback = await resFallback.json();
        if (dataFallback.success && dataFallback.data) {
          setActionSuccessMsg(`Đã cập nhật đơn #${dataFallback.data.code} thành công! ✨`);
          setTimeout(() => setActionSuccessMsg(''), 3000);
          setOrders(prev => {
            const list = prev.map(o => {
              const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
              const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
              return (oId === cleanId || oCode === cleanId) ? { ...o, ...dataFallback.data } : o;
            });
            try {
              localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(list));
            } catch (e) {}
            return list;
          });
        } else {
          setActionSuccessMsg(`Đã lưu trạng thái đơn #${currentOrder?.code || orderId} tại bộ nhớ Admin! ✨`);
          setTimeout(() => setActionSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setActionSuccessMsg(`Đã lưu trạng thái đơn #${currentOrder?.code || orderId} tại bộ nhớ Admin! ✨`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  const handleUpdateShippingFee = async (orderId: string, explicitFee?: number) => {
    const rawVal = explicitFee !== undefined ? explicitFee : shippingFeeInputs[orderId];
    if (rawVal === undefined || rawVal === '') return;
    const numVal = Math.max(0, Number(rawVal) || 0);
    setShippingFeeInputs(prev => ({ ...prev, [orderId]: String(numVal) }));

    const cleanId = (orderId || '').toLowerCase().replace(/^#/, '').trim();
    const currentOrder = orders.find(o => 
      (o.id && o.id.toLowerCase().replace(/^#/, '').trim() === cleanId) || 
      (o.code && o.code.toLowerCase().replace(/^#/, '').trim() === cleanId)
    );

    // Optimistic state update immediately
    let updatedTargetOrder: Order | undefined;
    setOrders(prev => {
      const updatedList = prev.map(o => {
        const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
        const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
        if (oId === cleanId || oCode === cleanId) {
          const itemsTotal = o.itemsTotalAmount || o.subtotal || 0;
          const updated = {
            ...o,
            shippingFee: numVal,
            itemsTotalAmount: itemsTotal,
            totalAmount: itemsTotal + numVal,
            finalTotalAmount: itemsTotal + numVal,
            updatedAt: new Date().toISOString(),
          };
          updatedTargetOrder = updated;
          return updated;
        }
        return o;
      });
      try {
        localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    try {
      const orderPayload = updatedTargetOrder || currentOrder;
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          shippingFee: numVal,
          order: orderPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActionSuccessMsg(`Đã cập nhật phí ship ${formatVND(numVal)} cho đơn #${data.data.code}! ✨`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
        setOrders(prev => {
          const list = prev.map(o => {
            const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
            const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
            return (oId === cleanId || oCode === cleanId) ? { ...o, ...data.data } : o;
          });
          try {
            localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(list));
          } catch (e) {}
          return list;
        });
      } else {
        // Fallback to /api/orders
        const resFallback = await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: orderId,
            shippingFee: numVal,
            order: orderPayload,
          }),
        });
        const dataFallback = await resFallback.json();
        if (dataFallback.success && dataFallback.data) {
          setActionSuccessMsg(`Đã cập nhật phí ship ${formatVND(numVal)} cho đơn #${dataFallback.data.code}! ✨`);
          setTimeout(() => setActionSuccessMsg(''), 3000);
          setOrders(prev => {
            const list = prev.map(o => {
              const oId = (o.id || '').toLowerCase().replace(/^#/, '').trim();
              const oCode = (o.code || '').toLowerCase().replace(/^#/, '').trim();
              return (oId === cleanId || oCode === cleanId) ? { ...o, ...dataFallback.data } : o;
            });
            try {
              localStorage.setItem('omachi_admin_orders_v2', JSON.stringify(list));
            } catch (e) {}
            return list;
          });
        } else {
          setActionSuccessMsg(`Đã lưu phí ship ${formatVND(numVal)} cho đơn #${currentOrder?.code || orderId} tại bộ nhớ Admin! ✨`);
          setTimeout(() => setActionSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setActionSuccessMsg(`Đã lưu phí ship ${formatVND(numVal)} cho đơn #${currentOrder?.code || orderId} tại bộ nhớ Admin! ✨`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  const handleTestZalo = async () => {
    const targetPhone = settings.zaloPhone || settings.hotline || '';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    
    // Open direct Zalo chat window
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    setTestZaloStatus(`✅ Đang mở cửa sổ chat Zalo đến SĐT ${cleanPhone}! Bạn có thể nhắn tin thử trực tiếp.`);
    
    try {
      await fetch('/api/notify-zalo', { method: 'POST' });
    } catch (err) {}
    
    setTimeout(() => setTestZaloStatus(''), 6000);
  };



  // IF NOT AUTHENTICATED -> PIN LOGIN
  if (!isAuthenticated) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-pink-200 shadow-2xl p-8 max-w-sm w-full space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center text-2xl shadow-md shadow-rose-200">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-800">Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-gray-500 mt-1">Dành riêng cho chủ shop Omachi</p>
          </div>

          {pinError && (
            <div className="bg-rose-50 text-rose-600 text-xs font-bold p-2.5 rounded-xl border border-rose-200">
              ⚠️ {pinError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mã PIN (Mặc định: 123456)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-center text-sm font-black tracking-widest bg-pink-50/50 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-gray-800 transition"
              />
              <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-sm shadow-md shadow-rose-200 transition transform active:scale-98"
            >
              Mở Khóa Quản Trị ✨
            </button>
          </form>

          <p className="text-[10px] text-gray-400">
            🔒 Khu vực bảo mật ngăn khách hàng truy cập trái phép.
          </p>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED -> DASHBOARD
  const filteredOrders = orders.filter((o) => {
    let statusMatch = true;
    if (selectedStatusFilter === 'PENDING_CONFIRM') statusMatch = o.orderStatus === 'PENDING_CONFIRM';
    else if (selectedStatusFilter === 'PREPARING') statusMatch = o.orderStatus === 'PREPARING';
    else if (selectedStatusFilter === 'SHIPPING') statusMatch = o.orderStatus === 'SHIPPING';
    else if (selectedStatusFilter === 'COMPLETED') statusMatch = o.orderStatus === 'COMPLETED';

    if (!statusMatch) return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const code = (o.code || '').toLowerCase();
      const name = (o.customer?.fullName || '').toLowerCase();
      const phone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
      const addr = (o.customer?.address || '').toLowerCase();
      return code.includes(q) || name.includes(q) || phone.includes(q) || addr.includes(q);
    }

    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingConfirmCount = orders.filter((o) => o.orderStatus === 'PENDING_CONFIRM').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'PREPARING').length;
  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockProducts = products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10);
  const outOfStockProducts = products.filter((p) => (Number(p.stock) || 0) === 0);
  const inStockProducts = products.filter((p) => (Number(p.stock) || 0) > 10);

  const statusFilterOptions = [
    { value: 'ALL', label: 'Tất cả đơn', icon: '📦', count: orders.length },
    { value: 'PENDING_CONFIRM', label: 'Chờ xác nhận', icon: '⏳', count: pendingConfirmCount },
    { value: 'PREPARING', label: 'Đang làm hàng', icon: '🔨', count: preparingCount },
    { value: 'SHIPPING', label: 'Đang giao', icon: '🚚', count: orders.filter((o) => o.orderStatus === 'SHIPPING').length },
    { value: 'COMPLETED', label: 'Hoàn thành', icon: '✅', count: orders.filter((o) => o.orderStatus === 'COMPLETED').length },
  ];
  const currentStatusOption = statusFilterOptions.find((o) => o.value === selectedStatusFilter) || statusFilterOptions[0];

  return (
    <div className="py-3 sm:py-6 space-y-3.5 sm:space-y-6">
      
      {/* Admin Top Header - Compact, Modern & Elegant */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🎀</span>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight">
              Trung Tâm Quản Trị Omachi
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-rose-100 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            Xác nhận đơn, quản lý kho hàng, phân loại màu sắc &amp; cấu hình toàn diện
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={() => {
              fetchOrders();
              fetchProducts();
              fetchFeedbacks();
              fetchSettings();
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 sm:px-3 sm:py-2 bg-black/20 hover:bg-black/30 rounded-xl text-xs font-bold transition flex items-center gap-1 text-pink-100"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl sm:rounded-2xl border border-emerald-200 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {testZaloStatus && (
        <div className="bg-purple-50 text-purple-800 text-xs font-bold p-3 rounded-xl sm:rounded-2xl border border-purple-200 animate-fade-in">
          {testZaloStatus}
        </div>
      )}

      {/* Navigation Tabs - Smart Grouped Professional Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-pink-100/80 pb-3">
        
        {/* NHÓM 1: KINH DOANH & ĐƠN HÀNG */}
        <div className="flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Đơn Hàng</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Doanh Thu</span>
          </button>
        </div>

        {/* NHÓM 2: SẢN PHẨM & KHO HÀNG */}
        <div className="flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Danh Mục</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sản Phẩm &amp; Giá Sỉ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kho &amp; Nhập Hàng</span>
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'inventory' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {outOfStockProducts.length > 0 ? `!${outOfStockProducts.length}` : `${lowStockProducts.length}`}
              </span>
            )}
          </button>
        </div>

        {/* NHÓM 3: KHÁCH HÀNG & CỬA HÀNG */}
        <div className="flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('feedbacks')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Feedback</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'feedbacks' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {feedbacks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Cài Đặt Shop</span>
          </button>
        </div>

      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Status filter selection box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-2xl border border-pink-100 shadow-2xs">
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="order-status-select" className="text-xs font-bold text-gray-500 shrink-0 hidden sm:inline">
                Lọc trạng thái:
              </label>
              <div className="relative flex-1 sm:max-w-xs" ref={statusComboboxRef}>
                <button
                  type="button"
                  onClick={() => setIsStatusComboboxOpen(!isStatusComboboxOpen)}
                  className="w-full bg-stone-50 hover:bg-stone-100 border border-gray-200 text-stone-800 text-xs sm:text-sm font-extrabold py-2 px-3 rounded-xl flex items-center justify-between transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{currentStatusOption.icon}</span>
                    <span>{currentStatusOption.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0 text-gray-400">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {currentStatusOption.count}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isStatusComboboxOpen ? 'rotate-180 text-rose-500' : ''}`} />
                  </span>
                </button>

                {isStatusComboboxOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-pink-100 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    {statusFilterOptions.map((opt) => {
                      const isSelected = opt.value === selectedStatusFilter;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedStatusFilter(opt.value);
                            setIsStatusComboboxOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 text-rose-700 font-extrabold'
                              : 'text-gray-700 hover:bg-stone-50 font-medium'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-sm">{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isSelected ? 'bg-rose-200 text-rose-800' : 'bg-stone-100 text-gray-500'
                            }`}>
                              {opt.count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sm:hidden shrink-0 px-2.5 py-1.5 bg-rose-50 border border-pink-200 rounded-xl text-rose-600 text-xs font-extrabold">
                {filteredOrders.length} đơn
              </div>
            </div>

            {/* Order search box */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên, SĐT, địa chỉ..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-rose-400 font-medium text-gray-800 transition"
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs font-bold text-gray-500">
                <span>Hiển thị:</span>
                <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-white text-[11px] font-extrabold">
                  {filteredOrders.length} đơn
                </span>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-pink-100 space-y-2">
                <p className="text-gray-400 text-xs">Không có đơn hàng nào trong mục này.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const zaloChatUrl = `https://zalo.me/${order.customer.phone.replace(/[^0-9]/g, '')}`;

                // Tính toán tài chính đơn hàng chuẩn xác theo giá lẻ từng con & chiết khấu sỉ
                const calculatedRetailSubtotal = (order.items || []).reduce((sum: number, it: any) => {
                  const origUnit = Number(it.originalUnitPrice || it.product?.basePrice || it.appliedUnitPrice || (it.totalPrice / (it.quantity || 1)) || 0);
                  const qty = Number(it.quantity || 1);
                  return sum + (origUnit > 0 ? origUnit * qty : Number(it.totalPrice || 0));
                }, 0);

                const calculatedItemsTotal = (order.items || []).reduce((sum: number, it: any) => sum + Number(it.totalPrice || 0), 0);
                const calculatedDiscount = Math.max(0, calculatedRetailSubtotal - calculatedItemsTotal);
                const calculatedDiscountPercent = calculatedRetailSubtotal > 0 ? Math.round((calculatedDiscount / calculatedRetailSubtotal) * 100) : 0;
                const calculatedShippingFee = Number(order.shippingFee || 0);
                const calculatedFinalTotal = calculatedItemsTotal + calculatedShippingFee;
                const totalItemCount = (order.items || []).reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0);
                const freeshipThreshold = Number(settings.prepaidFreeShipThreshold ?? settings.freeShippingThreshold ?? 0);
                const isOrderEligibleFreeship = freeshipThreshold > 0 && (
                  (calculatedItemsTotal >= freeshipThreshold) ||
                  (Number(order.subtotal || 0) >= freeshipThreshold) ||
                  (Number(order.totalAmount || 0) >= freeshipThreshold)
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-pink-100 shadow-xs p-3.5 sm:p-6 space-y-3 sm:space-y-4 transition hover:shadow-md"
                  >
                    {/* Order Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-50">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-base font-black text-gray-800">#{order.code}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </span>

                        {/* 1. Trạng thái Tiến độ đơn hàng (Dropdown chọn linh hoạt) */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => {
                              handleUpdateStatus(order.id, e.target.value as OrderStatus);
                            }}
                            className={`text-xs font-black px-2.5 py-1 rounded-xl border cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                              order.orderStatus === 'PENDING_CONFIRM'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : order.orderStatus === 'PREPARING'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : order.orderStatus === 'SHIPPING'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : order.orderStatus === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            <option value="PENDING_CONFIRM">⏳ Chờ xác nhận đơn</option>
                            <option value="PREPARING">🎨 Đang chuẩn bị &amp; đóng gói</option>
                            <option value="SHIPPING">🚚 Đang giao hàng</option>
                            <option value="COMPLETED">✅ Đã hoàn thành</option>
                            <option value="CANCELLED">❌ Đã hủy đơn</option>
                          </select>
                        </div>

                        {/* 2. Trạng thái Thanh toán (Mặc định: Chưa thu COD, bấm để chuyển Đã nhận tiền) */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, undefined, order.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID')}
                          title="Bấm để chuyển đổi giữa Đã nhận tiền và Chưa thu COD"
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer active:scale-95 ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {order.paymentStatus === 'PAID' ? '✓ Đã nhận tiền' : '⏳ Chưa thu COD'}
                        </button>

                        {/* 3. Phương thức thanh toán khách chọn */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                          order.paymentMethod === 'MOMO'
                            ? 'bg-pink-50 text-pink-700 border-pink-300'
                            : order.paymentMethod === 'BANK'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}>
                          {order.paymentMethod === 'MOMO'
                            ? '🟣 Ví MoMo'
                            : order.paymentMethod === 'BANK'
                            ? '💳 Chuyển khoản VietQR'
                            : '💵 Thu tiền mặt COD'}
                        </span>

                        {/* 4. Huy hiệu đủ điều kiện Freeship nếu đơn >= ngưỡng */}
                        {isOrderEligibleFreeship && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <span>✨</span>
                            <span>ĐƠN ≥ {formatVND(freeshipThreshold)} (FREESHIP CHUYỂN KHOẢN)</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Tổng tiền thanh toán chuẩn */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-gray-500">Tổng tiền:</span>
                          <span className="text-base font-black text-rose-600">
                            {formatVND(calculatedFinalTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info & Items */}
                    {(() => {
                      const groupedOrderItems = groupOrderItems(order.items);
                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                          {/* CỘT TRÁI (lg:col-span-5): Thông tin người nhận, Phí ship SPX, Bảng tính tiền & Nút Zalo */}
                          <div className="lg:col-span-5 space-y-3">
                            {/* 1. Thông tin khách hàng */}
                            <div className="space-y-2 bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100">
                              <div className="flex items-center justify-between">
                                <p className="font-extrabold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5">
                                  <span>👤</span> {order.customer.fullName}
                                </p>
                                <a
                                  href={zaloChatUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-rose-600 font-bold hover:underline inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-pink-200"
                                >
                                  <span>{order.customer.phone}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <p className="text-gray-700 leading-relaxed">
                                <strong>📍 Địa chỉ:</strong> {order.customer.address}
                              </p>
                              <p className="text-[11px] text-orange-800 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span>Vận chuyển: <strong>{order.carrierName || 'SPX Express'}</strong></span>
                              </p>
                              {order.customer.note && (
                                <p className="text-rose-700 font-medium bg-white p-2.5 rounded-xl border border-rose-200">
                                  📝 <strong>Ghi chú:</strong> {order.customer.note}
                                </p>
                              )}
                            </div>

                            {/* 2. Bảng Chi Tiết Tính Tiền (Khách đặt, Phí ship, Tổng thanh toán) */}
                            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs">
                              <h4 className="font-extrabold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <span>💰</span> Chi Tiết Tiền Hàng &amp; Cước Ship
                              </h4>

                              {calculatedDiscount > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-gray-500 text-[11px]">
                                    <span>Tổng giá bán lẻ ({totalItemCount} con):</span>
                                    <span>{formatVND(calculatedRetailSubtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                                    <span>Chiết khấu Combo sỉ ({calculatedDiscountPercent}%):</span>
                                    <span>-{formatVND(calculatedDiscount)}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between text-gray-700 font-medium">
                                <span>Tiền hàng thực tế ({totalItemCount} món):</span>
                                <strong className="text-gray-800">{formatVND(calculatedItemsTotal)}</strong>
                              </div>

                              {/* Phí ship sau khi cân hàng thực tế */}
                              {(() => {
                                const orderWeightKg = (Number(order.totalWeight) || 0) > 0
                                  ? ((Number(order.totalWeight) || 0) / 1000).toFixed(2)
                                  : (totalItemCount * 0.05).toFixed(2);

                                return (
                                  <div className={`p-2.5 bg-white/90 rounded-xl border space-y-2 ${
                                    isOrderEligibleFreeship ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-2xs' : 'border-orange-200'
                                  }`}>
                                    {/* Freeship Alert in Admin */}
                                    {isOrderEligibleFreeship && (
                                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-extrabold flex items-center gap-1 text-emerald-800">
                                            <span>🎉</span>
                                            <span>Đơn ≥ {formatVND(freeshipThreshold)}: Đủ điều kiện FREESHIP</span>
                                          </span>
                                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                                            {order.paymentMethod === 'BANK' ? 'Đã chọn CK' : 'Chờ CK'}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-emerald-700">
                                          Bấm nút <strong>&quot;🎁 Miễn Ship (0đ)&quot;</strong> bên dưới nếu khách đã chuyển khoản thành công.
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between gap-1 text-[11px] text-gray-500 pb-1 border-b border-orange-100">
                                      <span className="flex items-center gap-1 font-bold text-gray-700">
                                        <Truck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                        <span>Cước SPX (Cân nặng: ~{orderWeightKg} kg):</span>
                                      </span>
                                      <strong className={calculatedShippingFee > 0 ? 'text-emerald-700 font-black' : 'text-amber-600 font-bold'}>
                                        {calculatedShippingFee > 0 ? `+${formatVND(calculatedShippingFee)}` : 'Miễn ship (0đ)'}
                                      </strong>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      {/* Quick Preset Buttons */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateShippingFee(order.id, 0)}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 flex items-center gap-1 ${
                                            isOrderEligibleFreeship
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-black ring-2 ring-emerald-300 animate-pulse'
                                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                                          }`}
                                          title="Miễn phí vận chuyển cho khách"
                                        >
                                          <span>🎁 Miễn Ship (0đ)</span>
                                          {isOrderEligibleFreeship && <span className="bg-white/20 text-white text-[9px] px-1 rounded">≥1tr</span>}
                                        </button>
                                        {calculatedShippingFee >= 24000 && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateShippingFee(order.id, Math.max(0, calculatedShippingFee - 24000))}
                                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold transition active:scale-95"
                                            title="Khách chuyển khoản: Trừ 24k phí bảo hiểm COD"
                                          >
                                            ⚡ Giảm 24k (CK)
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              <div className="flex justify-between items-baseline pt-2 border-t border-amber-200/80">
                                <div>
                                  <strong className="text-gray-800 text-xs font-black block">TỔNG THANH TOÁN (COD):</strong>
                                  <span className="text-[10px] text-gray-400">
                                    {calculatedShippingFee > 0 ? 'Đã cộng tiền hàng & tiền ship' : 'Tiền hàng (chờ cộng ship thực tế)'}
                                  </span>
                                </div>
                                <span className="text-base font-black text-rose-600">
                                  {formatVND(calculatedFinalTotal)}
                                </span>
                              </div>
                            </div>

                            {/* 3. Nút Nhắn Zalo Khách Hàng */}
                            <a
                              href={`https://zalo.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                calculatedShippingFee > 0
                                  ? `Chào bạn ${order.customer.fullName}, Shop Omachi đã gói xong đơn #${order.code} của bạn. Sau khi cân thực tế, cước ship SPX là ${formatVND(calculatedShippingFee)}. Tổng tiền thanh toán COD khi nhận là ${formatVND(calculatedFinalTotal)}. Shop gửi hàng cho bạn nhé! 💕`
                                  : `Chào bạn ${order.customer.fullName}, Shop Omachi đã nhận đơn #${order.code} của bạn. Shop đang soạn hàng và cân xong sẽ báo phí ship cho bạn ngay nhé! 💕`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Nhắn Zalo Khách (Báo cước/Tư vấn)</span>
                            </a>
                          </div>

                          {/* CỘT PHẢI (lg:col-span-7): Danh sách hàng phân theo từng loại sản phẩm cho chủ shop dễ làm đơn */}
                          <div className="lg:col-span-7 space-y-2.5">
                            <div className="flex items-center justify-between pb-1 border-b border-pink-50">
                              <div>
                                <p className="font-extrabold text-gray-800 flex items-center gap-1.5">
                                  <span>🛍️</span>
                                  <span>Danh Sách Sản Phẩm Cần Soạn &amp; Đóng Gói ({totalItemCount} món):</span>
                                </p>
                                <span className="text-[10px] text-gray-400">Phân theo từng sản phẩm &amp; tích chọn khi đã chuẩn bị xong</span>
                              </div>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                                {groupedOrderItems.length} loại
                              </span>
                            </div>

                            {/* Product Groups */}
                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                              {groupedOrderItems.map((group) => (
                                <div key={group.productId} className="p-3 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-2">
                                  {/* Product Header */}
                                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-200/70">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <img
                                        src={group.image}
                                        alt={group.productName}
                                        className="w-9 h-9 object-cover rounded-xl border border-gray-200 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-black text-gray-800 text-xs truncate">{group.productName}</p>
                                        <p className="text-[10px] text-gray-500">
                                          Đơn giá: {formatVND(group.basePrice)}/cái
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-[11px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-pink-200 shrink-0 shadow-2xs">
                                      Tổng: {group.totalQty} gói
                                    </span>
                                  </div>

                                  {/* Variations Checklist */}
                                  <div className="space-y-1.5 pl-1 sm:pl-2">
                                    {group.items.map((it: any, subIdx: number) => {
                                      const itemKey = `${order.id}-${it.productId || it.product?.id}-${it.selectedVariant?.id || subIdx}`;
                                      const isChecked = checkedPackingItems[itemKey] || false;
                                      const origUnit = Number(it.originalUnitPrice || it.product?.basePrice || it.appliedUnitPrice || (it.totalPrice / (it.quantity || 1)) || 0);
                                      const qty = Number(it.quantity || 1);
                                      const origLine = origUnit * qty;
                                      const actualLine = Number(it.totalPrice || 0);
                                      const itemDiscount = Math.max(0, origLine - actualLine);
                                      const itemDiscountPercent = it.discountPercent || (origLine > 0 ? Math.round((itemDiscount / origLine) * 100) : 0);

                                      return (
                                        <div
                                          key={subIdx}
                                          onClick={() => toggleCheckPackingItem(itemKey)}
                                          className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 text-xs select-none ${
                                            isChecked
                                              ? 'bg-emerald-50/70 border-emerald-300'
                                              : 'bg-white hover:bg-pink-50/40 border-gray-200'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={() => {}}
                                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                                            />
                                            {it.selectedVariant?.color && (
                                              <span
                                                className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                                                style={{ backgroundColor: it.selectedVariant.color }}
                                              />
                                            )}
                                            <div className="min-w-0">
                                              <span className={`font-extrabold ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                {it.selectedVariant?.name || 'Mặc định'}
                                              </span>
                                              <span className="text-gray-400 mx-1.5">•</span>
                                              <span className="font-black text-rose-600 text-xs">
                                                x{qty} con
                                              </span>
                                              {itemDiscount > 0 && (
                                                <span className="ml-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-200">
                                                  Giảm {itemDiscountPercent}%
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="text-right shrink-0">
                                            <span className={`font-black text-xs ${isChecked ? 'text-gray-400' : 'text-gray-800'}`}>
                                              {formatVND(actualLine)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Buttons for Shop Owner */}
                    <div className="pt-3 border-t border-pink-50 flex flex-wrap items-center justify-end gap-2">
                        {order.orderStatus === 'PENDING_CONFIRM' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Xác Nhận &amp; Chuẩn Bị Hàng</span>
                          </button>
                        )}

                        {order.orderStatus === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Đã đóng gói xong → Bàn giao Shipper</span>
                          </button>
                        )}

                        {order.orderStatus === 'SHIPPING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Khách đã nhận → Hoàn thành</span>
                          </button>
                        )}

                        {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 font-bold text-xs transition"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB: REVENUE & FINANCIAL REPORT */}
      {activeTab === 'revenue' && (() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const periodFilteredOrders = orders.filter((o) => {
          if (o.orderStatus === 'CANCELLED') return false;
          if (revenuePeriodFilter === 'all') return true;
          const orderDate = new Date(o.createdAt);
          if (revenuePeriodFilter === 'today') return orderDate >= startOfToday;
          if (revenuePeriodFilter === 'week') return orderDate >= startOfWeek;
          if (revenuePeriodFilter === 'month') return orderDate >= startOfMonth;
          return true;
        });

        const finalFilteredOrders = periodFilteredOrders.filter((o) => {
          if (revenuePaymentFilter === 'all') return true;
          if (revenuePaymentFilter === 'PAID') return o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED';
          if (revenuePaymentFilter === 'UNPAID') return o.paymentStatus !== 'PAID' && o.orderStatus !== 'COMPLETED';
          return true;
        });

        const collectedRevenue = periodFilteredOrders
          .filter((o) => o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        const pendingRevenue = periodFilteredOrders
          .filter((o) => o.paymentStatus !== 'PAID' && o.orderStatus !== 'COMPLETED')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        const totalDiscounts = periodFilteredOrders
          .reduce((sum, o) => sum + (o.comboDiscountAmount || o.discount || 0), 0);

        const totalShipping = periodFilteredOrders
          .reduce((sum, o) => sum + (o.shippingFee || 0), 0);

        const completedOrdersCount = periodFilteredOrders.filter((o) => o.orderStatus === 'COMPLETED').length;
        const totalItemsSold = periodFilteredOrders.reduce((sum, o) => {
          const itemsCount = (o.items || []).reduce((itemSum: number, it: any) => itemSum + (Number(it.quantity) || 1), 0);
          return sum + itemsCount;
        }, 0);

        const productCostMap = new Map<string, number>();
        products.forEach((p) => {
          if (p.costPrice) productCostMap.set(p.id, p.costPrice);
        });

        let estimatedTotalCost = 0;
        periodFilteredOrders.forEach((o) => {
          (o.items || []).forEach((it: any) => {
            const pId = it.productId || it.product?.id;
            const cost = productCostMap.get(pId) || 0;
            const qty = Number(it.quantity) || 1;
            estimatedTotalCost += cost * qty;
          });
        });
        const estimatedGrossProfit = collectedRevenue > estimatedTotalCost ? collectedRevenue - estimatedTotalCost : 0;

        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Header & Filter Controls */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-rose-500" />
                    <span>Báo Cáo Doanh Thu &amp; Tài Chính Chi Tiết</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Thống kê dòng tiền thực thu, đơn chờ thu, chiết khấu giá sỉ và danh sách đối soát theo đơn
                  </p>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-50">
                {/* Period filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Kỳ:
                  </span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'today', label: 'Hôm nay' },
                    { id: 'week', label: '7 ngày qua' },
                    { id: 'month', label: 'Tháng này' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRevenuePeriodFilter(p.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        revenuePeriodFilter === p.id
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-stone-50 text-gray-600 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Payment filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> TT:
                  </span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'PAID', label: 'Đã thu' },
                    { id: 'UNPAID', label: 'Chờ thu' },
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setRevenuePaymentFilter(pay.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        revenuePaymentFilter === pay.id
                          ? 'bg-stone-800 text-white shadow-xs'
                          : 'bg-stone-50 text-gray-600 hover:bg-stone-100'
                      }`}
                    >
                      {pay.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Doanh thu thực thu */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-700">Đã Thực Thu</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-base sm:text-xl font-black text-emerald-600 tracking-tight">
                    {formatVND(collectedRevenue)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Đã thanh toán hoặc giao hoàn thành
                  </p>
                </div>
              </div>

              {/* Card 2: Doanh thu chờ thu */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-700">Chờ Thu (Công Nợ)</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-base sm:text-xl font-black text-amber-700 tracking-tight">
                    {formatVND(pendingRevenue)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Đang giao hoặc chờ duyệt COD/CK
                  </p>
                </div>
              </div>

              {/* Card 3: Chiết khấu sỉ */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-purple-700">Chiết Khấu Sỉ Đã Giảm</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-base sm:text-xl font-black text-purple-700 tracking-tight">
                    {formatVND(totalDiscounts)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Tổng ưu đãi giảm cho khách mua sỉ
                  </p>
                </div>
              </div>

              {/* Card 4: Tổng đơn & sản lượng */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-rose-700">Sản Lượng &amp; Số Đơn</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-base sm:text-xl font-black text-rose-600 tracking-tight">
                    {periodFilteredOrders.length} đơn <span className="text-xs text-gray-400 font-bold">({totalItemsSold} cái)</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {completedOrdersCount} đơn hoàn thành
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Gross Profit Note Banner (if costPrice configured) */}
            {estimatedTotalCost > 0 && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <span className="text-base">💰</span>
                  <span>
                    <strong>Lợi Nhuận Gộp Ước Tính (Gross Profit):</strong> Doanh thu đã thu ({formatVND(collectedRevenue)}) trừ Tổng giá vốn xưởng ({formatVND(estimatedTotalCost)}) =
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-700 shrink-0">
                  +{formatVND(estimatedGrossProfit)}
                </span>
              </div>
            )}

            {/* Detailed Orders Breakdown Table */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-pink-50 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                    Bảng Kê Chi Tiết Doanh Thu Từng Đơn Hàng
                  </h4>
                  <p className="text-xs text-gray-500">
                    Hiển thị {finalFilteredOrders.length} đơn hàng phù hợp bộ lọc
                  </p>
                </div>
              </div>

              {finalFilteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Không có đơn hàng nào trong khoảng thời gian này.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50/80 text-stone-500 font-bold border-b border-gray-100 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3 sm:px-4">Mã Đơn / Ngày</th>
                        <th className="py-3 px-3 sm:px-4">Khách Hàng</th>
                        <th className="py-3 px-3 sm:px-4 text-center">SL Món</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Tạm Tính</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Chiết Khấu</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Phí Ship</th>
                        <th className="py-3 px-3 sm:px-4 text-right font-black text-gray-800">Tổng Đơn</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Thanh Toán</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {finalFilteredOrders.map((order) => {
                        const orderDate = new Date(order.createdAt);
                        const isPaid = order.paymentStatus === 'PAID' || order.orderStatus === 'COMPLETED';
                        const itemsCount = (order.items || []).reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);
                        const discount = order.comboDiscountAmount || order.discount || 0;
                        const subtotal = (order.totalAmount || 0) + discount - (order.shippingFee || 0);

                        return (
                          <tr key={order.id} className="hover:bg-rose-50/30 transition">
                            <td className="py-3 px-3 sm:px-4">
                              <span className="font-mono font-extrabold text-stone-800">#{order.code}</span>
                              <div className="text-[10px] text-gray-400">
                                {orderDate.toLocaleDateString('vi-VN')} {orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <span className="font-bold text-gray-800">{order.customer?.fullName || 'Khách vãng lai'}</span>
                              <div className="text-[10px] text-gray-500">{order.customer?.phone}</div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center font-bold text-gray-700">
                              {itemsCount} cái
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-medium text-gray-600">
                              {formatVND(subtotal > 0 ? subtotal : (order.totalAmount || 0))}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-medium text-purple-600">
                              {discount > 0 ? `-${formatVND(discount)}` : '0đ'}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-medium text-gray-600">
                              {formatVND(order.shippingFee || 0)}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-black text-rose-600 text-sm">
                              {formatVND(order.totalAmount || 0)}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {isPaid ? 'Đã thanh toán' : 'Chờ thu'}
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <span className="text-[10px] font-semibold text-gray-600">
                                {order.orderStatus === 'COMPLETED' && '✅ Hoàn thành'}
                                {order.orderStatus === 'SHIPPING' && '🚚 Đang giao'}
                                {order.orderStatus === 'PREPARING' && '🔨 Đang làm'}
                                {order.orderStatus === 'PENDING_CONFIRM' && '⏳ Chờ duyệt'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-rose-50/50 font-black text-stone-800 border-t-2 border-pink-200">
                        <td colSpan={3} className="py-3 px-3 sm:px-4 text-xs font-black uppercase text-stone-700">
                          TỔNG CỘNG ({finalFilteredOrders.length} ĐƠN)
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right text-stone-700">
                          {formatVND(
                            finalFilteredOrders.reduce((sum, o) => {
                              const disc = o.comboDiscountAmount || o.discount || 0;
                              return sum + ((o.totalAmount || 0) + disc - (o.shippingFee || 0));
                            }, 0)
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right text-purple-700">
                          -{formatVND(
                            finalFilteredOrders.reduce((sum, o) => sum + (o.comboDiscountAmount || o.discount || 0), 0)
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right text-stone-700">
                          {formatVND(
                            finalFilteredOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0)
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right text-rose-600 text-sm sm:text-base font-black">
                          {formatVND(
                            finalFilteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                          )}
                        </td>
                        <td colSpan={2} className="py-3 px-3 sm:px-4 text-center text-[10px] text-gray-500">
                          {finalFilteredOrders.filter(o => o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED').length} đã thu / {finalFilteredOrders.length} đơn
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* TAB 2: PRODUCT CATALOG & CONFIGURATION */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span>Cấu Hình &amp; Danh Sách Loại Sản Phẩm</span>
              </h3>
              <p className="text-xs text-gray-500">
                Thêm mẫu mới, cài đặt danh mục, phân loại màu sắc, giá bán, giá vốn xưởng &amp; mốc combo. (Để nhập hàng thêm theo lô, vui lòng chuyển sang tab &quot;Quản Lý Kho &amp; Nhập Hàng&quot;).
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Mẫu Charm / Phụ Kiện Mới</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-pink-50/40 p-3 rounded-2xl border border-pink-100">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Tìm mẫu theo tên, mã SKU..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border border-pink-200 text-gray-800 text-xs font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer shadow-2xs"
              >
                <option value="ALL">✨ Tất cả danh mục ({products.length})</option>
                {categories.map((c) => {
                  const count = products.filter((p) => p.categoryId === c.id || p.category === c.slug).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.icon ? c.icon + ' ' : ''}{c.name} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Product Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(products.length > 0 ? products : INITIAL_PRODUCTS)
              .filter((prod) => {
                const matchesSearch = !productSearch ||
                  prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  (prod.sku && prod.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
                  (prod.categoryName && prod.categoryName.toLowerCase().includes(productSearch.toLowerCase()));
                const selectedCatObj = categories.find((c) => c.id === productCategoryFilter);
                const matchesCat = productCategoryFilter === 'ALL' || 
                  prod.categoryId === productCategoryFilter || 
                  prod.category === productCategoryFilter ||
                  (selectedCatObj && (prod.categoryId === selectedCatObj.id || prod.category === selectedCatObj.slug));
                return matchesSearch && matchesCat;
              })
              .map((prod) => {
                const estimatedProfit = prod.costPrice ? prod.basePrice - prod.costPrice : null;

                return (
                  <div key={prod.id} className="p-3 sm:p-4 rounded-2xl border border-pink-100 bg-pink-50/20 space-y-2.5 sm:space-y-3 relative group flex flex-col justify-between hover:border-pink-200 transition">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.images?.[0] || '/images/charm_feed_1.jpg'}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/charm_feed_1.jpg';
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-pink-200 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-pink-700">
                              {prod.categoryName || prod.category}
                            </span>
                            {prod.sku && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold">
                                {prod.sku}
                              </span>
                            )}
                            {prod.isHot && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600">
                                🔥 Hot
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-gray-800 mt-1 line-clamp-1">{prod.name}</h4>
                          
                          <div className="flex items-center gap-2.5 flex-wrap mt-1 text-[11px]">
                            <span className="text-pink-600 font-bold">
                              Bán lẻ: {formatVND(prod.basePrice)}
                            </span>
                            {prod.costPrice ? (
                              <span className="text-gray-500">
                                Vốn: <strong>{formatVND(prod.costPrice)}</strong>
                              </span>
                            ) : null}
                            {estimatedProfit !== null && (
                              <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                                Lãi ~{formatVND(estimatedProfit)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500 mt-1">
                            <span>Chất liệu: <strong>{prod.material || 'Handmade'}</strong></span>
                            <span>•</span>
                            <span>Kích thước: <strong>{prod.dimensions || 'Free size'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Color Variants Configuration Details */}
                      {prod.variants && prod.variants.length > 0 && (
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-pink-100 text-[11px] space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <span className="flex items-center gap-1.5 font-bold text-gray-700 text-xs">
                              <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                              <span>Chi tiết phân loại ({prod.variants.length} màu):</span>
                            </span>
                            <span className="text-[10px] sm:text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Tổng tồn kho: {(prod.stock || 0).toLocaleString('vi-VN')} cái
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {prod.variants.map((v, i) => {
                              const vStock = v.stock ?? 0;
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] border ${
                                    vStock <= 0
                                      ? 'bg-rose-50/70 border-rose-200 text-rose-700'
                                      : vStock <= 5
                                      ? 'bg-amber-50/70 border-amber-200 text-amber-800'
                                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                  }`}
                                >
                                  {v.colorHex && (
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: v.colorHex }} />
                                  )}
                                  <span className="font-bold">{v.name}</span>
                                  <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                                    vStock <= 0 ? 'bg-rose-200 text-rose-800' : 'bg-white/80 text-gray-800'
                                  }`}>
                                    {vStock <= 0 ? 'Hết hàng' : `Còn ${vStock.toLocaleString('vi-VN')}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Combo tiers badge */}
                      {prod.comboTiers && prod.comboTiers.length > 0 && (
                        <div className="bg-white p-2 rounded-xl border border-pink-100 text-[10px] space-y-1">
                          <span className="text-gray-500 font-semibold block">Mốc giá combo sỉ:</span>
                          <div className="flex flex-wrap gap-1">
                            {prod.comboTiers.map((t, i) => (
                              <span key={i} className="bg-gray-50 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded font-medium">
                                ≥{t.minQuantity}c: <strong>{formatVND(t.unitPrice)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-pink-100/60 mt-2 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInventorySearch(prod.name);
                          setActiveTab('inventory');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        title="Chuyển sang tab kho để nhập hàng thêm"
                      >
                        <Boxes className="w-3.5 h-3.5 text-purple-600" />
                        <span>📦 Nhập Kho</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED INVENTORY & WAREHOUSE RESTOCK */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                <span>Quản Lý Kho Hàng &amp; Nhập Hàng Tốc Độ</span>
              </h3>
              <p className="text-xs text-gray-500">
                Theo dõi tồn kho theo từng phân loại màu sắc, phát hiện mẫu sắp hết và nhập hàng thêm an toàn 100% — Chống nhầm lẫn, không sợ bấm nhầm sửa giá!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">Tổng trong kho:</span>
              <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {totalStockCount} cái
              </span>
            </div>
          </div>

          {/* Warehouse KPI Filter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setInventoryFilter('ALL')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                inventoryFilter === 'ALL'
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30'
                  : 'bg-white border-gray-200 hover:border-emerald-200'
              }`}
            >
              <div>
                <p className="text-xs text-gray-500 font-medium">Tất cả sản phẩm trong kho</p>
                <p className="text-xl font-black text-gray-800">{products.length} mẫu</p>
              </div>
              <span className="text-2xl">📦</span>
            </button>

            <button
              type="button"
              onClick={() => setInventoryFilter('LOW')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                inventoryFilter === 'LOW'
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white border-gray-200 hover:border-amber-200'
              }`}
            >
              <div>
                <p className="text-xs text-amber-700 font-medium">Cảnh báo sắp hết hàng (≤ 10 cái)</p>
                <p className="text-xl font-black text-amber-700">{lowStockProducts.length} mẫu</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </button>

            <button
              type="button"
              onClick={() => setInventoryFilter('OUT')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                inventoryFilter === 'OUT'
                  ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30'
                  : 'bg-white border-gray-200 hover:border-rose-200'
              }`}
            >
              <div>
                <p className="text-xs text-rose-700 font-medium">Đã hết hàng / Cháy hàng (0 cái)</p>
                <p className="text-xl font-black text-rose-700">{outOfStockProducts.length} mẫu</p>
              </div>
              <span className="text-2xl">❌</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Tìm nhanh theo tên mẫu, mã SKU hoặc tên màu..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {inventorySearch && (
                <button
                  type="button"
                  onClick={() => setInventorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setInventoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  inventoryFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setInventoryFilter('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  inventoryFilter === 'LOW'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <span>⚠️ Sắp hết</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">{lowStockProducts.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setInventoryFilter('OUT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  inventoryFilter === 'OUT'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <span>❌ Hết hàng</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">{outOfStockProducts.length}</span>
              </button>
            </div>
          </div>

          {/* Inventory Items List */}
          <div className="space-y-4">
            {(() => {
              const displayList = (products.length > 0 ? products : INITIAL_PRODUCTS).filter((prod) => {
                const stock = Number(prod.stock) || 0;
                const matchesFilter =
                  inventoryFilter === 'ALL' ? true :
                  inventoryFilter === 'LOW' ? (stock > 0 && stock <= 10) :
                  inventoryFilter === 'OUT' ? (stock === 0) : true;

                const matchesSearch = !inventorySearch ||
                  prod.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                  (prod.sku && prod.sku.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                  (prod.variants && prod.variants.some(v => v.name.toLowerCase().includes(inventorySearch.toLowerCase())));

                return matchesFilter && matchesSearch;
              });

              if (displayList.length === 0) {
                return (
                  <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <p className="text-gray-500 text-xs">Không có sản phẩm nào khớp với bộ lọc tồn kho hiện tại.</p>
                    <button
                      type="button"
                      onClick={() => { setInventoryFilter('ALL'); setInventorySearch(''); }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                    >
                      Bỏ lọc
                    </button>
                  </div>
                );
              }

              return displayList.map((prod) => {
                const currentStock = Number(prod.stock) || 0;
                const isOutOfStock = currentStock === 0;
                const isLowStock = currentStock > 0 && currentStock <= 10;

                return (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-3xl border transition-all ${
                      isOutOfStock
                        ? 'bg-rose-50/30 border-rose-200 shadow-2xs'
                        : isLowStock
                        ? 'bg-amber-50/20 border-amber-200 shadow-2xs'
                        : 'bg-white border-pink-100 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Product Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <img
                          src={prod.images?.[0] || '/uploads/charm_1789432914386_1789371730804_1528911961217344.jpg'}
                          alt={prod.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-pink-200 bg-white shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {prod.sku && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {prod.sku}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-pink-700">
                              {prod.categoryName || prod.category}
                            </span>
                            
                            {/* Stock Status Badge */}
                            {isOutOfStock ? (
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                                ❌ Cháy Hàng (0 cái)
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                ⚠️ Sắp Hết ({currentStock} cái)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 Đủ Hàng ({currentStock} cái)
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-gray-800 line-clamp-1">{prod.name}</h4>
                          
                          <p className="text-xs text-gray-500">
                            Giá bán lẻ: <strong className="text-rose-600">{formatVND(prod.basePrice)}</strong>
                            {prod.costPrice ? (
                              <span> • Giá vốn: <strong className="text-gray-700">{formatVND(prod.costPrice)}</strong></span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quick Restock Trigger Button */}
                      <div className="flex items-center gap-2 self-end lg:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenRestock(prod)}
                          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Boxes className="w-4 h-4" />
                          <span>⚡ Nhập Kho Thêm Nhanh</span>
                        </button>
                      </div>

                    </div>

                    {/* Variant Breakdown Table */}
                    {prod.variants && prod.variants.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-700 mb-2 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-pink-500" />
                          <span>Chi tiết tồn kho từng màu ({prod.variants.length} phân loại):</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {prod.variants.map((v, vIdx) => {
                            const vStock = v.stock ?? 0;
                            const isVLow = vStock <= 5;
                            const isVOut = vStock === 0;

                            return (
                              <div
                                key={vIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                                  isVOut
                                    ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                                    : isVLow
                                    ? 'bg-amber-50/60 border-amber-200 text-amber-800'
                                    : 'bg-gray-50/60 border-gray-200 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {v.colorHex ? (
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                      style={{ backgroundColor: v.colorHex }}
                                    />
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full bg-pink-300 shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <p className="font-bold truncate text-xs text-gray-800">{v.name}</p>
                                    <p className="text-[11px] mt-0.5">
                                      Tồn kho: <strong className={`text-xs ${isVOut ? 'text-rose-600 font-black' : isVLow ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'}`}>
                                        {vStock.toLocaleString('vi-VN')}
                                      </strong> cái
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddStock(prod, vIdx, 10)}
                                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold shadow-2xs transition active:scale-95"
                                    title={`Bấm để cộng nhanh +10 cái vào phân loại ${v.name}`}
                                  >
                                    +10
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddStock(prod, vIdx, 50)}
                                    className="px-2 py-1 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[10px] font-bold shadow-2xs transition active:scale-95"
                                    title={`Bấm để cộng nhanh +50 cái vào phân loại ${v.name}`}
                                  >
                                    +50
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* TAB: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-pink-100 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-500" />
                <span>Quản Lý Danh Mục Sản Phẩm Omachi ({categories.length})</span>
              </h3>
              <p className="text-xs text-gray-500">
                Tự do tạo mới, đổi icon, sửa tên hoặc phân loại lại danh mục. Dữ liệu sẽ tự động đồng bộ ngay vào thanh bộ lọc trang chủ và danh sách chọn sản phẩm.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-rose-200 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh Mục Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => {
              const countProducts = products.filter(p => p.categoryId === cat.id || p.category === cat.slug || p.category === cat.id).length;

              return (
                <div key={cat.id || idx} className="p-3 sm:p-4 rounded-2xl border border-pink-100 bg-pink-50/20 hover:border-pink-200 transition space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-white rounded-xl border border-pink-100 shadow-2xs">
                          {cat.icon || '🌸'}
                        </span>
                        <div>
                          <h4 className="font-black text-gray-800 text-sm">{cat.name}</h4>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-rose-700 shrink-0">
                        {countProducts} sản phẩm
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-pink-100/60">
                    <button
                      type="button"
                      onClick={() => {
                        setProductCategoryFilter(cat.id);
                        setActiveTab('products');
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <span>Xem {countProducts} mẫu ➔</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-gray-700 hover:bg-pink-50 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3 h-3 text-pink-600" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: FEEDBACKS / REVIEWS MANAGEMENT */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-pink-100 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <span>Quản Lý Đánh Giá Khách Hàng (#OmachiFeedback)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Toàn bộ feedback hiển thị trên trang chủ được lấy trực tiếp từ Database tại đây. Bạn có thể tự thêm, sửa lời khen hoặc xóa feedback.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddFeedback}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Feedback Khách Hàng</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl border border-pink-100 bg-pink-50/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <p className="text-xs text-gray-700 italic leading-relaxed bg-white p-3 rounded-xl border border-pink-100">
                    &quot;{fb.comment}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center">
                      {fb.avatarText || fb.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{fb.customerName} {fb.customerLocation ? `(${fb.customerLocation})` : ''}</p>
                      <p className="text-[10px] text-gray-400">Đã mua: {fb.purchasedProduct || 'Phụ kiện charm'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditFeedback(fb)}
                      className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100 transition"
                      title="Sửa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(fb.id, fb.customerName)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-xs space-y-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-500" />
                <span>Cấu Hình Toàn Diện Cửa Hàng (Dynamic Config)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tùy chỉnh mọi nội dung cửa hàng: Ảnh Lookbook Banner, Chính sách mua hàng, Slogan, Mạng xã hội, Hotline &amp; Telegram!
              </p>
            </div>
          </div>

          <form
            id="shop-settings-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                try {
                  localStorage.setItem('omachi_shop_settings', JSON.stringify(settings));
                } catch (lsErr) {}

                const res = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(settings),
                });
                const data = await res.json();
                if (data.success) {
                  setActionSuccessMsg('Đã lưu toàn bộ cấu hình shop thành công! ✨');
                  setTimeout(() => setActionSuccessMsg(''), 3000);
                  confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
                }
              } catch (err) {
                console.error(err);
                setActionSuccessMsg('Đã lưu cấu hình vào máy thành công! ✨');
                setTimeout(() => setActionSuccessMsg(''), 3000);
              }
            }}
            className="space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              
              {/* ===== CỘT TRÁI (LEFT COLUMN) ===== */}
              <div className="space-y-6">
                
                {/* 1. HERO LOOKBOOK IMAGE CONFIG */}
                <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 to-rose-50/30 border border-pink-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-rose-500" />
                      <span>1. Bộ Sưu Tập Ảnh Banner Shop (Hero Slideshow Lookbook)</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Bạn có thể tải lên <strong>nhiều ảnh</strong> cùng lúc. Website sẽ tự động trình chiếu luân phiên dạng slideshow hiệu ứng mượt mà và có thanh thumbnail bên dưới.
                  </p>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                    {/* Upload Controls */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition transform active:scale-95">
                        <UploadCloud className="w-4 h-4" />
                        <span>{uploadingHeroImage ? '⚡ Đang nén & tải ảnh banner...' : '📁 Tải ảnh từ máy (Nén nhanh WebP)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleHeroImageUpload}
                          disabled={uploadingHeroImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-gray-400">hoặc thêm link ảnh bên dưới</span>
                    </div>

                    {heroImageUploadError && (
                      <p className="text-xs text-rose-500 font-semibold">{heroImageUploadError}</p>
                    )}

                    {/* Add URL button */}
                    <div className="flex items-center gap-2">
                      <input
                        id="newHeroUrlInput"
                        type="text"
                        placeholder="Dán link ảnh URL (https://...) rồi bấm nút Thêm"
                        className="flex-1 px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none text-rose-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.currentTarget.value || '').trim();
                            if (val) {
                              const existing = (settings.heroImages && settings.heroImages.length > 0)
                                ? settings.heroImages.filter(Boolean)
                                : (settings.heroImage ? [settings.heroImage] : []);
                              const combined = [...existing, val];
                              setSettings({ ...settings, heroImage: combined[0], heroImages: combined });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newHeroUrlInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const val = input.value.trim();
                            const existing = (settings.heroImages && settings.heroImages.length > 0)
                              ? settings.heroImages.filter(Boolean)
                              : (settings.heroImage ? [settings.heroImage] : []);
                            const combined = [...existing, val];
                            setSettings({ ...settings, heroImage: combined[0], heroImages: combined });
                            input.value = '';
                          }
                        }}
                        className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-2xs transition active:scale-95"
                      >
                        + Thêm Link
                      </button>
                    </div>

                    {/* Badge text input */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">Chữ nhãn đè trên ảnh (Badge text):</label>
                      <input
                        type="text"
                        value={settings.heroBadge || ''}
                        onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                        placeholder="Ảnh thật tại tiệm 100% ✨"
                        className="w-full px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-xl font-bold text-xs"
                      />
                    </div>

                    {/* Multi-Image Preview Gallery for Hero Banner */}
                    <div className="pt-2 border-t border-pink-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700">
                          Danh sách ảnh banner đang có ({((settings.heroImages && settings.heroImages.length > 0) ? settings.heroImages : (settings.heroImage ? [settings.heroImage] : [])).length} ảnh):
                        </span>
                        <span className="text-[10px] text-gray-400">Ảnh đầu tiên sẽ hiển thị trước nhất</span>
                      </div>

                      {(() => {
                        const currentHeroList = (settings.heroImages && settings.heroImages.length > 0)
                          ? settings.heroImages.filter(Boolean)
                          : (settings.heroImage ? [settings.heroImage] : []);

                        if (currentHeroList.length === 0) {
                          return (
                            <div className="p-3 border-2 border-dashed border-pink-200 rounded-xl text-center text-gray-400 text-xs">
                              Chưa có ảnh banner nào. Hãy tải ảnh lên từ máy tính.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {currentHeroList.map((imgUrl, hIdx) => (
                              <div
                                key={hIdx}
                                className={`relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-pink-50/40 shadow-2xs transition ${
                                  hIdx === 0 ? 'border-rose-500 ring-2 ring-rose-200' : 'border-pink-100 hover:border-pink-300'
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Banner Lookbook ${hIdx}`}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/charm_feed_1.jpg';
                                  }}
                                  className="w-full h-full object-cover"
                                />

                                {hIdx === 0 && (
                                  <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                    ⭐ Ảnh đầu
                                  </span>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                  {hIdx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...currentHeroList];
                                        const [moved] = list.splice(hIdx, 1);
                                        list.unshift(moved);
                                        setSettings({ ...settings, heroImage: list[0], heroImages: list });
                                      }}
                                      className="p-1 bg-white text-gray-800 rounded-md text-[10px] font-bold shadow-xs hover:bg-rose-50"
                                      title="Đặt làm ảnh đầu tiên"
                                    >
                                      ⭐ Lên đầu
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = currentHeroList.filter((_, i) => i !== hIdx);
                                      setSettings({ ...settings, heroImage: list[0] || '', heroImages: list });
                                    }}
                                    className="p-1 bg-rose-600 text-white rounded-md text-[10px] font-bold shadow-xs hover:bg-rose-700"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>

                {/* 2. BANNER TEXT & BRANDING */}
                <div className="space-y-4 p-5 rounded-2xl bg-white border border-pink-200 shadow-2xs">
                  <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>2. Nội Dung Banner &amp; Tiêu Đề Website</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Dải Thông Báo Chạy Trên Cùng (Top Announcement Bar):</label>
                      <input
                        type="text"
                        value={settings.bannerText || ''}
                        onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Tiêu Đề Lớn Banner (Hero Title):</label>
                        <input
                          type="text"
                          value={settings.heroTitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl font-bold text-rose-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Slogan Phụ / Giới Thiệu Ngắn:</label>
                        <input
                          type="text"
                          value={settings.slogan || ''}
                          onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Đoạn Mô Tả Dưới Banner Hero (Hero Subtitle):</label>
                      <textarea
                        rows={2}
                        value={settings.heroSubtitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Địa Chỉ Shop / Xưởng:</label>
                        <input
                          type="text"
                          value={settings.shopAddress || ''}
                          onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                          className="w-full px-3.5 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Giờ Làm Việc:</label>
                        <input
                          type="text"
                          value={settings.workingHours || ''}
                          onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                          className="w-full px-3.5 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                        <input
                          type="checkbox"
                          checked={settings.showFeedbacks !== false}
                          onChange={(e) => setSettings({ ...settings, showFeedbacks: e.target.checked })}
                          className="w-4 h-4 text-rose-500 rounded-md focus:ring-rose-400"
                        />
                        <span>Hiển thị khối &quot;Khách Yêu Nói Gì Về Omachi&quot; trên trang chủ</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. LIÊN KẾT MẠNG XÃ HỘI */}
                <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-r from-pink-50/50 to-purple-50/50 border border-pink-200 shadow-2xs">
                  <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    <span>3. Liên Kết Mạng Xã Hội (Instagram &amp; TikTok)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Instagram */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-pink-100 shadow-xs">
                      <div className="flex items-center gap-2 font-bold text-pink-700">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span>Instagram Shop</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Tên tài khoản (Handle):</label>
                        <input
                          type="text"
                          value={settings.instagramHandle || ''}
                          onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                          placeholder="@omachi.handmade"
                          className="w-full px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Link Instagram trực tiếp:</label>
                        <input
                          type="text"
                          value={settings.instagramUrl || ''}
                          onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/omachi.handmade"
                          className="w-full px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-lg font-medium text-pink-600"
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-pink-100 shadow-xs">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span className="text-base">🎵</span>
                        <span>TikTok Shop / Channel</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Tên tài khoản (Handle):</label>
                        <input
                          type="text"
                          value={settings.tiktokHandle || ''}
                          onChange={(e) => setSettings({ ...settings, tiktokHandle: e.target.value })}
                          placeholder="@omachi_charm"
                          className="w-full px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Link TikTok trực tiếp:</label>
                        <input
                          type="text"
                          value={settings.tiktokUrl || ''}
                          onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                          placeholder="https://tiktok.com/@omachi_charm"
                          className="w-full px-3 py-1.5 bg-pink-50/30 border border-pink-200 rounded-lg font-medium text-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. LIÊN HỆ ZALO & HOTLINE */}
                <div className="space-y-4 p-5 rounded-2xl bg-blue-50/40 border border-blue-200 shadow-2xs">
                  <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>4. Liên Hệ Zalo &amp; Hotline Bán Hàng</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Số Điện Thoại Zalo Nhận Đơn:</label>
                      <input
                        type="text"
                        value={settings.zaloPhone || ''}
                        onChange={(e) => setSettings({ ...settings, zaloPhone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl font-bold text-blue-700"
                        placeholder="0988888888"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Hệ thống mở link zalo.me/SĐT khi bạn duyệt đơn</p>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Hotline / Số Điện Thoại Tư Vấn:</label>
                      <input
                        type="text"
                        value={settings.hotline || ''}
                        onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl font-bold"
                        placeholder="0988.888.888"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* ===== CỘT PHẢI (RIGHT COLUMN) ===== */}
              <div className="space-y-6">
                
                {/* 5. PURCHASE POLICIES CONFIG */}
                <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-pink-50/40 border border-amber-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>5. Chính Sách Mua Hàng &amp; Cam Kết Của Tiệm</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Các cam kết giúp khách hàng an tâm bấm mua (đồng kiểm, đổi trả, ảnh thật, đóng gói). Bạn có thể chỉnh sửa nội dung từng mốc dưới đây:
                  </p>

                  <div className="space-y-3">
                    {(settings.purchasePolicies && settings.purchasePolicies.length > 0 ? settings.purchasePolicies : [
                      { icon: '📦', title: 'Đồng Kiểm Khi Nhận Hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.' },
                      { icon: '🔄', title: 'Đổi Trả 1-1 Trong 48 Giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.' },
                      { icon: '🎀', title: '100% Ảnh Thật Tại Xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
                      { icon: '🚚', title: 'Gói Quà Pastel & Giao Nhanh', desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
                    ]).map((pol, pIdx) => (
                      <div key={pIdx} className="p-3 bg-white rounded-xl border border-pink-100 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pol.icon || '✨'}
                            onChange={(e) => {
                              const currentList = settings.purchasePolicies || [
                                { icon: '📦', title: 'Đồng Kiểm Khi Nhận Hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.' },
                                { icon: '🔄', title: 'Đổi Trả 1-1 Trong 48 Giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.' },
                                { icon: '🎀', title: '100% Ảnh Thật Tại Xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
                                { icon: '🚚', title: 'Gói Quà Pastel & Giao Nhanh', desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
                              ];
                              const updated = [...currentList];
                              updated[pIdx] = { ...updated[pIdx], icon: e.target.value };
                              setSettings({ ...settings, purchasePolicies: updated });
                            }}
                            className="w-10 text-center px-1 py-1 bg-pink-50/50 border border-pink-200 rounded-lg text-sm font-bold"
                            title="Biểu tượng icon"
                          />
                          <input
                            type="text"
                            value={pol.title || ''}
                            onChange={(e) => {
                              const currentList = settings.purchasePolicies || [
                                { icon: '📦', title: 'Đồng Kiểm Khi Nhận Hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.' },
                                { icon: '🔄', title: 'Đổi Trả 1-1 Trong 48 Giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.' },
                                { icon: '🎀', title: '100% Ảnh Thật Tại Xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
                                { icon: '🚚', title: 'Gói Quà Pastel & Giao Nhanh', desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
                              ];
                              const updated = [...currentList];
                              updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                              setSettings({ ...settings, purchasePolicies: updated });
                            }}
                            placeholder="Tên chính sách..."
                            className="flex-1 px-3 py-1 bg-pink-50/30 border border-pink-200 rounded-lg font-bold text-gray-800 text-xs"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={pol.desc || ''}
                          onChange={(e) => {
                            const currentList = settings.purchasePolicies || [
                              { icon: '📦', title: 'Đồng Kiểm Khi Nhận Hàng', desc: 'Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX.' },
                              { icon: '🔄', title: 'Đổi Trả 1-1 Trong 48 Giờ', desc: 'Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc.' },
                              { icon: '🎀', title: '100% Ảnh Thật Tại Xưởng', desc: 'Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ.' },
                              { icon: '🚚', title: 'Gói Quà Pastel & Giao Nhanh', desc: 'Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày.' },
                            ];
                            const updated = [...currentList];
                            updated[pIdx] = { ...updated[pIdx], desc: e.target.value };
                            setSettings({ ...settings, purchasePolicies: updated });
                          }}
                          placeholder="Mô tả quyền lợi của khách hàng..."
                          className="w-full px-3 py-1.5 bg-pink-50/20 border border-pink-200 rounded-lg text-gray-600 text-[11px]"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Ghi Chú Thêm Về Chính Sách (Hiển thị phụ):</label>
                    <textarea
                      rows={2}
                      value={settings.purchasePolicyDetail || ''}
                      onChange={(e) => setSettings({ ...settings, purchasePolicyDetail: e.target.value })}
                      placeholder="VD: Khách hàng vui lòng quay video khi bóc mở kiện hàng để được hỗ trợ nhanh nhất..."
                      className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-gray-700 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* 6. TELEGRAM BOT NOTIFICATIONS */}
                <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50/40 p-5 rounded-2xl border border-sky-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-sky-100">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="font-black text-sky-900 text-xs sm:text-sm">
                        6. Thông Báo Đơn Hàng Tự Động Qua Telegram
                      </h4>
                      <p className="text-[11px] text-sky-700">
                        Điện thoại rung chuông &quot;Ting ting&quot; ngay sau 0.1s mỗi khi có đơn mới
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1 flex items-center justify-between">
                        <span>Telegram Bot Token:</span>
                        <span className="text-[10px] font-normal text-gray-400">Từ @BotFather</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 7123456789:AAHkxxxxxxx..."
                        value={settings.telegramBotToken || ''}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-mono text-[11px] text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1 flex items-center justify-between">
                        <span>Telegram Chat ID:</span>
                        <span className="text-[10px] font-normal text-gray-400">Từ @userinfobot</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 123456789"
                        value={settings.telegramChatId || ''}
                        onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-mono text-[11px] text-gray-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-gray-700 block mb-1">
                        Link Website Của Shop (Gắn vào nút Xem Đơn trên Telegram):
                      </label>
                      <input
                        type="text"
                        placeholder="Để trống để tự động nhận diện theo tên miền web của bạn..."
                        value={settings.websiteUrl || ''}
                        onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-mono text-[11px] text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sky-900 text-xs">
                      <input
                        type="checkbox"
                        checked={settings.enableTelegramNotify !== false}
                        onChange={(e) => setSettings({ ...settings, enableTelegramNotify: e.target.checked })}
                        className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-400"
                      />
                      <span>Kích hoạt tính năng tự động nổ thông báo về điện thoại</span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* 7. CẤU HÌNH THANH TOÁN (NGÂN HÀNG VIETQR) & FREESHIP */}
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50/40 p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-purple-100">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h4 className="font-black text-purple-900 text-xs sm:text-sm">
                        7. Cấu Hình Thanh Toán Chuyển Khoản VietQR &amp; Ngưỡng Miễn Phí Ship
                      </h4>
                      <p className="text-[11px] text-purple-700">
                        Thiết lập thông tin nhận tiền qua Chuyển khoản VietQR và số tiền tối thiểu để được Freeship khi thanh toán trước
                      </p>
                    </div>
                  </div>

                  {/* Ngưỡng Freeship */}
                  <div className="p-3.5 bg-white rounded-xl border border-purple-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Chính Sách Miễn Phí Vận Chuyển (Freeship Khi Thanh Toán Trước)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 text-xs">
                        <input
                          type="checkbox"
                          checked={settings.enablePrepaidFreeShip !== false}
                          onChange={(e) => setSettings({ ...settings, enablePrepaidFreeShip: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Bật chính sách này</span>
                      </label>
                    </div>

                    <div>
                      <div className="mb-1">
                        <label className="font-bold text-gray-700 text-[11px]">
                          Số tiền đơn hàng tối thiểu để được Freeship (VNĐ):
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={settings.prepaidFreeShipThreshold !== undefined ? settings.prepaidFreeShipThreshold : (settings.freeShippingThreshold || 0)}
                          onChange={(e) => setSettings({ ...settings, prepaidFreeShipThreshold: Math.max(0, Number(e.target.value)) })}
                          placeholder="VD: 10000 để test, hoặc 200000"
                          className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-rose-600 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500 font-medium">VNĐ</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Khi khách đặt đơn từ số tiền này và chọn <strong>Chuyển khoản VietQR</strong>, cước ship sẽ tự động chuyển thành <strong>0đ</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Cấu hình Ngân Hàng VietQR */}
                  <div className="p-3.5 bg-white rounded-xl border border-sky-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>Thông Tin Tài Khoản Ngân Hàng (VietQR)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Ngân Hàng:</label>
                        <select
                          value={settings.bankId || 'MB'}
                          onChange={(e) => setSettings({ ...settings, bankId: e.target.value })}
                          className="w-full px-2.5 py-2 bg-white border border-sky-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-sky-400 focus:outline-none text-xs"
                        >
                          <option value="MB">MBBank (Quân Đội)</option>
                          <option value="VCB">Vietcombank</option>
                          <option value="TCB">Techcombank</option>
                          <option value="ACB">ACB</option>
                          <option value="VPB">VPBank</option>
                          <option value="TPB">TPBank</option>
                          <option value="BIDV">BIDV</option>
                          <option value="VIB">VIB</option>
                          <option value="AGR">Agribank</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Số Tài Khoản:</label>
                        <input
                          type="text"
                          placeholder="VD: 0398445122"
                          value={settings.bankAccount || ''}
                          onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-sky-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Tên Chủ Tài Khoản:</label>
                        <input
                          type="text"
                          placeholder="VD: OMACHI STORE"
                          value={settings.bankOwner || ''}
                          onChange={(e) => setSettings({ ...settings, bankOwner: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-sky-400 focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 8. CƠ SỞ DỮ LIỆU ĐÁM MÂY SUPABASE (CLOUD DATABASE) */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-white rounded-2xl border-2 border-emerald-300 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">⚡</span>
                        <div>
                          <h4 className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                            <span>Cơ Sở Dữ Liệu Đám Mây Supabase (Cloud Database)</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Lưu Trữ Vĩnh Viễn
                            </span>
                          </h4>
                          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            Đơn hàng, sản phẩm và cấu hình được bảo mật và đồng bộ tự động 24/7 lên Supabase PostgreSQL.
                          </p>
                        </div>
                      </div>
                    </div>

                    {supabaseStatusMsg && (
                      <div className={`p-3 rounded-xl text-xs font-bold transition ${
                        supabaseConnected === true
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                          : supabaseConnected === false
                          ? 'bg-amber-100 border border-amber-300 text-amber-900'
                          : 'bg-stone-100 border border-stone-200 text-stone-800'
                      }`}>
                        {supabaseStatusMsg}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSyncSupabase}
                        disabled={supabaseSyncing}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                        <span>{supabaseSyncing ? 'Đang Xử Lý...' : '⚡ Đồng Bộ Lên Supabase'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCheckSupabase}
                        disabled={supabaseSyncing}
                        className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kiểm Tra Kết Nối</span>
                      </button>

                      <a
                        href="https://supabase.com/dashboard/project/idkppwrfxvxffsflibar/editor"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <span>📊 Mở Supabase (Xem Dữ Liệu Như Excel)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>
                  </div>

                </div>

                {/* BIG SAVE BUTTON AT BOTTOM */}
            <div className="pt-4 border-t border-pink-100 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-extrabold text-sm shadow-lg shadow-rose-200 transition transform active:scale-98 flex items-center justify-center gap-2"
              >
                <span>💾 Lưu Toàn Bộ Cài Đặt Shop ✨</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL - MODERN MINIMALIST DESIGN */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* 1. MODAL HEADER */}
            <div className="shrink-0 px-5 sm:px-6 py-4 bg-white border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 line-clamp-1">
                  {editingProduct.id ? `Chỉnh sửa: ${editingProduct.name}` : 'Thêm sản phẩm mới'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Thiết lập thông tin, giá bán lẻ &amp; giá sỉ, hình ảnh và phân loại
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR - 3 UNIFIED TABS */}
            <div className="shrink-0 px-5 sm:px-6 py-2.5 bg-stone-50/80 border-b border-stone-200/70">
              <div className="flex items-center gap-1.5 bg-stone-200/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setProductModalTab('BASIC')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    productModalTab === 'BASIC'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>1. Thông tin chung</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('PRICING')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    productModalTab === 'PRICING'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>2. Giá bán &amp; Bán sỉ</span>
                  {(editingProduct.comboTiers?.length || 0) > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {editingProduct.comboTiers?.length} mốc sỉ
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('MEDIA')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                    productModalTab === 'MEDIA'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>3. Hình ảnh &amp; Màu sắc</span>
                  {((editingProduct.images?.length || 0) > 0 || (editingProduct.variants?.length || 0) > 0) && (
                    <span className="bg-stone-100 text-stone-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {(editingProduct.images?.length || 0) + (editingProduct.variants?.length || 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. MODAL BODY (SCROLLABLE) */}
            <form onSubmit={handleSaveProduct} noValidate className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs flex flex-col justify-between">
              
              <div className="space-y-5">
                {/* TAB 1: THÔNG TIN CHUNG */}
                {productModalTab === 'BASIC' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Tên & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs flex items-center gap-1">
                          <span>Tên sản phẩm</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="Nhập tên sản phẩm..."
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs">Mã SKU</label>
                        <input
                          type="text"
                          value={editingProduct.sku || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                          placeholder="VD: OM-BEAD-01"
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-mono text-stone-800 text-sm font-semibold focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Danh mục & Cân nặng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs block">Danh mục</label>
                        <select
                          value={
                            editingProduct.categoryId || 
                            categories.find((c) => c.slug === editingProduct.category)?.id || 
                            (categories[0]?.id || '')
                          }
                          onChange={(e) => {
                            const selectedVal = e.target.value;
                            const selectedCat = categories.find((c) => c.id === selectedVal || c.slug === selectedVal);
                            if (selectedCat) {
                              setEditingProduct({
                                ...editingProduct,
                                category: selectedCat.slug,
                                categoryId: selectedCat.id,
                                categoryName: selectedCat.name,
                              });
                            }
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-800 text-sm focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs block">Cân nặng kiện hàng (gram)</label>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.weight !== undefined && editingProduct.weight !== null ? editingProduct.weight : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, weight: Math.max(0, Number(e.target.value)) })}
                          placeholder="Mặc định: 50g"
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-semibold text-stone-800 text-sm focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Chất liệu & Kích thước */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs">Chất liệu</label>
                        <input
                          type="text"
                          value={editingProduct.material || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                          placeholder="VD: Acrylic trong suốt, Cườm đá..."
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-800 text-sm focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-stone-700 text-xs">Kích thước / Chiều dài</label>
                        <input
                          type="text"
                          value={editingProduct.dimensions || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                          placeholder="VD: Hạt 8mm - 12mm, dây 16cm..."
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-800 text-sm focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Checkbox nhãn / Thuộc tính hiển thị */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-semibold text-stone-700 text-xs block">Thuộc tính hiển thị gian hàng</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                          editingProduct.isHot
                            ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={editingProduct.isHot || false}
                            onChange={(e) => setEditingProduct({ ...editingProduct, isHot: e.target.checked })}
                            className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                          />
                          <span className="text-xs">Sản phẩm Bán chạy (Hot)</span>
                        </label>

                        <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                          editingProduct.isNewArrival
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={editingProduct.isNewArrival || false}
                            onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                          />
                          <span className="text-xs">Hàng Mới Về</span>
                        </label>

                        <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                          editingProduct.isCustomizable
                            ? 'bg-purple-50 border-purple-200 text-purple-900 font-semibold'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={editingProduct.isCustomizable || false}
                            onChange={(e) => setEditingProduct({ ...editingProduct, isCustomizable: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded border-stone-300 focus:ring-purple-500"
                          />
                          <span className="text-xs">Custom theo cỡ tay</span>
                        </label>
                      </div>
                    </div>

                    {/* Mô tả chi tiết sản phẩm */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-semibold text-stone-700 text-xs">Mô tả chi tiết sản phẩm</label>
                      <textarea
                        rows={4}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Mô tả chi tiết về sản phẩm, hướng dẫn phối phụ kiện, cách bảo quản..."
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-xs text-stone-800 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: GIÁ BÁN & BÁN SỈ (GỘP CHUNG GIÁ LẺ, GIÁ VỐN, QUY CÁCH MIN/STEP VÀ MỐC SỈ) */}
                {productModalTab === 'PRICING' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* 1. Giá bán lẻ & Giá vốn */}
                    <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                        <DollarSign className="w-4 h-4 text-stone-600" />
                        <span>1. Thiết Lập Giá Bán Lẻ &amp; Giá Vốn</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-stone-700 text-xs flex items-center gap-1">
                            <span>Giá bán lẻ 1 chiếc (VNĐ)</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            step="any"
                            value={editingProduct.basePrice || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-rose-600 text-base focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-semibold text-stone-700 text-xs">Giá vốn nhập kho (VNĐ)</label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={editingProduct.costPrice || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                            placeholder="Tùy chọn (để theo dõi giá nhập)"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl font-semibold text-stone-800 text-sm focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Cảnh báo bán xả kho (chỉ hiện khi giá bán < giá vốn) */}
                      {editingProduct.basePrice !== undefined && editingProduct.costPrice !== undefined && Number(editingProduct.costPrice) > 0 && Number(editingProduct.basePrice) < Number(editingProduct.costPrice) && (
                        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Lưu ý: Giá bán lẻ thấp hơn giá vốn (-{formatVND(Number(editingProduct.costPrice) - Number(editingProduct.basePrice))}/cái - Bán xả kho). Vẫn cho phép lưu.</span>
                        </div>
                      )}
                    </div>

                    {/* 2. Quy Cách Đặt Hàng (Min Qty & Step Qty) */}
                    <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-stone-600" />
                          <span>2. Quy Cách Mua &amp; Số Lượng Tối Thiểu</span>
                        </span>
                        <span className="text-[11px] text-stone-400">Giới hạn số lượng mua lẻ</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block text-xs">
                            Mua tối thiểu (Min Qty):
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={editingProduct.minOrderQuantity || 1}
                            onChange={(e) => setEditingProduct({ ...editingProduct, minOrderQuantity: Math.max(1, Number(e.target.value)) })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-800 text-xs"
                          />
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, minOrderQuantity: 1, stepQuantity: 1 })}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                            >
                              Lẻ (1)
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, minOrderQuantity: 10, stepQuantity: 10 })}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                            >
                              10 cái
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, minOrderQuantity: 50, stepQuantity: 50 })}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                            >
                              Bịch 50
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, minOrderQuantity: 100, stepQuantity: 100 })}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                            >
                              Bịch 100
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block text-xs">
                            Bước nhảy số lượng (Step Qty):
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={editingProduct.stepQuantity || 1}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stepQuantity: Math.max(1, Number(e.target.value)) })}
                            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-800 text-xs"
                          />
                          <p className="text-[10px] text-stone-500 mt-1">
                            {editingProduct.stepQuantity && editingProduct.stepQuantity > 1
                              ? `Tăng/giảm theo bước nhảy ${editingProduct.stepQuantity} cái/lần.`
                              : 'Tăng/giảm từng chiếc 1.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Bảng mốc giá sỉ */}
                    <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                            <Tag className="w-4 h-4 text-stone-600" />
                            <span>3. Bảng Mốc Giá Sỉ Bậc Thang (Theo Số Lượng)</span>
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            Khách mua đạt số lượng sẽ tự động áp dụng mức giá sỉ tương ứng
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={applyShopCustomTemplate}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                            <span>Mẫu có sẵn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentTiers = editingProduct.comboTiers || [];
                              const lastMin = currentTiers.length > 0 ? currentTiers[currentTiers.length - 1].minQuantity * 2 : 10;
                              const base = Number(editingProduct.basePrice) || 2000;
                              setEditingProduct({
                                ...editingProduct,
                                comboTiers: [
                                  ...currentTiers,
                                  {
                                    minQuantity: lastMin,
                                    unitPrice: Math.round(base * 0.9),
                                    label: `Mua từ ${lastMin} cái`,
                                    badge: 'Sỉ',
                                  },
                                ],
                              });
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                          >
                            + Thêm Mốc
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(editingProduct.comboTiers || []).length === 0 ? (
                          <p className="text-stone-400 italic text-center py-3 text-xs">
                            Chưa có mốc giá sỉ. Bấm &quot;Mẫu có sẵn&quot; hoặc &quot;+ Thêm Mốc&quot; để thiết lập.
                          </p>
                        ) : (
                          (editingProduct.comboTiers || []).map((tier, idx) => (
                            <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                              <div className="w-24">
                                <span className="text-[10px] text-stone-500 block font-medium">Từ số lượng:</span>
                                <input
                                  type="number"
                                  min={1}
                                  step="any"
                                  value={tier.minQuantity}
                                  onChange={(e) => {
                                    const newQty = Number(e.target.value);
                                    const newTiers = [...(editingProduct.comboTiers || [])];
                                    const curLabel = newTiers[idx].label || '';
                                    const isAuto = !curLabel || curLabel.includes('pcs') || curLabel.includes('Combo') || curLabel.startsWith('Mốc ') || curLabel.startsWith('Mua từ ');
                                    newTiers[idx] = {
                                      ...newTiers[idx],
                                      minQuantity: newQty,
                                      label: isAuto ? `Mua từ ${newQty} cái` : curLabel
                                    };
                                    setEditingProduct({ ...editingProduct, comboTiers: newTiers });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-center text-xs"
                                />
                              </div>

                              <div className="w-28">
                                <span className="text-[10px] text-stone-500 block font-medium">Đơn giá sỉ:</span>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={tier.unitPrice}
                                  onChange={(e) => {
                                    const newTiers = [...(editingProduct.comboTiers || [])];
                                    newTiers[idx] = { ...newTiers[idx], unitPrice: Number(e.target.value) };
                                    setEditingProduct({ ...editingProduct, comboTiers: newTiers });
                                  }}
                                  className={`w-full px-2 py-1 border rounded-lg font-bold text-center text-xs ${
                                    Number(editingProduct.costPrice) > 0 && Number(tier.unitPrice) > 0 && Number(tier.unitPrice) < Number(editingProduct.costPrice)
                                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                                      : 'bg-white border-stone-200 text-rose-600'
                                  }`}
                                />
                              </div>

                              <div className="flex-1 min-w-[130px]">
                                <span className="text-[10px] text-stone-500 block font-medium">Tên nút chọn sỉ (tùy chỉnh):</span>
                                <input
                                  type="text"
                                  value={tier.label}
                                  onChange={(e) => {
                                    const newTiers = [...(editingProduct.comboTiers || [])];
                                    newTiers[idx] = { ...newTiers[idx], label: e.target.value };
                                    setEditingProduct({ ...editingProduct, comboTiers: newTiers });
                                  }}
                                  placeholder={`Tự động: Mua từ ${tier.minQuantity} cái`}
                                  className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-medium text-xs text-stone-800"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const newTiers = (editingProduct.comboTiers || []).filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, comboTiers: newTiers });
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition shrink-0 mt-3 cursor-pointer"
                                title="Xóa mốc này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: HÌNH ẢNH & PHÂN LOẠI MÀU SẮC */}
                {productModalTab === 'MEDIA' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* 1. Bộ sưu tập hình ảnh */}
                    <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-800 text-xs block">
                          Bộ sưu tập hình ảnh ({editingProduct.images?.length || 0})
                        </label>
                        <span className="text-[11px] text-stone-400">
                          Ảnh đầu tiên là ảnh đại diện
                        </span>
                      </div>

                      {/* Dropzone upload */}
                      <label className={`cursor-pointer block border-2 border-dashed rounded-xl p-5 text-center transition ${
                        uploadingImage 
                          ? 'border-stone-300 bg-stone-100 cursor-not-allowed' 
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
                      }`}>
                        <UploadCloud className="w-7 h-7 text-stone-400 mx-auto mb-1.5" />
                        <span className="font-semibold text-stone-800 text-xs block">
                          {uploadingImage ? 'Đang nén và tải ảnh lên...' : 'Nhấn để chọn ảnh từ máy tính hoặc điện thoại'}
                        </span>
                        <span className="text-[11px] text-stone-400 block mt-0.5">
                          Tự động nén tối ưu WebP siêu nhanh, hỗ trợ chọn nhiều ảnh cùng lúc
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>

                      {imageUploadError && (
                        <p className="text-xs text-rose-500 font-semibold">⚠️ {imageUploadError}</p>
                      )}

                      {/* Manual URL input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          id="newImageUrlInput"
                          type="text"
                          placeholder="Hoặc dán đường link ảnh trực tiếp (https://...)"
                          className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-xs text-stone-800 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.currentTarget.value || '').trim();
                              if (val) {
                                const existing = (editingProduct.images || []).filter(Boolean);
                                setEditingProduct({ ...editingProduct, images: [...existing, val] });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('newImageUrlInput') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const existing = (editingProduct.images || []).filter(Boolean);
                              setEditingProduct({ ...editingProduct, images: [...existing, input.value.trim()] });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-semibold text-xs transition cursor-pointer shrink-0"
                        >
                          + Thêm Link
                        </button>
                      </div>

                      {/* Grid ảnh */}
                      {editingProduct.images && editingProduct.images.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                          {editingProduct.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className={`relative group rounded-xl overflow-hidden border-2 bg-stone-100 aspect-square transition ${
                                imgIdx === 0 ? 'border-stone-900 ring-2 ring-stone-300' : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Preview ${imgIdx}`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/charm_feed_1.jpg';
                                }}
                                className="w-full h-full object-cover"
                              />

                              {imgIdx === 0 && (
                                <span className="absolute top-1 left-1 bg-stone-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  Ảnh đại diện
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                {imgIdx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...(editingProduct.images || [])];
                                      const [moved] = list.splice(imgIdx, 1);
                                      list.unshift(moved);
                                      setEditingProduct({ ...editingProduct, images: list });
                                    }}
                                    className="p-1.5 bg-white text-stone-900 rounded-lg text-[10px] font-bold shadow-xs hover:bg-stone-100 transition cursor-pointer"
                                    title="Đặt làm ảnh đại diện"
                                  >
                                    Làm bìa
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (editingProduct.images || []).filter((_, i) => i !== imgIdx);
                                    setEditingProduct({ ...editingProduct, images: list });
                                  }}
                                  className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-rose-700 transition cursor-pointer"
                                  title="Xóa ảnh"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 border-2 border-dashed border-stone-200 rounded-xl text-center text-stone-400 text-xs">
                          Chưa có hình ảnh nào. Chọn ảnh từ máy tính hoặc dán link ở trên.
                        </div>
                      )}
                    </div>

                    {/* 2. Phân loại màu sắc */}
                    <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                            <Palette className="w-4 h-4 text-stone-600" />
                            <span>Phân Loại Màu Sắc &amp; Tồn Kho</span>
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            Nếu sản phẩm có nhiều màu sắc/phiên bản, thêm danh sách bên dưới
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentVariants = editingProduct.variants || [];
                            setEditingProduct({
                              ...editingProduct,
                              variants: [
                                ...currentVariants,
                                {
                                  id: `v-${Date.now()}`,
                                  name: `Màu ${currentVariants.length + 1}`,
                                  colorHex: '#FFB6C1',
                                  stock: 100,
                                  soldCount: 0,
                                  isActive: true,
                                },
                              ],
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold border border-stone-200 text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm phân loại</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(editingProduct.variants || []).length === 0 ? (
                          <p className="text-stone-400 italic text-center py-3 text-xs">
                            Sản phẩm đang bán dạng 1 mẫu tiêu chuẩn duy nhất (chưa chia phân loại màu).
                          </p>
                        ) : (
                          (editingProduct.variants || []).map((variant, vIdx) => (
                            <div key={vIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                              <div className="w-9 shrink-0 flex items-center justify-center">
                                <input
                                  type="color"
                                  value={variant.colorHex || '#FFB6C1'}
                                  onChange={(e) => {
                                    const newVariants = [...(editingProduct.variants || [])];
                                    newVariants[vIdx] = { ...newVariants[vIdx], colorHex: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: newVariants });
                                  }}
                                  className="w-7 h-7 rounded-lg cursor-pointer border border-stone-200 bg-transparent"
                                  title="Chọn màu đại diện"
                                />
                              </div>

                              <div className="flex-1 min-w-[140px]">
                                <span className="text-[10px] text-stone-500 block">Tên phân loại:</span>
                                <input
                                  type="text"
                                  value={variant.name}
                                  onChange={(e) => {
                                    const newVariants = [...(editingProduct.variants || [])];
                                    newVariants[vIdx] = { ...newVariants[vIdx], name: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: newVariants });
                                  }}
                                  placeholder="VD: Hồng Pastel, Trắng Kem..."
                                  className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-semibold text-stone-800 text-xs"
                                />
                              </div>

                              <div className="w-24">
                                <span className="text-[10px] text-stone-500 block">Tồn kho:</span>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={variant.stock ?? 0}
                                  onChange={(e) => {
                                    const newVariants = [...(editingProduct.variants || [])];
                                    newVariants[vIdx] = { ...newVariants[vIdx], stock: Number(e.target.value) };
                                    setEditingProduct({ ...editingProduct, variants: newVariants });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-800 text-center text-xs"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const newVariants = (editingProduct.variants || []).filter((_, i) => i !== vIdx);
                                  setEditingProduct({ ...editingProduct, variants: newVariants });
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition shrink-0 mt-3 cursor-pointer"
                                title="Xóa phân loại"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. MODAL FOOTER (STICKY BOTTOM ACTION BUTTONS) */}
              <div className="pt-4 mt-6 border-t border-stone-200 flex items-center justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSavingProduct}
                  className="px-5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold transition text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-7 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-xs transition active:scale-98 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProduct ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingProduct.id ? 'Lưu Thay Đổi Sản Phẩm' : 'Tạo Sản Phẩm Mới'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK ADD / EDIT MODAL */}
      {isFeedbackModalOpen && editingFeedback && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-pink-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-gray-800">
                  {editingFeedback.id ? 'Sửa Đánh Giá Khách Hàng' : 'Thêm Đánh Giá Khách Hàng Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Tên Khách Hàng <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingFeedback.customerName || ''}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, customerName: e.target.value })}
                    placeholder="VD: Nguyễn Linh"
                    className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Khu Vực / Tỉnh Thành</label>
                  <input
                    type="text"
                    value={editingFeedback.customerLocation || ''}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, customerLocation: e.target.value })}
                    placeholder="VD: Hà Nội, TP.HCM"
                    className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Sản Phẩm Đã Mua</label>
                  <input
                    type="text"
                    value={editingFeedback.purchasedProduct || ''}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, purchasedProduct: e.target.value })}
                    placeholder="VD: Vòng tay bướm dạ quang"
                    className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Số Sao Đánh Giá (1 - 5)</label>
                  <select
                    value={editingFeedback.rating || 5}
                    onChange={(e) => setEditingFeedback({ ...editingFeedback, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-bold text-amber-600"
                  >
                    <option value={5}>★★★★★ (5 Sao Xuất Sắc)</option>
                    <option value={4}>★★★★☆ (4 Sao Hài Lòng)</option>
                    <option value={3}>★★★☆☆ (3 Sao)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Nội Dung Đánh Giá / Lời Khen <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={editingFeedback.comment || ''}
                  onChange={(e) => setEditingFeedback({ ...editingFeedback, comment: e.target.value })}
                  placeholder="Vòng cườm hoa bướm dạ quang xinh dã man luôn ạ..."
                  className="w-full px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-pink-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-extrabold shadow-md transition"
                >
                  {editingFeedback.id ? 'Lưu Thay Đổi' : 'Thêm Feedback ✨'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK RESTOCK (PHIẾU NHẬP KHO THÊM CHỐNG NHẦM LẪN) */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800 flex items-center gap-1.5">
                    <span>Phiếu Nhập Hàng Thêm Nhanh</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Chống nhầm lẫn 100%
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Chỉ cần điền số lượng nhập thêm, hệ thống tự động cộng dồn vào kho mà không sợ bấm nhầm sửa giá!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Product Quick Info Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-200">
              <img
                src={restockProduct.images?.[0] || '/images/charm_feed_1.jpg'}
                alt={restockProduct.name}
                className="w-14 h-14 rounded-xl object-cover border border-emerald-200 bg-white flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {restockProduct.categoryName || restockProduct.category}
                </span>
                <h4 className="text-sm font-extrabold text-gray-800 truncate mt-0.5">
                  {restockProduct.name}
                </h4>
                <p className="text-xs text-gray-500">
                  Tồn kho hiện tại: <strong className="text-gray-800">{restockProduct.stock || 0} cái</strong> • Bán lẻ: <strong className="text-rose-600">{formatVND(restockProduct.basePrice)}</strong>
                </p>
              </div>
            </div>

            {/* Variant List with Anti-Mistake Row Highlighting */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <p className="text-xs font-bold text-gray-700">
                Nhập số lượng thêm cho từng màu / phân loại:
              </p>

              {(!restockProduct.variants || restockProduct.variants.length === 0) ? (
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-800">Sản phẩm không có phân loại</span>
                    <p className="text-[11px] text-gray-500">Kho hiện tại: <strong>{restockProduct.stock || 0} cái</strong></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600">+</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={restockQuantities[0] || ''}
                      onChange={(e) => setRestockQuantities({ 0: Math.max(0, parseInt(e.target.value) || 0) })}
                      placeholder="0"
                      className="w-24 px-3 py-2 bg-white border border-emerald-300 rounded-xl font-black text-center text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                restockProduct.variants.map((variant, idx) => {
                  const addQty = restockQuantities[idx] || 0;
                  const currentStock = variant.stock || 0;
                  const newStock = currentStock + addQty;
                  const isActivelyRestocking = addQty > 0;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all ${
                        isActivelyRestocking
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Variant Info */}
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          {variant.colorHex ? (
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0 shadow-2xs"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-pink-300 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-gray-800">{variant.name}</p>
                            <p className="text-[11px] text-gray-500">
                              Hiện có: <strong className="text-gray-700">{currentStock} cái</strong>
                            </p>
                          </div>
                        </div>

                        {/* Quick Presets & Input */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick Add Presets */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRestockPreset(idx, 10)}
                              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition active:scale-95"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRestockPreset(idx, 50)}
                              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition active:scale-95"
                            >
                              +50
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRestockPreset(idx, 100)}
                              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition active:scale-95"
                            >
                              +100
                            </button>
                          </div>

                          {/* Manual Input */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-emerald-600">+</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={addQty === 0 ? '' : addQty}
                              onChange={(e) => setRestockQuantities({ ...restockQuantities, [idx]: Math.max(0, parseInt(e.target.value) || 0) })}
                              placeholder="0"
                              className="w-20 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl font-black text-center text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                            />
                            {addQty > 0 && (
                              <button
                                type="button"
                                onClick={() => setRestockQuantities({ ...restockQuantities, [idx]: 0 })}
                                className="text-[10px] text-gray-400 hover:text-rose-500 font-bold p-1"
                                title="Xóa số lượng nhập"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Projected Stock */}
                          <div className="min-w-[100px] text-right">
                            {isActivelyRestocking ? (
                              <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg border border-emerald-300">
                                ➔ {newStock} (+{addQty})
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                Giữ nguyên: {currentStock}
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Summary & Confirm Button */}
            {(() => {
              const totalAdded = Object.values(restockQuantities).reduce((a, b) => a + (Number(b) || 0), 0);
              const countModified = Object.values(restockQuantities).filter(v => (Number(v) || 0) > 0).length;

              return (
                <div className="pt-3.5 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-600">
                      Đang nhập thêm: <strong className="text-emerald-700 font-black text-sm">+{totalAdded} cái</strong> ({countModified} phân loại)
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Tồn kho sau khi nhập: <strong className="text-gray-800">{(restockProduct.stock || 0) + totalAdded} cái</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRestockProduct(null)}
                      disabled={isRestocking}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRestock}
                      disabled={isRestocking || totalAdded === 0}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 ${
                        totalAdded > 0
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-95'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>{isRestocking ? 'Đang cập nhật kho...' : '✅ Xác Nhận Nhập Kho'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-5">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingCategory.icon || '🌸'}</span>
                <div>
                  <h3 className="text-lg font-black text-gray-800">
                    {editingCategory.id ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}
                  </h3>
                  <p className="text-xs text-gray-500">Tùy biến loại sản phẩm theo nhu cầu kinh doanh của bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="VD: Dây Chuyền Bạc, Khuyên Tai Vintage, Túi Canvas..."
                  className="w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl font-bold text-gray-800 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">Biểu Tượng Emoji / Icon</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCategory.icon || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    placeholder="🌸"
                    className="w-16 px-3 py-2 bg-white border border-pink-200 rounded-xl font-black text-center text-lg focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {['🌸', '🎀', '✨', '💍', '📱', '🎁', '💎', '👑', '🧸', '🍓', '🪞', '🦋', '🫧', '🌷', '🌼'].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setEditingCategory({ ...editingCategory, icon: emoji })}
                        className="w-8 h-8 rounded-lg hover:bg-pink-100 text-base flex items-center justify-center transition border border-transparent hover:border-pink-200 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">Mô Tả Ngắn</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Mô tả các mẫu sản phẩm thuộc danh mục này..."
                  className="w-full px-3.5 py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={savingCategory}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{savingCategory ? 'Đang lưu...' : editingCategory.id ? 'Cập Nhật' : 'Tạo Danh Mục ✨'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
