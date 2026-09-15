'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomer } from '@/context/CustomerContext';
import { formatVND } from '@/lib/utils';
import { Order, OrderCustomer, ShopSettings } from '@/types';
import { VIETNAM_PROVINCES, calculateSPXShipping } from '@/data/vietnamAddress';
import { MessageCircle, ShieldCheck, ArrowLeft, ArrowRight, Package, MapPin, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    selectedItems,
    selectedSubtotal,
    selectedTotalSavings,
    selectedTotalItems,
    subtotal,
    totalSavings,
    totalItems,
    clearCart,
  } = useCart();
  const { theme } = useTheme();
  const { customer: loggedInCustomer, updateProfile } = useCustomer();

  const checkoutItems = selectedItems.length > 0 ? selectedItems : items;
  const checkoutSubtotal = selectedItems.length > 0 ? selectedSubtotal : subtotal;
  const checkoutTotalSavings = selectedItems.length > 0 ? selectedTotalSavings : totalSavings;
  const checkoutTotalItems = selectedItems.length > 0 ? selectedTotalItems : totalItems;

  const groupedCheckoutItems = useMemo(() => {
    const groups: { [productId: string]: { product: any; items: typeof checkoutItems; totalQty: number; totalAmount: number } } = {};
    checkoutItems.forEach((item) => {
      const pId = item.product?.id || 'unknown';
      if (!groups[pId]) {
        groups[pId] = {
          product: item.product,
          items: [],
          totalQty: 0,
          totalAmount: 0,
        };
      }
      groups[pId].items.push(item);
      groups[pId].totalQty += item.quantity;
      groups[pId].totalAmount += item.totalPrice;
    });
    return Object.values(groups);
  }, [checkoutItems]);

  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const [customer, setCustomer] = useState<{
    fullName: string;
    phone: string;
    note: string;
  }>({
    fullName: '',
    phone: '',
    note: '',
  });

  // Quản lý địa chỉ hành chính linh động thích ứng đợt sáp nhập tỉnh/huyện/xã
  const [selectedProvince, setSelectedProvince] = useState('Bắc Giang');
  const [selectedDistrict, setSelectedDistrict] = useState('Huyện Yên Dũng');
  const [selectedWard, setSelectedWard] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  // Quản lý địa chỉ đã lưu & đặt mặc định cho tài khoản
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('');

  const savedAddresses = useMemo(() => {
    if (!loggedInCustomer) return [];
    if (loggedInCustomer.savedAddresses && loggedInCustomer.savedAddresses.length > 0) {
      return loggedInCustomer.savedAddresses;
    }
    if (loggedInCustomer.address) {
      return [{
        id: 'default-legacy',
        address: loggedInCustomer.address,
        district: loggedInCustomer.district || '',
        city: loggedInCustomer.city || 'Bắc Giang',
        isDefault: true,
      }];
    }
    return [];
  }, [loggedInCustomer]);

  const applySavedAddress = (addr: { id?: string; address: string; district?: string; city?: string }) => {
    if (addr.id) setSelectedSavedAddressId(addr.id);
    if (addr.city) {
      const found = VIETNAM_PROVINCES.find((p) => p.name.toLowerCase() === addr.city!.toLowerCase());
      if (found) {
        setSelectedProvince(found.name);
        if (addr.district && found.districts.includes(addr.district)) {
          setSelectedDistrict(addr.district);
        } else if (found.districts.length > 0) {
          setSelectedDistrict(found.districts[0]);
        }
      }
    }
    if (addr.address) {
      setSpecificAddress(addr.address);
    }
  };

  const handleSetDefaultSavedAddress = async (addrId: string) => {
    if (!loggedInCustomer) return;
    setSelectedSavedAddressId(addrId);
    await updateProfile({ setDefaultAddressId: addrId });
  };

  // Tự động điền nếu khách hàng đã đăng nhập
  useEffect(() => {
    if (loggedInCustomer) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || loggedInCustomer.fullName || '',
        phone: prev.phone || loggedInCustomer.phone || '',
      }));

      if (savedAddresses.length > 0) {
        const defaultSaved = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        applySavedAddress(defaultSaved);
      } else if (loggedInCustomer.city) {
        const found = VIETNAM_PROVINCES.find(
          (p) => p.name.toLowerCase() === loggedInCustomer.city.toLowerCase()
        );
        if (found) {
          setSelectedProvince(found.name);
          if (loggedInCustomer.district && found.districts.includes(loggedInCustomer.district)) {
            setSelectedDistrict(loggedInCustomer.district);
          } else if (found.districts.length > 0) {
            setSelectedDistrict(found.districts[0]);
          }
        }
        if (loggedInCustomer.address) {
          setSpecificAddress(loggedInCustomer.address);
        }
      }
    }
  }, [loggedInCustomer, savedAddresses]);

  // Lấy danh sách quận huyện tương ứng tỉnh được chọn
  const currentProvinceData = VIETNAM_PROVINCES.find((p) => p.name === selectedProvince) || VIETNAM_PROVINCES[0];
  const currentDistricts = currentProvinceData?.districts || [];

  // PHÍ SHIP: Bỏ tính tự động. Shop đóng gói cân thực tế rồi báo qua Zalo cho khách.
  const shippingFee = 0;
  const finalTotal = checkoutSubtotal;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const themeConfig = {
    green: {
      btnPrimary: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-200',
      priceColor: 'text-emerald-700',
      inputBg: 'bg-emerald-50/40 border-emerald-200 focus:ring-emerald-300',
      cardBorder: 'border-emerald-100',
      tagIcon: 'text-emerald-500',
      addressBadge: 'bg-emerald-100 text-emerald-800',
      zaloStepBadge: 'text-emerald-800 bg-emerald-100',
      linkBack: 'text-emerald-800 hover:text-emerald-900',
    },
    pink: {
      btnPrimary: 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 hover:from-pink-600 hover:to-rose-600 shadow-pink-200',
      priceColor: 'text-pink-600',
      inputBg: 'bg-pink-50/40 border-pink-200 focus:ring-pink-300',
      cardBorder: 'border-pink-100',
      tagIcon: 'text-pink-500',
      addressBadge: 'bg-pink-100 text-pink-700',
      zaloStepBadge: 'text-pink-700 bg-pink-100',
      linkBack: 'text-pink-700 hover:text-pink-800',
    },
    orange: {
      btnPrimary: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200',
      priceColor: 'text-orange-600',
      inputBg: 'bg-orange-50/40 border-orange-200 focus:ring-orange-300',
      cardBorder: 'border-orange-100',
      tagIcon: 'text-orange-500',
      addressBadge: 'bg-orange-100 text-orange-800',
      zaloStepBadge: 'text-orange-800 bg-orange-100',
      linkBack: 'text-orange-800 hover:text-orange-900',
    },
    yellow: {
      btnPrimary: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 shadow-amber-200',
      priceColor: 'text-amber-700',
      inputBg: 'bg-amber-50/40 border-amber-200 focus:ring-amber-300',
      cardBorder: 'border-amber-100',
      tagIcon: 'text-amber-500',
      addressBadge: 'bg-amber-100 text-amber-800',
      zaloStepBadge: 'text-amber-800 bg-amber-100',
      linkBack: 'text-amber-800 hover:text-amber-900',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName.trim() || !customer.phone.trim() || !specificAddress.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng chi tiết!');
      return;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage('Bạn chưa chọn sản phẩm nào trong giỏ để đặt hàng!');
      return;
    }

    const fullAddress = [
      specificAddress.trim(),
      selectedWard.trim(),
      selectedDistrict.trim(),
      selectedProvince.trim(),
    ].filter(Boolean).join(', ');

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customer: {
          fullName: customer.fullName.trim(),
          phone: customer.phone.trim(),
          address: fullAddress,
          specificAddress: specificAddress.trim(),
          ward: selectedWard.trim(),
          city: selectedProvince,
          district: selectedDistrict,
          note: customer.note || '',
        },
        setAsDefaultAddress: saveAsDefault,
        items: checkoutItems,
        subtotal: checkoutSubtotal,
        shippingFee,
        discount: checkoutTotalSavings,
        totalAmount: finalTotal,
        paymentMethod: 'ZALO_CONFIRM' as const,
        paymentStatus: 'UNPAID' as const,
        orderStatus: 'PENDING_CONFIRM' as const,
        carrierName: 'SPX Express',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedOrder(data.data);
        clearCart();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Đồng bộ lưu địa chỉ mới vào tài khoản thành viên
        if (loggedInCustomer) {
          updateProfile({
            address: specificAddress.trim(),
            district: selectedDistrict,
            city: selectedProvince,
            saveNewAddress: {
              address: specificAddress.trim(),
              district: selectedDistrict,
              city: selectedProvince,
              isDefault: saveAsDefault || savedAddresses.length === 0,
            },
          } as any).catch(() => {});
        }
      } else {
        setErrorMessage('Không thể tạo đơn hàng, vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // MÀN HÌNH XÁC NHẬN GỬI ĐƠN THÀNH CÔNG
  if (createdOrder) {
    const zaloShopPhone = (settings?.zaloPhone || '0375408256').replace(/[^0-9]/g, '');
    const prefilledMsg = encodeURIComponent(
      `Chào shop Omachi! Mình vừa đặt đơn #${createdOrder.code} (${createdOrder.items.reduce((s: number, i: any) => s + i.quantity, 0)} món). Mình nhắn qua để shop tư vấn thêm nhé! 💕`
    );
    const zaloShopUrl = `https://zalo.me/${zaloShopPhone}?text=${prefilledMsg}`;

    return (
      <div className="py-10 max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className={`bg-white rounded-3xl border ${curr.cardBorder} shadow-xl p-6 sm:p-8 text-center space-y-5`}>
          
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-200">
            🌸
          </div>

          <div className="space-y-1.5">
            <span className={`text-xs font-extrabold ${curr.tagBadge} px-3.5 py-1 rounded-full border`}>
              ĐÃ GỬI ĐƠN HÀNG THÀNH CÔNG ✨
            </span>
            <h2 className="text-2xl font-black text-gray-800 pt-2">
              Mã Đơn: #{createdOrder.code}
            </h2>
            <p className="text-xs text-gray-500">
              Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong> đã tin tưởng đặt hàng tại Omachi!
            </p>
          </div>

          {/* Chi tiết tóm tắt đơn */}
          <div className={`p-4 rounded-2xl border ${curr.cardBorder} bg-emerald-50/20 text-xs text-left space-y-2.5`}>
            <div className="flex justify-between">
              <span className="text-gray-500">Tiền hàng tạm tính:</span>
              <strong className="text-gray-800 text-sm font-black">
                {formatVND(createdOrder.subtotal || createdOrder.subtotalAmount || createdOrder.totalAmount || 0)}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phí vận chuyển (SPX):</span>
              <strong className="text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                {createdOrder.shippingFee > 0 ? formatVND(createdOrder.shippingFee) : 'Shop cân thực tế & báo sau'}
              </strong>
            </div>
            <div className={`flex justify-between items-baseline pt-2 border-t ${curr.cardBorder}`}>
              <span className="font-extrabold text-gray-700">Tổng tiền hàng:</span>
              <strong className={`${curr.priceColor} text-lg font-black`}>
                {formatVND(createdOrder.subtotal || createdOrder.totalAmount)}
              </strong>
            </div>
            <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-100">
              <span>Số lượng sản phẩm:</span>
              <strong className="text-gray-800">{createdOrder.items.reduce((s, i) => s + i.quantity, 0)} gói</strong>
            </div>
            <div className={`pt-2 border-t ${curr.cardBorder} flex justify-between text-gray-600`}>
              <span>Địa chỉ nhận hàng:</span>
              <strong className="text-gray-800 text-right max-w-[240px] truncate">{createdOrder.customer.address}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SĐT người nhận:</span>
              <strong className="text-gray-800">{createdOrder.customer.phone}</strong>
            </div>
          </div>

          {/* Thông báo tiến trình tiếp theo */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5 text-left">
            <p className="font-extrabold flex items-center gap-1.5 text-emerald-800">
              <span>📦</span>
              <span>Shop đã nhận được đơn hàng tự động qua hệ thống!</span>
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Xưởng Omachi sẽ soạn hàng, đóng gói cẩn thận và cân khối lượng thực tế. Sau đó shop sẽ liên hệ qua SĐT / Zalo của bạn để báo cước ship SPX chính xác nhất và gửi hàng nhé!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/"
              className={`w-full py-3.5 rounded-2xl ${curr.btnPrimary} text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-98`}
            >
              <span>🏠 Về Trang Chủ Tiếp Tục Mua Sắm</span>
            </Link>

            <Link
              href={`/tra-cuu-don-hang?phone=${encodeURIComponent(createdOrder.customer.phone)}`}
              className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>🔍 Tra Cứu Đơn Hàng Của Bạn</span>
            </Link>

            {/* Nút phụ: Nhắn Zalo nếu khách muốn */}
            <div className="pt-2">
              <a
                href={zaloShopUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Nhắn Zalo cho shop (Nếu bạn cần tư vấn thêm hoặc đổi mẫu)</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className={`w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-3xl`}>
          🛍️
        </div>
        <h2 className="text-xl font-bold text-gray-800">Chưa chọn sản phẩm thanh toán</h2>
        <p className="text-xs text-gray-500">
          Bạn chưa chọn sản phẩm nào trong giỏ hàng để tiến hành đặt hàng. Hãy mở giỏ hàng và tích chọn món bạn muốn mua nhé!
        </p>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${curr.btnPrimary} text-white font-bold text-xs shadow-md`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại mua sắm</span>
        </Link>
      </div>
    );
  }

  // MÀN HÌNH ĐẶT HÀNG CHÍNH
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 text-xs font-bold ${curr.linkBack} transition`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tiếp tục chọn thêm charm &amp; vòng</span>
        </Link>
        <span className="text-xs text-gray-400 font-medium">Bước 2: Giao Hàng &amp; Thanh Toán</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
          <span>Xác Nhận Đơn Hàng</span>
          <span className="text-2xl">✨</span>
        </h1>
        <p className="text-xs text-gray-500">
          Xác nhận thông tin nhận hàng để xưởng Omachi chuẩn bị và đóng gói đơn hàng handmade cho bạn ✨
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-600 animate-shake">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        
        {/* Top 2 Columns: Balanced Left (Thông tin người nhận) & Right (Chi tiết tiền hàng) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Customer & Delivery Info */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${curr.cardBorder} shadow-xs space-y-4`}>
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className={curr.tagIcon}>👤</span>
                <span>1. Thông Tin Người Nhận</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Họ và tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Lan Anh"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Số điện thoại / Zalo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0988123456"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                  />
                </div>
              </div>

              {/* BỘ QUẢN LÝ VÀ CHỌN ĐỊA CHỈ THÔNG MINH */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                
                {/* Trường hợp 1: Thành viên đã có địa chỉ lưu trong tài khoản */}
                {loggedInCustomer && savedAddresses.length > 0 && (
                  <div className="p-3.5 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-rose-50/40 rounded-2xl border border-pink-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Địa chỉ nhận hàng đã lưu ({savedAddresses.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsChangingAddress(!isChangingAddress)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {isChangingAddress ? '← Quay lại địa chỉ đã lưu' : '+ Giao tới địa chỉ khác'}
                      </button>
                    </div>

                    {!isChangingAddress && (
                      <div className="space-y-2">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedSavedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => applySavedAddress(addr)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2.5 ${
                                isSelected
                                  ? 'bg-white border-rose-400 shadow-xs ring-1 ring-rose-400'
                                  : 'bg-white/60 border-pink-100 hover:bg-white hover:border-pink-200'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-rose-500 bg-rose-500 text-white text-[9px] font-black' : 'border-gray-300'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-gray-800 font-bold">{addr.address}</strong>
                                    {addr.isDefault && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                        Mặc định
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {addr.district ? `${addr.district}, ` : ''}{addr.city}
                                  </p>
                                </div>
                              </div>

                              {isSelected && !addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefaultSavedAddress(addr.id);
                                  }}
                                  className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg shrink-0 transition"
                                  title="Bấm để đặt địa chỉ này làm địa chỉ giao hàng mặc định"
                                >
                                  ⭐ Đặt làm mặc định
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Trường hợp 2: Thành viên đặt đơn đầu tiên */}
                {loggedInCustomer && savedAddresses.length === 0 && (
                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <span className="text-base shrink-0">🌟</span>
                    <div>
                      <p className="font-bold">Đơn hàng đầu tiên của bạn!</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Địa chỉ bạn chọn bên dưới sẽ được tự động lưu làm <strong>mặc định</strong> cho tài khoản của bạn để không cần gõ lại ở các lần sau.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form nhập/chọn địa chỉ 3 cấp */}
                {(!loggedInCustomer || savedAddresses.length === 0 || isChangingAddress) && (
                  <div className="space-y-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isChangingAddress ? 'Nhập địa chỉ nhận hàng mới' : 'Địa chỉ giao hàng chuẩn SPX Express'} <span className="text-rose-500">*</span></span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Tự động tính cước</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Tỉnh / Thành phố (Vừa gợi ý vừa cho gõ tự do) */}
                      <div>
                        <span className="text-[11px] font-bold text-gray-600 block mb-1">
                          Tỉnh / Thành phố <span className="text-rose-500">*</span>
                        </span>
                        <div className="relative">
                          <input
                            type="text"
                            list="province-datalist"
                            placeholder="Chọn hoặc nhập Tỉnh/Thành..."
                            value={selectedProvince}
                            onChange={(e) => {
                              const prov = e.target.value;
                              setSelectedProvince(prov);
                              const found = VIETNAM_PROVINCES.find((p) => p.name.toLowerCase() === prov.toLowerCase());
                              if (found && found.districts.length > 0) {
                                setSelectedDistrict(found.districts[0]);
                              }
                            }}
                            className={`w-full px-3 py-2.5 text-xs ${curr.inputBg} border rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition`}
                          />
                          <datalist id="province-datalist">
                            {VIETNAM_PROVINCES.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} {p.region === 'NORTH' ? '(Miền Bắc)' : p.region === 'CENTRAL' ? '(Miền Trung)' : '(Miền Nam)'}
                              </option>
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {/* 2. Quận / Huyện / Thị xã (Hỗ trợ vừa chọn vừa gõ tự do tên mới sáp nhập) */}
                      <div>
                        <span className="text-[11px] font-bold text-gray-600 block mb-1">
                          Quận / Huyện / Thị xã <span className="text-rose-500">*</span>
                        </span>
                        <div className="relative">
                          <input
                            type="text"
                            list="district-datalist"
                            placeholder="Chọn hoặc nhập tên huyện/thị xã..."
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className={`w-full px-3 py-2.5 text-xs ${curr.inputBg} border rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition`}
                          />
                          <datalist id="district-datalist">
                            {currentDistricts.map((d) => (
                              <option key={d} value={d} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {/* 3. Phường / Xã / Thị trấn (Linh động nhập theo địa giới mới/cũ) */}
                      <div>
                        <span className="text-[11px] font-bold text-gray-600 block mb-1">
                          Phường / Xã / Thị trấn
                        </span>
                        <input
                          type="text"
                          placeholder="Nhập Phường/Xã (hoặc tên cũ)..."
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className={`w-full px-3 py-2.5 text-xs ${curr.inputBg} border rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition`}
                        />
                      </div>
                    </div>

                    {/* Notice for administrative changes */}
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">💡</span>
                      <span>
                        <strong>Hỗ trợ sáp nhập địa giới:</strong> Nếu địa phương của bạn vừa sáp nhập xã/phường/huyện, bạn có thể tự do gõ tên mới hoặc ghi kèm tên cũ để bưu tá SPX giao hàng nhanh chóng và chuẩn xác nhất!
                      </span>
                    </div>

                    {/* 4. Địa chỉ chi tiết */}
                    <div>
                      <span className="text-[11px] font-bold text-gray-600 block mb-1">
                        Số nhà, tên ngõ, đường hoặc thôn/xóm <span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="VD: Thôn Giá, Xóm Đình (hoặc Số 18 Ngõ 65...)"
                        value={specificAddress}
                        onChange={(e) => setSpecificAddress(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                      />
                    </div>

                    {/* Tùy chọn đặt làm địa chỉ mặc định cho tài khoản */}
                    {loggedInCustomer && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={saveAsDefault}
                          onChange={(e) => setSaveAsDefault(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-700">
                          Đặt làm địa chỉ nhận hàng mặc định cho các đơn sau
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {/* Xem trước địa chỉ vận đơn */}
                {(specificAddress || selectedDistrict) && (
                  <div className="p-2.5 bg-pink-50/40 rounded-xl border border-pink-100 text-[11px] text-gray-600 flex items-start gap-1.5">
                    <span className="font-bold text-rose-600 shrink-0">📍 Vận đơn:</span>
                    <span className="font-medium text-gray-800">
                      {[specificAddress.trim(), selectedWard.trim(), selectedDistrict.trim(), selectedProvince.trim()].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Ghi chú cho shop (Size tay, đổi charm, giao giờ hành chính...):
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Cỡ tay 15cm / Mình là khách quen đợt trước / Giao giờ hành chính..."
                  value={customer.note}
                  onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs ${curr.inputBg} border rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                />
              </div>
            </div>

          </div>

          {/* Right: Order Summary (Chi Tiết Tiền Hàng) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${curr.cardBorder} shadow-sm space-y-4`}>
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className={curr.tagIcon}>🛍️</span>
                <span>Chi Tiết Tiền Hàng ({checkoutTotalItems} món)</span>
              </h3>

              {/* Item list grouped by product */}
              <div className="max-h-72 overflow-y-auto space-y-3 divide-y divide-gray-100 pr-1">
                {groupedCheckoutItems.map((group) => (
                  <div key={group.product.id} className="pt-2.5 first:pt-0 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={group.product.images[0] || '/images/charm_feed_1.jpg'}
                        alt={group.product.name}
                        className={`w-10 h-10 object-cover rounded-xl border ${curr.cardBorder} flex-shrink-0 shadow-xs`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-gray-800 line-clamp-2 leading-snug">{group.product.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {group.items.length} phân loại • Tổng: {group.totalQty} gói
                        </p>
                      </div>
                    </div>

                    {/* Variations of this product */}
                    <div className="pl-3 border-l-2 border-dashed border-gray-200 space-y-1.5 my-1.5">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                            {item.selectedVariant?.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                                style={{ backgroundColor: item.selectedVariant.colorHex }}
                              />
                            )}
                            <span className="text-[11px] font-semibold text-gray-800">
                              {item.selectedVariant?.name || 'Mặc định'}
                              {item.selectedPackage ? ` (${item.selectedPackage.name})` : ''}
                            </span>
                            <span className="text-[11px] font-extrabold text-gray-900 bg-gray-100 px-1.5 py-0.2 rounded shrink-0">
                              x{item.quantity}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-xs text-gray-800">
                              {formatVND(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className={`space-y-2.5 pt-3 border-t ${curr.cardBorder} text-xs text-gray-600`}>
                {checkoutTotalSavings > 0 && (
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Tổng tiền theo giá lẻ ban đầu:</span>
                    <span className="line-through">{formatVND(checkoutSubtotal + checkoutTotalSavings)}</span>
                  </div>
                )}

                {checkoutTotalSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Chiết khấu Combo / Mua sỉ:</span>
                    <span>-{formatVND(checkoutTotalSavings)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-700">
                  <span>Tiền hàng thực tế:</span>
                  <span className="text-gray-800">{formatVND(checkoutSubtotal)}</span>
                </div>

                {/* Phí ship báo sau khi cân thực tế */}
                <div className="flex justify-between items-center py-1.5 bg-amber-50/60 px-3 rounded-xl border border-amber-100">
                  <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Cước ship (SPX):</span>
                  </span>
                  <span className="font-extrabold text-amber-700 text-[11px] bg-amber-100 px-2 py-0.5 rounded-md">
                    Shop báo sau khi cân
                  </span>
                </div>

                <div className={`flex justify-between pt-3 border-t ${curr.cardBorder} items-baseline`}>
                  <div>
                    <span className="text-sm font-extrabold text-gray-800 block">Tổng tiền hàng:</span>
                    <span className="text-[10px] text-gray-400">Chưa bao gồm cước ship thực tế</span>
                  </div>
                  <span className={`text-2xl font-black ${curr.priceColor}`}>{formatVND(checkoutSubtotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl ${curr.btnPrimary} text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition transform active:scale-98 cursor-pointer`}
              >
                {isSubmitting ? (
                  <span>Đang tạo đơn hàng...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 shrink-0" />
                    <span>Đặt Hàng Ngay (Thanh Toán COD)</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>

              <div className={`p-3 bg-emerald-50/70 rounded-2xl text-[11px] text-emerald-900 space-y-1 border ${curr.cardBorder}`}>
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cam kết từ xưởng handmade Omachi:</span>
                </p>
                <p className="text-gray-500 text-[10px]">
                  Đơn hàng gửi đi sẽ kích hoạt thông báo tức thì tới điện thoại của chủ shop để chuẩn bị chu đáo nhất.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom 2 Columns: Symmetrical Balanced Delivery & Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Card 1: THẺ GIAO HÀNG & PHÍ SHIP (CÂN THỰC TẾ) */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 border border-orange-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                  SPX
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-800 flex items-center gap-2">
                    <span>Giao Hàng Qua SPX Express</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                      Cân hàng thực tế
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Khu vực: <strong className="text-gray-800">{selectedProvince || "Toàn quốc"}</strong> • Giao tận nơi COD
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-200">
                  Báo sau khi cân
                </span>
                <span className="text-[10px] text-gray-400 block font-medium mt-0.5">Theo trọng lượng thực</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 bg-white/80 p-2.5 rounded-2xl border border-orange-100 flex items-center gap-1.5">
              <span>📦</span>
              <span>Đơn charm / hạt vòng handmade có cân nặng khác nhau (từ vài chục gram đến vài kg). Shop sẽ đóng gói cân trực tiếp để áp mức phí ship rẻ nhất và báo lại bạn trước khi giao.</span>
            </p>
          </div>

          {/* Card 2: QUY TRÌNH XỬ LÝ ĐƠN HÀNG */}
          <div className={`${curr.accentBg} p-5 rounded-3xl border space-y-3 flex flex-col justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${curr.btnPrimary} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-gray-800">
                  Quy Trình Xử Lý Đơn Hàng Tại Omachi 🌿
                </h4>
                <p className={`text-[11px] ${curr.priceColor} font-semibold`}>
                  Nhanh chóng - Tự động - Tối ưu cước phí vận chuyển
                </p>
              </div>
            </div>

            <div className={`bg-white/90 p-3.5 rounded-2xl border ${curr.cardBorder} space-y-2 text-xs text-gray-600`}>
              <div className="flex items-start gap-2">
                <span className={`font-bold ${curr.zaloStepBadge} w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5`}>1</span>
                <p>Bạn bấm <strong>&quot;Đặt Hàng Ngay&quot;</strong>. Đơn hàng sẽ được tự động gửi về hệ thống của Shop.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className={`font-bold ${curr.zaloStepBadge} w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5`}>2</span>
                <p>Shop kiểm tra mẫu charm/vòng, đóng gói và cân trọng lượng thực tế để tính mức ship SPX ưu đãi nhất.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className={`font-bold ${curr.zaloStepBadge} w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5`}>3</span>
                <p>Shop liên hệ xác nhận cước phí ship (qua Zalo/Điện thoại) và bàn giao bưu tá SPX giao tận tay bạn!</p>
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
