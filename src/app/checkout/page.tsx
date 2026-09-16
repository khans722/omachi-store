'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Truck,
  ShieldCheck,
  ReceiptText,
  MessageSquare,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Tag,
  Edit2,
  Check
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomer } from '@/context/CustomerContext';
import { VIETNAM_PROVINCES } from '@/data/vietnamAddress';
import { Order, ShopSettings } from '@/types';
import confetti from 'canvas-confetti';

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

function SearchableDropdown({
  label,
  required,
  placeholder,
  value,
  onChange,
  options,
  error,
  disabled,
  disabledText,
  buttonRef,
  searchPlaceholder,
  onSelectOption,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  error?: string;
  disabled?: boolean;
  disabledText?: string;
  buttonRef?: React.RefObject<any>;
  searchPlaceholder?: string;
  onSelectOption?: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, search]);

  if (isManualInput) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 block">
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsManualInput(false);
              onChange('');
            }}
            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
          >
            ← Chọn danh sách có sẵn
          </button>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-rose-400 font-medium text-gray-800"
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        <button
          type="button"
          onClick={() => setIsManualInput(true)}
          className="text-[10px] text-gray-400 hover:text-rose-600 hover:underline"
        >
          Nhập tay
        </button>
      </div>

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left text-xs bg-gray-50 border ${
          error
            ? 'border-rose-400 ring-1 ring-rose-200'
            : disabled
            ? 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-100'
            : 'border-gray-200 hover:border-gray-300'
        } rounded-lg flex items-center justify-between font-medium text-gray-800 transition`}
      >
        <span className={value ? 'text-gray-900 font-bold truncate' : 'text-gray-400 truncate'}>
          {value || (disabled ? disabledText || placeholder : placeholder)}
        </span>
        <span className="text-gray-400 text-[10px] shrink-0 ml-1">▼</span>
      </button>

      {error && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">⚠️ {error}</p>}

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-2 space-y-1.5 animate-fade-in">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder || '🔍 Gõ tìm nhanh...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:bg-white focus:border-rose-400 font-medium text-gray-800"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">
              🔍
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 pr-0.5 space-y-0.5 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.toLowerCase() === value.toLowerCase().trim();
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch('');
                      onSelectOption?.(opt);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <span className="text-rose-600 font-bold text-xs">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-gray-400 space-y-1.5">
                <p>Không thấy &quot;{search}&quot;</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(search);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-bold text-[11px]"
                >
                  Sử dụng &quot;{search}&quot;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const themeConfig = {
    green: {
      btnPrimary: 'bg-gradient-to-r from-[#6EA64E] to-[#78B159] hover:from-[#629744] hover:to-[#6EA64E] text-white shadow-md shadow-[#DCEDCE]',
      priceText: 'text-[#3E6B28]',
      accentText: 'text-[#456F2F]',
      badgeBg: 'bg-[#78B159]',
      focusBorder: 'focus:border-[#78B159]',
      hoverText: 'hover:text-[#3E6B28]',
      borderSubtle: 'border-[#DCEDCE]',
      bgSubtle: 'bg-[#F4F9EE]',
      ribbonBg: 'repeating-linear-gradient(45deg, #78B159, #78B159 12px, #fff 12px, #fff 18px, #A0D488 18px, #A0D488 30px, #fff 30px, #fff 36px)',
    },
    pink: {
      btnPrimary: 'bg-gradient-to-r from-[#E0688E] to-[#F0789E] hover:from-[#CF587E] hover:to-[#E0688E] text-white shadow-md shadow-[#FAD1DE]',
      priceText: 'text-[#9E2B54]',
      accentText: 'text-[#9E2B54]',
      badgeBg: 'bg-[#F0789E]',
      focusBorder: 'focus:border-[#F0789E]',
      hoverText: 'hover:text-[#9E2B54]',
      borderSubtle: 'border-[#FAD1DE]',
      bgSubtle: 'bg-[#FFF2F6]',
      ribbonBg: 'repeating-linear-gradient(45deg, #F0789E, #F0789E 12px, #fff 12px, #fff 18px, #FAD1DE 18px, #FAD1DE 30px, #fff 30px, #fff 36px)',
    },
    purple: {
      btnPrimary: 'bg-gradient-to-r from-[#8C6EC8] to-[#9C80D8] hover:from-[#7C5EB8] hover:to-[#8C6EC8] text-white shadow-md shadow-[#E0D4FA]',
      priceText: 'text-[#613CA8]',
      accentText: 'text-[#613CA8]',
      badgeBg: 'bg-[#9C80D8]',
      focusBorder: 'focus:border-[#9C80D8]',
      hoverText: 'hover:text-[#613CA8]',
      borderSubtle: 'border-[#E0D4FA]',
      bgSubtle: 'bg-[#F8F4FF]',
      ribbonBg: 'repeating-linear-gradient(45deg, #9C80D8, #9C80D8 12px, #fff 12px, #fff 18px, #E0D4FA 18px, #E0D4FA 30px, #fff 30px, #fff 36px)',
    },
    cream: {
      btnPrimary: 'bg-gradient-to-r from-[#D6973A] to-[#E5A84B] hover:from-[#C7882C] hover:to-[#D6973A] text-white shadow-md shadow-[#F7E4BE]',
      priceText: 'text-[#8E5A13]',
      accentText: 'text-[#8E5A13]',
      badgeBg: 'bg-[#E5A84B]',
      focusBorder: 'focus:border-[#E5A84B]',
      hoverText: 'hover:text-[#8E5A13]',
      borderSubtle: 'border-[#F7E4BE]',
      bgSubtle: 'bg-[#FFF9EE]',
      ribbonBg: 'repeating-linear-gradient(45deg, #E5A84B, #E5A84B 12px, #fff 12px, #fff 18px, #F7E4BE 18px, #F7E4BE 30px, #fff 30px, #fff 36px)',
    },
  };
  const curr = themeConfig[theme] || themeConfig.green;
  const { customer: loggedInCustomer, updateProfile } = useCustomer();

  const checkoutItems = selectedItems.length > 0 ? selectedItems : items;
  const checkoutSubtotal = selectedItems.length > 0 ? selectedSubtotal : subtotal;
  const checkoutTotalSavings = selectedItems.length > 0 ? selectedTotalSavings : totalSavings;
  const checkoutTotalItems = selectedItems.length > 0 ? selectedTotalItems : totalItems;

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

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  // Payment method selection (Shopee style)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');

  // Address edit toggle: auto-expand if any required field is missing
  const isAddressComplete = Boolean(
    customer.fullName.trim() &&
    customer.phone.trim() &&
    selectedProvince.trim() &&
    selectedDistrict.trim() &&
    specificAddress.trim()
  );
  const [isEditingAddress, setIsEditingAddress] = useState(!isAddressComplete);

  // Sync edit mode if empty
  useEffect(() => {
    if (!isAddressComplete) {
      setIsEditingAddress(true);
    }
  }, [isAddressComplete]);

  // Refs for validation focus
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<any>(null);
  const districtRef = useRef<any>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const addressSectionRef = useRef<HTMLDivElement>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    province?: string;
    district?: string;
    specificAddress?: string;
  }>({});

  const [saveAsDefault, setSaveAsDefault] = useState(true);

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
        city: loggedInCustomer.city || '',
        isDefault: true,
      }];
    }
    return [];
  }, [loggedInCustomer]);

  const applySavedAddress = (addr: { id?: string; address: string; district?: string; city?: string }) => {
    if (addr.city) {
      setSelectedProvince(addr.city);
      if (addr.district) {
        setSelectedDistrict(addr.district);
      }
    }
    if (addr.address) {
      setSpecificAddress(addr.address);
    }
  };

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
        setSelectedProvince(loggedInCustomer.city);
        if (loggedInCustomer.district) {
          setSelectedDistrict(loggedInCustomer.district);
        }
        if (loggedInCustomer.address) {
          setSpecificAddress(loggedInCustomer.address);
        }
      }
    }
  }, [loggedInCustomer, savedAddresses]);

  const currentProvinceData = useMemo(() => {
    if (!selectedProvince) return null;
    return VIETNAM_PROVINCES.find(
      (p) => p.name.toLowerCase() === selectedProvince.trim().toLowerCase()
    );
  }, [selectedProvince]);

  const currentDistricts = currentProvinceData?.districts || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!customer.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên nhận hàng';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập họ và tên của bạn');
      setIsEditingAddress(true);
      setTimeout(() => {
        fullNameRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    }

    const rawPhone = customer.phone.trim().replace(/[^0-9]/g, '');
    const vnPhoneRegex = /^(0|84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!rawPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại nhận hàng';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập số điện thoại nhận hàng');
      setIsEditingAddress(true);
      setTimeout(() => {
        phoneRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    } else if (!vnPhoneRegex.test(rawPhone)) {
      errors.phone = 'Số điện thoại chưa đúng định dạng (cần 10 số)';
      setFieldErrors(errors);
      setErrorMessage('Số điện thoại chưa đúng định dạng (cần 10 số, VD: 0988123456)');
      setIsEditingAddress(true);
      setTimeout(() => {
        phoneRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    }

    if (!selectedProvince.trim()) {
      errors.province = 'Vui lòng chọn Tỉnh / Thành phố';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng chọn Tỉnh / Thành phố nhận hàng');
      setIsEditingAddress(true);
      setTimeout(() => {
        provinceRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    }

    if (!selectedDistrict.trim()) {
      errors.district = 'Vui lòng chọn Quận / Huyện';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng chọn Quận / Huyện nhận hàng');
      setIsEditingAddress(true);
      setTimeout(() => {
        districtRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    }

    if (!specificAddress.trim()) {
      errors.specificAddress = 'Vui lòng nhập số nhà, tên đường/thôn xóm';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập số nhà, tên đường hoặc thôn xóm');
      setIsEditingAddress(true);
      setTimeout(() => {
        addressRef.current?.focus();
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return false;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage('Bạn chưa chọn sản phẩm nào để đặt hàng!');
      return false;
    }

    setFieldErrors({});
    setErrorMessage('');
    return true;
  };

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

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
          city: selectedProvince.trim(),
          district: selectedDistrict.trim(),
          note: customer.note || '',
        },
        setAsDefaultAddress: saveAsDefault,
        items: checkoutItems,
        subtotal: checkoutSubtotal,
        shippingFee: 0,
        discount: checkoutTotalSavings,
        totalAmount: checkoutSubtotal,
        paymentMethod: paymentMethod,
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

        if (loggedInCustomer) {
          updateProfile({
            address: specificAddress.trim(),
            district: selectedDistrict.trim(),
            city: selectedProvince.trim(),
            saveNewAddress: {
              address: specificAddress.trim(),
              district: selectedDistrict.trim(),
              city: selectedProvince.trim(),
              isDefault: saveAsDefault || savedAddresses.length === 0,
            },
          } as any).catch(() => {});
        }
      } else {
        const errorMsg = data.message || 'Không thể tạo đơn hàng, vui lòng thử lại.';
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // MÀN HÌNH ĐÃ TẠO ĐƠN THÀNH CÔNG
  if (createdOrder) {
    const zaloShopPhone = (settings?.zaloPhone || '0375408256').replace(/[^0-9]/g, '');
    const prefilledMsg = encodeURIComponent(
      `Chào shop Omachi! Mình vừa đặt đơn #${createdOrder.code} (${createdOrder.items.reduce((s: number, i: any) => s + i.quantity, 0)} món). Mình nhắn qua để shop tư vấn thêm nhé! 💕`
    );
    const zaloShopUrl = `https://zalo.me/${zaloShopPhone}?text=${prefilledMsg}`;

    return (
      <div className="py-8 max-w-lg mx-auto space-y-4 font-sans px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-xs">
            ✨
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ĐẶT HÀNG THÀNH CÔNG
            </span>
            <h2 className="text-xl font-black text-gray-900 pt-1.5">
              Mã Đơn: #{createdOrder.code}
            </h2>
            <p className="text-xs text-gray-500">
              Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong> đã đặt hàng tại Omachi!
            </p>
          </div>

          {/* Shopee Style Compact Receipt */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Tiền hàng tạm tính:</span>
              <strong className="text-gray-900 font-bold">
                {formatVND(createdOrder.subtotal || createdOrder.totalAmount || 0)}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phí vận chuyển (SPX):</span>
              <strong className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                Shop cân thực tế &amp; báo sau
              </strong>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Tổng thanh toán:</span>
              <strong className={`${curr.priceText} text-base font-black`}>
                {formatVND(createdOrder.subtotal || createdOrder.totalAmount)}
              </strong>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between text-gray-600">
              <span>Địa chỉ nhận:</span>
              <strong className="text-gray-800 text-right max-w-[200px] truncate">{createdOrder.customer.address}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Số điện thoại:</span>
              <strong className="text-gray-800">{createdOrder.customer.phone}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Hình thức:</span>
              <strong className="text-gray-800">{createdOrder.paymentMethod === 'BANK' ? 'Chuyển khoản VietQR' : 'COD (Khi nhận hàng)'}</strong>
            </div>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1 text-left">
            <p className="font-bold flex items-center gap-1 text-emerald-800">
              <span>📦</span>
              <span>Shop đã nhận được đơn hàng tự động!</span>
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Xưởng Omachi sẽ soạn hàng, đóng gói cẩn thận và cân khối lượng thực tế. Shop sẽ liên hệ qua SĐT/Zalo của bạn để báo cước ship SPX rẻ nhất nhé!
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              href="/"
              className={`w-full py-3 rounded-xl ${curr.btnPrimary} font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition active:scale-98`}
            >
              <span>🏠 Về Trang Chủ Tiếp Tục Mua Sắm</span>
            </Link>

            <Link
              href={`/tra-cuu-don-hang?phone=${encodeURIComponent(createdOrder.customer.phone)}`}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>🔍 Tra Cứu Đơn Hàng</span>
            </Link>

            <div className="pt-1">
              <a
                href={zaloShopUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Nhắn tin Zalo với shop</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GIỎ HÀNG TRỐNG
  if (checkoutItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto font-sans px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-3xl">
          🛍️
        </div>
        <h2 className="text-lg font-bold text-gray-800">Chưa chọn sản phẩm thanh toán</h2>
        <p className="text-xs text-gray-500">
          Bạn chưa chọn sản phẩm nào trong giỏ hàng để tiến hành đặt hàng. Hãy chọn món bạn muốn mua nhé!
        </p>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${curr.btnPrimary} font-bold text-xs shadow-md`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại mua sắm</span>
        </Link>
      </div>
    );
  }

  // MÀN HÌNH THANH TOÁN CHUẨN SHOPEE MOBILE
  return (
    <div className="min-h-screen bg-transparent -mx-4 sm:-mx-6 lg:-mx-8 pb-24 font-sans">
      
      {/* 1. SHOPEE TOP APP BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 py-2.5 flex items-center justify-between shadow-2xs">
        <Link
          href="/cart"
          className={`flex items-center gap-1.5 text-gray-700 ${curr.hoverText} transition`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Thanh toán</span>
        </Link>
        <span className="text-[11px] text-gray-400 font-medium">Omachi Store</span>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto px-3 pt-3">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <form onSubmit={handleSubmitOrder} noValidate className="max-w-2xl mx-auto px-2 sm:px-4 py-2.5 space-y-2.5">
        
        {/* 2. SHOPEE ADDRESS CARD (Bì Thư Viền Ruy Băng) */}
        <div ref={addressSectionRef} className="bg-white rounded-lg shadow-2xs overflow-hidden border border-gray-100">
          {/* Top striped ribbon bar */}
          <div
            className="h-1 w-full"
            style={{
              background: curr.ribbonBg,
            }}
          />

          <div className="p-3.5 space-y-3">
            {/* Header / Click to toggle */}
            <div
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="flex items-start gap-2.5 cursor-pointer select-none"
            >
              <MapPin className={`w-4 h-4 ${curr.priceText} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Địa chỉ nhận hàng</span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span className={`${curr.priceText} font-semibold`}>{isEditingAddress ? 'Thu gọn' : 'Thay đổi'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isEditingAddress ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Collapsed Address Preview */}
                {!isEditingAddress && (
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{customer.fullName || '(Chưa có tên)'}</span>
                      <span className="text-xs text-gray-500 font-medium">({customer.phone || 'Chưa có SĐT'})</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {[specificAddress, selectedWard, selectedDistrict, selectedProvince].filter(Boolean).join(', ') || 'Chưa nhập địa chỉ chi tiết - Bấm để thêm'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Address Form */}
            {isEditingAddress && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={fullNameRef}
                      type="text"
                      placeholder="VD: Nguyễn Lan Anh"
                      value={customer.fullName}
                      onChange={(e) => {
                        setCustomer({ ...customer, fullName: e.target.value });
                        if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
                      }}
                      className={`w-full px-3 py-2 text-xs bg-gray-50 border ${
                        fieldErrors.fullName ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-200'
                      } rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}`}
                    />
                    {fieldErrors.fullName && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">⚠️ {fieldErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={phoneRef}
                      type="tel"
                      placeholder="VD: 0988123456"
                      value={customer.phone}
                      onChange={(e) => {
                        setCustomer({ ...customer, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      className={`w-full px-3 py-2 text-xs bg-gray-50 border ${
                        fieldErrors.phone ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-200'
                      } rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}`}
                    />
                    {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">⚠️ {fieldErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SearchableDropdown
                    label="Tỉnh / Thành phố"
                    required
                    placeholder="Chọn Tỉnh / TP..."
                    searchPlaceholder="🔍 Tìm tỉnh thành..."
                    value={selectedProvince}
                    onChange={(prov) => {
                      setSelectedProvince(prov);
                      setSelectedDistrict('');
                      if (fieldErrors.province) setFieldErrors((p) => ({ ...p, province: undefined }));
                    }}
                    options={VIETNAM_PROVINCES.map((p) => p.name)}
                    error={fieldErrors.province}
                    buttonRef={provinceRef}
                  />

                  <SearchableDropdown
                    label="Quận / Huyện"
                    required
                    placeholder={selectedProvince ? 'Chọn Quận / Huyện...' : 'Chọn Tỉnh trước'}
                    searchPlaceholder="🔍 Tìm quận huyện..."
                    disabled={!selectedProvince}
                    disabledText="Chọn Tỉnh trước"
                    value={selectedDistrict}
                    onChange={(dist) => {
                      setSelectedDistrict(dist);
                      if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: undefined }));
                    }}
                    options={currentDistricts}
                    error={fieldErrors.district}
                    buttonRef={districtRef}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Phường / Xã (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Phường Bến Nghé / Xã Hồng Quang..."
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Số nhà, tên ngõ đường <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={addressRef}
                      type="text"
                      placeholder="VD: Số 12, ngõ 85, phố Chùa Láng..."
                      value={specificAddress}
                      onChange={(e) => {
                        setSpecificAddress(e.target.value);
                        if (fieldErrors.specificAddress) setFieldErrors((p) => ({ ...p, specificAddress: undefined }));
                      }}
                      className={`w-full px-3 py-2 text-xs bg-gray-50 border ${
                        fieldErrors.specificAddress ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-200'
                      } rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}`}
                    />
                    {fieldErrors.specificAddress && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">⚠️ {fieldErrors.specificAddress}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (customer.fullName && customer.phone && selectedProvince && selectedDistrict && specificAddress) {
                        setIsEditingAddress(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. SHOPEE SHOP ITEMS CARD */}
        <div className="bg-white rounded-lg shadow-2xs p-3.5 space-y-3 border border-gray-100">
          {/* Shop Name Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className={`${curr.badgeBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs`}>
                Yêu thích
              </span>
              <span className="text-xs font-bold text-gray-900">🌸 Omachi Handmade Studio</span>
            </div>
            <span className="text-[11px] text-gray-400">{checkoutTotalItems} sản phẩm</span>
          </div>

          {/* Items list */}
          <div className="space-y-3 divide-y divide-gray-50">
            {checkoutItems.map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-start gap-2.5">
                <img
                  src={item.product?.images?.[0] || '/images/charm_feed_1.jpg'}
                  alt={item.product?.name || 'Sản phẩm'}
                  className="w-14 h-14 object-cover rounded-md border border-gray-100 shrink-0 bg-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-normal text-gray-900 line-clamp-1 leading-snug">
                    {item.product?.name}
                  </h4>
                  
                  {/* Variant Pill (Shopee gray badge) */}
                  <div className="mt-1">
                    <span className="inline-block bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-xs truncate max-w-full">
                      Phân loại: {item.selectedVariant?.name || 'Tiêu chuẩn'}
                      {item.selectedPackage ? ` • ${item.selectedPackage.name}` : ''}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-gray-900">{formatVND(item.unitPrice || item.product?.basePrice || 0)}</span>
                    <span className="text-[11px] text-gray-500 font-medium">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shopee Style Inline Message to Seller */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-700 shrink-0">Tin nhắn:</span>
            <input
              type="text"
              placeholder="Lưu ý cho Người bán (size tay, đổi charm...)"
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
              className="flex-1 text-xs text-right sm:text-left text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Shipping row: SPX Express */}
          <div className="pt-2.5 border-t border-gray-100 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">Phương thức vận chuyển</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  SPX Express (Nhanh) • Giao tận nơi COD
                </p>
                <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-amber-200">
                  Shop cân trọng lượng thực tế &amp; báo cước ưu đãi
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-900 shrink-0">₫0 (báo cước sau)</span>
          </div>
        </div>

        {/* 4. SHOPEE VOUCHER / DISCOUNT ROW */}
        {checkoutTotalSavings > 0 && (
          <div className="bg-white rounded-lg shadow-2xs p-3.5 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-2">
              <Tag className={`w-4 h-4 ${curr.priceText}`} />
              <span className="text-xs font-bold text-gray-900">Chiết khấu Combo / Mua sỉ</span>
            </div>
            <span className={`text-xs font-bold ${curr.priceText}`}>- {formatVND(checkoutTotalSavings)}</span>
          </div>
        )}

        {/* 6. SHOPEE SUMMARY RECEIPT (Chi tiết thanh toán) */}
        <div className="bg-white rounded-lg shadow-2xs p-3.5 space-y-2 border border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 pb-1">
            <ReceiptText className="w-3.5 h-3.5 text-gray-500" />
            <span>Chi tiết thanh toán</span>
          </div>

          <div className="flex justify-between">
            <span>Tổng tiền hàng:</span>
            <span className="text-gray-900 font-medium">
              {formatVND(checkoutSubtotal + checkoutTotalSavings)}
            </span>
          </div>

          {checkoutTotalSavings > 0 && (
            <div className={`flex justify-between ${curr.priceText}`}>
              <span>Tổng tiền giảm giá:</span>
              <span className="font-medium">- {formatVND(checkoutTotalSavings)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Tổng tiền phí vận chuyển:</span>
            <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100 text-[11px]">
              Shop báo cước sau khi cân
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-100 items-baseline">
            <span className="font-bold text-gray-900 text-xs">Tổng thanh toán:</span>
            <span className={`text-base font-black ${curr.priceText}`}>
              {formatVND(checkoutSubtotal)}
            </span>
          </div>
        </div>

        {/* Trust banner */}
        <div className="p-3 bg-emerald-50/60 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nhấn &quot;Đặt hàng&quot; đồng nghĩa với việc bạn đồng ý tuân theo Điều khoản Omachi</span>
        </div>

      </form>

      {/* 7. SHOPEE STICKY BOTTOM CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-2xl safe-area-bottom">
        <div className="max-w-2xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
          <div className="flex flex-col items-end sm:items-start flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-600">Tổng thanh toán:</span>
              <span className={`text-base sm:text-lg font-black ${curr.priceText}`}>
                {formatVND(checkoutSubtotal)}
              </span>
            </div>
            {checkoutTotalSavings > 0 && (
              <span className={`text-[10px] ${curr.priceText} font-semibold`}>
                Tiết kiệm {formatVND(checkoutTotalSavings)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSubmitOrder()}
            disabled={isSubmitting}
            className={`${curr.btnPrimary} font-bold px-8 py-3 rounded-lg text-sm transition transform active:scale-98 flex items-center justify-center min-w-[130px]`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              'Đặt hàng'
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
