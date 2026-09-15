import { Product } from '@/types';

export let productsStore: Product[] = [
  {
    id: 'prod-1',
    name: 'Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)',
    slug: 'set-hat-cuom-hoa-no-pastel-beads-haul',
    category: 'beads-haul',
    categoryName: 'Hạt Cườm & Beads',
    basePrice: 2000,
    originalPrice: 3000,
    images: [
      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Hạt cườm acrylic pastel cao cấp trong suốt, hình hoa, nơ, ngôi sao lấp lánh, trái tim y2k. Thích hợp xâu vòng tay, móc khóa, kẹp tóc, phone charm.',
    isHot: true,
    isNewArrival: true,
    stock: 5000,
    soldCount: 1840,
    rating: 4.9,
    reviewCount: 236,
    variants: [
      { id: 'v1', name: 'Mix Hồng Pastel 🌸', colorHex: '#FFB6C1' },
      { id: 'v2', name: 'Mix Tím Lavender 💜', colorHex: '#D8B4FE' },
      { id: 'v3', name: 'Mix Xanh Bơ Mint 🌿', colorHex: '#A7F3D0' },
      { id: 'v4', name: 'Mix Vàng Kem 🧈', colorHex: '#FDE68A' },
      { id: 'v5', name: 'Mix Cầu Vồng Pastel 🌈', colorHex: '#FDA4AF' },
    ],
    comboTiers: [
      { minQuantity: 50, unitPrice: 1500, label: 'Combo 50 pcs', badge: 'Tiết kiệm 25%', discountPercent: 25 },
      { minQuantity: 100, unitPrice: 1200, label: 'Combo 100 pcs', badge: 'Hot Bán Chạy 🔥 (Giảm 40%)', discountPercent: 40 },
      { minQuantity: 200, unitPrice: 1000, label: 'Combo 200 pcs (Sỉ VIP)', badge: 'Sỉ VIP 💎 (Giảm 50%)', discountPercent: 50 },
      { minQuantity: 500, unitPrice: 800, label: 'Combo 500 pcs (Xưởng Charm)', badge: 'Cực Rẻ 👑 (Giảm 60%)', discountPercent: 60 },
    ]
  },
  {
    id: 'prod-2',
    name: 'Kẹp Tóc Hoa Kem Bơ Pastel Handmade Xinh Xắn',
    slug: 'kep-toc-hoa-kem-bo-pastel-handmade',
    category: 'kep-toc',
    categoryName: 'Kẹp Tóc Nàng Thơ',
    basePrice: 18000,
    originalPrice: 25000,
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Kẹp tóc handmade đính hoa acrylic kem bơ và charm nơ lấp lánh phong cách nàng thơ. Khung kẹp mỏ vịt kim loại chống rỉ bọc nỉ êm ái.',
    isHot: true,
    isNewArrival: false,
    stock: 350,
    soldCount: 920,
    rating: 5.0,
    reviewCount: 148,
    variants: [
      { id: 'k1', name: 'Hoa Hồng Baby 🌸', colorHex: '#FDA4AF' },
      { id: 'k2', name: 'Hoa Xanh Pastel 🩵', colorHex: '#93C5FD' },
      { id: 'k3', name: 'Hoa Tím Lavender 💜', colorHex: '#C084FC' },
      { id: 'k4', name: 'Hoa Vàng Bơ 🧈', colorHex: '#FDE047' },
    ],
    comboTiers: [
      { minQuantity: 5, unitPrice: 15000, label: 'Set 5 kẹp', badge: 'Giảm 17%', discountPercent: 17 },
      { minQuantity: 10, unitPrice: 12000, label: 'Set 10 kẹp (Tặng hộp)', badge: 'Siêu Hời 🎁 (Giảm 33%)', discountPercent: 33 },
      { minQuantity: 50, unitPrice: 9000, label: 'Sỉ 50 kẹp', badge: 'Giá Sỉ 👑 (Giảm 50%)', discountPercent: 50 },
    ]
  },
  {
    id: 'prod-3',
    name: 'Vòng Tay Cườm Hoa & Charm Bướm Dạ Quang (Custom)',
    slug: 'vong-tay-cuom-hoa-charm-buom-da-quang',
    category: 'vong-tay',
    categoryName: 'Vòng Tay Cườm',
    basePrice: 45000,
    originalPrice: 65000,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Vòng tay đan thủ công từ hạt cườm Miyuki kết hợp charm hoa bướm dạ quang phát sáng nhẹ ban đêm. Dây rút tiện lợi vừa mọi cỡ tay.',
    isHot: true,
    isNewArrival: true,
    isCustomizable: true,
    stock: 120,
    soldCount: 450,
    rating: 4.9,
    reviewCount: 89,
    variants: [
      { id: 'v-pink', name: 'Hồng Kẹo Ngọt', colorHex: '#F472B6' },
      { id: 'v-blue', name: 'Xanh Biển Trong Veo', colorHex: '#38BDF8' },
      { id: 'v-purple', name: 'Tím Khói Fairy', colorHex: '#A855F7' },
      { id: 'v-mint', name: 'Xanh Bơ Thanh Mát', colorHex: '#34D399' },
    ],
    comboTiers: [
      { minQuantity: 2, unitPrice: 40000, label: 'Cặp đôi (2 chiếc)', badge: 'Tiết kiệm 10k' },
      { minQuantity: 5, unitPrice: 35000, label: 'Set 5 bạn thân', badge: 'Giảm 22%' },
      { minQuantity: 20, unitPrice: 28000, label: 'Combo sỉ 20 vòng', badge: 'Giá Sỉ 🌟' },
    ]
  },
  {
    id: 'prod-4',
    name: 'Dây Đeo Thẻ / Phone Charm Phong Cách Fairy Tale',
    slug: 'day-deo-the-phone-charm-fairy-tale',
    category: 'phone-charm',
    categoryName: 'Phone Charm & Dây Thẻ',
    basePrice: 35000,
    originalPrice: 50000,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Dây charm đa năng móc ốp lưng điện thoại, thẻ sinh viên, máy ảnh mini, túi xách. Hạt charm hoa tulip, trái cây, ngôi sao acrylic bền đẹp.',
    isHot: false,
    isNewArrival: true,
    stock: 200,
    soldCount: 310,
    rating: 4.8,
    reviewCount: 54,
    variants: [
      { id: 'p1', name: 'Dây Thẻ Đeo Cổ (Dài 45cm)', colorHex: '#E879F9' },
      { id: 'p2', name: 'Móc Phone Charm Cầm Tay (15cm)', colorHex: '#FB7185' },
    ],
    comboTiers: [
      { minQuantity: 3, unitPrice: 30000, label: 'Combo 3 dây', badge: 'Giảm 14%' },
      { minQuantity: 10, unitPrice: 24000, label: 'Combo 10 dây', badge: 'Giảm 31%' },
    ]
  },
  {
    id: 'prod-5',
    name: 'Đồng Hồ Cườm Handmade Vintage Fairycore Custom',
    slug: 'dong-ho-cuom-handmade-vintage-fairycore',
    category: 'vong-tay',
    categoryName: 'Vòng Tay Cườm',
    basePrice: 129000,
    originalPrice: 180000,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Mặt đồng hồ vintage mạ vàng đồng kết hợp dây đeo xâu cườm đá ngọc trai và charm hoa thủy tinh độc quyền bởi Omachi. Mỗi mẫu là 1 tác phẩm độc nhất!',
    isHot: true,
    isNewArrival: true,
    isCustomizable: true,
    stock: 35,
    soldCount: 168,
    rating: 5.0,
    reviewCount: 62,
    variants: [
      { id: 'dh-gold', name: 'Mặt Tròn Vàng Gold + Cườm Ngọc', colorHex: '#F59E0B' },
      { id: 'dh-silver', name: 'Mặt Vuông Bạc + Cườm Xanh Băng', colorHex: '#06B6D4' },
    ],
    comboTiers: [
      { minQuantity: 2, unitPrice: 115000, label: 'Combo 2 chiếc', badge: 'Tặng túi nhung' },
      { minQuantity: 5, unitPrice: 99000, label: 'Combo 5 chiếc', badge: 'Giá Ưu Đãi' },
    ]
  },
  {
    id: 'prod-6',
    name: 'Túi Mù Charm & Hạt Cườm May Mắn (Blind Bag Omachi)',
    slug: 'tui-mu-charm-hat-cuom-may-man-blind-bag',
    category: 'tui-mu',
    categoryName: 'Túi Mù Charm',
    basePrice: 15000,
    originalPrice: 25000,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Túi mù xé trúng thưởng charm hiếm: Charm hoa pha lê, nơ cánh tiên, kẹp tóc lấp lánh, charm phát sáng. Càng mua nhiều túi cơ hội trúng charm VIP càng cao!',
    isHot: true,
    isNewArrival: true,
    stock: 800,
    soldCount: 1530,
    rating: 4.9,
    reviewCount: 310,
    variants: [
      { id: 'tm-1', name: 'Túi Mù Charm Hoa & Quả 🍓', colorHex: '#EF4444' },
      { id: 'tm-2', name: 'Túi Mù Kẹp Tóc & Nơ 🎀', colorHex: '#EC4899' },
    ],
    comboTiers: [
      { minQuantity: 5, unitPrice: 12000, label: 'Set 5 túi mù', badge: 'Xé cực cuốn' },
      { minQuantity: 10, unitPrice: 10000, label: 'Set 10 túi', badge: 'Tiết kiệm 33%' },
    ]
  }
];

export const INITIAL_PRODUCTS = productsStore;

export function getProducts(): Product[] {
  return productsStore;
}

export function addProduct(productData: Omit<Product, 'id' | 'slug'>): Product {
  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}`,
    slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  };
  productsStore.unshift(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updatedData: Partial<Product>): Product | null {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return null;
  productsStore[index] = {
    ...productsStore[index],
    ...updatedData,
  };
  return productsStore[index];
}

export function deleteProduct(id: string): boolean {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return false;
  productsStore.splice(index, 1);
  return true;
}
