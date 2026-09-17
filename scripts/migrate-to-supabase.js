const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-read .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idkppwrfxvxffsflibar.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
  console.error('❌ Thiếu SUPABASE_SERVICE_ROLE_KEY trong môi trường hoặc file .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
  console.log('🚀 Bắt đầu nạp dữ liệu từ database.json lên Supabase...');
  const dbPath = path.join(__dirname, '..', 'data', 'database.json');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Không tìm thấy data/database.json');
    return;
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);

  // 1. SETTINGS
  if (data.settings) {
    console.log('📦 Đang nạp Cấu hình cửa hàng (settings)...');
    const s = data.settings;
    const settingsRow = {
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
      free_shipping_threshold: s.freeShippingThreshold || 1000000,
      prepaid_free_ship_threshold: s.prepaidFreeShipThreshold || 10000,
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
      updated_at: new Date().toISOString()
    };
    const { error: sErr } = await supabase.from('settings').upsert(settingsRow);
    if (sErr) console.error('  ⚠️ Lỗi nạp settings:', sErr.message);
    else console.log('  ✅ Cấu hình shop đã lưu thành công lên Supabase!');
  }

  // 2. CATEGORIES
  if (data.categories && data.categories.length > 0) {
    console.log(`📦 Đang nạp ${data.categories.length} danh mục (categories)...`);
    const catRows = data.categories.map(c => ({
      id: c.id,
      code: c.code || '',
      name: c.name,
      slug: c.slug || '',
      icon: c.icon || '🌸',
      description: c.description || '',
      display_order: c.displayOrder || 1,
      is_active: c.isActive !== false,
      created_at: c.createdAt || new Date().toISOString()
    }));
    const { error: cErr } = await supabase.from('categories').upsert(catRows);
    if (cErr) console.error('  ⚠️ Lỗi nạp categories:', cErr.message);
    else console.log(`  ✅ Đã nạp thành công ${catRows.length} danh mục!`);
  }

  // 3. PRODUCTS
  if (data.products && data.products.length > 0) {
    console.log(`📦 Đang nạp ${data.products.length} sản phẩm (products)...`);
    const prodRows = data.products.map(p => ({
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
      images: p.images || [],
      description: p.description || '',
      is_hot: Boolean(p.isHot),
      is_new_arrival: Boolean(p.isNewArrival),
      is_customizable: Boolean(p.isCustomizable),
      stock: p.stock ?? 100,
      sold_count: p.soldCount ?? 0,
      rating_avg: p.ratingAvg ?? 5,
      rating_count: p.ratingCount ?? 0,
      variants: p.variants || [],
      combo_tiers: p.comboTiers || [],
      package_options: p.packageOptions || [],
      min_order_quantity: p.minOrderQuantity || 1,
      step_quantity: p.stepQuantity || 1,
      is_active: p.isActive !== false,
      created_at: p.createdAt || new Date().toISOString(),
      updated_at: p.updatedAt || new Date().toISOString()
    }));
    const { error: pErr } = await supabase.from('products').upsert(prodRows);
    if (pErr) console.error('  ⚠️ Lỗi nạp products:', pErr.message);
    else console.log(`  ✅ Đã nạp thành công ${prodRows.length} sản phẩm!`);
  }

  // 4. FEEDBACKS
  if (data.feedbacks && data.feedbacks.length > 0) {
    console.log(`📦 Đang nạp ${data.feedbacks.length} đánh giá (feedbacks)...`);
    const fbRows = data.feedbacks.map(f => ({
      id: f.id,
      customer_name: f.customerName,
      customer_location: f.customerLocation || '',
      comment: f.comment,
      rating: f.rating || 5,
      purchased_product: f.purchasedProduct || '',
      avatar_text: f.avatarText || 'KH',
      is_active: f.isActive !== false,
      created_at: f.createdAt || new Date().toISOString()
    }));
    const { error: fErr } = await supabase.from('feedbacks').upsert(fbRows);
    if (fErr) console.error('  ⚠️ Lỗi nạp feedbacks:', fErr.message);
    else console.log(`  ✅ Đã nạp thành công ${fbRows.length} feedbacks!`);
  }

  // 5. CUSTOMERS
  if (data.customers && data.customers.length > 0) {
    console.log(`📦 Đang nạp ${data.customers.length} khách hàng (customers)...`);
    const custRows = data.customers.map(c => ({
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
      internal_notes: c.internalNotes || '',
      created_at: c.createdAt || new Date().toISOString(),
      updated_at: c.updatedAt || new Date().toISOString()
    }));
    const { error: cErr } = await supabase.from('customers').upsert(custRows);
    if (cErr) console.error('  ⚠️ Lỗi nạp customers:', cErr.message);
    else console.log(`  ✅ Đã nạp thành công ${custRows.length} khách hàng!`);
  }

  // 6. ORDERS
  if (data.orders && data.orders.length > 0) {
    console.log(`📦 Đang nạp ${data.orders.length} đơn hàng (orders)...`);
    const orderRows = data.orders.map(o => {
      const itemsSummary = (o.items || []).map(i => `${i.productName || 'Sản phẩm'} (x${i.quantity || 1})`).join(', ');
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
        updated_at: o.updatedAt || new Date().toISOString()
      };
    });
    const { error: oErr } = await supabase.from('orders').upsert(orderRows);
    if (oErr) console.error('  ⚠️ Lỗi nạp orders:', oErr.message);
    else console.log(`  ✅ Đã nạp thành công ${orderRows.length} đơn hàng!`);
  }

  console.log('🎉 Hoàn tất quá trình nạp dữ liệu lên Supabase!');
}

runMigration().catch(err => {
  console.error('Fatal error during migration:', err);
});