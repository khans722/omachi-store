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
      { id: 'v1', name: '#11 Hồng Pastel 🌸', colorHex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=200&auto=format&fit=crop&q=80' },
      { id: 'v2', name: '#12 Tím Lavender 💜', colorHex: '#D8B4FE', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&auto=format&fit=crop&q=80' },
      { id: 'v3', name: '#13 Xanh Bơ Mint 🌿', colorHex: '#A7F3D0', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=200&auto=format&fit=crop&q=80' },
      { id: 'v4', name: '#14 Trộn màu ngẫu nhiên 🌈', colorHex: '#FDA4AF', imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=200&auto=format&fit=crop&q=80' },
      { id: 'v5', name: '#15 Vàng Kem 🧈', colorHex: '#FDE68A', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&auto=format&fit=crop&q=80' },
    ],
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 20000 },
      { id: 'pkg-100', name: '100 cái', price: 120000 },
    ],
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
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 150000 },
      { id: 'pkg-100', name: '100 cái', price: 1200000 },
    ],
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
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 380000 },
      { id: 'pkg-100', name: '100 cái', price: 3200000 },
    ],
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
      { id: 'p1', name: 'Dây Thẻ Đeo Cổ (45cm)', colorHex: '#E879F9' },
      { id: 'p2', name: 'Móc Charm Cầm Tay (15cm)', colorHex: '#FB7185' },
    ],
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 280000 },
      { id: 'pkg-100', name: '100 cái', price: 2200000 },
    ],
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
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 990000 },
      { id: 'pkg-100', name: '100 cái', price: 8500000 },
    ],
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
    packageOptions: [
      { id: 'pkg-10', name: '10 cái', price: 120000 },
      { id: 'pkg-100', name: '100 cái', price: 1000000 },
    ],
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
