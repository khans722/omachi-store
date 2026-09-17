import fs from 'fs';
import path from 'path';
import { calculateShippingFee } from '@/lib/utils';
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
  "feedbacks": [
    {
      "id": "fb-1",
      "customerName": "Nguyễn Linh",
      "customerLocation": "Hà Nội",
      "comment": "Vòng cườm hoa bướm dạ quang xinh dã man luôn ạ! Shop làm đúng theo số đo cổ tay mình yêu cầu, đeo vừa in. Chốt đơn qua Zalo rất nhiệt tình, còn được tặng kèm túi mù charm nữa!",
      "rating": 5,
      "purchasedProduct": "Vòng tay bướm dạ quang",
      "avatarText": "NL",
      "isActive": true,
      "createdAt": "2026-09-01T08:00:00.000Z"
    },
    {
      "id": "fb-2",
      "customerName": "Thu Hương",
      "customerLocation": "TP. HCM",
      "comment": "Mình gom mua chung với lớp gói combo 100 kẹp tóc hoa kem bơ, giá rẻ giật mình luôn, rẻ hơn mua lẻ nhiều. Kẹp chắc chắn, màu pastel xinh xuất sắc!",
      "rating": 5,
      "purchasedProduct": "Combo 100 kẹp tóc hoa",
      "avatarText": "TH",
      "isActive": true,
      "createdAt": "2026-09-05T08:00:00.000Z"
    },
    {
      "id": "fb-3",
      "customerName": "Minh Anh",
      "customerLocation": "Đà Nẵng",
      "comment": "Set cườm beads haul trong suốt lấp lánh cực kỳ, đủ các mẫu hoa, nơ, quả dâu tây. Mua combo 200 hạt tha hồ xâu móc khóa phone charm tặng bạn bè.",
      "rating": 5,
      "purchasedProduct": "Combo 200 hạt cườm pastel",
      "avatarText": "MA",
      "isActive": true,
      "createdAt": "2026-09-10T08:00:00.000Z"
    }
  ],
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
    "enableTelegramNotify": true
  }
};

declare global {
  var __omachi_db: DetailedDatabaseSchema | undefined;
}

function readDb(): DetailedDatabaseSchema {
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
    if (!parsed.feedbacks || parsed.feedbacks.length === 0) {
      parsed.feedbacks = INITIAL_DATABASE.feedbacks;
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
        city: data.city || '',
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
      return newCustomer;
    }
  },

  // ORDERS TABLE
  orders: {
    getAll(): Order[] {
      return readDb().orders || [];
    },
    getById(idOrCode: string): Order | undefined {
      if (!idOrCode) return undefined;
      const clean = idOrCode.replace(/^#/, '').trim().toLowerCase();
      return (readDb().orders || []).find((o) => 
        (o.id && o.id.toLowerCase() === clean) || 
        (o.code && o.code.replace(/^#/, '').toLowerCase() === clean)
      );
    },
    getByPhone(phone: string): Order[] {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone) return [];
      return (readDb().orders || []).filter((o) => (o.customer?.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    lookup(query: string, customerId?: string): Order[] {
      const raw = (query || '').trim();
      const q = raw.toLowerCase().replace(/^#/, '');
      const cleanDigits = raw.replace(/[^0-9]/g, '');
      const dbData = readDb();
      const orders = dbData.orders || [];
      const customers = dbData.customers || [];

      const cust = customerId ? customers.find((c) => c.id === customerId) : undefined;
      const custPhone = cust ? (cust.phone || '').replace(/[^0-9]/g, '') : '';

      return orders.filter((o) => {
        // Mode 1: Logged-in customer search / load all
        if (customerId) {
          const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          const isOwnOrder = (o.customerId && o.customerId === customerId) ||
                             (custPhone && oPhone === custPhone);

          if (!isOwnOrder) return false;

          // If no search keyword, return all orders for this customer
          if (!raw) return true;

          // If search keyword is given, filter within their orders
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

        // Mode 2: Guest lookup (by phone or order code)
        if (!raw) return false;
        const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
        const oCode = (o.code || '').toLowerCase().replace(/^#/, '');
        const oId = (o.id || '').toLowerCase().replace(/^#/, '');

        // Match by phone if query has at least 4 digits
        if (cleanDigits.length >= 4 && oPhone.includes(cleanDigits)) return true;
        // Match by order code (e.g. OM-1234 or 1234)
        if (oCode.includes(q)) return true;
        if (oId.includes(q)) return true;
        return false;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create(orderInput: {
      customerId?: string;
      customer: { fullName: string; phone: string; address: string; city?: string; note?: string };
      items: any[];
      subtotal?: number;
      shippingFee?: number;
      discount?: number;
      totalAmount?: number;
      totalWeight?: number;
      paymentMethod?: 'ZALO_CONFIRM' | 'COD' | 'BANK' | 'MOMO';
    }): Order {
      const dbData = readDb();
      if (!dbData.orders || !Array.isArray(dbData.orders)) {
        dbData.orders = [];
      }
      if (!dbData.customers || !Array.isArray(dbData.customers)) {
        dbData.customers = [];
      }
      
      // 1. Generate Random Order Code OM-XXXX
      const randomCode = `OM-${Math.floor(1000 + Math.random() * 9000)}`;

      // Xác định customerId liên kết (Ưu tiên ID từ tài khoản đang đăng nhập, nếu không thì đối soát SĐT)
      const cleanPhone = (orderInput.customer?.phone || '').replace(/[^0-9]/g, '');
      let linkedCustomerId = orderInput.customerId;
      if (!linkedCustomerId && cleanPhone) {
        const matchingCust = (dbData.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);
        if (matchingCust) {
          linkedCustomerId = matchingCust.id;
        }
      }
      
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

      // Tính tổng cân nặng thực tế kiện hàng
      const computedWeight = mappedItems.reduce((sum, item) => {
        const prod = (orderInput.items || []).find((it: any) => (it.product?.id || it.productId) === item.productId)?.product;
        const w = Number(prod?.weight || 50);
        return sum + (w * item.quantity);
      }, 0);
      const totalWeight = Number(orderInput.totalWeight) > 0 ? Number(orderInput.totalWeight) : computedWeight;

      // BẢO MẬT & KIỂM TRA CHÍNH SÁCH FREESHIP TỪ MÁY CHỦ (ANTI-TAMPERING):
      const settings: any = dbData.settings || {};
      const prepaidFreeShipThreshold = Number(settings.prepaidFreeShipThreshold) || 1000000;
      const isPrepaid = orderInput.paymentMethod === 'BANK' || orderInput.paymentMethod === 'MOMO';
      const isEligiblePrepaidFreeship = isPrepaid && itemsTotal >= prepaidFreeShipThreshold && settings.enablePrepaidFreeShip !== false;

      let calculatedShippingFee = 0;
      if (isEligiblePrepaidFreeship) {
        calculatedShippingFee = 0; // Đủ điều kiện miễn phí vận chuyển khi thanh toán trước
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

      // Tự động lưu địa chỉ & cập nhật thống kê tài khoản khách hàng
      const existingCust = linkedCustomerId
        ? (dbData.customers || []).find((c) => c.id === linkedCustomerId)
        : cleanPhone
        ? (dbData.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone)
        : undefined;

      const specificAddr = (orderInput.customer as any)?.specificAddress || orderInput.customer?.address || '';
      const orderCity = orderInput.customer?.city || '';
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
        existingCust.lastOrderAt = new Date().toISOString();
        existingCust.updatedAt = new Date().toISOString();
      }

      dbData.orders.unshift(newOrder);
      writeDb(dbData);
      return newOrder;
    },

    upsert(order: Order): Order {
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
        writeDb(dbData);
        return dbData.orders[index];
      } else {
        dbData.orders.unshift(order);
        writeDb(dbData);
        return order;
      }
    },

    upsertBatch(ordersList: Order[]): Order[] {
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
      return dbData.orders;
    },

    updateStatus(orderId: string, status?: OrderStatus, paymentStatus?: PaymentStatus, carrierName?: string, trackingNumber?: string, shippingFee?: number, fallbackOrder?: Order): Order | null {
      const dbData = readDb();
      if (!dbData.orders) dbData.orders = [];
      const cleanId = (orderId || '').replace(/^#/, '').trim().toLowerCase();
      let index = dbData.orders.findIndex((o) => 
        (o.id && o.id.toLowerCase() === cleanId) || 
        (o.code && o.code.replace(/^#/, '').toLowerCase() === cleanId)
      );

      if (index === -1 && fallbackOrder) {
        // Auto-recover order if sent from client
        dbData.orders.unshift(fallbackOrder);
        index = 0;
      }

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

      dbData.orders[index].updatedAt = new Date().toISOString();
      if (!dbData.orders[index].logs) dbData.orders[index].logs = [];
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