import fs from 'fs';
import path from 'path';
import { calculateShippingFee } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
const READONLY_DB_FILE = path.join(process.cwd(), 'data', 'database.json');
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const WRITABLE_DB_FILE = IS_SERVERLESS ? path.join('/tmp', 'database.json') : READONLY_DB_FILE;


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
  packageOptions?: any[];
  minOrderQuantity?: number; // Số lượng mua tối thiểu (VD: 1, 10, 50, 100)
  stepQuantity?: number;     // Bội số mua / Bước nhảy (VD: 1, 10, 50, 100)
  weight?: number;           // Khối lượng mỗi sản phẩm (đơn vị: gram, VD: 10, 50, 100, 500)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAddress {
  id: string;
  fullName?: string;
  phone?: string;
  address: string; // Chi tiết: số nhà, thôn/xóm, đường
  ward?: string; // Phường / Xã / Thị trấn
  district?: string; // Quận / Huyện / Thị xã
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
  ward?: string;
  savedAddresses?: SavedAddress[];
  customerType: 'NEW' | 'REGULAR_VIP' | 'WHOLESALE'; // Khách mới, Khách quen, Khách sỉ
  totalOrdersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
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
  selectedVariant?: any;
  productImage?: string;
  colorHex?: string;
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
  cancelReason?: string;
  cancelledBy?: string;
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
  totalWeight?: number; // Tổng cân nặng (gram)
  finalTotalAmount: number; // Tổng thanh toán = tiền hàng + ship
  totalAmount: number; // Tương thích các component cũ
  paymentMethod: 'ZALO_CONFIRM' | 'COD' | 'BANK' | 'MOMO';
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
  cancelReason?: string;
  cancelledBy?: 'SHOP' | 'CUSTOMER';
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
  websiteUrl?: string;
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
  customWholesaleTiers?: {
    minQuantity: number;
    discountPercent?: number;
    unitPrice?: number;
    label: string;
    badge?: string;
  }[];
  prepaidFreeShipThreshold?: number; // Ngưỡng freeship khi thanh toán trước (Chuyển khoản / MoMo)
  enablePrepaidFreeShip?: boolean;   // Bật/tắt chính sách freeship khi thanh toán trước
  momoPhone?: string;               // Số điện thoại nhận MoMo
  momoName?: string;                // Tên chủ ví MoMo
  momoQrImage?: string;             // Ảnh QR MoMo riêng nếu upload
  bankId?: string;                  // Tên / Mã ngân hàng (MB, VCB, TCB...)
  bankAccount?: string;             // Số tài khoản ngân hàng
  bankOwner?: string;               // Tên chủ tài khoản ngân hàng
  sepayApiKey?: string;             // API Token từ my.sepay.vn để chủ động đối soát giao dịch
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
  "version": "2.0.0",
  "lastBackup": "2026-09-16T02:46:23.799Z",
  "categories": [
    {
      "id": "cat-1",
      "code": "BEADS_HAUL",
      "name": "Charm Vòng",
      "slug": "beads-haul",
      "icon": "✨",
      "description": "Hạt cườm acrylic pastel, cườm đá ngọc trai, nơ hoa y2k tự xâu",
      "displayOrder": 1,
      "isActive": true,
      "createdAt": "2026-09-14T03:17:56.527Z"
    },
    {
      "id": "cat-2",
      "code": "KEP_TOC",
      "name": "Kẹp Tóc",
      "slug": "kep-toc",
      "icon": "🎀",
      "description": "Kẹp càng cua, kẹp mỏ vịt đính hoa kem bơ handmade",
      "displayOrder": 2,
      "isActive": true,
      "createdAt": "2026-09-14T03:17:56.527Z"
    },
    {
      "id": "cat-3",
      "code": "VONG_TAY",
      "name": "Vòng Tay",
      "slug": "vong-tay",
      "icon": "🌸",
      "description": "Vòng tay đan thủ công, vòng bướm dạ quang, đồng hồ cườm vintage",
      "displayOrder": 3,
      "isActive": true,
      "createdAt": "2026-09-14T03:17:56.527Z"
    },
    {
      "id": "cat-4",
      "code": "PHONE_CHARM",
      "name": "Phone Charm",
      "slug": "phone-charm",
      "icon": "📱",
      "description": "Móc khóa điện thoại, dây đeo thẻ sinh viên hạt charm xinh xắn",
      "displayOrder": 4,
      "isActive": true,
      "createdAt": "2026-09-14T03:17:56.527Z"
    },
    {
      "id": "cat-5",
      "code": "TUI_MU",
      "name": "Gấu",
      "slug": "tui-mu",
      "icon": "🎁",
      "description": "Gấu bông dễ thưn mlien chóa",
      "displayOrder": 5,
      "isActive": true,
      "createdAt": "2026-09-14T03:17:56.527Z"
    },
    {
      "id": "cat-1789379315381",
      "code": "CAT_5381",
      "name": "Dây Chuyền Bạc & Y2K",
      "slug": "day-chuyen-bac-y2k",
      "icon": "💍",
      "description": "Mẫu dây chuyền handmade xinh xắn",
      "displayOrder": 6,
      "isActive": false,
      "createdAt": "2026-09-14T09:48:35.381Z"
    }
  ],
  "products": [
    {
      "id": "prod-1",
      "sku": "OM-BEAD-01",
      "name": "Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)",
      "slug": "set-hat-cuom-hoa-no-pastel-beads-haul",
      "categoryId": "cat-1",
      "categoryName": "Charm Vòng",
      "basePrice": 2000,
      "originalPrice": 2000,
      "costPrice": 1800,
      "material": "Acrylic cao cấp trong suốt, phủ ánh nhũ pastel",
      "dimensions": "Hạt size 8mm - 12mm, lỗ xâu 1.5mm",
      "images": [
        "/uploads/charm_1789432914386_1789371730804_1528911961217344.jpg"
      ],
      "description": "Hạt cườm acrylic pastel cao cấp trong suốt, hình hoa, nơ, ngôi sao lấp lánh, trái tim y2k. Thích hợp xâu vòng tay, móc khóa, kẹp tóc, phone charm.",
      "isHot": true,
      "isNewArrival": true,
      "isCustomizable": true,
      "stock": 5000,
      "soldCount": 1840,
      "ratingAvg": 4.9,
      "ratingCount": 236,
      "variants": [
        {
          "id": "v1",
          "sku": "OM-BEAD-01-PK",
          "name": "Mix Hồng Pastel 🌸",
          "colorHex": "#FFB6C1",
          "stock": 1500,
          "soldCount": 620,
          "isActive": true
        },
        {
          "id": "v2",
          "sku": "OM-BEAD-01-LV",
          "name": "Mix Tím Lavender 💜",
          "colorHex": "#D8B4FE",
          "stock": 1200,
          "soldCount": 410,
          "isActive": true
        },
        {
          "id": "v3",
          "sku": "OM-BEAD-01-MT",
          "name": "Mix Xanh Bơ Mint 🌿",
          "colorHex": "#A7F3D0",
          "stock": 900,
          "soldCount": 330,
          "isActive": true
        },
        {
          "id": "v4",
          "sku": "OM-BEAD-01-BT",
          "name": "Mix Vàng Kem Bơ 🧈",
          "colorHex": "#FDE68A",
          "stock": 800,
          "soldCount": 250,
          "isActive": true
        },
        {
          "id": "v5",
          "sku": "OM-BEAD-01-RB",
          "name": "Mix Cầu Vồng Pastel 🌈",
          "colorHex": "#FDA4AF",
          "stock": 0,
          "soldCount": 230,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t1-50",
          "minQuantity": 50,
          "unitPrice": 2000,
          "label": "Mua từ 50 cái",
          "badge": "Mốc 50 cái",
          "discountPercent": 0
        },
        {
          "id": "t1-100",
          "minQuantity": 100,
          "unitPrice": 1950,
          "label": "Mua từ 100 cái",
          "badge": "Hot Bán Chạy 🔥",
          "discountPercent": 3,
          "isPopular": true
        },
        {
          "id": "t1-200",
          "minQuantity": 200,
          "unitPrice": 1900,
          "label": "Mua từ 200 cái (Sỉ VIP)",
          "badge": "Sỉ VIP 💎",
          "discountPercent": 5
        },
        {
          "id": "t1-500",
          "minQuantity": 500,
          "unitPrice": 1850,
          "label": "Mua từ 500 cái (Xưởng Charm)",
          "badge": "Cực Rẻ 👑",
          "discountPercent": 8
        }
      ],
      "isActive": true,
      "createdAt": "2026-01-10T08:00:00.000Z",
      "updatedAt": "2026-09-15T00:42:22.811Z",
      "packageOptions": [
        {
          "id": "pkg-10",
          "name": "Gói 10 cái",
          "price": 20000
        },
        {
          "id": "pkg-100",
          "name": "Gói 100 cái (Tiết kiệm)",
          "price": 120000
        }
      ]
    },
    {
      "id": "prod-2",
      "sku": "OM-CLIP-02",
      "name": "Kẹp Tóc Hoa Kem Bơ Pastel Handmade Xinh Xắn",
      "slug": "kep-toc-hoa-kem-bo-pastel-handmade",
      "categoryId": "cat-2",
      "categoryName": "Kẹp Tóc",
      "basePrice": 20000,
      "originalPrice": 20000,
      "costPrice": 17000,
      "material": "Khung mỏ vịt bọc nỉ êm, đính hoa acrylic kem bơ",
      "dimensions": "Dài 6.5cm x Rộng 2.5cm",
      "images": [
        "/uploads/charm_1789435942313_1789435706684_1528911961217344.jpg"
      ],
      "description": "Kẹp tóc handmade đính hoa acrylic kem bơ và charm nơ lấp lánh phong cách nàng thơ. Khung kẹp mỏ vịt kim loại chống rỉ bọc nỉ êm ái.",
      "isHot": true,
      "isNewArrival": false,
      "isCustomizable": false,
      "stock": 350,
      "soldCount": 920,
      "ratingAvg": 5,
      "ratingCount": 148,
      "variants": [
        {
          "id": "k1",
          "sku": "OM-CLIP-02-PK",
          "name": "Hoa Hồng Baby 🌸",
          "colorHex": "#FDA4AF",
          "stock": 100,
          "soldCount": 310,
          "isActive": true
        },
        {
          "id": "k2",
          "sku": "OM-CLIP-02-BL",
          "name": "Hoa Xanh Pastel 🩵",
          "colorHex": "#93C5FD",
          "stock": 90,
          "soldCount": 220,
          "isActive": true
        },
        {
          "id": "k3",
          "sku": "OM-CLIP-02-LV",
          "name": "Hoa Tím Lavender 💜",
          "colorHex": "#C084FC",
          "stock": 80,
          "soldCount": 210,
          "isActive": true
        },
        {
          "id": "k4",
          "sku": "OM-CLIP-02-BT",
          "name": "Hoa Vàng Bơ 🧈",
          "colorHex": "#FDE047",
          "stock": 80,
          "soldCount": 180,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t2-5",
          "minQuantity": 5,
          "unitPrice": 20000,
          "label": "Set 5 kẹp",
          "badge": "",
          "discountPercent": 17
        },
        {
          "id": "t2-10",
          "minQuantity": 10,
          "unitPrice": 19000,
          "label": "Set 10 kẹp (Tặng hộp)",
          "badge": "Siêu Hời 🎁",
          "discountPercent": 33,
          "isPopular": true
        },
        {
          "id": "t2-50",
          "minQuantity": 50,
          "unitPrice": 18000,
          "label": "Sỉ 50 kẹp",
          "badge": "Giá Sỉ 👑",
          "discountPercent": 50
        }
      ],
      "isActive": true,
      "createdAt": "2026-02-15T08:00:00.000Z",
      "updatedAt": "2026-09-15T01:32:58.871Z",
      "packageOptions": [
        {
          "id": "pkg-1",
          "name": "1 cái",
          "price": 20000
        },
        {
          "id": "pkg-5",
          "name": "Set 5 cái (Tiết kiệm 15%)",
          "price": 85000
        }
      ]
    },
    {
      "id": "prod-3",
      "sku": "OM-BRAC-03",
      "name": "Vòng Tay Cườm Hoa & Charm Bướm Dạ Quang (Custom)",
      "slug": "vong-tay-cuom-hoa-charm-buom-da-quang",
      "categoryId": "cat-3",
      "categoryName": "Vòng Tay",
      "basePrice": 10000,
      "originalPrice": 10000,
      "costPrice": 8000,
      "material": "Cườm Miyuki Nhật Bản, charm bướm dạ quang phát sáng, dây rút co giãn",
      "dimensions": "Chu vi cổ tay 14cm - 18cm (có thể yêu cầu size)",
      "images": [
        "/uploads/charm_1789436045826_1789435706628_1528911961217344.jpg"
      ],
      "description": "Vòng tay đan thủ công từ hạt cườm Miyuki kết hợp charm hoa bướm dạ quang phát sáng nhẹ ban đêm. Dây rút tiện lợi vừa mọi cỡ tay.",
      "isHot": true,
      "isNewArrival": true,
      "isCustomizable": true,
      "stock": 120,
      "soldCount": 450,
      "ratingAvg": 4.9,
      "ratingCount": 89,
      "variants": [
        {
          "id": "v-pink",
          "sku": "OM-BRAC-03-PK",
          "name": "Hồng Kẹo Ngọt 🌸",
          "colorHex": "#F472B6",
          "stock": 40,
          "soldCount": 150,
          "isActive": true
        },
        {
          "id": "v-blue",
          "sku": "OM-BRAC-03-BL",
          "name": "Xanh Biển Trong Veo 🩵",
          "colorHex": "#38BDF8",
          "stock": 30,
          "soldCount": 120,
          "isActive": true
        },
        {
          "id": "v-purple",
          "sku": "OM-BRAC-03-PL",
          "name": "Tím Khói Fairy 💜",
          "colorHex": "#A855F7",
          "stock": 30,
          "soldCount": 100,
          "isActive": true
        },
        {
          "id": "v-mint",
          "sku": "OM-BRAC-03-MT",
          "name": "Xanh Bơ Thanh Mát 🌿",
          "colorHex": "#34D399",
          "stock": 20,
          "soldCount": 80,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t3-2",
          "minQuantity": 2,
          "unitPrice": 10000,
          "label": "Cặp đôi (2 chiếc)",
          "badge": "",
          "discountPercent": 11
        },
        {
          "id": "t3-5",
          "minQuantity": 5,
          "unitPrice": 9500,
          "label": "Set 5 bạn thân",
          "badge": "Giảm 22%",
          "discountPercent": 22
        },
        {
          "id": "t3-20",
          "minQuantity": 20,
          "unitPrice": 9350,
          "label": "Combo sỉ 20 vòng",
          "badge": "Giá Sỉ 🌟",
          "discountPercent": 38
        }
      ],
      "isActive": true,
      "createdAt": "2026-03-01T08:00:00.000Z",
      "updatedAt": "2026-09-15T01:36:27.614Z",
      "packageOptions": [
        {
          "id": "pkg-1",
          "name": "1 cái",
          "price": 45000
        },
        {
          "id": "pkg-2",
          "name": "Combo Đôi 2 cái (Tặng hộp)",
          "price": 80000
        }
      ]
    },
    {
      "id": "prod-4",
      "sku": "OM-PHONE-04",
      "name": "Dây Đeo Thẻ / Phone Charm Phong Cách Fairy Tale",
      "slug": "day-deo-the-phone-charm-fairy-tale",
      "categoryId": "cat-4",
      "categoryName": "Phone Charm",
      "basePrice": 35000,
      "originalPrice": 35000,
      "costPrice": 30000,
      "material": "Dây dù siêu bền chịu lực 10kg, cườm hoa acrylic",
      "dimensions": "Dây đeo cổ 45cm / Dây cầm tay 15cm",
      "images": [
        "/uploads/charm_1789436308520_1789435799294_1528911961217344.jpg"
      ],
      "description": "Dây charm đa năng móc ốp lưng điện thoại, thẻ sinh viên, máy ảnh mini, túi xách. Hạt charm hoa tulip, trái cây, ngôi sao acrylic bền đẹp.",
      "isHot": false,
      "isNewArrival": true,
      "isCustomizable": false,
      "stock": 200,
      "soldCount": 310,
      "ratingAvg": 4.8,
      "ratingCount": 54,
      "variants": [
        {
          "id": "p1",
          "sku": "OM-PHONE-04-NECK",
          "name": "Dây Thẻ Đeo Cổ (45cm) 🎀",
          "colorHex": "#E879F9",
          "stock": 110,
          "soldCount": 180,
          "isActive": true
        },
        {
          "id": "p2",
          "sku": "OM-PHONE-04-HAND",
          "name": "Móc Cầm Tay (15cm) ✨",
          "colorHex": "#FB7185",
          "stock": 90,
          "soldCount": 130,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t4-3",
          "minQuantity": 3,
          "unitPrice": 35000,
          "label": "Combo 3 dây",
          "badge": "",
          "discountPercent": 14
        },
        {
          "id": "t4-10",
          "minQuantity": 10,
          "unitPrice": 34000,
          "label": "Combo 10 dây",
          "badge": "Giảm 31%",
          "discountPercent": 31
        }
      ],
      "isActive": true,
      "createdAt": "2026-03-20T08:00:00.000Z",
      "updatedAt": "2026-09-15T01:38:48.372Z",
      "packageOptions": [
        {
          "id": "pkg-1",
          "name": "1 cái",
          "price": 35000
        },
        {
          "id": "pkg-3",
          "name": "Combo 3 cái (Tặng bạn thân)",
          "price": 90000
        }
      ]
    },
    {
      "id": "prod-5",
      "sku": "OM-WATCH-05",
      "name": "Đồng Hồ Cườm Handmade Vintage Fairycore Custom",
      "slug": "dong-ho-cuom-handmade-vintage-fairycore",
      "categoryId": "cat-3",
      "categoryName": "Vòng Tay",
      "basePrice": 15000,
      "originalPrice": 15000,
      "costPrice": 10000,
      "material": "Mặt đồng hồ quartz kim loại vintage, đính cườm đá ngọc trai",
      "dimensions": "Size mặt 22mm, dây xâu custom theo cỡ tay",
      "images": [
        "/uploads/charm_1789436207744_1789435706706_1528911961217344.jpg"
      ],
      "description": "Mặt đồng hồ vintage mạ vàng đồng kết hợp dây đeo xâu cườm đá ngọc trai và charm hoa thủy tinh độc quyền bởi Omachi. Mỗi mẫu là 1 tác phẩm độc nhất!",
      "isHot": true,
      "isNewArrival": true,
      "isCustomizable": true,
      "stock": 35,
      "soldCount": 168,
      "ratingAvg": 5,
      "ratingCount": 62,
      "variants": [
        {
          "id": "dh-gold",
          "sku": "OM-WATCH-05-GD",
          "name": "Mặt Tròn Vàng Gold + Cườm Ngọc",
          "colorHex": "#F59E0B",
          "stock": 20,
          "soldCount": 98,
          "isActive": true
        },
        {
          "id": "dh-silver",
          "sku": "OM-WATCH-05-SV",
          "name": "Mặt Vuông Bạc + Cườm Xanh Băng",
          "colorHex": "#06B6D4",
          "stock": 15,
          "soldCount": 70,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t5-2",
          "minQuantity": 2,
          "unitPrice": 15000,
          "label": "Combo 2 chiếc",
          "badge": "",
          "discountPercent": 11
        },
        {
          "id": "t5-5",
          "minQuantity": 5,
          "unitPrice": 13000,
          "label": "Combo 5 chiếc",
          "badge": "Giá Ưu Đãi",
          "discountPercent": 23
        }
      ],
      "isActive": true,
      "createdAt": "2026-04-01T08:00:00.000Z",
      "updatedAt": "2026-09-15T01:37:27.931Z",
      "packageOptions": [
        {
          "id": "pkg-1",
          "name": "1 cái",
          "price": 129000
        }
      ]
    },
    {
      "id": "prod-6",
      "sku": "OM-BAG-06",
      "name": "Túi Mù Charm & Hạt Cườm May Mắn (Blind Bag Omachi)",
      "slug": "tui-mu-charm-hat-cuom-may-man-blind-bag",
      "categoryId": "cat-5",
      "categoryName": "Gấu",
      "basePrice": 15000,
      "originalPrice": 15000,
      "costPrice": 12000,
      "material": "Túi tráng nhôm bí mật, charm ngẫu nhiên",
      "dimensions": "Túi 7cm x 9cm",
      "images": [
        "/uploads/charm_1789436349750_1789435799214_1528911961217344.jpg"
      ],
      "description": "Túi mù xé trúng thưởng charm hiếm: Charm hoa pha lê, nơ cánh tiên, kẹp tóc lấp lánh, charm phát sáng. Càng mua nhiều túi cơ hội trúng charm VIP càng cao!",
      "isHot": true,
      "isNewArrival": true,
      "isCustomizable": false,
      "stock": 800,
      "soldCount": 1530,
      "ratingAvg": 4.9,
      "ratingCount": 310,
      "variants": [
        {
          "id": "tm-1",
          "sku": "OM-BAG-06-FL",
          "name": "Túi Mù Charm Hoa & Quả 🍓",
          "colorHex": "#EF4444",
          "stock": 450,
          "soldCount": 820,
          "isActive": true
        },
        {
          "id": "tm-2",
          "sku": "OM-BAG-06-BW",
          "name": "Túi Mù Kẹp Tóc & Nơ 🎀",
          "colorHex": "#EC4899",
          "stock": 350,
          "soldCount": 710,
          "isActive": true
        }
      ],
      "comboTiers": [
        {
          "id": "t6-5",
          "minQuantity": 5,
          "unitPrice": 15000,
          "label": "Set 5 ",
          "badge": "",
          "discountPercent": 20
        },
        {
          "id": "t6-10",
          "minQuantity": 10,
          "unitPrice": 14000,
          "label": "Set 10",
          "badge": "Tiết kiệm 33%",
          "discountPercent": 33
        }
      ],
      "isActive": true,
      "createdAt": "2026-04-10T08:00:00.000Z",
      "updatedAt": "2026-09-15T01:39:39.167Z",
      "packageOptions": [
        {
          "id": "pkg-1",
          "name": "1 túi",
          "price": 15000
        },
        {
          "id": "pkg-5",
          "name": "Set 5 túi (Tặng keo nano)",
          "price": 65000
        },
        {
          "id": "pkg-10",
          "name": "Set 10 túi (Bao trúng charm hiếm)",
          "price": 120000
        }
      ]
    }
  ],
  "customers": [
    {
      "id": "cust-1789380728129",
      "fullName": "Nguyễn Thùy Linh",
      "phone": "0912345678",
      "password": "password123",
      "email": "",
      "hasAccount": true,
      "address": "123 Cầu Giấy, Hà Nội",
      "city": "Hà Nội",
      "customerType": "NEW",
      "totalOrdersCount": 0,
      "totalSpent": 0,
      "createdAt": "2026-09-14T10:12:08.129Z",
      "updatedAt": "2026-09-14T10:12:08.129Z"
    }
  ],
  "orders": [
    {
      "id": "ord-1789526783799",
      "code": "OM-2260",
      "customer": {
        "fullName": "Dương Quốc Khánh",
        "phone": "0375408255",
        "address": "Thon Noi, Thong noi, Thị xã Việt Yên, Bắc Giang",
        "city": "Bắc Giang",
        "note": "1"
      },
      "items": [
        {
          "id": "item-1789526783799-0",
          "productId": "prod-1",
          "productName": "Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)",
          "productSku": "OM-BEAD-01",
          "variantId": "v1",
          "variantName": "Mix Hồng Pastel 🌸",
          "quantity": 1,
          "originalUnitPrice": 2000,
          "appliedUnitPrice": 20000,
          "totalPrice": 20000,
          "savingsAmount": 0,
          "discountPercent": 0,
          "customHandmadeNote": ""
        }
      ],
      "subtotal": 20000,
      "subtotalAmount": 2000,
      "comboDiscountAmount": 0,
      "itemsTotalAmount": 20000,
      "shippingFee": 0,
      "finalTotalAmount": 20000,
      "totalAmount": 20000,
      "paymentMethod": "COD",
      "paymentStatus": "UNPAID",
      "orderStatus": "PENDING_CONFIRM",
      "carrierName": "SPX Express",
      "logs": [
        {
          "id": "log-1789526783799",
          "action": "ORDER_CREATED",
          "performedBy": "CUSTOMER",
          "newValue": "Khách hàng đặt 1 sản phẩm",
          "timestamp": "2026-09-16T02:46:23.799Z"
        }
      ],
      "createdAt": "2026-09-16T02:46:23.799Z",
      "updatedAt": "2026-09-16T02:46:23.799Z"
    },
    {
      "id": "ord-1789519434477",
      "code": "OM-2049",
      "customer": {
        "fullName": "Dương Quốc Khánh",
        "phone": "0375408255",
        "address": "Thon Gia, Noi Hoang, Huyện Yên Dũng, Bắc Giang",
        "city": "Bắc Giang",
        "note": "1"
      },
      "items": [
        {
          "id": "item-1789519434477-0",
          "productId": "prod-3",
          "productName": "Vòng Tay Cườm Hoa & Charm Bướm Dạ Quang (Custom)",
          "productSku": "OM-BRAC-03",
          "variantId": "v-pink",
          "variantName": "Hồng Kẹo Ngọt 🌸",
          "quantity": 1,
          "originalUnitPrice": 10000,
          "appliedUnitPrice": 10000,
          "totalPrice": 10000,
          "savingsAmount": 0,
          "discountPercent": 0,
          "customHandmadeNote": ""
        },
        {
          "id": "item-1789519434477-1",
          "productId": "prod-1",
          "productName": "Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)",
          "productSku": "OM-BEAD-01",
          "variantId": "v1",
          "variantName": "Mix Hồng Pastel 🌸",
          "quantity": 3,
          "originalUnitPrice": 2000,
          "appliedUnitPrice": 20000,
          "totalPrice": 60000,
          "savingsAmount": 0,
          "discountPercent": 0,
          "customHandmadeNote": ""
        },
        {
          "id": "item-1789519434477-2",
          "productId": "prod-1",
          "productName": "Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)",
          "productSku": "OM-BEAD-01",
          "variantId": "v1",
          "variantName": "Mix Hồng Pastel 🌸",
          "quantity": 11,
          "originalUnitPrice": 2000,
          "appliedUnitPrice": 120000,
          "totalPrice": 1320000,
          "savingsAmount": 0,
          "discountPercent": 0,
          "customHandmadeNote": ""
        },
        {
          "id": "item-1789519434477-3",
          "productId": "prod-2",
          "productName": "Kẹp Tóc Hoa Kem Bơ Pastel Handmade Xinh Xắn",
          "productSku": "OM-CLIP-02",
          "variantId": "k1",
          "variantName": "Hoa Hồng Baby 🌸",
          "quantity": 1,
          "originalUnitPrice": 20000,
          "appliedUnitPrice": 20000,
          "totalPrice": 20000,
          "savingsAmount": 0,
          "discountPercent": 0,
          "customHandmadeNote": ""
        }
      ],
      "subtotal": 1410000,
      "subtotalAmount": 58000,
      "comboDiscountAmount": 0,
      "itemsTotalAmount": 1410000,
      "shippingFee": 20000,
      "finalTotalAmount": 1430000,
      "totalAmount": 1430000,
      "paymentMethod": "COD",
      "paymentStatus": "UNPAID",
      "orderStatus": "PREPARING",
      "carrierName": "SPX Express",
      "logs": [
        {
          "id": "log-1789519434477",
          "action": "ORDER_CREATED",
          "performedBy": "CUSTOMER",
          "newValue": "Khách hàng đặt 4 sản phẩm",
          "timestamp": "2026-09-16T00:43:54.477Z"
        },
        {
          "id": "log-1789519488867",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PENDING_CONFIRM",
          "newValue": "PREPARING (Thanh toán: UNPAID, Ship: 0)",
          "timestamp": "2026-09-16T00:44:48.867Z"
        },
        {
          "id": "log-1789519512684",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PREPARING",
          "newValue": "PREPARING (Thanh toán: UNPAID, Ship: 10000)",
          "timestamp": "2026-09-16T00:45:12.684Z"
        },
        {
          "id": "log-1789519519739",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PREPARING",
          "newValue": "PREPARING (Thanh toán: UNPAID, Ship: 199)",
          "timestamp": "2026-09-16T00:45:19.739Z"
        },
        {
          "id": "log-1789519525778",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PREPARING",
          "newValue": "PREPARING (Thanh toán: UNPAID, Ship: 20000)",
          "timestamp": "2026-09-16T00:45:25.778Z"
        }
      ],
      "createdAt": "2026-09-16T00:43:54.477Z",
      "updatedAt": "2026-09-16T00:45:25.778Z"
    },
    {
      "id": "ord-1789381048721",
      "code": "OM-9698",
      "customer": {
        "fullName": "Duong Quoc Khanh",
        "phone": "0358364897",
        "address": "Thôn Giá, Nội Hoàng, Yên Dũng",
        "city": "Hà Nội",
        "note": "12"
      },
      "items": [
        {
          "id": "item-1789381048721-0",
          "productId": "prod-5",
          "productName": "Đồng Hồ Cườm Handmade Vintage Fairycore Custom",
          "productSku": "OM-WATCH-05",
          "variantId": "dh-gold",
          "variantName": "Mặt Tròn Vàng Gold + Cườm Ngọc",
          "quantity": 12,
          "originalUnitPrice": 129000,
          "appliedUnitPrice": 99000,
          "appliedTierId": "t5-5",
          "appliedTierLabel": "Combo 5 chiếc",
          "totalPrice": 1188000,
          "savingsAmount": 360000,
          "customHandmadeNote": ""
        },
        {
          "id": "item-1789381048721-1",
          "productId": "prod-6",
          "productName": "Túi Mù Charm & Hạt Cườm May Mắn (Blind Bag Omachi)",
          "productSku": "OM-BAG-06",
          "variantId": "tm-1",
          "variantName": "Túi Mù Charm Hoa & Quả 🍓",
          "quantity": 1,
          "originalUnitPrice": 15000,
          "appliedUnitPrice": 15000,
          "totalPrice": 15000,
          "savingsAmount": 0,
          "customHandmadeNote": ""
        },
        {
          "id": "item-1789381048721-2",
          "productId": "prod-2",
          "productName": "Kẹp Tóc Hoa Kem Bơ Pastel Handmade Xinh Xắn",
          "productSku": "OM-CLIP-02",
          "variantId": "k1",
          "variantName": "Hoa Hồng Baby 🌸",
          "quantity": 1,
          "originalUnitPrice": 18000,
          "appliedUnitPrice": 18000,
          "totalPrice": 18000,
          "savingsAmount": 0,
          "customHandmadeNote": ""
        }
      ],
      "subtotalAmount": 1581000,
      "comboDiscountAmount": 360000,
      "itemsTotalAmount": 1221000,
      "shippingFee": 10000,
      "finalTotalAmount": 1231000,
      "totalAmount": 1231000,
      "paymentMethod": "ZALO_CONFIRM",
      "paymentStatus": "UNPAID",
      "orderStatus": "COMPLETED",
      "logs": [
        {
          "id": "log-1789381048721",
          "action": "ORDER_CREATED",
          "performedBy": "CUSTOMER",
          "newValue": "Khách hàng đặt 3 sản phẩm",
          "timestamp": "2026-09-14T10:17:28.721Z"
        },
        {
          "id": "log-1789381672800",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PENDING_CONFIRM",
          "newValue": "PREPARING (Thanh toán: PAID)",
          "timestamp": "2026-09-14T10:27:52.800Z"
        },
        {
          "id": "log-1789381677666",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PREPARING",
          "newValue": "SHIPPING (Thanh toán: PAID)",
          "timestamp": "2026-09-14T10:27:57.666Z"
        },
        {
          "id": "log-1789383622475",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "SHIPPING",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:22.475Z"
        },
        {
          "id": "log-1789383625318",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:25.318Z"
        },
        {
          "id": "log-1789383628720",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:28.720Z"
        },
        {
          "id": "log-1789383629819",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:29.819Z"
        },
        {
          "id": "log-1789383630667",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:30.667Z"
        },
        {
          "id": "log-1789383631224",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:31.224Z"
        },
        {
          "id": "log-1789383631727",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:31.727Z"
        },
        {
          "id": "log-1789383632113",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:32.113Z"
        },
        {
          "id": "log-1789383632571",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:32.571Z"
        },
        {
          "id": "log-1789383632780",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:32.780Z"
        },
        {
          "id": "log-1789383633005",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:33.005Z"
        },
        {
          "id": "log-1789383633208",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:33.208Z"
        },
        {
          "id": "log-1789383633426",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:33.426Z"
        },
        {
          "id": "log-1789383633635",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:33.635Z"
        },
        {
          "id": "log-1789383633852",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:33.852Z"
        },
        {
          "id": "log-1789383634071",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:34.071Z"
        },
        {
          "id": "log-1789383634280",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:34.280Z"
        },
        {
          "id": "log-1789383634496",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:34.496Z"
        },
        {
          "id": "log-1789383634715",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:34.715Z"
        },
        {
          "id": "log-1789383634917",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:34.917Z"
        },
        {
          "id": "log-1789383635144",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:35.144Z"
        },
        {
          "id": "log-1789383635368",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:35.368Z"
        },
        {
          "id": "log-1789383635577",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:35.577Z"
        },
        {
          "id": "log-1789383635788",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:35.788Z"
        },
        {
          "id": "log-1789383636023",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:36.023Z"
        },
        {
          "id": "log-1789383636215",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:36.215Z"
        },
        {
          "id": "log-1789383636425",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:36.425Z"
        },
        {
          "id": "log-1789383636634",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:36.634Z"
        },
        {
          "id": "log-1789383636844",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:36.844Z"
        },
        {
          "id": "log-1789383637062",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:37.062Z"
        },
        {
          "id": "log-1789383637280",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:37.280Z"
        },
        {
          "id": "log-1789383637507",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:37.507Z"
        },
        {
          "id": "log-1789383637715",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:37.715Z"
        },
        {
          "id": "log-1789383638186",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:38.186Z"
        },
        {
          "id": "log-1789383638575",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID)",
          "timestamp": "2026-09-14T11:00:38.575Z"
        },
        {
          "id": "log-1789383639144",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:00:39.144Z"
        },
        {
          "id": "log-1789436393162",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: PAID, Ship: 0)",
          "timestamp": "2026-09-15T01:39:53.162Z"
        },
        {
          "id": "log-1789436394045",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID, Ship: 0)",
          "timestamp": "2026-09-15T01:39:54.045Z"
        },
        {
          "id": "log-1789519321269",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "COMPLETED",
          "newValue": "COMPLETED (Thanh toán: UNPAID, Ship: 10000)",
          "timestamp": "2026-09-16T00:42:01.269Z"
        }
      ],
      "createdAt": "2026-09-14T10:17:28.721Z",
      "updatedAt": "2026-09-16T00:42:01.269Z",
      "paidAt": "2026-09-15T01:39:53.162Z",
      "shippedAt": "2026-09-14T10:27:57.666Z",
      "completedAt": "2026-09-14T11:00:22.475Z"
    },
    {
      "id": "ord-1789380741655",
      "code": "OM-1571",
      "customer": {
        "fullName": "Nguyễn Thùy Linh",
        "phone": "0912345678",
        "address": "123 Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "note": ""
      },
      "items": [
        {
          "id": "item-1789380741655-0",
          "productId": "prod-1",
          "productName": "Set Hạt Cườm Hoa & Nơ",
          "productSku": "OM-BEAD-01",
          "quantity": 50,
          "originalUnitPrice": 2000,
          "appliedUnitPrice": 1500,
          "totalPrice": 75000,
          "savingsAmount": 25000,
          "customHandmadeNote": ""
        }
      ],
      "subtotalAmount": 100000,
      "comboDiscountAmount": 25000,
      "itemsTotalAmount": 75000,
      "shippingFee": 20000,
      "finalTotalAmount": 95000,
      "totalAmount": 95000,
      "paymentMethod": "ZALO_CONFIRM",
      "paymentStatus": "UNPAID",
      "orderStatus": "PREPARING",
      "logs": [
        {
          "id": "log-1789380741655",
          "action": "ORDER_CREATED",
          "performedBy": "CUSTOMER",
          "newValue": "Khách hàng đặt 1 sản phẩm",
          "timestamp": "2026-09-14T10:12:21.655Z"
        },
        {
          "id": "log-1789385727892",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PENDING_CONFIRM",
          "newValue": "PREPARING (Thanh toán: UNPAID)",
          "timestamp": "2026-09-14T11:35:27.892Z"
        }
      ],
      "createdAt": "2026-09-14T10:12:21.655Z",
      "updatedAt": "2026-09-14T11:35:27.892Z"
    },
    {
      "id": "ord-1789377352334",
      "code": "OM-8093",
      "customer": {
        "fullName": "Nguyễn Thị Hà Trang",
        "phone": "0375408256",
        "address": "Số 18 Chùa Bộc, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "note": "Làm theo cỡ tay 15cm giúp em nhé shop!"
      },
      "items": [
        {
          "id": "item-1789377352334-0",
          "productId": "",
          "productName": "Mẫu Charm",
          "productSku": "SKU-1",
          "quantity": 2,
          "originalUnitPrice": 45000,
          "appliedUnitPrice": 45000,
          "totalPrice": 90000,
          "savingsAmount": 0,
          "customHandmadeNote": "Cỡ tay 15cm"
        }
      ],
      "subtotalAmount": 90000,
      "comboDiscountAmount": 0,
      "itemsTotalAmount": 90000,
      "shippingFee": 0,
      "finalTotalAmount": 90000,
      "totalAmount": 90000,
      "paymentMethod": "ZALO_CONFIRM",
      "paymentStatus": "PAID",
      "orderStatus": "PREPARING",
      "logs": [
        {
          "id": "log-1789377352334",
          "action": "ORDER_CREATED",
          "performedBy": "CUSTOMER",
          "newValue": "Khách hàng đặt 1 sản phẩm",
          "timestamp": "2026-09-14T09:15:52.334Z"
        },
        {
          "id": "log-1789377352342",
          "action": "STATUS_UPDATED",
          "performedBy": "ADMIN",
          "oldValue": "PENDING_CONFIRM",
          "newValue": "PREPARING (Thanh toán: PAID)",
          "timestamp": "2026-09-14T09:15:52.342Z"
        }
      ],
      "createdAt": "2026-09-14T09:15:52.334Z",
      "updatedAt": "2026-09-14T09:15:52.342Z",
      "paidAt": "2026-09-14T09:15:52.342Z"
    }
  ],
  "feedbacks": [],
  "settings": {
    "shopName": "Omachi 🌸 Phụ Kiện Handmade & Charm",
    "brandTitle": "OMACHI HANDMADE STORE",
    "slogan": "Vòng cườm, kẹp tóc pastel, charm hoa xinh lấp lánh custom theo yêu cầu ✨",
    "hotline": "0398445122",
    "zaloPhone": "0398445122",
    "zaloOfficialUrl": "https://zalo.me/0375408256",
    "instagramUrl": "https://instagram.com/omachii18",
    "instagramHandle": "@omachii18",
    "tiktokUrl": "https://tiktok.com/@omachi_charm",
    "tiktokHandle": "@omachi_charm",
    "heroTitle": "Vòng Charm, Kẹp Tóc & Phụ Kiện Pastel",
    "heroSubtitle": "Khám phá thế giới charm trong veo, kẹp hoa kem bơ và vòng tay handmade đan thủ công theo phong cách của riêng bạn ✨",
    "bannerText": "🌸 Tiệm Phụ Kiện Handmade Omachi • Nhận làm vòng tay & charm theo yêu cầu ✨",
    "showFeedbacks": true,
    "shopAddress": "Hà Nội, Việt Nam",
    "workingHours": "08:30 - 22:00 Hàng ngày",
    "freeShippingThreshold": 200000,
    "autoReplyTemplate": "Chào bạn, Shop Omachi đã nhận được đơn hàng #{orderCode}. Shop sẽ kiểm tra mẫu và báo lại bạn ngay nhé!",
    "heroImage": "/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg",
    "heroBadge": "Ảnh thật tại tiệm 100% ✨",
    "purchasePolicies": [
      {
        "icon": "📦",
        "title": "Đồng Kiểm Khi Nhận Hàng",
        "desc": "Được mở gói hàng kiểm tra đúng mẫu, đúng số lượng trước khi thanh toán tiền cho shipper SPX."
      },
      {
        "icon": "🔄",
        "title": "Đổi Trả 1-1 Trong 48 Giờ",
        "desc": "Hỗ trợ đổi mới hoàn toàn miễn phí nếu charm bị gãy vỡ, lỗi đứt cước hoặc giao nhầm màu sắc."
      },
      {
        "icon": "🎀",
        "title": "100% Ảnh Thật Tại Xưởng",
        "desc": "Mọi hình ảnh charm, vòng tay và kẹp hoa đều do shop tự quay chụp thật, đan thủ công tỉ mỉ."
      },
      {
        "icon": "🚚",
        "title": "Gói Quà Pastel & Giao Nhanh",
        "desc": "Đóng gói hộp quà pastel xinh xắn kèm bọc bóng khí chống sốc, giao toàn quốc từ 1 - 3 ngày."
      }
    ],
    "purchasePolicyDetail": "Khách hàng vui lòng quay video khi bóc mở kiện hàng để được hỗ trợ giải quyết nhanh nhất khi có phát sinh lỗi hoặc thiếu mẫu.",
    "heroImages": [
      "/uploads/charm_1789435032381_1789371730991_1528911961217344.jpg",
      "/uploads/charm_1789442857187_1789435799272_1528911961217344.jpg",
      "/uploads/charm_1789442857200_1789435799294_1528911961217344.jpg",
      "/uploads/charm_1789442857210_1789435799313_1528911961217344.jpg",
      "/uploads/charm_1789442857219_1789435799334_1528911961217344.jpg"
    ],
    "telegramChatId": "8941847464",
    "telegramBotToken": "8643883325:AAFtYvON3zYNH6D8K1Mf8bTtHclR1ha92SQ",
    "websiteUrl": "",
    "enableTelegramNotify": true,
    "prepaidFreeShipThreshold": 10000,
    "enablePrepaidFreeShip": true,
    "bankId": "VCB",
    "bankAccount": "1018880066",
    "bankOwner": "DUONG QUOC KHANH"
  }
};

declare global {
  var __omachi_db: DetailedDatabaseSchema | undefined;
}

function readDb(): DetailedDatabaseSchema {
  // Ưu tiên trả về tức thì từ bộ nhớ RAM (0ms) thay vì đọc ổ đĩa liên tục
  if (globalThis.__omachi_db) {
    return globalThis.__omachi_db;
  }
  try {
    const targetFile = WRITABLE_DB_FILE;
    if (!fs.existsSync(targetFile)) {
      let initialData: DetailedDatabaseSchema = INITIAL_DATABASE;
      if (fs.existsSync(READONLY_DB_FILE)) {
        try {
          const raw = fs.readFileSync(READONLY_DB_FILE, 'utf-8');
          initialData = JSON.parse(raw);
        } catch (e) {
          console.error('[DB] Error reading READONLY_DB_FILE:', e);
        }
      }
      try {
        const dir = path.dirname(targetFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(targetFile, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch (writeErr) {
        console.error('[DB] Error initializing target DB file:', writeErr);
      }
      globalThis.__omachi_db = initialData;
      return initialData;
    }

    const raw = fs.readFileSync(targetFile, 'utf-8');
    const parsed: DetailedDatabaseSchema = JSON.parse(raw);
    let needResave = false;
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_DATABASE.products;
      needResave = true;
    }
    if (!parsed.feedbacks || !Array.isArray(parsed.feedbacks)) {
      parsed.feedbacks = [];
      needResave = true;
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_DATABASE.categories;
      needResave = true;
    }
    if (!parsed.orders || !Array.isArray(parsed.orders)) {
      parsed.orders = [];
      needResave = true;
    }
    if (!parsed.customers || !Array.isArray(parsed.customers)) {
      parsed.customers = [];
      needResave = true;
    }
    if (needResave) {
      writeDb(parsed);
    }
    globalThis.__omachi_db = parsed;
    return parsed;
  } catch (error) {
    console.error('[DB] Error reading DB, using memory or initial:', error);
    if (globalThis.__omachi_db) {
      return globalThis.__omachi_db;
    }
    return INITIAL_DATABASE;
  }
}

function writeDb(data: DetailedDatabaseSchema) {
  globalThis.__omachi_db = data;
  data.lastBackup = new Date().toISOString();
  try {
    const targetFile = WRITABLE_DB_FILE;
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] Error writing DB to targetFile:', error);
    if (!IS_SERVERLESS) {
      try {
        const fallback = path.join('/tmp', 'database.json');
        const fdir = path.dirname(fallback);
        if (!fs.existsSync(fdir)) fs.mkdirSync(fdir, { recursive: true });
        fs.writeFileSync(fallback, JSON.stringify(data, null, 2), 'utf-8');
      } catch (e2) {}
    }
  }
}

// ==========================================
// EXPORTED DATABASE ENGINE WITH RELATIONAL METHODS
// ==========================================

// ==========================================
// SUPABASE HELPERS & MAPPERS
// ==========================================

function mapCategoryFromSupabase(row: any): Category {
  return {
    id: row.id,
    code: row.code || '',
    name: row.name,
    slug: row.slug || '',
    icon: row.icon || '🌸',
    description: row.description || '',
    displayOrder: Number(row.display_order ?? 1),
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapProductFromSupabase(row: any): Product {
  return {
    id: row.id,
    sku: row.sku || '',
    name: row.name,
    slug: row.slug || '',
    categoryId: row.category_id || '',
    categoryName: row.category_name || '',
    basePrice: Number(row.base_price || 0),
    originalPrice: Number(row.original_price || 0),
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    material: row.material || '',
    dimensions: row.dimensions || '',
    weight: Number(
      (row.weight !== undefined && row.weight !== null && Number(row.weight) > 0)
        ? row.weight
        : (Array.isArray(row.variants) && row.variants[0]?.weight)
        ? row.variants[0].weight
        : (Array.isArray(row.package_options) && row.package_options[0]?._weight)
        ? row.package_options[0]._weight
        : 50
    ),
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || '',
    isHot: Boolean(row.is_hot),
    isNewArrival: Boolean(row.is_new_arrival),
    isCustomizable: Boolean(row.is_customizable),
    stock: Number(row.stock ?? 100),
    soldCount: Number(row.sold_count ?? 0),
    ratingAvg: Number(row.rating_avg ?? 5),
    ratingCount: Number(row.rating_count ?? 0),
    variants: Array.isArray(row.variants) ? row.variants : [],
    comboTiers: Array.isArray(row.combo_tiers) ? row.combo_tiers : [],
    packageOptions: Array.isArray(row.package_options) ? row.package_options : [],
    minOrderQuantity: Number(row.min_order_quantity || 1),
    stepQuantity: Number(row.step_quantity || 1),
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapOrderFromSupabase(row: any): Order {
  const cust = row.customer || {
    fullName: row.customer_name || '',
    phone: row.customer_phone || '',
    address: row.customer_address || '',
    city: row.customer_city || '',
    note: '',
  };
  return {
    id: row.id,
    code: row.code,
    customerId: row.customer_id || undefined,
    customer: cust,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? row.subtotal_amount ?? 0),
    subtotalAmount: Number(row.subtotal_amount ?? row.subtotal ?? 0),
    comboDiscountAmount: Number(row.combo_discount_amount ?? 0),
    discount: Number(row.discount ?? 0),
    itemsTotalAmount: Number(row.items_total_amount ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    totalWeight: Number(row.total_weight ?? 0),
    finalTotalAmount: Number(row.final_total_amount ?? row.total_amount ?? 0),
    totalAmount: Number(row.total_amount ?? row.final_total_amount ?? 0),
    paymentMethod: row.payment_method || 'COD',
    paymentStatus: row.payment_status || 'UNPAID',
    orderStatus: row.order_status || 'PENDING_CONFIRM',
    carrierName: row.carrier_name || undefined,
    trackingNumber: row.tracking_number || undefined,
    logs: Array.isArray(row.logs) ? row.logs : [],
    paidAt: row.paid_at || undefined,
    shippedAt: row.shipped_at || undefined,
    completedAt: row.completed_at || undefined,
    cancelReason: row.cancel_reason || row.customer?.cancelReason || (Array.isArray(row.logs) ? row.logs.find((l: any) => l.cancelReason)?.cancelReason : '') || undefined,
    cancelledBy: row.cancelled_by || row.customer?.cancelledBy || (Array.isArray(row.logs) ? row.logs.find((l: any) => l.cancelledBy)?.cancelledBy : '') || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapCustomerFromSupabase(row: any): Customer {
  const savedAddrs: SavedAddress[] = Array.isArray(row.saved_addresses) ? row.saved_addresses : [];
  const defaultAddr = savedAddrs.find((a) => a.isDefault) || savedAddrs[0];
  const ward = defaultAddr?.ward || (row.district && !row.district.includes('Huyện') && !row.district.includes('Quận') ? row.district : '');

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || undefined,
    password: row.password || undefined,
    hasAccount: Boolean(row.has_account),
    address: row.address || defaultAddr?.address || '',
    city: row.city || defaultAddr?.city || '',
    district: row.district || defaultAddr?.district || undefined,
    ward: ward || undefined,
    savedAddresses: savedAddrs,
    customerType: row.customer_type || 'NEW',
    totalOrdersCount: Number(row.total_orders_count || 0),
    totalSpent: Number(row.total_spent || 0),
    lastOrderAt: row.last_order_at || undefined,
    internalNotes: row.internal_notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapFeedbackFromSupabase(row: any): CustomerFeedback {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerLocation: row.customer_location || undefined,
    comment: row.comment,
    rating: Number(row.rating || 5),
    purchasedProduct: row.purchased_product || undefined,
    avatarText: row.avatar_text || 'KH',
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapSettingsFromSupabase(row: any, fallback: ShopSettings): ShopSettings {
  const raw = row.raw_data || {};
  return {
    ...fallback,
    ...raw,
    shopName: row.shop_name ?? raw.shopName ?? fallback.shopName,
    brandTitle: row.brand_title ?? raw.brandTitle ?? fallback.brandTitle,
    slogan: row.slogan ?? raw.slogan ?? fallback.slogan,
    hotline: row.hotline ?? raw.hotline ?? fallback.hotline,
    zaloPhone: row.zalo_phone ?? raw.zaloPhone ?? fallback.zaloPhone,
    zaloOfficialUrl: row.zalo_official_url ?? raw.zaloOfficialUrl ?? fallback.zaloOfficialUrl,
    instagramUrl: row.instagram_url ?? raw.instagramUrl ?? fallback.instagramUrl,
    instagramHandle: raw.instagramHandle ?? fallback.instagramHandle,
    tiktokUrl: row.tiktok_url ?? raw.tiktokUrl ?? fallback.tiktokUrl,
    tiktokHandle: raw.tiktokHandle ?? fallback.tiktokHandle,
    heroTitle: row.hero_title ?? raw.heroTitle ?? fallback.heroTitle,
    heroSubtitle: row.hero_subtitle ?? raw.heroSubtitle ?? fallback.heroSubtitle,
    bannerText: row.banner_text ?? raw.bannerText ?? fallback.bannerText,
    showFeedbacks: raw.showFeedbacks ?? fallback.showFeedbacks,
    shopAddress: row.shop_address ?? raw.shopAddress ?? fallback.shopAddress,
    workingHours: row.working_hours ?? raw.workingHours ?? fallback.workingHours,
    freeShippingThreshold: Number(row.free_shipping_threshold ?? raw.freeShippingThreshold ?? fallback.freeShippingThreshold),
    autoReplyTemplate: raw.autoReplyTemplate ?? fallback.autoReplyTemplate,
    telegramBotToken: row.telegram_bot_token ?? raw.telegramBotToken ?? fallback.telegramBotToken,
    telegramChatId: row.telegram_chat_id ?? raw.telegramChatId ?? fallback.telegramChatId,
    enableTelegramNotify: row.enable_telegram_notify ?? raw.enableTelegramNotify ?? fallback.enableTelegramNotify,
    websiteUrl: raw.websiteUrl ?? fallback.websiteUrl,
    warehouseProvince: raw.warehouseProvince ?? fallback.warehouseProvince,
    heroImage: raw.heroImage ?? fallback.heroImage,
    heroImages: raw.heroImages ?? fallback.heroImages,
    heroBadge: raw.heroBadge ?? fallback.heroBadge,
    purchasePolicies: raw.purchasePolicies ?? fallback.purchasePolicies,
    purchasePolicyDetail: raw.purchasePolicyDetail ?? fallback.purchasePolicyDetail,
    customWholesaleTiers: raw.customWholesaleTiers ?? fallback.customWholesaleTiers,
    prepaidFreeShipThreshold: Number(row.prepaid_free_ship_threshold ?? raw.prepaidFreeShipThreshold ?? fallback.prepaidFreeShipThreshold ?? 10000),
    enablePrepaidFreeShip: row.enable_prepaid_free_ship ?? raw.enablePrepaidFreeShip ?? fallback.enablePrepaidFreeShip ?? true,
    momoPhone: row.momo_phone ?? raw.momoPhone ?? fallback.momoPhone,
    momoName: row.momo_name ?? raw.momoName ?? fallback.momoName,
    momoQrImage: raw.momoQrImage ?? fallback.momoQrImage,
    bankId: row.bank_id ?? raw.bankId ?? fallback.bankId,
    bankAccount: row.bank_account ?? raw.bankAccount ?? fallback.bankAccount,
    bankOwner: row.bank_owner ?? raw.bankOwner ?? fallback.bankOwner,
    sepayApiKey: (row as any).sepay_api_key ?? raw.sepayApiKey ?? fallback.sepayApiKey,
  };
}

let serverOrdersCache: { data: Order[]; expiresAt: number } | null = null;
let serverProductsCache: { data: Product[]; expiresAt: number } | null = null;
let serverCategoriesCache: { data: Category[]; expiresAt: number } | null = null;
let serverSettingsCache: { data: ShopSettings; expiresAt: number } | null = null;
let serverFeedbacksCache: { data: CustomerFeedback[]; expiresAt: number } | null = null;

export function invalidateOrdersCache() { serverOrdersCache = null; }
export function invalidateProductsCache() { serverProductsCache = null; }
export function invalidateCategoriesCache() { serverCategoriesCache = null; }
export function invalidateSettingsCache() { serverSettingsCache = null; }
export function invalidateFeedbacksCache() { serverFeedbacksCache = null; }
export function invalidateAllCaches() {
  serverOrdersCache = null;
  serverProductsCache = null;
  serverCategoriesCache = null;
  serverSettingsCache = null;
  serverFeedbacksCache = null;
}

export const db = {
  // RAW DATABASE
  raw: {
    get: () => readDb(),
    save: (data: DetailedDatabaseSchema) => writeDb(data),
  },

  // CATEGORIES TABLE
  categories: {
    async getAll(): Promise<Category[]> {
      if (serverCategoriesCache && Date.now() < serverCategoriesCache.expiresAt) {
        return serverCategoriesCache.data;
      }
      const local = (readDb().categories || []).filter((c) => c.isActive !== false).sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

      const fetchSupabase = async (): Promise<Category[] | null> => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map(mapCategoryFromSupabase);
          }
        } catch (err) {
          console.warn('[Supabase categories.getAll fallback to local]:', err);
        }
        return null;
      };

      let freshList: Category[] | null = null;
      if (local.length > 0) {
        freshList = await Promise.race([
          fetchSupabase(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 300))
        ]);
      } else {
        freshList = await fetchSupabase();
      }

      if (freshList && freshList.length > 0) {
        serverCategoriesCache = { data: freshList, expiresAt: Date.now() + 30000 };
        const dbData = readDb();
        dbData.categories = freshList;
        return freshList;
      }

      serverCategoriesCache = { data: local, expiresAt: Date.now() + 10000 };
      return local;
    },

    async getById(id: string): Promise<Category | undefined> {
      // 1. Kiểm tra RAM cục bộ trước (0ms)
      const local = (readDb().categories || []).find((c) => c.id === id || c.slug === id);
      if (local) return local;

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .maybeSingle();
        if (!error && data) {
          return mapCategoryFromSupabase(data);
        }
      } catch (err) {
        console.warn('[Supabase categories.getById fallback]:', err);
      }
      return undefined;
    },

    async create(data: Omit<Category, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean }): Promise<Category> {
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
      invalidateCategoriesCache();

      try {
        const upsertP = supabase.from('categories').upsert({
          id: newCategory.id,
          code: newCategory.code,
          name: newCategory.name,
          slug: newCategory.slug,
          icon: newCategory.icon,
          description: newCategory.description,
          display_order: newCategory.displayOrder,
          is_active: newCategory.isActive,
          created_at: newCategory.createdAt,
        });
        await Promise.race([upsertP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase categories.create error]:', err);
      }
      return newCategory;
    },

    async update(id: string, updateData: Partial<Category>): Promise<Category | null> {
      const dbData = readDb();
      if (!dbData.categories) return null;
      const index = dbData.categories.findIndex((c) => c.id === id);
      if (index === -1) return null;
      dbData.categories[index] = {
        ...dbData.categories[index],
        ...updateData,
      };
      if (updateData.name) {
        dbData.products.forEach((p) => {
          if (p.categoryId === id || (p as any).category === dbData.categories[index].slug) {
            p.categoryName = updateData.name!;
          }
        });
      }
      writeDb(dbData);
      invalidateCategoriesCache();
      invalidateProductsCache();

      try {
        const item = dbData.categories[index];
        const upsertP = supabase.from('categories').upsert({
          id: item.id,
          code: item.code,
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          description: item.description,
          display_order: item.displayOrder,
          is_active: item.isActive,
        });
        await Promise.race([upsertP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase categories.update error]:', err);
      }
      return dbData.categories[index];
    },

    async delete(id: string): Promise<boolean> {
      const dbData = readDb();
      if (!dbData.categories) return false;
      const index = dbData.categories.findIndex((c) => c.id === id);
      if (index === -1) return false;
      dbData.categories[index].isActive = false;
      writeDb(dbData);
      invalidateCategoriesCache();

      try {
        const delP = supabase.from('categories').update({ is_active: false }).eq('id', id);
        await Promise.race([delP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase categories.delete error]:', err);
      }
      return true;
    }
  },

  // PRODUCTS TABLE
  products: {
    async getAll(): Promise<Product[]> {
      if (serverProductsCache && Date.now() < serverProductsCache.expiresAt) {
        return serverProductsCache.data;
      }
      const local = (readDb().products || []).filter((p) => p.isActive);

      const fetchSupabase = async (): Promise<Product[] | null> => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map(mapProductFromSupabase);
          }
        } catch (err) {
          console.warn('[Supabase products.getAll fallback]:', err);
        }
        return null;
      };

      let freshList: Product[] | null = null;
      if (local.length > 0) {
        freshList = await Promise.race([
          fetchSupabase(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 300))
        ]);
      } else {
        freshList = await fetchSupabase();
      }

      if (freshList && freshList.length > 0) {
        serverProductsCache = { data: freshList, expiresAt: Date.now() + 30000 };
        const dbData = readDb();
        dbData.products = freshList;
        return freshList;
      }

      serverProductsCache = { data: local, expiresAt: Date.now() + 10000 };
      return local;
    },

    async getById(idOrSlug: string): Promise<Product | undefined> {
      // 1. Kiểm tra RAM cục bộ trước (0ms)
      const local = (readDb().products || []).find((p) => (p.id === idOrSlug || p.slug === idOrSlug) && p.isActive);
      if (local) return local;

      // 2. Tra cứu Supabase nếu chưa có
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
          .eq('is_active', true)
          .maybeSingle();
        if (!error && data) {
          return mapProductFromSupabase(data);
        }
      } catch (err) {
        console.warn('[Supabase products.getById fallback]:', err);
      }
      return undefined;
    },

    async create(data: Omit<Product, 'id' | 'sku' | 'slug' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<Product> {
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
      invalidateProductsCache();

      try {
        const weightVal = Number(newProduct.weight) > 0 ? Number(newProduct.weight) : 50;
        const variantsWithWeight = (newProduct.variants || []).map((v: any) => ({ ...v, weight: weightVal }));
        const pkgWithWeight = (newProduct.packageOptions || []).map((pkg: any) => ({ ...pkg, _weight: weightVal }));
        const baseRow = {
          id: newProduct.id,
          sku: newProduct.sku,
          name: newProduct.name,
          slug: newProduct.slug,
          category_id: newProduct.categoryId,
          category_name: newProduct.categoryName,
          base_price: newProduct.basePrice,
          original_price: newProduct.originalPrice,
          cost_price: newProduct.costPrice || null,
          material: newProduct.material || '',
          dimensions: newProduct.dimensions || '',
          images: newProduct.images || [],
          description: newProduct.description || '',
          is_hot: newProduct.isHot,
          is_new_arrival: newProduct.isNewArrival,
          is_customizable: newProduct.isCustomizable,
          stock: newProduct.stock,
          sold_count: newProduct.soldCount,
          rating_avg: newProduct.ratingAvg,
          rating_count: newProduct.ratingCount,
          variants: variantsWithWeight,
          combo_tiers: newProduct.comboTiers || [],
          package_options: pkgWithWeight,
          min_order_quantity: newProduct.minOrderQuantity || 1,
          step_quantity: newProduct.stepQuantity || 1,
          is_active: newProduct.isActive,
          created_at: newProduct.createdAt,
          updated_at: newProduct.updatedAt,
        };

        const upsertP = (async () => {
          const { error: err1 } = await supabase.from('products').upsert({ ...baseRow, weight: weightVal });
          if (err1) {
            await supabase.from('products').upsert(baseRow);
          }
        })();

        await Promise.race([upsertP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase products.create exception]:', err);
      }
      return newProduct;
    },

    async update(id: string, updateData: Partial<Product>): Promise<Product | null> {
      const dbData = readDb();
      const index = dbData.products.findIndex((p) => p.id === id);
      if (index === -1) return null;
      dbData.products[index] = {
        ...dbData.products[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      writeDb(dbData);
      invalidateProductsCache();

      try {
        const p = dbData.products[index];
        const weightVal = Number(p.weight) > 0 ? Number(p.weight) : 50;
        const variantsWithWeight = (p.variants || []).map((v: any) => ({ ...v, weight: weightVal }));
        const pkgWithWeight = (p.packageOptions || []).map((pkg: any) => ({ ...pkg, _weight: weightVal }));
        const baseRow = {
          id: p.id,
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          category_id: p.categoryId,
          category_name: p.categoryName,
          base_price: p.basePrice,
          original_price: p.originalPrice,
          cost_price: p.costPrice || null,
          material: p.material || '',
          dimensions: p.dimensions || '',
          images: p.images || [],
          description: p.description || '',
          is_hot: p.isHot,
          is_new_arrival: p.isNewArrival,
          is_customizable: p.isCustomizable,
          stock: p.stock,
          sold_count: p.soldCount,
          rating_avg: p.ratingAvg,
          rating_count: p.ratingCount,
          variants: variantsWithWeight,
          combo_tiers: p.comboTiers || [],
          package_options: pkgWithWeight,
          min_order_quantity: p.minOrderQuantity || 1,
          step_quantity: p.stepQuantity || 1,
          is_active: p.isActive,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        };

        const upsertP = (async () => {
          const { error: err1 } = await supabase.from('products').upsert({ ...baseRow, weight: weightVal });
          if (err1) {
            await supabase.from('products').upsert(baseRow);
          }
        })();

        await Promise.race([upsertP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase products.update exception]:', err);
      }
      return dbData.products[index];
    },

    async delete(id: string): Promise<boolean> {
      const dbData = readDb();
      const index = dbData.products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      dbData.products.splice(index, 1);
      writeDb(dbData);
      invalidateProductsCache();

      try {
        const delP = supabase.from('products').update({ is_active: false }).eq('id', id);
        await Promise.race([delP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase products.delete error]:', err);
      }
      return true;
    }
  },

  // CUSTOMERS TABLE
  customers: {
    async getAll(): Promise<Customer[]> {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(mapCustomerFromSupabase);
        }
      } catch (err) {
        console.warn('[Supabase customers.getAll fallback]:', err);
      }
      return readDb().customers || [];
    },

    async getById(id: string): Promise<Customer | undefined> {
      const local = (readDb().customers || []).find((c) => c.id === id);
      if (local) return local;

      try {
        const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
        if (!error && data) return mapCustomerFromSupabase(data);
      } catch (err) {
        console.warn('[Supabase customers.getById fallback]:', err);
      }
      return undefined;
    },

    async findByPhone(phone: string): Promise<Customer | undefined> {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const local = (readDb().customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);
      if (local) return local;

      try {
        const { data, error } = await supabase.from('customers').select('*').eq('phone', cleanPhone).maybeSingle();
        if (!error && data) return mapCustomerFromSupabase(data);
      } catch (err) {
        console.warn('[Supabase customers.findByPhone fallback]:', err);
      }
      return undefined;
    },

    async register(data: { fullName: string; phone: string; password?: string; address?: string; city?: string; email?: string }): Promise<{ customer: Customer; error?: string }> {
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
        existing.fullName = data.fullName || existing.fullName;
        existing.password = data.password || existing.password;
        existing.address = data.address || existing.address;
        existing.city = data.city || existing.city;
        existing.email = data.email || existing.email;
        existing.hasAccount = true;
        existing.updatedAt = new Date().toISOString();
        writeDb(dbData);

        try {
          await supabase.from('customers').upsert({
            id: existing.id,
            full_name: existing.fullName,
            phone: existing.phone,
            password: existing.password,
            email: existing.email || '',
            address: existing.address || '',
            city: existing.city || '',
            has_account: true,
            updated_at: existing.updatedAt,
          });
        } catch (e) {}
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
        city: data.city || '',
        customerType: 'NEW',
        totalOrdersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.customers.unshift(newCustomer);
      writeDb(dbData);

      try {
        await supabase.from('customers').upsert({
          id: newCustomer.id,
          full_name: newCustomer.fullName,
          phone: newCustomer.phone,
          password: newCustomer.password,
          email: newCustomer.email,
          has_account: true,
          address: newCustomer.address,
          city: newCustomer.city,
          customer_type: newCustomer.customerType,
          total_orders_count: 0,
          total_spent: 0,
          created_at: newCustomer.createdAt,
          updated_at: newCustomer.updatedAt,
        });
      } catch (e) {}
      return { customer: newCustomer };
    },

    async login(phone: string, password?: string): Promise<{ customer: Customer | null; error?: string }> {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      let customer: Customer | undefined;

      // 1. Kiểm tra RAM cục bộ trước (0ms)
      const dbData = readDb();
      customer = (dbData.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);

      // 2. Nếu chưa có mới tra cứu Supabase
      if (!customer) {
        try {
          const { data, error } = await supabase.from('customers').select('*').eq('phone', cleanPhone).maybeSingle();
          if (!error && data) {
            customer = mapCustomerFromSupabase(data);
            if (customer) {
              if (!dbData.customers) dbData.customers = [];
              dbData.customers.unshift(customer);
            }
          }
        } catch (e) {}
      }

      if (!customer) {
        return { customer: null, error: 'Số điện thoại chưa từng đặt hàng hoặc đăng ký tại shop!' };
      }

      if (customer.hasAccount && customer.password) {
        if (password && customer.password !== password) {
          return { customer: null, error: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
        }
      }

      return { customer };
    },

    async saveOrUpdateAddress(customerIdOrPhone: string, addr: { address: string; district?: string; city?: string; ward?: string; isDefault?: boolean }): Promise<Customer | null> {
      const dbData = readDb();
      if (!dbData.customers) return null;
      const clean = customerIdOrPhone.replace(/[^0-9]/g, '');
      const cust = dbData.customers.find((c) => c.id === customerIdOrPhone || c.phone.replace(/[^0-9]/g, '') === clean);
      if (!cust) return null;

      if (!cust.savedAddresses) cust.savedAddresses = [];
      const makeDefault = addr.isDefault !== false || !cust.address || cust.savedAddresses.length === 0;
      const addrSpecific = (addr.address || '').trim();
      const addrDistrict = (addr.district || '').trim();
      const addrWard = (addr.ward || (addr as any).ward || '').trim();
      const addrCity = (addr.city || '').trim();

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
        cust.savedAddresses[existingAddrIdx].ward = addrWard;
        cust.savedAddresses[existingAddrIdx].district = addrDistrict;
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

      try {
        await supabase.from('customers').update({
          address: cust.address,
          district: cust.district,
          city: cust.city,
          saved_addresses: cust.savedAddresses,
          updated_at: cust.updatedAt,
        }).eq('id', cust.id);
      } catch (e) {}
      return cust;
    },

    async update(id: string, updateData: Partial<Customer>): Promise<Customer | null> {
      const dbData = readDb();
      if (!dbData.customers) dbData.customers = [];
      let index = dbData.customers.findIndex((c) => c.id === id);

      if (index === -1) {
        // Kiểm tra xem khách hàng có trên Supabase hoặc tìm theo số điện thoại không
        let custFromSb: Customer | undefined;
        try {
          const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
          if (data) {
            custFromSb = mapCustomerFromSupabase(data);
          } else if (updateData.phone) {
            const clean = updateData.phone.replace(/[^0-9]/g, '');
            const { data: byPhone } = await supabase.from('customers').select('*').eq('phone', clean).maybeSingle();
            if (byPhone) custFromSb = mapCustomerFromSupabase(byPhone);
          }
        } catch (e) {}

        if (custFromSb) {
          dbData.customers.unshift(custFromSb);
          index = 0;
        } else {
          // Tự động tạo hồ sơ khách hàng mới thay vì trả về null
          const newCust: Customer = {
            id,
            fullName: updateData.fullName || 'Khách hàng',
            phone: updateData.phone || '',
            hasAccount: updateData.hasAccount ?? true,
            address: updateData.address || '',
            city: updateData.city || '',
            district: updateData.district || '',
            ward: updateData.ward || '',
            savedAddresses: updateData.savedAddresses || [],
            customerType: 'NEW',
            totalOrdersCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          dbData.customers.unshift(newCust);
          index = 0;
        }
      }

      dbData.customers[index] = {
        ...dbData.customers[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      writeDb(dbData);

      try {
        const c = dbData.customers[index];
        await supabase.from('customers').upsert({
          id: c.id,
          full_name: c.fullName,
          phone: c.phone,
          email: c.email || '',
          password: c.password || '',
          has_account: c.hasAccount ?? true,
          address: c.address || '',
          district: c.district || '',
          city: c.city || '',
          saved_addresses: c.savedAddresses || [],
          customer_type: c.customerType || 'NEW',
          total_orders_count: c.totalOrdersCount || 0,
          total_spent: c.totalSpent || 0,
          updated_at: c.updatedAt,
        });
      } catch (e) {}
      return dbData.customers[index];
    },

    async findOrCreate(customerData: { fullName: string; phone: string; address: string; city?: string }): Promise<Customer> {
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
        city: customerData.city || '',
        customerType: 'NEW',
        totalOrdersCount: 0,
        totalSpent: 0,
        hasAccount: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.customers.unshift(newCustomer);
      writeDb(dbData);

      try {
        await supabase.from('customers').upsert({
          id: newCustomer.id,
          full_name: newCustomer.fullName,
          phone: newCustomer.phone,
          address: newCustomer.address,
          city: newCustomer.city,
          customer_type: newCustomer.customerType,
          total_orders_count: 0,
          total_spent: 0,
          has_account: false,
          created_at: newCustomer.createdAt,
          updated_at: newCustomer.updatedAt,
        });
      } catch (e) {}
      return newCustomer;
    }
  },

  // ORDERS TABLE
  orders: {
    async getAll(): Promise<Order[]> {
      if (serverOrdersCache && Date.now() < serverOrdersCache.expiresAt) {
        return serverOrdersCache.data;
      }
      const localOrders = readDb().orders || [];

      // Tra cứu Supabase nhưng giới hạn thời gian 350ms nếu đã có localOrders
      // để tránh việc mạng lag/Supabase cold-start làm trang Admin hoặc Checkout bị treo quay vòng
      const fetchSupabase = async (): Promise<Order[] | null> => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map(mapOrderFromSupabase);
          }
        } catch (err) {
          console.warn('[Supabase orders.getAll fallback]:', err);
        }
        return null;
      };

      let freshList: Order[] | null = null;
      if (localOrders.length > 0) {
        freshList = await Promise.race([
          fetchSupabase(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 350))
        ]);
      } else {
        freshList = await fetchSupabase();
      }

      if (freshList && freshList.length > 0) {
        serverOrdersCache = { data: freshList, expiresAt: Date.now() + 4000 };
        return freshList;
      }

      serverOrdersCache = { data: localOrders, expiresAt: Date.now() + 2000 };
      return localOrders;
    },

    async clearAll(): Promise<boolean> {
      invalidateOrdersCache();
      const dbData = readDb();
      dbData.orders = [];
      dbData.customers = [];

      if (dbData.products && Array.isArray(dbData.products)) {
        dbData.products.forEach((p) => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v) => { v.stock = 1000; });
            p.stock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            p.stock = 5000;
          }
        });
      }

      writeDb(dbData);

      try {
        await supabase.from('orders').delete().neq('id', '___NEVER_MATCH___');
      } catch (e) {
        console.error('[Supabase clearAll orders error]:', e);
      }

      try {
        await supabase.from('customers').delete().neq('id', '___NEVER_MATCH___');
      } catch (e) {
        console.error('[Supabase clearAll customers error]:', e);
      }

      return true;
    },

    async getById(idOrCode: string): Promise<Order | undefined> {
      if (!idOrCode) return undefined;
      const clean = idOrCode.replace(/^#/, '').trim();
      const lower = clean.toLowerCase();

      // 1. Tìm ngay trong bộ nhớ cục bộ (0ms)
      const local = (readDb().orders || []).find((o) => 
        (o.id && o.id.toLowerCase() === lower) || 
        (o.code && o.code.replace(/^#/, '').toLowerCase() === lower)
      );
      if (local) return local;

      // 2. Nếu chưa có mới tra cứu Supabase
      try {
        let { data } = await supabase
          .from('orders')
          .select('*')
          .or(`code.eq.${clean},id.eq.${clean}`)
          .maybeSingle();

        if (data) return mapOrderFromSupabase(data);
      } catch (err) {
        console.warn('[Supabase orders.getById fallback]:', err);
      }
      return undefined;
    },

    async getByPhone(phone: string): Promise<Order[]> {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone) return [];
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_phone', cleanPhone)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(mapOrderFromSupabase);
        }
      } catch (err) {
        console.warn('[Supabase orders.getByPhone fallback]:', err);
      }
      return (readDb().orders || []).filter((o) => (o.customer?.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async lookup(query: string, customerId?: string): Promise<Order[]> {
      const raw = (query || '').trim();
      const q = raw.toLowerCase().replace(/^#/, '');
      const cleanDigits = raw.replace(/[^0-9]/g, '');
      
      let orders: Order[] = await this.getAll();
      if (!orders || orders.length === 0) {
        orders = readDb().orders || [];
      }

      const customers = readDb().customers || [];
      const cust = customerId ? customers.find((c) => c.id === customerId) : undefined;
      const custPhone = cust ? (cust.phone || '').replace(/[^0-9]/g, '') : '';

      return orders.filter((o) => {
        if (customerId) {
          const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          const isOwnOrder = (o.customerId && o.customerId === customerId) ||
                             (custPhone && oPhone === custPhone);
          if (!isOwnOrder) return false;
          if (!raw) return true;
          const oCode = (o.code || '').toLowerCase().replace(/^#/, '');
          const oId = (o.id || '').toLowerCase().replace(/^#/, '');
          const oReceiverName = (o.customer?.fullName || '').toLowerCase();
          const matchesItem = (o.items || []).some((item: any) =>
            (item.productName || item.product?.name || '').toLowerCase().includes(q)
          );
          return (
            (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) ||
            oCode.includes(q) ||
            oId.includes(q) ||
            oReceiverName.includes(q) ||
            matchesItem
          );
        }

        if (!raw) return false;
        const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
        const oCode = (o.code || '').toLowerCase().replace(/^#/, '');
        const oId = (o.id || '').toLowerCase().replace(/^#/, '');

        if (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) return true;
        if (oCode.includes(q)) return true;
        if (oId.includes(q)) return true;
        return false;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async create(orderInput: {
      customerId?: string;
      customer: { fullName: string; phone: string; address: string; city?: string; note?: string };
      items: any[];
      subtotal?: number;
      shippingFee?: number;
      discount?: number;
      totalAmount?: number;
      totalWeight?: number;
      paymentMethod?: 'ZALO_CONFIRM' | 'COD' | 'BANK' | 'MOMO';
    }): Promise<Order> {
      const dbData = readDb();
      if (!dbData.orders) dbData.orders = [];
      if (!dbData.customers) dbData.customers = [];

      // Đảm bảo mã đơn hàng là DUY NHẤT 100%, nâng độ dài lên 6 số ngẫu nhiên (100.000 -> 999.999)
      let randomCode = `OM-${Math.floor(100000 + Math.random() * 900000)}`;
      const existingCodes = new Set((dbData.orders || []).map((o) => (o.code || '').toUpperCase()));
      let tries = 0;
      while (existingCodes.has(randomCode.toUpperCase()) && tries < 30) {
        randomCode = `OM-${Math.floor(100000 + Math.random() * 900000)}`;
        tries++;
      }
      if (tries >= 30) {
        randomCode = `OM-${Date.now().toString().slice(-6)}`;
      }
      const cleanPhone = (orderInput.customer?.phone || '').replace(/[^0-9]/g, '');
      let linkedCustomerId = orderInput.customerId;
      if (!linkedCustomerId && cleanPhone) {
        const matchingCust = (dbData.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);
        if (matchingCust) linkedCustomerId = matchingCust.id;
      }

      const mappedItems: OrderItem[] = (orderInput.items || []).map((it, idx) => {
        const prod = it.product || {};
        const originalUnitPrice = Number(prod.basePrice || it.originalUnitPrice || it.unitPrice || 0);
        const appliedUnitPrice = Number(it.unitPrice || prod.basePrice || originalUnitPrice);
        const qty = Number(it.quantity || 1);
        const originalLineTotal = originalUnitPrice * qty;
        const actualLineTotal = Number(it.totalPrice !== undefined ? it.totalPrice : (appliedUnitPrice * qty));
        const savingsAmount = Math.max(0, originalLineTotal - actualLineTotal);
        const discountPercent = originalLineTotal > 0 ? Math.round((savingsAmount / originalLineTotal) * 100) : 0;

        const variantObj = it.selectedVariant || (it.variantName ? {
          id: it.variantId || '',
          name: it.variantName,
          colorHex: it.colorHex || (it.selectedVariant as any)?.colorHex || '',
          color: it.color || (it.selectedVariant as any)?.color || '',
          image: it.variantImage || (it.selectedVariant as any)?.image || (it.selectedVariant as any)?.imageUrl || '',
        } : undefined);
        const resolvedVariantName = it.selectedVariant?.name || it.variantName || '';
        const resolvedColorHex = it.selectedVariant?.colorHex || it.selectedVariant?.color || it.colorHex || it.color || '';

        return {
          id: `item-${Date.now()}-${idx}`,
          productId: prod.id || it.productId || '',
          productName: prod.name || it.productName || 'Mẫu Charm',
          productSku: prod.sku || it.productSku || `SKU-${idx + 1}`,
          variantId: it.selectedVariant?.id || it.variantId || '',
          variantName: resolvedVariantName,
          selectedVariant: variantObj,
          productImage: prod.images?.[0] || it.productImage || (it as any).image || '',
          colorHex: resolvedColorHex,
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

      const retailSubtotal = mappedItems.reduce((s, i) => s + (i.originalUnitPrice * i.quantity), 0);
      const discount = mappedItems.reduce((s, i) => s + i.savingsAmount, 0);
      const itemsTotal = mappedItems.reduce((s, i) => s + i.totalPrice, 0);

      const computedWeight = mappedItems.reduce((sum, item) => {
        const prod = (orderInput.items || []).find((it: any) => (it.product?.id || it.productId) === item.productId)?.product;
        const w = Number(prod?.weight || 50);
        return sum + (w * item.quantity);
      }, 0);
      const totalWeight = Number(orderInput.totalWeight) > 0 ? Number(orderInput.totalWeight) : computedWeight;

      const settings: any = dbData.settings || {};
      const prepaidFreeShipThreshold = settings.prepaidFreeShipThreshold !== undefined && settings.prepaidFreeShipThreshold !== null
        ? Number(settings.prepaidFreeShipThreshold)
        : (settings.freeShippingThreshold !== undefined && settings.freeShippingThreshold !== null ? Number(settings.freeShippingThreshold) : 0);
      const isPrepaid = orderInput.paymentMethod === 'BANK' || orderInput.paymentMethod === 'MOMO';
      const isEligiblePrepaidFreeship = isPrepaid && prepaidFreeShipThreshold > 0 && itemsTotal >= prepaidFreeShipThreshold && settings.enablePrepaidFreeShip !== false;

      let calculatedShippingFee = 0;
      if (isEligiblePrepaidFreeship) {
        calculatedShippingFee = 0;
      } else {
        const { shippingFee: spxFee } = calculateShippingFee(totalWeight, itemsTotal);
        calculatedShippingFee = spxFee;
      }

      const shipping = calculatedShippingFee;
      const finalTotal = itemsTotal + shipping;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        code: randomCode,
        customerId: linkedCustomerId,
        customer: {
          fullName: orderInput.customer.fullName,
          phone: orderInput.customer.phone,
          address: orderInput.customer.address,
          city: orderInput.customer.city || '',
          note: orderInput.customer.note || '',
        },
        items: mappedItems,
        subtotal: itemsTotal,
        subtotalAmount: retailSubtotal,
        comboDiscountAmount: discount,
        itemsTotalAmount: itemsTotal,
        shippingFee: shipping,
        totalWeight: totalWeight,
        finalTotalAmount: finalTotal,
        totalAmount: finalTotal,
        paymentMethod: orderInput.paymentMethod || 'COD',
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

      const specificAddr = (orderInput.customer as any)?.specificAddress || orderInput.customer?.address || '';
      const orderCity = orderInput.customer?.city || '';
      const orderDistrict = (orderInput.customer as any)?.district || '';
      const orderWard = (orderInput.customer as any)?.ward || '';
      const setAsDefault = (orderInput as any)?.setAsDefaultAddress !== false;

      // Tìm khách hàng từ RAM local DB trước (0ms) thay vì chờ mạng Supabase
      let targetCust: Customer | undefined;
      if (linkedCustomerId) {
        targetCust = (dbData.customers || []).find((c) => c.id === linkedCustomerId);
      }
      if (!targetCust && cleanPhone) {
        targetCust = (dbData.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);
      }

      if (targetCust) {
        if (!targetCust.savedAddresses) targetCust.savedAddresses = [];
        const isFirstOrder = !targetCust.address || targetCust.savedAddresses.length === 0;
        const makeDefault = setAsDefault || isFirstOrder;

        if (makeDefault && specificAddr) {
          targetCust.savedAddresses.forEach((a) => { a.isDefault = false; });
          targetCust.address = specificAddr;
          targetCust.district = orderDistrict;
          targetCust.ward = orderWard;
          targetCust.city = orderCity;
          if (orderInput.customer.fullName) targetCust.fullName = orderInput.customer.fullName;
        }

        const matchIdx = targetCust.savedAddresses.findIndex(
          (a) => a.address.trim().toLowerCase() === specificAddr.trim().toLowerCase() &&
                 (a.city || '').trim().toLowerCase() === orderCity.trim().toLowerCase()
        );

        if (matchIdx !== -1) {
          if (makeDefault) targetCust.savedAddresses[matchIdx].isDefault = true;
          if (orderWard) targetCust.savedAddresses[matchIdx].ward = orderWard;
          if (orderDistrict) targetCust.savedAddresses[matchIdx].district = orderDistrict;
        } else if (specificAddr) {
          targetCust.savedAddresses.push({
            id: `addr-${Date.now()}`,
            fullName: orderInput.customer.fullName,
            phone: orderInput.customer.phone,
            address: specificAddr,
            ward: orderWard,
            district: orderDistrict,
            city: orderCity,
            isDefault: makeDefault,
            createdAt: new Date().toISOString(),
          });
        }

        targetCust.totalOrdersCount = (targetCust.totalOrdersCount || 0) + 1;
        targetCust.totalSpent = (targetCust.totalSpent || 0) + finalTotal;
        targetCust.lastOrderAt = new Date().toISOString();
        targetCust.updatedAt = new Date().toISOString();

        const lIdx = (dbData.customers || []).findIndex((c) => c.id === targetCust!.id);
        if (lIdx !== -1) dbData.customers[lIdx] = targetCust;
        else {
          if (!dbData.customers) dbData.customers = [];
          dbData.customers.unshift(targetCust);
        }

        // Chuẩn bị lưu khách hàng
      } else if (cleanPhone || linkedCustomerId) {
        const newCustId = linkedCustomerId || `cust-${Date.now()}`;
        const newCustRecord: Customer = {
          id: newCustId,
          fullName: orderInput.customer.fullName,
          phone: orderInput.customer.phone,
          hasAccount: Boolean(linkedCustomerId),
          address: specificAddr,
          ward: orderWard,
          district: orderDistrict,
          city: orderCity,
          savedAddresses: specificAddr ? [
            {
              id: `addr-${Date.now()}`,
              fullName: orderInput.customer.fullName,
              phone: orderInput.customer.phone,
              address: specificAddr,
              ward: orderWard,
              district: orderDistrict,
              city: orderCity,
              isDefault: true,
              createdAt: new Date().toISOString(),
            }
          ] : [],
          customerType: 'NEW',
          totalOrdersCount: 1,
          totalSpent: finalTotal,
          lastOrderAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (!dbData.customers) dbData.customers = [];
        dbData.customers.unshift(newCustRecord);
      }

      // Khấu trừ tồn kho sản phẩm cục bộ khi khách đặt đơn
      if (dbData.products && Array.isArray(dbData.products)) {
        for (const item of mappedItems) {
          const prodId = item.productId;
          const pIdx = dbData.products.findIndex((p: any) => p.id === prodId);
          if (pIdx !== -1) {
            const qty = Number(item.quantity || 1);
            dbData.products[pIdx].stock = Math.max(0, (dbData.products[pIdx].stock || 0) - qty);
            dbData.products[pIdx].soldCount = (dbData.products[pIdx].soldCount || 0) + qty;
            if (item.variantName || item.variantId) {
              const vIdx = (dbData.products[pIdx].variants || []).findIndex(
                (v: any) => (item.variantId && v.id === item.variantId) || (item.variantName && v.name === item.variantName)
              );
              if (vIdx !== -1) {
                dbData.products[pIdx].variants[vIdx].stock = Math.max(0, (dbData.products[pIdx].variants[vIdx].stock || 0) - qty);
              }
            }
          }
        }
      }

      dbData.orders.unshift(newOrder);
      writeDb(dbData);
      invalidateOrdersCache();

      // Cập nhật thông tin khách hàng và tồn kho sản phẩm lên Supabase song song trong background (không chặn khách)
      (async () => {
        try {
          if (targetCust) {
            await supabase.from('customers').upsert({
              id: targetCust.id,
              full_name: targetCust.fullName,
              phone: targetCust.phone,
              email: targetCust.email || '',
              password: targetCust.password || '',
              has_account: targetCust.hasAccount ?? Boolean(linkedCustomerId),
              address: targetCust.address || '',
              district: targetCust.district || '',
              city: targetCust.city || '',
              saved_addresses: targetCust.savedAddresses || [],
              customer_type: targetCust.customerType || 'NEW',
              total_orders_count: targetCust.totalOrdersCount || 1,
              total_spent: targetCust.totalSpent || finalTotal,
              last_order_at: targetCust.lastOrderAt,
              updated_at: targetCust.updatedAt,
            });
          }
          
          // Cập nhật tồn kho sản phẩm song song
          await Promise.allSettled(
            mappedItems.map(async (item) => {
              const prodId = item.productId;
              const prod = dbData.products?.find((p: any) => p.id === prodId);
              if (prod) {
                await supabase.from('products').update({
                  stock: prod.stock,
                  sold_count: prod.soldCount,
                  variants: prod.variants,
                }).eq('id', prodId);
              }
            })
          );
        } catch (e) {
          console.warn('[Background customer/stock sync error]:', e);
        }
      })();

      try {
        const itemsSummary = mappedItems.map(i => `${i.productName || 'Sản phẩm'} (x${i.quantity || 1})`).join(', ');
        const upsertPromise = supabase.from('orders').upsert({
          id: newOrder.id,
          code: newOrder.code,
          customer_id: newOrder.customerId || null,
          customer_name: newOrder.customer?.fullName || '',
          customer_phone: newOrder.customer?.phone || '',
          customer_address: newOrder.customer?.address || '',
          customer_city: newOrder.customer?.city || '',
          items_summary: itemsSummary,
          subtotal: newOrder.subtotal,
          subtotal_amount: newOrder.subtotalAmount,
          combo_discount_amount: newOrder.comboDiscountAmount,
          discount: newOrder.comboDiscountAmount,
          items_total_amount: newOrder.itemsTotalAmount,
          shipping_fee: newOrder.shippingFee,
          total_weight: newOrder.totalWeight,
          final_total_amount: newOrder.finalTotalAmount,
          total_amount: newOrder.totalAmount,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          order_status: newOrder.orderStatus,
          carrier_name: newOrder.carrierName || 'SPX Express',
          items: newOrder.items,
          customer: newOrder.customer,
          logs: newOrder.logs,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt,
        });

        // Giới hạn thời gian chờ Supabase tối đa 200ms để người mua nhận phản hồi tức thì
        await Promise.race([
          upsertPromise,
          new Promise((resolve) => setTimeout(resolve, 200))
        ]);
      } catch (err) {
        console.warn('[Supabase orders.create upsert error]:', err);
      }

      return newOrder;
    },

    async upsert(order: Order): Promise<Order> {
      const dbData = readDb();
      if (!dbData.orders) dbData.orders = [];
      const cleanId = (order.id || '').replace(/^#/, '').trim().toLowerCase();
      const cleanCode = (order.code || '').replace(/^#/, '').trim().toLowerCase();
      const index = dbData.orders.findIndex((o) => 
        (cleanId && o.id && o.id.toLowerCase() === cleanId) || 
        (cleanCode && o.code && o.code.replace(/^#/, '').toLowerCase() === cleanCode)
      );
      if (index !== -1) {
        dbData.orders[index] = {
          ...dbData.orders[index],
          ...order,
          updatedAt: new Date().toISOString(),
        };
      } else {
        dbData.orders.unshift(order);
      }
      writeDb(dbData);
      invalidateOrdersCache();

      try {
        const itemsSummary = (order.items || []).map(i => `${i.productName || 'Sản phẩm'} (x${i.quantity || 1})`).join(', ');
        const upsertPromise = supabase.from('orders').upsert({
          id: order.id,
          code: order.code,
          customer_id: order.customerId || null,
          customer_name: order.customer?.fullName || '',
          customer_phone: order.customer?.phone || '',
          customer_address: order.customer?.address || '',
          customer_city: order.customer?.city || '',
          items_summary: itemsSummary,
          subtotal: order.subtotal || 0,
          subtotal_amount: order.subtotalAmount || 0,
          combo_discount_amount: order.comboDiscountAmount || 0,
          discount: order.discount || 0,
          items_total_amount: order.itemsTotalAmount || 0,
          shipping_fee: order.shippingFee || 0,
          total_weight: order.totalWeight || 0,
          final_total_amount: order.finalTotalAmount || order.totalAmount || 0,
          total_amount: order.totalAmount || 0,
          payment_method: order.paymentMethod || 'COD',
          payment_status: order.paymentStatus || 'UNPAID',
          order_status: order.orderStatus || 'PENDING_CONFIRM',
          carrier_name: order.carrierName || '',
          tracking_number: order.trackingNumber || '',
          items: order.items || [],
          customer: order.customer || {},
          logs: order.logs || [],
          paid_at: order.paidAt || null,
          shipped_at: order.shippedAt || null,
          completed_at: order.completedAt || null,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
        });
        await Promise.race([
          upsertPromise,
          new Promise((resolve) => setTimeout(resolve, 250))
        ]);
      } catch (e) {}
      return order;
    },

    async upsertBatch(ordersList: Order[]): Promise<Order[]> {
      const dbData = readDb();
      if (!dbData.orders) dbData.orders = [];
      ordersList.forEach((order) => {
        if (!order || (!order.id && !order.code)) return;
        const cleanId = (order.id || '').replace(/^#/, '').trim().toLowerCase();
        const cleanCode = (order.code || '').replace(/^#/, '').trim().toLowerCase();
        const index = dbData.orders.findIndex((o) => 
          (cleanId && o.id && o.id.toLowerCase() === cleanId) || 
          (cleanCode && o.code && o.code.replace(/^#/, '').toLowerCase() === cleanCode)
        );
        if (index !== -1) {
          dbData.orders[index] = {
            ...dbData.orders[index],
            ...order,
          };
        } else {
          dbData.orders.unshift(order);
        }
      });
      writeDb(dbData);
      invalidateOrdersCache();

      try {
        const rows = ordersList.map(order => {
          const itemsSummary = (order.items || []).map(i => `${i.productName || 'Sản phẩm'} (x${i.quantity || 1})`).join(', ');
          return {
            id: order.id,
            code: order.code,
            customer_id: order.customerId || null,
            customer_name: order.customer?.fullName || '',
            customer_phone: order.customer?.phone || '',
            customer_address: order.customer?.address || '',
            customer_city: order.customer?.city || '',
            items_summary: itemsSummary,
            subtotal: order.subtotal || 0,
            subtotal_amount: order.subtotalAmount || 0,
            combo_discount_amount: order.comboDiscountAmount || 0,
            discount: order.discount || 0,
            items_total_amount: order.itemsTotalAmount || 0,
            shipping_fee: order.shippingFee || 0,
            total_weight: order.totalWeight || 0,
            final_total_amount: order.finalTotalAmount || order.totalAmount || 0,
            total_amount: order.totalAmount || 0,
            payment_method: order.paymentMethod || 'COD',
            payment_status: order.paymentStatus || 'UNPAID',
            order_status: order.orderStatus || 'PENDING_CONFIRM',
            carrier_name: order.carrierName || '',
            tracking_number: order.trackingNumber || '',
            items: order.items || [],
            customer: order.customer || {},
            logs: order.logs || [],
            paid_at: order.paidAt || null,
            shipped_at: order.shippedAt || null,
            completed_at: order.completedAt || null,
            created_at: order.createdAt || new Date().toISOString(),
            updated_at: order.updatedAt || new Date().toISOString(),
          };
        });
        await supabase.from('orders').upsert(rows);
      } catch (e) {}
      return dbData.orders;
    },

    async updateStatus(orderId: string, status?: OrderStatus, paymentStatus?: PaymentStatus, carrierName?: string, trackingNumber?: string, shippingFee?: number, fallbackOrder?: Order, extra?: { cancelReason?: string; cancelledBy?: 'SHOP' | 'CUSTOMER'; restock?: boolean }): Promise<Order | null> {
      const dbData = readDb();
      if (!dbData.orders) dbData.orders = [];
      const cleanId = (orderId || '').replace(/^#/, '').trim().toLowerCase();
      let index = dbData.orders.findIndex((o) => 
        (o.id && o.id.toLowerCase() === cleanId) || 
        (o.code && o.code.replace(/^#/, '').toLowerCase() === cleanId)
      );

      // Nếu không có trong database.json cục bộ, tự động tra cứu từ Supabase
      if (index === -1) {
        try {
          let { data } = await supabase.from('orders').select('*').eq('id', cleanId).maybeSingle();
          if (!data) {
            const res = await supabase.from('orders').select('*').ilike('code', cleanId).maybeSingle();
            if (res.data) data = res.data;
          }
          if (data) {
            const mapped = mapOrderFromSupabase(data);
            dbData.orders.unshift(mapped);
            index = 0;
          }
        } catch (e) {
          console.warn('[Supabase updateStatus fetch fallback]:', e);
        }
      }

      if (index === -1 && fallbackOrder) {
        dbData.orders.unshift(fallbackOrder);
        index = 0;
      }

      if (index === -1) {
        throw new Error('ORDER_NOT_FOUND: Không tìm thấy đơn hàng trên hệ thống');
      }

      const targetOrder = dbData.orders[index];
      const isPrepaid = targetOrder.paymentMethod === 'BANK' || targetOrder.paymentMethod === 'MOMO';
      const willBePaid = paymentStatus === 'PAID' || targetOrder.paymentStatus === 'PAID';

      // Chặn cứng: đơn chuyển khoản chưa thanh toán thì tuyệt đối không được chuyển sang PREPARING, SHIPPING, COMPLETED!
      // (Được phép HỦY ĐƠN CANCELLED bất cứ lúc nào nếu khách đổi ý hoặc shop hủy)
      if (isPrepaid && !willBePaid && status !== 'CANCELLED' && (status === 'PREPARING' || status === 'SHIPPING' || status === 'COMPLETED')) {
        console.warn(`[SECURITY BLOCK]: Chặn đơn #${targetOrder.code} sang ${status} do chưa thanh toán tiền!`);
        throw new Error('SECURITY_PREPAID_UNPAID: Đơn hàng chuyển khoản VietQR chưa thanh toán tiền, không thể xác nhận đơn hoặc giao hàng!');
      }

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
        const newShip = Math.max(0, Number(shippingFee) || 0);
        dbData.orders[index].shippingFee = newShip;
        let itemsTotal = (dbData.orders[index].items || []).reduce((sum: number, it: any) => sum + Number(it.totalPrice || 0), 0);
        if (!itemsTotal || itemsTotal === 0) {
          itemsTotal = Number(dbData.orders[index].itemsTotalAmount || dbData.orders[index].subtotal || 0);
        }
        dbData.orders[index].itemsTotalAmount = itemsTotal;
        dbData.orders[index].totalAmount = itemsTotal + newShip;
        dbData.orders[index].finalTotalAmount = itemsTotal + newShip;
      }

      if (extra?.cancelReason || fallbackOrder?.cancelReason) {
        dbData.orders[index].cancelReason = extra?.cancelReason || fallbackOrder?.cancelReason || '';
      }
      if (extra?.cancelledBy || fallbackOrder?.cancelledBy) {
        dbData.orders[index].cancelledBy = extra?.cancelledBy || fallbackOrder?.cancelledBy || 'SHOP';
      }

      // Restock inventory on cancellation
      if (status === 'CANCELLED' && oldStatus !== 'CANCELLED' && extra?.restock !== false) {
        const items = dbData.orders[index].items || [];
        for (const item of items) {
          const it = item as any;
          const prodId = it.productId || it.product?.id;
          const pIdx = (dbData.products || []).findIndex((p: any) => p.id === prodId);
          if (pIdx !== -1) {
            const qty = Number(it.quantity || 1);
            dbData.products[pIdx].stock = (dbData.products[pIdx].stock || 0) + qty;
            if (it.selectedVariant?.name || it.variantName) {
              const vName = it.selectedVariant?.name || it.variantName;
              const vIdx = (dbData.products[pIdx].variants || []).findIndex((v: any) => v.name === vName);
              if (vIdx !== -1) {
                dbData.products[pIdx].variants[vIdx].stock = (dbData.products[pIdx].variants[vIdx].stock || 0) + qty;
              }
            }
          }
        }
      }

      dbData.orders[index].updatedAt = new Date().toISOString();
      if (!dbData.orders[index].logs) dbData.orders[index].logs = [];
      dbData.orders[index].logs.push({
        id: `log-${Date.now()}`,
        action: status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'STATUS_UPDATED',
        performedBy: extra?.cancelledBy === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN',
        oldValue: oldStatus,
        newValue: `${dbData.orders[index].orderStatus} (Thanh toán: ${dbData.orders[index].paymentStatus}, Ship: ${dbData.orders[index].shippingFee})`,
        cancelReason: dbData.orders[index].cancelReason,
        cancelledBy: dbData.orders[index].cancelledBy,
        timestamp: new Date().toISOString(),
      });
      writeDb(dbData);
      invalidateOrdersCache();

      try {
        const o = dbData.orders[index];
        const upsertPromise = supabase.from('orders').upsert({
          id: o.id,
          code: o.code,
          customer_id: o.customerId || null,
          customer_name: o.customer?.fullName || '',
          customer_phone: o.customer?.phone || '',
          customer_address: o.customer?.address || '',
          customer_city: o.customer?.city || '',
          shipping_fee: o.shippingFee,
          final_total_amount: o.finalTotalAmount,
          total_amount: o.totalAmount,
          payment_status: o.paymentStatus,
          order_status: o.orderStatus,
          carrier_name: o.carrierName || '',
          tracking_number: o.trackingNumber || '',
          customer: { ...(o.customer || {}), cancelReason: o.cancelReason, cancelledBy: o.cancelledBy },
          logs: o.logs,
          paid_at: o.paidAt || null,
          shipped_at: o.shippedAt || null,
          completed_at: o.completedAt || null,
          updated_at: o.updatedAt,
        });
        await Promise.race([
          upsertPromise,
          new Promise((resolve) => setTimeout(resolve, 250))
        ]);
      } catch (e) {}

      return dbData.orders[index];
    }
  },

  // SETTINGS TABLE
  settings: {
    async get(): Promise<ShopSettings> {
      if (serverSettingsCache && Date.now() < serverSettingsCache.expiresAt) {
        return serverSettingsCache.data;
      }
      const local = readDb().settings;

      const fetchSupabase = async (): Promise<ShopSettings | null> => {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 'default')
            .maybeSingle();
          if (!error && data) {
            const fallback = readDb().settings;
            return mapSettingsFromSupabase(data, fallback);
          }
        } catch (err) {
          console.warn('[Supabase settings.get fallback]:', err);
        }
        return null;
      };

      let fresh: ShopSettings | null = null;
      if (local) {
        fresh = await Promise.race([
          fetchSupabase(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 300))
        ]);
      } else {
        fresh = await fetchSupabase();
      }

      if (fresh) {
        serverSettingsCache = { data: fresh, expiresAt: Date.now() + 60000 };
        const dbData = readDb();
        dbData.settings = fresh;
        return fresh;
      }

      serverSettingsCache = { data: local, expiresAt: Date.now() + 15000 };
      return local;
    },

    async update(newSettings: Partial<ShopSettings>): Promise<ShopSettings> {
      const dbData = readDb();
      dbData.settings = {
        ...dbData.settings,
        ...newSettings,
      };
      writeDb(dbData);
      invalidateSettingsCache();

      try {
        const s = dbData.settings;
        const upsertP = supabase.from('settings').upsert({
          id: 'default',
          shop_name: s.shopName,
          brand_title: s.brandTitle,
          slogan: s.slogan,
          hotline: s.hotline,
          zalo_phone: s.zaloPhone,
          zalo_official_url: s.zaloOfficialUrl,
          instagram_url: s.instagramUrl,
          tiktok_url: s.tiktokUrl,
          hero_title: s.heroTitle,
          hero_subtitle: s.heroSubtitle,
          banner_text: s.bannerText,
          shop_address: s.shopAddress,
          working_hours: s.workingHours,
          free_shipping_threshold: s.freeShippingThreshold,
          prepaid_free_ship_threshold: s.prepaidFreeShipThreshold,
          enable_prepaid_free_ship: s.enablePrepaidFreeShip !== false,
          telegram_bot_token: s.telegramBotToken || '',
          telegram_chat_id: s.telegramChatId || '',
          enable_telegram_notify: s.enableTelegramNotify !== false,
          bank_id: s.bankId || '',
          bank_account: s.bankAccount || '',
          bank_owner: s.bankOwner || '',
          raw_data: s,
          updated_at: new Date().toISOString(),
        });
        await Promise.race([upsertP, new Promise((res) => setTimeout(res, 200))]);
      } catch (err) {
        console.warn('[Supabase settings.update error]:', err);
      }

      return dbData.settings;
    }
  },

  // FEEDBACKS TABLE
  feedbacks: {
    async getAll(): Promise<CustomerFeedback[]> {
      if (serverFeedbacksCache && Date.now() < serverFeedbacksCache.expiresAt) {
        return serverFeedbacksCache.data;
      }
      const local = (readDb().feedbacks || []).filter((f) => f.isActive);

      const fetchSupabase = async (): Promise<CustomerFeedback[] | null> => {
        try {
          const { data, error } = await supabase
            .from('feedbacks')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
            return data.map(mapFeedbackFromSupabase);
          }
        } catch (err) {
          console.warn('[Supabase feedbacks.getAll fallback]:', err);
        }
        return null;
      };

      let fresh: CustomerFeedback[] | null = null;
      if (local.length > 0) {
        fresh = await Promise.race([
          fetchSupabase(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 300))
        ]);
      } else {
        fresh = await fetchSupabase();
      }

      if (fresh && fresh.length > 0) {
        serverFeedbacksCache = { data: fresh, expiresAt: Date.now() + 60000 };
        const dbData = readDb();
        dbData.feedbacks = fresh;
        return fresh;
      }

      serverFeedbacksCache = { data: local, expiresAt: Date.now() + 15000 };
      return local;
    },

    async create(data: Omit<CustomerFeedback, 'id' | 'createdAt' | 'isActive'>): Promise<CustomerFeedback> {
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
      invalidateFeedbacksCache();

      try {
        const p = supabase.from('feedbacks').upsert({
          id: newFb.id,
          customer_name: newFb.customerName,
          customer_location: newFb.customerLocation || '',
          comment: newFb.comment,
          rating: newFb.rating,
          purchased_product: newFb.purchasedProduct || '',
          avatar_text: newFb.avatarText,
          is_active: newFb.isActive,
          created_at: newFb.createdAt,
        });
        await Promise.race([p, new Promise((res) => setTimeout(res, 200))]);
      } catch (e) {}

      return newFb;
    },

    async update(id: string, data: Partial<CustomerFeedback>): Promise<CustomerFeedback | null> {
      const dbData = readDb();
      if (!dbData.feedbacks) return null;
      const index = dbData.feedbacks.findIndex((f) => f.id === id);
      if (index === -1) return null;
      dbData.feedbacks[index] = {
        ...dbData.feedbacks[index],
        ...data,
      };
      writeDb(dbData);
      invalidateFeedbacksCache();

      try {
        const fb = dbData.feedbacks[index];
        const p = supabase.from('feedbacks').upsert({
          id: fb.id,
          customer_name: fb.customerName,
          customer_location: fb.customerLocation || '',
          comment: fb.comment,
          rating: fb.rating,
          purchased_product: fb.purchasedProduct || '',
          avatar_text: fb.avatarText,
          is_active: fb.isActive,
        });
        await Promise.race([p, new Promise((res) => setTimeout(res, 200))]);
      } catch (e) {}

      return dbData.feedbacks[index];
    },

    async delete(id: string): Promise<boolean> {
      const dbData = readDb();
      if (!dbData.feedbacks) return false;
      const index = dbData.feedbacks.findIndex((f) => f.id === id);
      if (index === -1) return false;
      dbData.feedbacks.splice(index, 1);
      writeDb(dbData);
      invalidateFeedbacksCache();

      try {
        const p = supabase.from('feedbacks').delete().eq('id', id);
        await Promise.race([p, new Promise((res) => setTimeout(res, 200))]);
      } catch (e) {}

      return true;
    }
  }
};

