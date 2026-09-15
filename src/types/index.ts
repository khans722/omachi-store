export interface Category {
  id: string;
  code?: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ComboTier {
  id?: string;
  minQuantity: number;
  unitPrice: number;
  label: string;
  badge?: string;
  discountPercent?: number;
  isPopular?: boolean;
}

export interface ProductPackageOption {
  id: string;
  name: string;
  price?: number;
  stock?: number;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  name: string;
  image?: string;
  imageUrl?: string;
  colorHex?: string;
  price?: number;
  stock?: number;
  soldCount?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  category?: 'vong-tay' | 'kep-toc' | 'phone-charm' | 'day-the' | 'beads-haul' | 'tui-mu' | string;
  categoryId?: string;
  categoryName: string;
  basePrice: number;
  originalPrice?: number;
  costPrice?: number;
  material?: string;
  dimensions?: string;
  images: string[];
  description: string;
  isHot?: boolean;
  isNewArrival?: boolean;
  isCustomizable?: boolean;
  stock: number;
  soldCount: number;
  rating?: number;
  ratingAvg?: number;
  reviewCount?: number;
  ratingCount?: number;
  variants?: ProductVariant[];
  packageOptions?: ProductPackageOption[];
  comboTiers?: ComboTier[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  selectedPackage?: ProductPackageOption;
  customNote?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  appliedTier?: ComboTier;
  selected?: boolean; // Hỗ trợ tick chọn món cần thanh toán
}

export type OrderStatus = 
  | 'PENDING_CONFIRM'  // Chờ shop duyệt / chốt ship qua Zalo
  | 'PREPARING'        // Đang làm hàng / xâu cườm
  | 'SHIPPING'         // Đang giao hàng
  | 'COMPLETED'        // Hoàn thành
  | 'CANCELLED';       // Đã hủy

export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'PAID' | 'REFUNDED';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  note?: string;
}


export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  originalUnitPrice: number;
  appliedUnitPrice: number;
  appliedTierId?: string;
  appliedTierLabel?: string;
  totalPrice: number;
  savingsAmount?: number;
  discountPercent?: number;
  customHandmadeNote?: string;
}

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
  code: string; // OM-XXXX
  customerId?: string;
  customer: OrderCustomer;
  items: CartItem[] | OrderItem[] | any[];
  subtotal?: number;
  subtotalAmount?: number;
  discount?: number;
  comboDiscountAmount?: number;
  itemsTotalAmount?: number;
  shippingFee: number;
  totalAmount: number;
  finalTotalAmount?: number;
  paymentMethod: 'ZALO_CONFIRM' | 'COD';
  paymentStatus: PaymentStatus | 'UNPAID' | 'PAID';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  carrierName?: string;
  logs?: OrderHistoryLog[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
}

export interface SavedAddress {
  id: string;
  address: string;      // Số nhà, ngõ ngách, thôn/xóm
  district: string;     // Quận / Huyện / Thị xã
  city: string;         // Tỉnh / Thành phố
  isDefault: boolean;   // Đặt làm địa chỉ mặc định
  createdAt?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  hasAccount?: boolean;
  address: string;      // Địa chỉ mặc định (số nhà, ngõ...)
  city: string;         // Tỉnh/TP mặc định
  district?: string;    // Quận/Huyện mặc định
  savedAddresses?: SavedAddress[]; // Danh sách các địa chỉ đã lưu
  customerType: 'NEW' | 'REGULAR_VIP' | 'WHOLESALE';
  totalOrdersCount: number;
  totalSpent: number;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
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
  brandTitle?: string;
  slogan: string;
  hotline: string;
  zaloPhone: string;
  zaloOfficialUrl?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  tiktokUrl?: string;
  tiktokHandle?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  bannerText?: string;
  showFeedbacks?: boolean;
  shopAddress?: string;
  workingHours?: string;
  freeShippingThreshold?: number;
  autoReplyTemplate?: string;
  themeColor?: 'pink' | 'green' | 'purple' | 'cream';
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



