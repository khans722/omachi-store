'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Sparkles,
  MapPin,
  MessageCircle,
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
  curr,
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
  curr: any;
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
              setSearch('');
            }}
            className="text-[10px] text-pink-600 hover:text-pink-700 font-bold hover:underline"
          >
            📋 Chọn từ danh sách
          </button>
        </div>
        <input
          ref={buttonRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border ${
            error ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20' : ''
          } rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition`}
        />
        {error && (
          <p className="text-[10px] text-rose-500 font-semibold mt-1">⚠️ {error}</p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        <button
          type="button"
          onClick={() => setIsManualInput(true)}
          className="text-[10px] text-gray-400 hover:text-pink-600 font-medium"
        >
          ✍️ Tự gõ
        </button>
      </div>

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch('');
          }
        }}
        className={`w-full px-3.5 py-2.5 text-xs text-left ${curr.inputBg} border ${
          error ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20' : ''
        } rounded-xl font-bold transition flex items-center justify-between gap-2 shadow-2xs ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
            : 'hover:border-pink-300 focus:outline-none focus:ring-2'
        } ${value ? 'text-gray-800' : 'text-gray-400'}`}
      >
        <span className="truncate">
          {disabled ? disabledText || placeholder : value || placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
              }}
              className="p-0.5 hover:text-rose-500 rounded-full cursor-pointer text-xs"
              title="Xóa lựa chọn"
            >
              ✕
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-600' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {error && (
        <p className="text-[10px] text-rose-500 font-semibold mt-1">⚠️ {error}</p>
      )}

      {/* DROPDOWN POPUP ATTACHED DIRECTLY UNDERNEATH */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-2xl shadow-2xl border border-pink-200 p-2 space-y-2 animate-fade-in">
          {/* Quick Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder || '🔍 Gõ để tìm kiếm nhanh...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-pink-400 font-medium text-gray-800"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
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

          {/* List items */}
          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 pr-1 space-y-0.5 scrollbar-thin">
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-pink-100 text-pink-900 font-black'
                        : 'hover:bg-pink-50 hover:text-pink-700 text-gray-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="text-pink-600 font-black">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400 space-y-2">
                <p>Không tìm thấy &quot;{search}&quot;</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(search);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="px-3 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg font-bold text-[11px]"
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

  // Mặc định để trống hoàn toàn, không gán sẵn tỉnh thành
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');

  // Refs để tự động trỏ focus đến đúng ô bị lỗi
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<any>(null);
  const districtRef = useRef<any>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  // Quản lý lỗi chi tiết từng trường
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    province?: string;
    district?: string;
    specificAddress?: string;
  }>({});

  // Quản lý địa chỉ đã lưu cho tài khoản đăng nhập
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
        city: loggedInCustomer.city || '',
        isDefault: true,
      }];
    }
    return [];
  }, [loggedInCustomer]);

  const applySavedAddress = (addr: { id?: string; address: string; district?: string; city?: string }) => {
    if (addr.id) setSelectedSavedAddressId(addr.id);
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

  const handleSetDefaultSavedAddress = async (addrId: string) => {
    if (!loggedInCustomer) return;
    setSelectedSavedAddressId(addrId);
    await updateProfile({ setDefaultAddressId: addrId });
  };

  // Điền thông tin nếu khách đã đăng nhập
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

  // Lấy danh sách quận huyện tương ứng tỉnh được chọn (chỉ khi tỉnh có giá trị)
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

  const themeConfig = {
    green: {
      btnPrimary: 'bg-[#569440] hover:bg-[#467E33] shadow-emerald-200',
      priceColor: 'text-[#4A8537]',
      inputBg: 'bg-[#F2FAF0]/60 border-[#D1EAC7] focus:ring-[#569440]/30 focus:border-[#569440]',
      cardBorder: 'border-[#DDEFD7]',
      tagIcon: 'text-[#569440]',
      tagBadge: 'bg-[#F2FAF0] text-[#4A8537] border-[#D1EAC7]',
      linkBack: 'text-[#4A8537] hover:text-[#386D27]',
    },
    pink: {
      btnPrimary: 'bg-[#FF6B8B] hover:bg-[#E84878] shadow-pink-200',
      priceColor: 'text-[#E04573]',
      inputBg: 'bg-[#FFF0F5]/60 border-[#FFD0DE] focus:ring-[#FF6B8B]/30 focus:border-[#FF6B8B]',
      cardBorder: 'border-[#FFD6E4]',
      tagIcon: 'text-[#FF6B8B]',
      tagBadge: 'bg-[#FFF0F5] text-[#D84A74] border-[#FFD0DE]',
      linkBack: 'text-[#D84A74] hover:text-[#B82255]',
    },
    purple: {
      btnPrimary: 'bg-[#8E6ADF] hover:bg-[#7952C4] shadow-purple-200',
      priceColor: 'text-[#784EC9]',
      inputBg: 'bg-[#F8F4FF]/60 border-[#DFD1FC] focus:ring-[#8E6ADF]/30 focus:border-[#8E6ADF]',
      cardBorder: 'border-[#E6D8FD]',
      tagIcon: 'text-[#8E6ADF]',
      tagBadge: 'bg-[#F8F4FF] text-[#784EC9] border-[#DFD1FC]',
      linkBack: 'text-[#784EC9] hover:text-[#5829A8]',
    },
    cream: {
      btnPrimary: 'bg-[#E59530] hover:bg-[#CC7D1A] shadow-amber-200',
      priceColor: 'text-[#BA6C0D]',
      inputBg: 'bg-[#FFFBF2]/60 border-[#FCE1B4] focus:ring-[#E59530]/30 focus:border-[#E59530]',
      cardBorder: 'border-[#FBE5BD]',
      tagIcon: 'text-[#E59530]',
      tagBadge: 'bg-[#FFFBF2] text-[#BA6C0D] border-[#FCE1B4]',
      linkBack: 'text-[#BA6C0D] hover:text-[#8E4D00]',
    },
  };

  const curr = themeConfig[theme] || themeConfig.green;

  // Validation rõ ràng từng trường & tự động trỏ đến ô bị lỗi
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!customer.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên của bạn';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập họ và tên của bạn');
      fullNameRef.current?.focus();
      fullNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    const rawPhone = customer.phone.trim().replace(/[^0-9]/g, '');
    const vnPhoneRegex = /^(0|84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!rawPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại để shop liên hệ giao hàng';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập số điện thoại nhận hàng');
      phoneRef.current?.focus();
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    } else if (!vnPhoneRegex.test(rawPhone)) {
      errors.phone = 'Số điện thoại chưa đúng định dạng (cần 10 số, VD: 0988123456)';
      setFieldErrors(errors);
      setErrorMessage('Số điện thoại chưa đúng định dạng (cần 10 số, VD: 0988123456)');
      phoneRef.current?.focus();
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!selectedProvince.trim()) {
      errors.province = 'Vui lòng chọn hoặc nhập Tỉnh / Thành phố';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng chọn Tỉnh / Thành phố nhận hàng');
      provinceRef.current?.focus();
      provinceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!selectedDistrict.trim()) {
      errors.district = 'Vui lòng chọn hoặc nhập Quận / Huyện / Thị xã';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng chọn Quận / Huyện nhận hàng');
      districtRef.current?.focus();
      districtRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!specificAddress.trim()) {
      errors.specificAddress = 'Vui lòng nhập số nhà, tên đường hoặc thôn/xóm';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập số nhà, ngõ xóm hoặc địa chỉ cụ thể');
      addressRef.current?.focus();
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage('Bạn chưa chọn sản phẩm nào trong giỏ để đặt hàng!');
      return false;
    }

    setFieldErrors({});
    setErrorMessage('');
    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
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
        paymentMethod: 'COD' as const,
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
        const errorMsg = data.message || 'Không thể tạo đơn hàng, vui lòng kiểm tra lại thông tin.';
        setErrorMessage(errorMsg);
        if (errorMsg.toLowerCase().includes('số điện thoại')) {
          setFieldErrors({ phone: errorMsg });
          phoneRef.current?.focus();
        }
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
      <div className="py-10 max-w-xl mx-auto space-y-6 animate-fade-in font-sans">
        <div className={`bg-white rounded-3xl border ${curr.cardBorder} shadow-xl p-6 sm:p-8 text-center space-y-5`}>
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-200">
            🌸
          </div>

          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${curr.tagBadge} px-3.5 py-1 rounded-full border`}>
              ĐÃ GỬI ĐƠN HÀNG THÀNH CÔNG ✨
            </span>
            <h2 className="text-2xl font-black text-gray-800 pt-2 font-sans">
              Mã Đơn: #{createdOrder.code}
            </h2>
            <p className="text-xs text-gray-500">
              Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong> đã tin tưởng đặt hàng tại Omachi!
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${curr.cardBorder} bg-emerald-50/20 text-xs text-left space-y-2.5`}>
            <div className="flex justify-between">
              <span className="text-gray-500">Tiền hàng tạm tính:</span>
              <strong className="text-gray-800 text-sm font-black">
                {formatVND(createdOrder.subtotal || createdOrder.totalAmount || 0)}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phí vận chuyển (SPX):</span>
              <strong className="text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                Shop cân thực tế &amp; báo sau
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

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5 text-left">
            <p className="font-extrabold flex items-center gap-1.5 text-emerald-800">
              <span>📦</span>
              <span>Shop đã nhận được đơn hàng tự động qua hệ thống!</span>
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Xưởng Omachi sẽ soạn hàng, đóng gói cẩn thận và cân khối lượng thực tế. Sau đó shop sẽ liên hệ qua SĐT / Zalo của bạn để báo cước ship SPX chính xác nhất và gửi hàng nhé!
            </p>
          </div>

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
      <div className="py-20 text-center space-y-4 max-w-md mx-auto font-sans">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
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
    <div className="max-w-5xl mx-auto py-6 px-3 sm:px-6 space-y-5 animate-fade-in font-sans">
      
      {/* Top Breadcrumb */}
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
        <h1 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
          <span>Xác Nhận Đơn Hàng</span>
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        </h1>
        <p className="text-xs text-gray-500">
          Xác nhận thông tin nhận hàng để xưởng Omachi chuẩn bị và đóng gói đơn hàng handmade cho bạn ✨
        </p>
      </div>

      {/* Global Error Banner if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
        
        {/* Balanced 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (7/12): Thông tin người nhận & Địa chỉ & Thẻ SPX */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Box 1: Thông tin người nhận */}
            <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${curr.cardBorder} shadow-xs space-y-4`}>
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className={curr.tagIcon}>👤</span>
                <span>1. Thông Tin Người Nhận</span>
              </h3>

              {/* Họ tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Họ và tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={fullNameRef}
                    type="text"
                    placeholder="VD: Nguyễn Lan Anh"
                    value={customer.fullName}
                    onChange={(e) => {
                      setCustomer({ ...customer, fullName: e.target.value });
                      if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border ${
                      fieldErrors.fullName ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20' : ''
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Số điện thoại / Zalo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    placeholder="VD: 0988123456"
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer({ ...customer, phone: e.target.value });
                      if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border ${
                      fieldErrors.phone ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20' : ''
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* BỘ CHỌN ĐỊA CHỈ THÔNG MINH */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                
                {/* Form nhập/chọn địa chỉ 3 cấp */}
                <div className="space-y-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Địa chỉ giao hàng chuẩn SPX Express <span className="text-rose-500">*</span></span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Tự do gõ hoặc chọn</span>
                  </div>

                  {/* Hàng 1: Tỉnh / Thành phố (50%) + Quận / Huyện / Thị xã (50%) - CHUẨN DROPDOWN GẮN LIỀN Ô NHẬP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Tỉnh / Thành phố */}
                    <SearchableDropdown
                      label="Tỉnh / Thành phố"
                      required
                      placeholder="Chọn Tỉnh / Thành phố..."
                      searchPlaceholder="🔍 Gõ tên tỉnh (VD: Hà Nội, Hà Nam, TP.HCM)..."
                      value={selectedProvince}
                      onChange={(prov) => {
                        setSelectedProvince(prov);
                        setSelectedDistrict(''); // TUYỆT ĐỐI KHÔNG CHỌN BỪA HUYỆN
                        if (fieldErrors.province) setFieldErrors((prev) => ({ ...prev, province: undefined }));
                      }}
                      options={VIETNAM_PROVINCES.map((p) => p.name)}
                      error={fieldErrors.province}
                      buttonRef={provinceRef}
                      curr={curr}
                    />

                    {/* 2. Quận / Huyện / Thị xã */}
                    <SearchableDropdown
                      label="Quận / Huyện / Thị xã"
                      required
                      placeholder={selectedProvince ? "Chọn Quận / Huyện / Thị xã..." : "Vui lòng chọn Tỉnh/Thành trước"}
                      searchPlaceholder="🔍 Gõ tên quận/huyện..."
                      disabled={!selectedProvince}
                      disabledText="⚠️ Vui lòng chọn Tỉnh/Thành trước"
                      value={selectedDistrict}
                      onChange={(dist) => {
                        setSelectedDistrict(dist);
                        if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: undefined }));
                      }}
                      options={currentDistricts}
                      error={fieldErrors.district}
                      buttonRef={districtRef}
                      curr={curr}
                    />
                  </div>

                  {/* Hàng 2: Phường / Xã / Thị trấn (100% full width) */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 block mb-1">
                      Phường / Xã / Thị trấn
                    </span>
                    <input
                      type="text"
                      placeholder="Nhập Phường/Xã (hoặc tên xã cũ nếu vừa sáp nhập)..."
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs ${curr.inputBg} border rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition`}
                    />
                  </div>

                  {/* Ghi chú sáp nhập địa giới */}
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">💡</span>
                    <span>
                      <strong>Hỗ trợ sáp nhập địa giới:</strong> Nếu địa phương của bạn vừa sáp nhập xã/phường/huyện, bạn có thể tự do gõ tên mới hoặc ghi kèm tên cũ để bưu tá SPX giao hàng nhanh chóng và chuẩn xác nhất!
                    </span>
                  </div>

                  {/* Hàng 3: Số nhà, tên ngõ đường */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 block mb-1">
                      Số nhà, tên ngõ, đường hoặc thôn/xóm <span className="text-rose-500">*</span>
                    </span>
                    <input
                      ref={addressRef}
                      type="text"
                      placeholder="VD: Thôn Giá, Xóm Đình (hoặc Số 18 Ngõ 65...)"
                      value={specificAddress}
                      onChange={(e) => {
                        setSpecificAddress(e.target.value);
                        if (fieldErrors.specificAddress) setFieldErrors((prev) => ({ ...prev, specificAddress: undefined }));
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs ${curr.inputBg} border ${
                        fieldErrors.specificAddress ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20' : ''
                      } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-gray-800 transition`}
                    />
                    {fieldErrors.specificAddress && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">
                        ⚠️ {fieldErrors.specificAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Xem trước địa chỉ vận đơn */}
                {(specificAddress || selectedDistrict || selectedProvince) && (
                  <div className="p-2.5 bg-pink-50/40 rounded-xl border border-pink-100 text-[11px] text-gray-600 flex items-start gap-1.5">
                    <span className="font-bold text-rose-600 shrink-0">📍 Vận đơn:</span>
                    <span className="font-medium text-gray-800">
                      {[specificAddress.trim(), selectedWard.trim(), selectedDistrict.trim(), selectedProvince.trim()].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
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

            {/* Box 2: THẺ GIAO HÀNG SPX & CAM KẾT (KÉO XUỐNG CỘT TRÁI ĐỂ 2 BÊN CÂN BẰNG) */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 border border-orange-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-orange-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                    SPX
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800">Giao Hàng SPX Express</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                        Cân thực tế
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Khu vực: <strong className="text-gray-800">{selectedProvince || "Toàn quốc"}</strong> • Giao tận nơi COD
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between gap-0.5">
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    Báo cước sau khi cân
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Theo trọng lượng thực</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 bg-white/80 p-2.5 rounded-2xl border border-orange-100 flex items-center gap-1.5">
                <span>📦</span>
                <span>Đơn charm / hạt vòng handmade có cân nặng khác nhau (từ vài chục gram đến vài kg). Shop sẽ đóng gói cân trực tiếp để áp mức phí ship rẻ nhất và báo lại bạn trước khi giao.</span>
              </p>
            </div>

          </div>

          {/* CỘT PHẢI (5/12): Chi Tiết Tiền Hàng & Nút Đặt Hàng COD */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${curr.cardBorder} shadow-sm space-y-4`}>
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className={curr.tagIcon}>🛍️</span>
                <span>Chi Tiết Tiền Hàng ({checkoutTotalItems} món)</span>
              </h3>

              {/* Danh sách sản phẩm */}
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

                    {/* Phân loại con */}
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

              {/* Bảng tính tiền */}
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

                {/* Phí ship */}
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

              {/* Nút Đặt Hàng COD: Đã tách xuống 2 dòng rõ ràng theo yêu cầu của bạn */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl ${curr.btnPrimary} text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition transform active:scale-98 cursor-pointer`}
              >
                {isSubmitting ? (
                  <span>Đang tạo đơn hàng...</span>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <ShoppingBag className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="font-extrabold text-sm sm:text-base tracking-wide">Đặt Hàng Ngay</span>
                      <span className="text-[11px] sm:text-xs font-semibold opacity-90">(Thanh Toán COD)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </div>
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

            {/* Quy trình xử lý đơn hàng */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>🌿 Quy Trình Xử Lý Đơn Hàng</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-stone-600 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Bạn bấm <strong>&quot;Đặt Hàng Ngay&quot;</strong>, đơn tự động gửi về shop.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Shop soạn hàng, đóng gói hộp quà và cân khối lượng thực tế.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Shop liên hệ báo cước ship SPX ưu đãi và bàn giao bưu tá giao tận tay bạn.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
}
