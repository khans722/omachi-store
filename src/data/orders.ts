import { Order, OrderStatus } from '@/types';

// In-memory / Mock order store for development and API routes
let ordersStore: Order[] = [
  {
    id: 'ord-101',
    code: 'OM-8821',
    customer: {
      fullName: 'Nguyễn Linh Nhi',
      phone: '0988123456',
      address: 'Số 15 Ngõ 48 Cầu Giấy, Hà Nội',
      note: 'Xâu vòng cỡ tay 14.5cm giùm mình nhé shop!',
    },
    items: [
      {
        id: 'prod-1-v1',
        product: {
          id: 'prod-1',
          name: 'Set Hạt Cườm Hoa & Nơ Pastel Tự Xâu (Beads Haul)',
          slug: 'set-hat-cuom-hoa-no-pastel-beads-haul',
          category: 'beads-haul',
          categoryName: 'Hạt Cườm & Charm Lẻ',
          basePrice: 2000,
          images: ['/images/charm_feed_1.jpg'],
          description: '',
          stock: 5000,
          soldCount: 1840,
          rating: 4.9,
          reviewCount: 236,
        },
        selectedVariant: { id: 'v1', name: 'Mix Hồng Pastel 🌸' },
        quantity: 100,
        unitPrice: 1200,
        totalPrice: 120000,
        appliedTier: { minQuantity: 100, unitPrice: 1200, label: 'Combo 100 pcs', badge: 'Hot Bán Chạy 🔥' },
      },
      {
        id: 'prod-2-k1',
        product: {
          id: 'prod-2',
          name: 'Kẹp Tóc Hoa Kem Bơ Pastel Handmade',
          slug: 'kep-toc-hoa-kem-bo-pastel-handmade',
          category: 'kep-toc',
          categoryName: 'Kẹp Tóc Handmade',
          basePrice: 18000,
          images: ['/images/charm_feed_1.jpg'],
          description: '',
          stock: 350,
          soldCount: 920,
          rating: 5.0,
          reviewCount: 148,
        },
        selectedVariant: { id: 'k1', name: 'Hoa Hồng Baby 🌸' },
        quantity: 2,
        unitPrice: 18000,
        totalPrice: 36000,
      }
    ],
    subtotal: 156000,
    shippingFee: 20000,
    discount: 0,
    totalAmount: 176000,
    paymentMethod: 'ZALO_CONFIRM',
    paymentStatus: 'PAID',
    orderStatus: 'PREPARING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'ord-102',
    code: 'OM-8822',
    customer: {
      fullName: 'Trần Mai Phương',
      phone: '0912345678',
      address: '228 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
      note: 'Giao giờ hành chính',
    },
    items: [
      {
        id: 'prod-5-dh-gold',
        product: {
          id: 'prod-5',
          name: 'Đồng Hồ Cườm Handmade Vintage Fairycore Custom',
          slug: 'dong-ho-cuom-handmade-vintage-fairycore',
          category: 'vong-tay',
          categoryName: 'Vòng Tay Cườm',
          basePrice: 129000,
          images: ['/images/charm_feed_2.jpg'],
          description: '',
          stock: 35,
          soldCount: 168,
          rating: 5.0,
          reviewCount: 62,
        },
        selectedVariant: { id: 'dh-gold', name: 'Mặt Tròn Vàng Gold + Cườm Ngọc' },
        quantity: 1,
        unitPrice: 129000,
        totalPrice: 129000,
      }
    ],
    subtotal: 129000,
    shippingFee: 25000,
    discount: 0,
    totalAmount: 154000,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    orderStatus: 'PENDING_CONFIRM',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

export function getOrders(): Order[] {
  return ordersStore;
}

export function getOrderById(idOrCode: string): Order | undefined {
  return ordersStore.find((o) => o.id === idOrCode || o.code.toLowerCase() === idOrCode.toLowerCase());
}

export function createOrder(orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Order {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    code: `OM-${randomNum}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  ordersStore.unshift(newOrder);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: 'UNPAID' | 'PAID'): Order | null {
  const index = ordersStore.findIndex((o) => o.id === orderId || o.code === orderId);
  if (index === -1) return null;

  ordersStore[index] = {
    ...ordersStore[index],
    orderStatus: status,
    paymentStatus: paymentStatus || ordersStore[index].paymentStatus,
    updatedAt: new Date().toISOString(),
    paidAt: paymentStatus === 'PAID' ? (ordersStore[index].paidAt || new Date().toISOString()) : ordersStore[index].paidAt,
  };

  return ordersStore[index];
}
