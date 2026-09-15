import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

// ==========================================
// DETAILED ENTERPRISE E-COMMERCE DATABASE SCHEMA
// ==========================================

export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  colorHex: string;
  imageUrl?: string;
  stock: number;
  soldCount: number;
  isActive: boolean;
}

export interface ComboTier {
  id: string;
  minQuantity: number;
  unitPrice: number;
  label: string;
  badge: string;
  discountPercent: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  sku: string; // Mã quản lý nội bộ (VD: OM-BEAD-01)
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  basePrice: number; // Giá bán lẻ 1 chiếc
  originalPrice: number; // Giá niêm yết so sánh
  costPrice?: number; // Giá vốn nhập xưởng
  material?: string; // Chất liệu (Acrylic pastel, Bạc 925, Cườm đá)
  dimensions?: string; // Kích thước (8mm, 10mm, dây rút 14-18cm)
  images: string[];
  description: string;
  isHot: boolean;
  isNewArrival: boolean;
  isCustomizable: boolean;
  stock: number; // Tổng tồn kho
  soldCount: number;
  ratingAvg: number;
  ratingCount: number;
  variants: ProductVariant[];
  comboTiers: ComboTier[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAddress {
  id: string;
  address: string; // Chi tiết: số nhà, thôn/xóm, đường
  district: string; // Quận / Huyện / Thị xã
  city: string; // Tỉnh / Thành phố
  isDefault: boolean; // Đặt làm địa chỉ mặc định
  createdAt?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string; // Khóa định danh Zalo / SĐT
  email?: string;
  password?: string; // Mật khẩu đăng nhập (cho thành viên có tài khoản)
  hasAccount?: boolean; // Đã tạo tài khoản thành viên hay chỉ là Guest
  address: string;
  city: string;
  district?: string;
  savedAddresses?: SavedAddress[];
  customerType: 'NEW' | 'REGULAR_VIP' | 'WHOLESALE'; // Khách mới, Khách quen, Khách sỉ
  totalOrdersCount: number;
  totalSpent: number;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  originalUnitPrice: number;
  appliedUnitPrice: number;
  appliedTierId?: string;
  appliedTierLabel?: string;
  totalPrice: number;
  savingsAmount: number;
  discountPercent?: number;
  customHandmadeNote?: string; // Size tay, màu charm riêng
}

export type OrderStatus = 
  | 'PENDING_CONFIRM'   // 1. Chờ shop duyệt & chốt ship qua Zalo
  | 'PREPARING'         // 2. Đang xâu cườm & đóng gói thủ công
  | 'SHIPPING'          // 3. Đã giao đơn vị vận chuyển (ViettelPost / GHN / GHTK)
  | 'COMPLETED'         // 4. Khách đã nhận hàng thành công
  | 'CANCELLED';        // 5. Đã hủy

export type PaymentStatus = 
  | 'UNPAID'            // Chưa thanh toán (chờ chốt Zalo)
  | 'DEPOSIT_PAID'      // Đã cọc tiền (áp dụng cho đơn xâu custom nhiều)
  | 'PAID'              // Đã chuyển khoản 100%
  | 'REFUNDED';         // Đã hoàn tiền

export interface OrderHistoryLog {
  id: string;
  action: string;
  performedBy: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  code: string; // Mã đơn hiển thị (VD: OM-9281)
  customerId?: string;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    city?: string;
    note?: string;
  };
  items: OrderItem[];
  subtotalAmount: number; // Tổng tiền hàng theo giá lẻ
  subtotal?: number;
  comboDiscountAmount: number; // Tiền tiết kiệm từ combo sỉ
  discount?: number;
  itemsTotalAmount: number; // Tiền hàng thực tế sau giảm combo
  shippingFee: number; // Phí ship (thương lượng Zalo)
  finalTotalAmount: number; // Tổng thanh toán = tiền hàng + ship
  totalAmount: number; // Tương thích các component cũ
  paymentMethod: 'ZALO_CONFIRM' | 'COD';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string; // Mã vận đơn giao hàng
  carrierName?: string; // ViettelPost, GHTK, GHN, Shopee Xpress
  logs: OrderHistoryLog[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerLocation?: string;
  comment: string;
  rating: number;
  purchasedProduct?: string;
  avatarText?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  brandTitle: string;
  slogan: string;
  hotline: string;
  zaloPhone: string;
  zaloOfficialUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  tiktokUrl: string;
  tiktokHandle: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerText: string;
  showFeedbacks: boolean;
  shopAddress: string;
  workingHours: string;
  freeShippingThreshold: number; // Mua trên mức này tự động hỗ trợ ship
  autoReplyTemplate: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  enableTelegramNotify?: boolean;
  warehouseProvince?: string;
  heroImage?: string;
  heroImages?: string[];
  heroBadge?: string;
  purchasePolicies?: {
    icon: string;
    title: string;
    desc: string;
  }[];
  purchasePolicyDetail?: string;
}

export interface DetailedDatabaseSchema {
  version: string;
  lastBackup: string;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  feedbacks: CustomerFeedback[];
  settings: ShopSettings;
}

// ==========================================
// INITIAL PRODUCTION SEED DATA
// ==========================================

const INITIAL_DATABASE: DetailedDatabaseSchema = {
  version: '2.0.0',
  lastBackup: new Date().toISOString(),
  categories: [
    {
      id: 'cat-1',
      code: 'BEADS_HAUL',
      name: 'Hạt Cườm & Beads',
      slug: 'beads-haul',
      icon: '✨',
      description: 'Hạt cườm acrylic pastel, cườm đá ngọc trai, nơ hoa y2k tự xâu',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-2',
      code: 'KEP_TOC',
      name: 'Kẹp Tóc Nàng Thơ',
      slug: 'kep-toc',
      icon: '🎀',
      description: 'Kẹp càng cua, kẹp mỏ vịt đính hoa kem bơ handmade',
      displayOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-3',
      code: 'VONG_TAY',
      name: 'Vòng Tay Cườm',
      slug: 'vong-tay',
      icon: '🌸',
      description: 'Vòng tay đan thủ công, vòng bướm dạ quang, đồng hồ cườm vintage',
      displayOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-4',
      code: 'PHONE_CHARM',
      name: 'Phone Charm & Dây Thẻ',
      slug: 'phone-charm',
      icon: '📱',
      description: 'Móc khóa điện thoại, dây đeo thẻ sinh viên hạt charm xinh xắn',
      displayOrder: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-5',
      code: 'TUI_MU',
      name: 'Túi Mù Charm',
      slug: 'tui-mu',
      icon: '🎁',
      description: 'Túi mù blind bag xé may mắn trúng charm độc quyền',
      displayOrder: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  ],
  products: [
    {
      id: 'prod-1',
      sku: 'OM-BEAD-01',
      name: 'Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)',
      slug: 'set-hat-cuom-hoa-no-pastel-beads-haul',
      categoryId: 'cat-1',
      categoryName: 'Hạt Cườm & Beads',
      basePrice: 2000,
      originalPrice: 3000,
      costPrice: 600,
      material: 'Acrylic cao cấp trong suốt, phủ ánh nhũ pastel',
      dimensions: 'Hạt size 8mm - 12mm, lỗ xâu 1.5mm',
      images: [
        'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Hạt cườm acrylic pastel cao cấp trong suốt, hình hoa, nơ, ngôi sao lấp lánh, trái tim y2k. Thích hợp xâu vòng tay, móc khóa, kẹp tóc, phone charm.',
      isHot: true,
      isNewArrival: true,
      isCustomizable: true,
      stock: 5000,
      soldCount: 1840,
      ratingAvg: 4.9,
      ratingCount: 236,
      variants: [
        { id: 'v1', sku: 'OM-BEAD-01-PK', name: 'Mix Hồng Pastel 🌸', colorHex: '#FFB6C1', stock: 1500, soldCount: 620, isActive: true },
        { id: 'v2', sku: 'OM-BEAD-01-LV', name: 'Mix Tím Lavender 💜', colorHex: '#D8B4FE', stock: 1200, soldCount: 410, isActive: true },
        { id: 'v3', sku: 'OM-BEAD-01-MT', name: 'Mix Xanh Bơ Mint 🌿', colorHex: '#A7F3D0', stock: 900, soldCount: 330, isActive: true },
        { id: 'v4', sku: 'OM-BEAD-01-BT', name: 'Mix Vàng Kem Bơ 🧈', colorHex: '#FDE68A', stock: 800, soldCount: 250, isActive: true },
        { id: 'v5', sku: 'OM-BEAD-01-RB', name: 'Mix Cầu Vồng Pastel 🌈', colorHex: '#FDA4AF', stock: 600, soldCount: 230, isActive: true },
      ],
      comboTiers: [
        { id: 't1-50', minQuantity: 50, unitPrice: 1500, label: 'Combo 50 pcs', badge: 'Tiết kiệm 25%', discountPercent: 25 },
        { id: 't1-100', minQuantity: 100, unitPrice: 1200, label: 'Combo 100 pcs', badge: 'Hot Bán Chạy 🔥 (Giảm 40%)', discountPercent: 40, isPopular: true },
        { id: 't1-200', minQuantity: 200, unitPrice: 1000, label: 'Combo 200 pcs (Sỉ VIP)', badge: 'Sỉ VIP 💎 (Giảm 50%)', discountPercent: 50 },
        { id: 't1-500', minQuantity: 500, unitPrice: 800, label: 'Combo 500 pcs (Xưởng Charm)', badge: 'Cực Rẻ 👑 (Giảm 60%)', discountPercent: 60 },
      ],
      isActive: true,
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    },
    {
      id: 'prod-2',
      sku: 'OM-CLIP-02',
      name: 'Kẹp Tóc Hoa Kem Bơ Pastel Handmade Xinh Xắn',
      slug: 'kep-toc-hoa-kem-bo-pastel-handmade',
      categoryId: 'cat-2',
      categoryName: 'Kẹp Tóc Nàng Thơ',
      basePrice: 18000,
      originalPrice: 25000,
      costPrice: 6500,
      material: 'Khung mỏ vịt bọc nỉ êm, đính hoa acrylic kem bơ',
      dimensions: 'Dài 6.5cm x Rộng 2.5cm',
      images: [
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Kẹp tóc handmade đính hoa acrylic kem bơ và charm nơ lấp lánh phong cách nàng thơ. Khung kẹp mỏ vịt kim loại chống rỉ bọc nỉ êm ái.',
      isHot: true,
      isNewArrival: false,
      isCustomizable: false,
      stock: 350,
      soldCount: 920,
      ratingAvg: 5.0,
      ratingCount: 148,
      variants: [
        { id: 'k1', sku: 'OM-CLIP-02-PK', name: 'Hoa Hồng Baby 🌸', colorHex: '#FDA4AF', stock: 100, soldCount: 310, isActive: true },
        { id: 'k2', sku: 'OM-CLIP-02-BL', name: 'Hoa Xanh Pastel 🩵', colorHex: '#93C5FD', stock: 90, soldCount: 220, isActive: true },
        { id: 'k3', sku: 'OM-CLIP-02-LV', name: 'Hoa Tím Lavender 💜', colorHex: '#C084FC', stock: 80, soldCount: 210, isActive: true },
        { id: 'k4', sku: 'OM-CLIP-02-BT', name: 'Hoa Vàng Bơ 🧈', colorHex: '#FDE047', stock: 80, soldCount: 180, isActive: true },
      ],
      comboTiers: [
        { id: 't2-5', minQuantity: 5, unitPrice: 15000, label: 'Set 5 kẹp', badge: 'Giảm 17%', discountPercent: 17 },
        { id: 't2-10', minQuantity: 10, unitPrice: 12000, label: 'Set 10 kẹp (Tặng hộp)', badge: 'Siêu Hời 🎁 (Giảm 33%)', discountPercent: 33, isPopular: true },
        { id: 't2-50', minQuantity: 50, unitPrice: 9000, label: 'Sỉ 50 kẹp', badge: 'Giá Sỉ 👑 (Giảm 50%)', discountPercent: 50 },
      ],
      isActive: true,
      createdAt: '2026-02-15T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    },
    {
      id: 'prod-3',
      sku: 'OM-BRAC-03',
      name: 'Vòng Tay Cườm Hoa & Charm Bướm Dạ Quang (Custom)',
      slug: 'vong-tay-cuom-hoa-charm-buom-da-quang',
      categoryId: 'cat-3',
      categoryName: 'Vòng Tay Cườm',
      basePrice: 45000,
      originalPrice: 65000,
      costPrice: 15000,
      material: 'Cườm Miyuki Nhật Bản, charm bướm dạ quang phát sáng, dây rút co giãn',
      dimensions: 'Chu vi cổ tay 14cm - 18cm (có thể yêu cầu size)',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Vòng tay đan thủ công từ hạt cườm Miyuki kết hợp charm hoa bướm dạ quang phát sáng nhẹ ban đêm. Dây rút tiện lợi vừa mọi cỡ tay.',
      isHot: true,
      isNewArrival: true,
      isCustomizable: true,
      stock: 120,
      soldCount: 450,
      ratingAvg: 4.9,
      ratingCount: 89,
      variants: [
        { id: 'v-pink', sku: 'OM-BRAC-03-PK', name: 'Hồng Kẹo Ngọt', colorHex: '#F472B6', stock: 40, soldCount: 160, isActive: true },
        { id: 'v-blue', sku: 'OM-BRAC-03-BL', name: 'Xanh Biển Trong Veo', colorHex: '#38BDF8', stock: 30, soldCount: 120, isActive: true },
        { id: 'v-purple', sku: 'OM-BRAC-03-PR', name: 'Tím Khói Fairy', colorHex: '#A855F7', stock: 25, soldCount: 90, isActive: true },
        { id: 'v-mint', sku: 'OM-BRAC-03-MT', name: 'Xanh Bơ Thanh Mát', colorHex: '#34D399', stock: 25, soldCount: 80, isActive: true },
      ],
      comboTiers: [
        { id: 't3-2', minQuantity: 2, unitPrice: 40000, label: 'Cặp đôi (2 chiếc)', badge: 'Tiết kiệm 10k', discountPercent: 11 },
        { id: 't3-5', minQuantity: 5, unitPrice: 35000, label: 'Set 5 bạn thân', badge: 'Giảm 22%', discountPercent: 22, isPopular: true },
        { id: 't3-20', minQuantity: 20, unitPrice: 28000, label: 'Combo sỉ 20 vòng', badge: 'Giá Sỉ 🌟', discountPercent: 38 },
      ],
      isActive: true,
      createdAt: '2026-03-01T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    },
    {
      id: 'prod-4',
      sku: 'OM-PHON-04',
      name: 'Dây Đeo Thẻ / Phone Charm Phong Cách Fairy Tale',
      slug: 'day-deo-the-phone-charm-fairy-tale',
      categoryId: 'cat-4',
      categoryName: 'Phone Charm & Dây Thẻ',
      basePrice: 35000,
      originalPrice: 50000,
      costPrice: 12000,
      material: 'Dây dù bện chịu lực 15kg, hạt charm hoa tulip & trái tim',
      dimensions: 'Dài 15cm (cầm tay) hoặc 45cm (đeo cổ)',
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Dây charm đa năng móc ốp lưng điện thoại, thẻ sinh viên, máy ảnh mini, túi xách. Hạt charm hoa tulip, trái cây, ngôi sao acrylic bền đẹp.',
      isHot: false,
      isNewArrival: true,
      isCustomizable: true,
      stock: 200,
      soldCount: 310,
      ratingAvg: 4.8,
      ratingCount: 54,
      variants: [
        { id: 'p1', sku: 'OM-PHON-04-NECK', name: 'Dây Thẻ Đeo Cổ (Dài 45cm)', colorHex: '#E879F9', stock: 100, soldCount: 170, isActive: true },
        { id: 'p2', sku: 'OM-PHON-04-HAND', name: 'Móc Phone Charm Cầm Tay (15cm)', colorHex: '#FB7185', stock: 100, soldCount: 140, isActive: true },
      ],
      comboTiers: [
        { id: 't4-3', minQuantity: 3, unitPrice: 30000, label: 'Combo 3 dây', badge: 'Giảm 14%', discountPercent: 14 },
        { id: 't4-10', minQuantity: 10, unitPrice: 24000, label: 'Combo 10 dây', badge: 'Giảm 31%', discountPercent: 31, isPopular: true },
      ],
      isActive: true,
      createdAt: '2026-03-20T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    },
    {
      id: 'prod-5',
      sku: 'OM-WATC-05',
      name: 'Đồng Hồ Cườm Handmade Vintage Fairycore Custom',
      slug: 'dong-ho-cuom-handmade-vintage-fairycore',
      categoryId: 'cat-3',
      categoryName: 'Vòng Tay Cườm',
      basePrice: 129000,
      originalPrice: 180000,
      costPrice: 48000,
      material: 'Mặt đồng hồ máy thạch anh quartz mạ vàng/bạc chống nước nhẹ, dây cườm ngọc trai nhân tạo cao cấp',
      dimensions: 'Mặt đồng hồ 2.2cm, dây chỉnh theo size tay 13-17cm',
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Mặt đồng hồ vintage mạ vàng đồng kết hợp dây đeo xâu cườm đá ngọc trai và charm hoa thủy tinh độc quyền bởi Omachi. Mỗi mẫu là 1 tác phẩm độc nhất!',
      isHot: true,
      isNewArrival: true,
      isCustomizable: true,
      stock: 35,
      soldCount: 168,
      ratingAvg: 5.0,
      ratingCount: 62,
      variants: [
        { id: 'dh-gold', sku: 'OM-WATC-05-GD', name: 'Mặt Tròn Vàng Gold + Cườm Ngọc', colorHex: '#F59E0B', stock: 20, soldCount: 95, isActive: true },
        { id: 'dh-silver', sku: 'OM-WATC-05-SV', name: 'Mặt Vuông Bạc + Cườm Xanh Băng', colorHex: '#06B6D4', stock: 15, soldCount: 73, isActive: true },
      ],
      comboTiers: [
        { id: 't5-2', minQuantity: 2, unitPrice: 115000, label: 'Combo 2 chiếc', badge: 'Tặng túi nhung', discountPercent: 11 },
        { id: 't5-5', minQuantity: 5, unitPrice: 99000, label: 'Combo 5 chiếc', badge: 'Giá Ưu Đãi 🌟', discountPercent: 23, isPopular: true },
      ],
      isActive: true,
      createdAt: '2026-04-05T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    },
    {
      id: 'prod-6',
      sku: 'OM-BLND-06',
      name: 'Túi Mù Charm & Hạt Cườm May Mắn (Blind Bag Omachi)',
      slug: 'tui-mu-charm-hat-cuom-may-man-blind-bag',
      categoryId: 'cat-5',
      categoryName: 'Túi Mù Charm',
      basePrice: 15000,
      originalPrice: 25000,
      costPrice: 4000,
      material: 'Bao bì hologram bí mật, chứa charm phát sáng, charm hoa pha lê',
      dimensions: 'Gói 8cm x 10cm',
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Túi mù xé trúng thưởng charm hiếm: Charm hoa pha lê, nơ cánh tiên, kẹp tóc lấp lánh, charm phát sáng. Càng mua nhiều túi cơ hội trúng charm VIP càng cao!',
      isHot: true,
      isNewArrival: true,
      isCustomizable: false,
      stock: 800,
      soldCount: 1530,
      ratingAvg: 4.9,
      ratingCount: 310,
      variants: [
        { id: 'tm-1', sku: 'OM-BLND-06-FR', name: 'Túi Mù Charm Hoa & Quả 🍓', colorHex: '#EF4444', stock: 450, soldCount: 880, isActive: true },
        { id: 'tm-2', sku: 'OM-BLND-06-BW', name: 'Túi Mù Kẹp Tóc & Nơ 🎀', colorHex: '#EC4899', stock: 350, soldCount: 650, isActive: true },
      ],
      comboTiers: [
        { id: 't6-5', minQuantity: 5, unitPrice: 12000, label: 'Set 5 túi mù', badge: 'Xé cực cuốn', discountPercent: 20 },
        { id: 't6-10', minQuantity: 10, unitPrice: 10000, label: 'Set 10 túi', badge: 'Tiết kiệm 33%', discountPercent: 33, isPopular: true },
      ],
      isActive: true,
      createdAt: '2026-04-12T08:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    }
  ],
  customers: [
    {
      id: 'cust-1',
      fullName: 'Nguyễn Linh Nhi',
      phone: '0988123456',
      address: 'Số 15 Ngõ 48 Cầu Giấy, Hà Nội',
      city: 'Hà Nội',
      district: 'Cầu Giấy',
      customerType: 'REGULAR_VIP',
      totalOrdersCount: 4,
      totalSpent: 480000,
      internalNotes: 'Khách quen xâu tay cỡ nhỏ 14.5cm, thích tone hồng pastel',
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-09-14T08:00:00.000Z',
    }
  ],
  orders: [
    {
      id: 'ord-101',
      code: 'OM-8821',
      customerId: 'cust-1',
      customer: {
        fullName: 'Nguyễn Linh Nhi',
        phone: '0988123456',
        address: 'Số 15 Ngõ 48 Cầu Giấy, Hà Nội',
        city: 'Hà Nội',
        note: 'Xâu vòng cỡ tay 14.5cm giùm mình nhé shop!',
      },
      items: [
        {
          id: 'item-101-1',
          productId: 'prod-1',
          productName: 'Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)',
          productSku: 'OM-BEAD-01',
          variantId: 'v1',
          variantName: 'Mix Hồng Pastel 🌸',
          quantity: 100,
          originalUnitPrice: 2000,
          appliedUnitPrice: 1200,
          appliedTierId: 't1-100',
          appliedTierLabel: 'Combo 100 pcs',
          totalPrice: 120000,
          savingsAmount: 80000,
          customHandmadeNote: 'Mix nhiều charm hoa tulip và nơ hồng',
        }
      ],
      subtotalAmount: 200000,
      comboDiscountAmount: 80000,
      itemsTotalAmount: 120000,
      shippingFee: 0,
      finalTotalAmount: 120000,
      totalAmount: 120000,
      paymentMethod: 'ZALO_CONFIRM',
      paymentStatus: 'PAID',
      orderStatus: 'PREPARING',
      trackingNumber: '',
      carrierName: 'Giao Hàng Tiết Kiệm (GHTK)',
      logs: [
        { id: 'log-1', action: 'ORDER_CREATED', performedBy: 'CUSTOMER', newValue: 'Đặt đơn hàng mới', timestamp: '2026-09-14T05:00:00.000Z' },
        { id: 'log-2', action: 'ZALO_CONFIRMED', performedBy: 'ADMIN', newValue: 'Đã nhắn Zalo chốt freeship và bắt đầu xâu charm', timestamp: '2026-09-14T06:00:00.000Z' },
      ],
      createdAt: '2026-09-14T05:00:00.000Z',
      updatedAt: '2026-09-14T06:00:00.000Z',
      paidAt: '2026-09-14T06:00:00.000Z',
    }
  ],
  feedbacks: [
    {
      id: 'fb-1',
      customerName: 'Nguyễn Linh',
      customerLocation: 'Hà Nội',
      comment: 'Vòng cườm hoa bướm dạ quang xinh dã man luôn ạ! Shop làm đúng theo số đo cổ tay mình yêu cầu, đeo vừa in. Chốt đơn qua Zalo rất nhiệt tình, còn được tặng kèm túi mù charm nữa!',
      rating: 5,
      purchasedProduct: 'Vòng tay bướm dạ quang',
      avatarText: 'NL',
      isActive: true,
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'fb-2',
      customerName: 'Thu Hương',
      customerLocation: 'TP. HCM',
      comment: 'Mình gom mua chung với lớp gói combo 100 kẹp tóc hoa kem bơ, giá rẻ giật mình luôn, rẻ hơn mua lẻ nhiều. Kẹp chắc chắn, màu pastel xinh xuất sắc!',
      rating: 5,
      purchasedProduct: 'Combo 100 kẹp tóc hoa',
      avatarText: 'TH',
      isActive: true,
      createdAt: '2026-09-05T08:00:00.000Z',
    },
    {
      id: 'fb-3',
      customerName: 'Minh Anh',
      customerLocation: 'Đà Nẵng',
      comment: 'Set cườm beads haul trong suốt lấp lánh cực kỳ, đủ các mẫu hoa, nơ, quả dâu tây. Mua combo 200 hạt tha hồ xâu móc khóa phone charm tặng bạn bè.',
      rating: 5,
      purchasedProduct: 'Combo 200 hạt cườm pastel',
      avatarText: 'MA',
      isActive: true,
      createdAt: '2026-09-10T08:00:00.000Z',
    }
  ],
  settings: {
    shopName: 'Omachi 🌸 Phụ Kiện Handmade & Charm',
    brandTitle: 'OMACHI HANDMADE STORE',
    slogan: 'Vòng cườm, kẹp tóc pastel, charm hoa xinh lấp lánh custom theo yêu cầu ✨',
    hotline: '0988.888.888',
    zaloPhone: '0988888888',
    zaloOfficialUrl: 'https://zalo.me/0988888888',
    instagramUrl: 'https://instagram.com',
    instagramHandle: '@omachi.handmade',
    tiktokUrl: 'https://tiktok.com',
    tiktokHandle: '@omachi_charm',
    heroTitle: 'Vòng Charm, Kẹp Tóc & Phụ Kiện Pastel',
    heroSubtitle: 'Khám phá thế giới charm trong veo, kẹp hoa kem bơ và vòng tay handmade đan thủ công theo phong cách của riêng bạn ✨',
    bannerText: '🌸 Tiệm Phụ Kiện Handmade Omachi • Nhận làm vòng tay & charm theo yêu cầu ✨',
    showFeedbacks: true,
    shopAddress: 'Hà Nội, Việt Nam',
    workingHours: '08:30 - 22:00 Hàng ngày',
    freeShippingThreshold: 200000,
    autoReplyTemplate: 'Chào bạn, Shop Omachi đã nhận được đơn hàng #{orderCode}. Shop sẽ kiểm tra mẫu và báo lại bạn ngay nhé!',
    telegramBotToken: '',
    telegramChatId: '',
    enableTelegramNotify: true,
    heroImage: '/images/charm_feed_1.jpg',
    heroImages: ['/images/charm_feed_1.jpg'],
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
  }
};

function readDb(): DetailedDatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let needResave = false;
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_DATABASE.products;
      needResave = true;
    }
    if (!parsed.feedbacks || parsed.feedbacks.length === 0) {
      parsed.feedbacks = INITIAL_DATABASE.feedbacks;
      needResave = true;
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_DATABASE.categories;
      needResave = true;
    }
    if (needResave) {
      writeDb(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Error reading DB, using initial:', error);
    return INITIAL_DATABASE;
  }
}

function writeDb(data: DetailedDatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastBackup = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// ==========================================
// EXPORTED DATABASE ENGINE WITH RELATIONAL METHODS
// ==========================================

export const db = {
  // RAW DATABASE
  raw: {
    get: () => readDb(),
    save: (data: DetailedDatabaseSchema) => writeDb(data),
  },

  // CATEGORIES TABLE
  categories: {
    getAll(): Category[] {
      const dbData = readDb();
      return (dbData.categories || []).filter((c) => c.isActive !== false).sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    },
    getById(id: string): Category | undefined {
      const dbData = readDb();
      return (dbData.categories || []).find((c) => c.id === id || c.slug === id);
    },
    create(data: Omit<Category, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean }): Category {
      const dbData = readDb();
      if (!dbData.categories) dbData.categories = [];
      const timestamp = Date.now();
      const generatedSlug = data.slug || data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newCategory: Category = {
        id: `cat-${timestamp}`,
        code: data.code || `CAT_${timestamp.toString().slice(-4)}`,
        name: data.name,
        slug: generatedSlug,
        icon: data.icon || '🌸',
        description: data.description || '',
        displayOrder: data.displayOrder || (dbData.categories.length + 1),
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
      };
      dbData.categories.push(newCategory);
      writeDb(dbData);
      return newCategory;
    },
    update(id: string, updateData: Partial<Category>): Category | null {
      const dbData = readDb();
      if (!dbData.categories) return null;
      const index = dbData.categories.findIndex((c) => c.id === id);
      if (index === -1) return null;
      dbData.categories[index] = {
        ...dbData.categories[index],
        ...updateData,
      };
      // Cascade update categoryName to products if name changed
      if (updateData.name) {
        dbData.products.forEach((p) => {
          if (p.categoryId === id || (p as any).category === dbData.categories[index].slug) {
            p.categoryName = updateData.name!;
          }
        });
      }
      writeDb(dbData);
      return dbData.categories[index];
    },
    delete(id: string): boolean {
      const dbData = readDb();
      if (!dbData.categories) return false;
      const index = dbData.categories.findIndex((c) => c.id === id);
      if (index === -1) return false;
      // Mark as inactive instead of deleting to preserve historical orders
      dbData.categories[index].isActive = false;
      writeDb(dbData);
      return true;
    }
  },

  // PRODUCTS TABLE
  products: {
    getAll(): Product[] {
      return readDb().products.filter((p) => p.isActive);
    },
    getById(idOrSlug: string): Product | undefined {
      return readDb().products.find((p) => (p.id === idOrSlug || p.slug === idOrSlug) && p.isActive);
    },
    create(data: Omit<Product, 'id' | 'sku' | 'slug' | 'createdAt' | 'updatedAt' | 'isActive'>): Product {
      const dbData = readDb();
      const randomSkuNum = Math.floor(10 + Math.random() * 90);
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        sku: `OM-${data.categoryId.toUpperCase().replace(/[^A-Z]/g, '')}-${randomSkuNum}`,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.products.unshift(newProduct);
      writeDb(dbData);
      return newProduct;
    },
    update(id: string, updateData: Partial<Product>): Product | null {
      const dbData = readDb();
      const index = dbData.products.findIndex((p) => p.id === id);
      if (index === -1) return null;
      dbData.products[index] = {
        ...dbData.products[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      writeDb(dbData);
      return dbData.products[index];
    },
    delete(id: string): boolean {
      const dbData = readDb();
      const index = dbData.products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      // Soft-delete: mark inactive or remove
      dbData.products.splice(index, 1);
      writeDb(dbData);
      return true;
    }
  },

  // CUSTOMERS TABLE
  customers: {
    getAll(): Customer[] {
      return readDb().customers || [];
    },
    getById(id: string): Customer | undefined {
      return (readDb().customers || []).find((c) => c.id === id);
    },
    findByPhone(phone: string): Customer | undefined {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      return (readDb().customers || []).find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
    },
    register(data: { fullName: string; phone: string; password?: string; address?: string; city?: string; email?: string }): { customer: Customer; error?: string } {
      const dbData = readDb();
      if (!dbData.customers) dbData.customers = [];
      const cleanPhone = data.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 9) {
        return { customer: null as any, error: 'Số điện thoại không hợp lệ (cần ít nhất 9-10 chữ số)' };
      }

      let existing = dbData.customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
      if (existing) {
        if (existing.hasAccount && existing.password) {
          return { customer: null as any, error: 'Số điện thoại này đã được đăng ký tài khoản. Vui lòng đăng nhập!' };
        }
        // If they previously checked out as Guest, upgrade them to registered account!
        existing.fullName = data.fullName || existing.fullName;
        existing.password = data.password || existing.password;
        existing.address = data.address || existing.address;
        existing.city = data.city || existing.city;
        existing.email = data.email || existing.email;
        existing.hasAccount = true;
        existing.updatedAt = new Date().toISOString();
        writeDb(dbData);
        return { customer: existing };
      }

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        fullName: data.fullName,
        phone: data.phone,
        password: data.password || '',
        email: data.email || '',
        hasAccount: true,
        address: data.address || '',
        city: data.city || 'Hà Nội',
        customerType: 'NEW',
        totalOrdersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.customers.unshift(newCustomer);
      writeDb(dbData);
      return { customer: newCustomer };
    },
    login(phone: string, password?: string): { customer: Customer | null; error?: string } {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const dbData = readDb();
      const customer = (dbData.customers || []).find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

      if (!customer) {
        return { customer: null, error: 'Số điện thoại chưa từng đặt hàng hoặc đăng ký tại shop!' };
      }

      // If customer has account with password, verify password
      if (customer.hasAccount && customer.password) {
        if (password && customer.password !== password) {
          return { customer: null, error: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
        }
      }

      return { customer };
    },
    saveOrUpdateAddress(customerIdOrPhone: string, addr: { address: string; district?: string; city?: string; isDefault?: boolean }): Customer | null {
      const dbData = readDb();
      if (!dbData.customers) return null;
      const clean = customerIdOrPhone.replace(/[^0-9]/g, '');
      const cust = dbData.customers.find((c) => c.id === customerIdOrPhone || c.phone.replace(/[^0-9]/g, '') === clean);
      if (!cust) return null;

      if (!cust.savedAddresses) cust.savedAddresses = [];

      const makeDefault = addr.isDefault !== false || !cust.address || cust.savedAddresses.length === 0;
      const addrSpecific = (addr.address || '').trim();
      const addrDistrict = (addr.district || '').trim();
      const addrCity = (addr.city || 'Bắc Giang').trim();

      if (makeDefault && addrSpecific) {
        cust.savedAddresses.forEach((a) => { a.isDefault = false; });
        cust.address = addrSpecific;
        cust.district = addrDistrict;
        cust.city = addrCity;
      }

      const existingAddrIdx = cust.savedAddresses.findIndex(
        (a) => a.address.trim().toLowerCase() === addrSpecific.toLowerCase() &&
               a.district.trim().toLowerCase() === addrDistrict.toLowerCase() &&
               a.city.trim().toLowerCase() === addrCity.toLowerCase()
      );

      if (existingAddrIdx !== -1) {
        if (makeDefault) cust.savedAddresses[existingAddrIdx].isDefault = true;
      } else if (addrSpecific) {
        cust.savedAddresses.push({
          id: `addr-${Date.now()}`,
          address: addrSpecific,
          district: addrDistrict,
          city: addrCity,
          isDefault: makeDefault,
          createdAt: new Date().toISOString()
        });
      }

      cust.updatedAt = new Date().toISOString();
      writeDb(dbData);
      return cust;
    },
    update(id: string, updateData: Partial<Customer>): Customer | null {
      const dbData = readDb();
      if (!dbData.customers) return null;
      const index = dbData.customers.findIndex((c) => c.id === id);
      if (index === -1) return null;

      dbData.customers[index] = {
        ...dbData.customers[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      writeDb(dbData);
      return dbData.customers[index];
    },
    findOrCreate(customerData: { fullName: string; phone: string; address: string; city?: string }): Customer {
      const dbData = readDb();
      if (!dbData.customers) dbData.customers = [];
      const cleanPhone = customerData.phone.replace(/[^0-9]/g, '');
      let existing = dbData.customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

      if (existing) {
        existing.fullName = customerData.fullName || existing.fullName;
        existing.address = customerData.address || existing.address;
        existing.updatedAt = new Date().toISOString();
        writeDb(dbData);
        return existing;
      }

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        fullName: customerData.fullName,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city || 'Hà Nội',
        customerType: 'NEW',
        totalOrdersCount: 0,
        totalSpent: 0,
        hasAccount: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.customers.unshift(newCustomer);
      writeDb(dbData);
      return newCustomer;
    }
  },

  // ORDERS TABLE
  orders: {
    getAll(): Order[] {
      return readDb().orders || [];
    },
    getById(idOrCode: string): Order | undefined {
      return (readDb().orders || []).find((o) => o.id === idOrCode || o.code.toLowerCase() === idOrCode.toLowerCase());
    },
    getByPhone(phone: string): Order[] {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone) return [];
      return (readDb().orders || []).filter((o) => (o.customer?.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    lookup(query: string): Order[] {
      const raw = query.trim();
      const q = raw.toLowerCase();
      const cleanDigits = raw.replace(/[^0-9]/g, '');
      const orders = readDb().orders || [];

      return orders.filter((o) => {
        const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
        const oCode = (o.code || '').toLowerCase();
        const oId = (o.id || '').toLowerCase();

        // Match by phone if query has at least 4 digits
        if (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) return true;
        // Match by order code (e.g. OM-1234 or 1234)
        if (oCode.includes(q)) return true;
        if (oId.includes(q)) return true;
        return false;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create(orderInput: {
      customer: { fullName: string; phone: string; address: string; city?: string; note?: string };
      items: any[];
      subtotal?: number;
      shippingFee?: number;
      discount?: number;
      totalAmount?: number;
      paymentMethod?: 'ZALO_CONFIRM' | 'COD';
    }): Order {
      const dbData = readDb();
      
      // 1. Generate Random Order Code OM-XXXX
      const randomCode = `OM-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // 2. Map Items with SKU and detail calculation
      const mappedItems: OrderItem[] = (orderInput.items || []).map((it, idx) => {
        const prod = it.product || {};
        const originalUnitPrice = Number(prod.basePrice || it.originalUnitPrice || it.unitPrice || 0);
        const appliedUnitPrice = Number(it.unitPrice || prod.basePrice || originalUnitPrice);
        const qty = Number(it.quantity || 1);
        const originalLineTotal = originalUnitPrice * qty;
        const actualLineTotal = Number(it.totalPrice !== undefined ? it.totalPrice : (appliedUnitPrice * qty));
        const savingsAmount = Math.max(0, originalLineTotal - actualLineTotal);
        const discountPercent = originalLineTotal > 0 ? Math.round((savingsAmount / originalLineTotal) * 100) : 0;

        return {
          id: `item-${Date.now()}-${idx}`,
          productId: prod.id || it.productId || '',
          productName: prod.name || it.productName || 'Mẫu Charm',
          productSku: prod.sku || it.productSku || `SKU-${idx + 1}`,
          variantId: it.selectedVariant?.id || it.variantId,
          variantName: it.selectedVariant?.name || it.variantName,
          quantity: qty,
          originalUnitPrice,
          appliedUnitPrice,
          appliedTierId: it.appliedTier?.id || it.appliedTierId,
          appliedTierLabel: it.appliedTier?.label || it.appliedTierLabel,
          totalPrice: actualLineTotal,
          savingsAmount,
          discountPercent,
          customHandmadeNote: it.customNote || it.customHandmadeNote || '',
        };
      });

      // Tổng tiền theo giá bán lẻ từng con
      const retailSubtotal = mappedItems.reduce((s, i) => s + (i.originalUnitPrice * i.quantity), 0);
      // Tổng chiết khấu combo / sỉ
      const discount = mappedItems.reduce((s, i) => s + i.savingsAmount, 0);
      // Tiền hàng thực tế sau khi giảm
      const itemsTotal = mappedItems.reduce((s, i) => s + i.totalPrice, 0);
      // Phí vận chuyển SPX
      const shipping = Number(orderInput.shippingFee || 0);
      // Tổng thanh toán = Tiền hàng sau giảm + Phí ship
      const finalTotal = itemsTotal + shipping;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        code: randomCode,
        customer: {
          fullName: orderInput.customer.fullName,
          phone: orderInput.customer.phone,
          address: orderInput.customer.address,
          city: orderInput.customer.city || 'Hà Nội',
          note: orderInput.customer.note || '',
        },
        items: mappedItems,
        subtotal: itemsTotal,
        subtotalAmount: retailSubtotal,
        comboDiscountAmount: discount,
        itemsTotalAmount: itemsTotal,
        shippingFee: shipping,
        finalTotalAmount: finalTotal,
        totalAmount: finalTotal,
        paymentMethod: orderInput.paymentMethod || 'ZALO_CONFIRM',
        paymentStatus: 'UNPAID',
        orderStatus: 'PENDING_CONFIRM',
        carrierName: (orderInput as any).carrierName || 'SPX Express',
        logs: [
          {
            id: `log-${Date.now()}`,
            action: 'ORDER_CREATED',
            performedBy: 'CUSTOMER',
            newValue: `Khách hàng đặt ${mappedItems.length} sản phẩm`,
            timestamp: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Tự động lưu địa chỉ vào tài khoản khách hàng (làm mặc định nếu đơn đầu hoặc có chọn lưu)
      const cleanPhone = (orderInput.customer?.phone || '').replace(/[^0-9]/g, '');
      const existingCust = (dbData.customers || []).find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

      const specificAddr = (orderInput.customer as any)?.specificAddress || orderInput.customer?.address || '';
      const orderCity = orderInput.customer?.city || 'Bắc Giang';
      const orderDistrict = (orderInput.customer as any)?.district || '';
      const setAsDefault = (orderInput as any)?.setAsDefaultAddress !== false;

      if (existingCust) {
        if (!existingCust.savedAddresses) existingCust.savedAddresses = [];

        const isFirstOrder = !existingCust.address || existingCust.savedAddresses.length === 0;
        const makeDefault = setAsDefault || isFirstOrder;

        if (makeDefault && specificAddr) {
          existingCust.savedAddresses.forEach((a) => { a.isDefault = false; });
          existingCust.address = specificAddr;
          existingCust.district = orderDistrict;
          existingCust.city = orderCity;
        }

        const matchIdx = existingCust.savedAddresses.findIndex(
          (a) => a.address.trim().toLowerCase() === specificAddr.trim().toLowerCase() &&
                 a.district.trim().toLowerCase() === orderDistrict.trim().toLowerCase() &&
                 a.city.trim().toLowerCase() === orderCity.trim().toLowerCase()
        );

        if (matchIdx !== -1) {
          if (makeDefault) existingCust.savedAddresses[matchIdx].isDefault = true;
        } else if (specificAddr) {
          existingCust.savedAddresses.push({
            id: `addr-${Date.now()}`,
            address: specificAddr,
            district: orderDistrict,
            city: orderCity,
            isDefault: makeDefault,
            createdAt: new Date().toISOString(),
          });
        }

        existingCust.totalOrdersCount = (existingCust.totalOrdersCount || 0) + 1;
        existingCust.totalSpent = (existingCust.totalSpent || 0) + finalTotal;
        existingCust.updatedAt = new Date().toISOString();
      }

      dbData.orders.unshift(newOrder);
      writeDb(dbData);
      return newOrder;
    },

    updateStatus(orderId: string, status?: OrderStatus, paymentStatus?: PaymentStatus, carrierName?: string, trackingNumber?: string, shippingFee?: number): Order | null {
      const dbData = readDb();
      const index = dbData.orders.findIndex((o) => o.id === orderId || o.code === orderId);
      if (index === -1) return null;

      const oldStatus = dbData.orders[index].orderStatus;
      if (status) {
        dbData.orders[index].orderStatus = status;
        if (status === 'SHIPPING' && !dbData.orders[index].shippedAt) {
          dbData.orders[index].shippedAt = new Date().toISOString();
        }
        if (status === 'COMPLETED' && !dbData.orders[index].completedAt) {
          dbData.orders[index].completedAt = new Date().toISOString();
        }
      }
      if (paymentStatus) {
        dbData.orders[index].paymentStatus = paymentStatus;
        if (paymentStatus === 'PAID') {
          dbData.orders[index].paidAt = new Date().toISOString();
        }
      }
      if (carrierName) dbData.orders[index].carrierName = carrierName;
      if (trackingNumber) dbData.orders[index].trackingNumber = trackingNumber;
      if (shippingFee !== undefined) {
        const newShip = Number(shippingFee) || 0;
        dbData.orders[index].shippingFee = newShip;
        const itemsTotal = (dbData.orders[index].items || []).reduce((sum: number, it: any) => sum + Number(it.totalPrice || 0), 0);
        dbData.orders[index].itemsTotalAmount = itemsTotal;
        dbData.orders[index].totalAmount = itemsTotal + newShip;
        dbData.orders[index].finalTotalAmount = itemsTotal + newShip;
      }

      dbData.orders[index].updatedAt = new Date().toISOString();
      dbData.orders[index].logs.push({
        id: `log-${Date.now()}`,
        action: 'STATUS_UPDATED',
        performedBy: 'ADMIN',
        oldValue: oldStatus,
        newValue: `${dbData.orders[index].orderStatus} (Thanh toán: ${dbData.orders[index].paymentStatus}, Ship: ${dbData.orders[index].shippingFee})`,
        timestamp: new Date().toISOString(),
      });
      writeDb(dbData);
      return dbData.orders[index];
    }
  },

  // SETTINGS TABLE
  settings: {
    get(): ShopSettings {
      return readDb().settings;
    },
    update(newSettings: Partial<ShopSettings>): ShopSettings {
      const dbData = readDb();
      dbData.settings = {
        ...dbData.settings,
        ...newSettings,
      };
      writeDb(dbData);
      return dbData.settings;
    }
  },

  // FEEDBACKS TABLE
  feedbacks: {
    getAll(): CustomerFeedback[] {
      const dbData = readDb();
      return (dbData.feedbacks || []).filter((f) => f.isActive);
    },
    create(data: Omit<CustomerFeedback, 'id' | 'createdAt' | 'isActive'>): CustomerFeedback {
      const dbData = readDb();
      if (!dbData.feedbacks) dbData.feedbacks = [];
      const newFb: CustomerFeedback = {
        ...data,
        id: `fb-${Date.now()}`,
        avatarText: data.customerName ? data.customerName.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase() : 'KH',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      dbData.feedbacks.unshift(newFb);
      writeDb(dbData);
      return newFb;
    },
    update(id: string, data: Partial<CustomerFeedback>): CustomerFeedback | null {
      const dbData = readDb();
      if (!dbData.feedbacks) return null;
      const index = dbData.feedbacks.findIndex((f) => f.id === id);
      if (index === -1) return null;
      dbData.feedbacks[index] = {
        ...dbData.feedbacks[index],
        ...data,
      };
      writeDb(dbData);
      return dbData.feedbacks[index];
    },
    delete(id: string): boolean {
      const dbData = readDb();
      if (!dbData.feedbacks) return false;
      const index = dbData.feedbacks.findIndex((f) => f.id === id);
      if (index === -1) return false;
      dbData.feedbacks.splice(index, 1);
      writeDb(dbData);
      return true;
    }
  }
};