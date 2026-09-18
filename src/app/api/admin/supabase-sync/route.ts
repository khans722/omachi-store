import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Kiểm tra kết nối tới Supabase
    const { data, error } = await supabase.from('settings').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json({
          success: true,
          connected: true,
          tablesCreated: false,
          message: 'Đã kết nối tới Supabase nhưng bảng chưa được tạo. Vui lòng mở Supabase SQL Editor và chạy file supabase-schema.sql!',
        });
      }
      return NextResponse.json({
        success: false,
        connected: false,
        tablesCreated: false,
        error: error.message,
      }, { status: 500 });
    }

    // 2. Lấy thống kê số lượng dữ liệu
    const [ordersRes, prodsRes, catsRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      success: true,
      connected: true,
      tablesCreated: true,
      stats: {
        ordersCount: ordersRes.count ?? 0,
        productsCount: prodsRes.count ?? 0,
        categoriesCount: catsRes.count ?? 0,
      },
      message: 'Kết nối Supabase Cloud Database hoàn hảo! Dữ liệu được lưu trữ vĩnh viễn và an toàn 100% ✨',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: err?.message || String(err),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Đọc toàn bộ dữ liệu hiện tại từ local
    const rawData = db.raw.get();

    // 1. Đồng bộ settings
    const s = rawData.settings;
    if (s) {
      await supabase.from('settings').upsert({
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
        free_shipping_threshold: Number(s.freeShippingThreshold || 0),
        prepaid_free_ship_threshold: Number(s.prepaidFreeShipThreshold || 0),
        enable_prepaid_free_ship: s.enablePrepaidFreeShip !== false,
        telegram_bot_token: s.telegramBotToken || '',
        telegram_chat_id: s.telegramChatId || '',
        enable_telegram_notify: s.enableTelegramNotify !== false,
        bank_id: s.bankId || '',
        bank_account: s.bankAccount || '',
        bank_owner: s.bankOwner || '',
        momo_phone: s.momoPhone || '',
        momo_name: s.momoName || '',
        raw_data: s,
        updated_at: new Date().toISOString(),
      });
    }

    // 1.5 Đồng bộ khách hàng
    let custsCount = 0;
    if (rawData.customers?.length) {
      const custRows = rawData.customers.map((c) => ({
        id: c.id,
        full_name: c.fullName,
        phone: c.phone,
        email: c.email || '',
        password: c.password || '',
        has_account: Boolean(c.hasAccount),
        address: c.address || '',
        district: c.district || '',
        city: c.city || '',
        saved_addresses: c.savedAddresses || [],
        customer_type: c.customerType || 'NEW',
        total_orders_count: c.totalOrdersCount || 0,
        total_spent: c.totalSpent || 0,
        last_order_at: c.lastOrderAt || null,
        internal_notes: c.internalNotes || null,
        created_at: c.createdAt || new Date().toISOString(),
        updated_at: c.updatedAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from('customers').upsert(custRows);
      if (!error) custsCount = custRows.length;
    }

    // 2. Đồng bộ danh mục
    let catsCount = 0;
    if (rawData.categories?.length) {
      const catRows = rawData.categories.map((c) => ({
        id: c.id,
        code: c.code || '',
        name: c.name,
        slug: c.slug || '',
        icon: c.icon || '🌸',
        description: c.description || '',
        display_order: c.displayOrder || 1,
        is_active: c.isActive !== false,
        created_at: c.createdAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from('categories').upsert(catRows);
      if (!error) catsCount = catRows.length;
    }

    // 3. Đồng bộ sản phẩm
    let prodsCount = 0;
    if (rawData.products?.length) {
      const prodRows = rawData.products.map((p) => ({
        id: p.id,
        sku: p.sku || '',
        name: p.name,
        slug: p.slug || '',
        category_id: p.categoryId || '',
        category_name: p.categoryName || '',
        base_price: p.basePrice || 0,
        original_price: p.originalPrice || 0,
        cost_price: p.costPrice || null,
        material: p.material || '',
        dimensions: p.dimensions || '',
        weight: Number(p.weight) > 0 ? Number(p.weight) : 50,
        images: p.images || [],
        description: p.description || '',
        is_hot: Boolean(p.isHot),
        is_new_arrival: Boolean(p.isNewArrival),
        is_customizable: Boolean(p.isCustomizable),
        stock: p.stock ?? 100,
        sold_count: p.soldCount ?? 0,
        rating_avg: p.ratingAvg ?? 5,
        rating_count: p.ratingCount ?? 0,
        variants: (p.variants || []).map((v: any) => ({ ...v, weight: Number(p.weight) > 0 ? Number(p.weight) : 50 })),
        combo_tiers: p.comboTiers || [],
        package_options: (p.packageOptions || []).map((pkg: any) => ({ ...pkg, _weight: Number(p.weight) > 0 ? Number(p.weight) : 50 })),
        min_order_quantity: p.minOrderQuantity || 1,
        step_quantity: p.stepQuantity || 1,
        is_active: p.isActive !== false,
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString(),
      }));
      const { error: syncErr } = await supabase.from('products').upsert(prodRows);
      if (syncErr) {
        const prodRowsNoWeight = prodRows.map((r: any) => {
          const copy = { ...r };
          delete copy.weight;
          return copy;
        });
        const { error: retryErr } = await supabase.from('products').upsert(prodRowsNoWeight);
        if (!retryErr) prodsCount = prodRowsNoWeight.length;
      } else {
        prodsCount = prodRows.length;
      }
    }

    // 4. Đồng bộ đánh giá
    let feedbacksCount = 0;
    if (rawData.feedbacks?.length) {
      const fbRows = rawData.feedbacks.map((f) => ({
        id: f.id,
        customer_name: f.customerName,
        customer_location: f.customerLocation || '',
        comment: f.comment,
        rating: f.rating || 5,
        purchased_product: f.purchasedProduct || '',
        avatar_text: f.avatarText || 'KH',
        is_active: f.isActive !== false,
        created_at: f.createdAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from('feedbacks').upsert(fbRows);
      if (!error) feedbacksCount = fbRows.length;
    }

    // 5. Đồng bộ đơn hàng
    let ordersCount = 0;
    if (rawData.orders?.length) {
      const orderRows = rawData.orders.map((o) => {
        const itemsSummary = (o.items || []).map((i) => `${i.productName || 'Sản phẩm'} (x${i.quantity || 1})`).join(', ');
        return {
          id: o.id,
          code: o.code,
          customer_id: o.customerId || null,
          customer_name: o.customer?.fullName || '',
          customer_phone: o.customer?.phone || '',
          customer_address: o.customer?.address || '',
          customer_city: o.customer?.city || '',
          items_summary: itemsSummary,
          subtotal: o.subtotal || 0,
          subtotal_amount: o.subtotalAmount || 0,
          combo_discount_amount: o.comboDiscountAmount || 0,
          discount: o.discount || 0,
          items_total_amount: o.itemsTotalAmount || 0,
          shipping_fee: o.shippingFee || 0,
          total_weight: o.totalWeight || 0,
          final_total_amount: o.finalTotalAmount || o.totalAmount || 0,
          total_amount: o.totalAmount || 0,
          payment_method: o.paymentMethod || 'COD',
          payment_status: o.paymentStatus || 'UNPAID',
          order_status: o.orderStatus || 'PENDING_CONFIRM',
          carrier_name: o.carrierName || '',
          tracking_number: o.trackingNumber || '',
          items: o.items || [],
          customer: o.customer || {},
          logs: o.logs || [],
          paid_at: o.paidAt || null,
          shipped_at: o.shippedAt || null,
          completed_at: o.completedAt || null,
          created_at: o.createdAt || new Date().toISOString(),
          updated_at: o.updatedAt || new Date().toISOString(),
        };
      });
      const { error } = await supabase.from('orders').upsert(orderRows);
      if (!error) ordersCount = orderRows.length;
    }

    return NextResponse.json({
      success: true,
      message: `Đồng bộ thành công: ${catsCount} danh mục, ${prodsCount} sản phẩm, ${feedbacksCount} đánh giá, ${custsCount} khách hàng, ${ordersCount} đơn hàng lên Supabase!`,
      synced: {
        categories: catsCount,
        products: prodsCount,
        feedbacks: feedbacksCount,
        customers: custsCount,
        orders: ordersCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Lỗi khi đồng bộ lên Supabase',
    }, { status: 500 });
  }
}