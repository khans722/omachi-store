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
  Check,
  CreditCard,
  Download
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomer } from '@/context/CustomerContext';
import { VIETNAM_PROVINCES } from '@/data/vietnamAddress';
import { Order, ShopSettings } from '@/types';
import confetti from 'canvas-confetti';
import { removeVietnameseTones } from '@/lib/search';
import { calculateShippingFee } from '@/lib/utils';

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export type DropdownItem = string | { value: string; label?: string };

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
  options: DropdownItem[];
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

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        const raw = opt.toLowerCase();
        const unaccented = removeVietnameseTones(opt);
        const stripped = raw.replace(/^(tỉnh|thành phố|tp\.?|quận|huyện|thị xã|tx\.?|phường|xã|thị trấn|tt\.?)\s+/i, '');
        const strippedUnacc = removeVietnameseTones(stripped);
        return { value: opt, label: opt, subLabel: undefined, searchKey: `${raw} ${unaccented} ${stripped} ${strippedUnacc}` };
      }
      const rawText = opt.label || opt.value;
      const raw = rawText.toLowerCase();
      const unaccented = removeVietnameseTones(rawText);
      const stripped = raw.replace(/^(tỉnh|thành phố|tp\.?|quận|huyện|thị xã|tx\.?|phường|xã|thị trấn|tt\.?)\s+/i, '');
      const strippedUnacc = removeVietnameseTones(stripped);
      return { value: opt.value, label: opt.label || opt.value, subLabel: undefined, searchKey: `${raw} ${unaccented} ${stripped} ${strippedUnacc}` };
    });
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const qRaw = search.toLowerCase().trim();
    const qUnaccented = removeVietnameseTones(search);
    const qStripped = qRaw.replace(/^(tỉnh|thành phố|tp\.?|quận|huyện|thị xã|tx\.?|phường|xã|thị trấn|tt\.?)\s+/i, '').trim();
    const qStrippedUnacc = removeVietnameseTones(qStripped);
    return normalizedOptions.filter(
      (opt) =>
        opt.searchKey.includes(qRaw) ||
        opt.searchKey.includes(qUnaccented) ||
        (qStripped && opt.searchKey.includes(qStripped)) ||
        (qStrippedUnacc && opt.searchKey.includes(qStrippedUnacc))
    );
  }, [normalizedOptions, search]);


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
              placeholder={searchPlaceholder || 'Gõ tìm nhanh...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:bg-white focus:border-rose-400 font-medium text-gray-800"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] pointer-events-none">
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
                const isSelected = opt.value.toLowerCase() === value.toLowerCase().trim();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                      onSelectOption?.(opt.value);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="truncate block font-bold text-gray-900">{opt.label}</span>
                    </div>
                    {isSelected && <span className="text-rose-600 font-bold text-xs shrink-0 ml-1">✓</span>}
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

function OrderCountdownTimer({ createdAt }: { createdAt?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const baseTime = createdAt ? new Date(createdAt).getTime() : Date.now();
    const target = baseTime + 24 * 60 * 60 * 1000;

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (isExpired) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700 font-bold flex items-center justify-center gap-1.5">
        <span>⚠️ Đã quá thời hạn 24 giờ thanh toán (Đơn hàng đã tự động hủy)</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1.5 shadow-2xs">
      <div className="text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1.5">
        <span className="animate-pulse">⏳</span>
        <span>Thời gian còn lại để hoàn tất thanh toán:</span>
      </div>
      <div className="flex items-center justify-center gap-2 font-mono text-xl font-black text-amber-900">
        <div className="bg-white px-2.5 py-1 rounded-md shadow-xs border border-amber-200 text-center">
          <span>{pad(timeLeft.hours)}</span>
          <span className="block text-[8px] font-sans font-medium text-gray-500 uppercase tracking-tight">Giờ</span>
        </div>
        <span className="text-amber-500 font-bold">:</span>
        <div className="bg-white px-2.5 py-1 rounded-md shadow-xs border border-amber-200 text-center">
          <span>{pad(timeLeft.minutes)}</span>
          <span className="block text-[8px] font-sans font-medium text-gray-500 uppercase tracking-tight">Phút</span>
        </div>
        <span className="text-amber-500 font-bold">:</span>
        <div className="bg-white px-2.5 py-1 rounded-md shadow-xs border border-amber-200 text-center">
          <span>{pad(timeLeft.seconds)}</span>
          <span className="block text-[8px] font-sans font-medium text-gray-500 uppercase tracking-tight">Giây</span>
        </div>
      </div>
      <p className="text-[10px] text-amber-700 font-medium">
        Sau 24 giờ kể từ lúc đặt hàng, đơn chưa thanh toán sẽ tự động hủy trên hệ thống.
      </p>
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

  // Tính tổng cân nặng đơn hàng (đơn vị: gram, mặc định 50g nếu sản phẩm chưa config cân nặng)
  const checkoutTotalWeightGram = useMemo(() => {
    return checkoutItems.reduce((sum, it) => {
      const itemWeight = Number(it.product?.weight) > 0 ? Number(it.product.weight) : 50;
      return sum + it.quantity * itemWeight;
    }, 0);
  }, [checkoutItems]);

  // Tính cước vận chuyển chuẩn theo cân nặng & giá trị đơn hàng
  const shipInfo = useMemo(() => {
    return calculateShippingFee(checkoutTotalWeightGram, checkoutSubtotal);
  }, [checkoutTotalWeightGram, checkoutSubtotal]);

  const checkoutShippingFee = shipInfo.shippingFee;

  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    let localSaved: any = null;
    try {
      const cached = localStorage.getItem('omachi_shop_settings');
      if (cached) {
        localSaved = JSON.parse(cached);
        setSettings(localSaved);
      }
    } catch {}

    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          try {
            localStorage.setItem('omachi_shop_settings', JSON.stringify(res.data));
          } catch {}
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
  const [currentWards, setCurrentWards] = useState<string[]>([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const wardRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedProvince.trim()) {
      setCurrentWards([]);
      return;
    }

    let isMounted = true;
    setIsLoadingWards(true);

    const distQuery = selectedDistrict.trim() ? `&district=${encodeURIComponent(selectedDistrict)}` : '';
    fetch(`/api/address/wards?province=${encodeURIComponent(selectedProvince)}${distQuery}`)
      .then((r) => r.json())
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCurrentWards(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingWards(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvince, selectedDistrict]);
  const [specificAddress, setSpecificAddress] = useState('');

  // Payment method selection (Shopee style)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(() => {});
    }
  };

  const downloadQrImage = async (url: string, filename: string) => {
    setIsDownloadingQr(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    } finally {
      setIsDownloadingQr(false);
    }
  };

  // Freeship cấu hình theo settings (mặc định 1.000.000₫) khi thanh toán Chuyển Khoản VietQR
  const FREESHIP_THRESHOLD = Number(settings?.prepaidFreeShipThreshold) || 1000000;
  const isPrepaidFreeshipEnabled = settings?.enablePrepaidFreeShip !== false;
  const isOrderOverThreshold = checkoutSubtotal >= FREESHIP_THRESHOLD;
  const missingForFreeship = Math.max(0, FREESHIP_THRESHOLD - checkoutSubtotal);
  const isPrepaidFreeship = isPrepaidFreeshipEnabled && isOrderOverThreshold && (paymentMethod === 'BANK');
  const effectiveShippingFee = isPrepaidFreeship ? 0 : checkoutShippingFee;
  const checkoutFinalTotal = checkoutSubtotal + effectiveShippingFee;

  // Address edit toggle
  const isAddressComplete = Boolean(
    customer.fullName.trim() &&
    customer.phone.trim() &&
    selectedProvince.trim() &&
    selectedWard.trim() &&
    specificAddress.trim()
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Refs for validation focus
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<any>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const addressSectionRef = useRef<HTMLDivElement>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    province?: string;
    ward?: string;
    district?: string;
    specificAddress?: string;
  }>({});

  const [errorMessage, setErrorMessage] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  // Restore guest checkout shipping info from localStorage if available (GUESTS ONLY)
  useEffect(() => {
    if (!loggedInCustomer) {
      try {
        const cached = localStorage.getItem('omachi_checkout_shipping_info');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.fullName) setCustomer((prev) => ({ ...prev, fullName: prev.fullName || parsed.fullName }));
          if (parsed.phone) setCustomer((prev) => ({ ...prev, phone: prev.phone || parsed.phone }));
          if (parsed.selectedProvince) setSelectedProvince((prev) => prev || parsed.selectedProvince);
          if (parsed.selectedDistrict) setSelectedDistrict((prev) => prev || parsed.selectedDistrict);
          if (parsed.selectedWard) setSelectedWard((prev) => prev || parsed.selectedWard);
          if (parsed.specificAddress) setSpecificAddress((prev) => prev || parsed.specificAddress);

          const isSavedComplete = Boolean(
            parsed.fullName?.trim() &&
            parsed.phone?.trim() &&
            parsed.selectedProvince?.trim() &&
            parsed.selectedWard?.trim() &&
            parsed.specificAddress?.trim()
          );
          setIsEditingAddress(!isSavedComplete);
        } else {
          setIsEditingAddress(true);
        }
      } catch (e) {
        setIsEditingAddress(true);
      }
    }
  }, [loggedInCustomer]);

  // Auto save shipping info to localStorage for guest convenience ONLY
  useEffect(() => {
    try {
      if (!loggedInCustomer && (customer.fullName || customer.phone || specificAddress || selectedProvince)) {
        localStorage.setItem(
          'omachi_checkout_shipping_info',
          JSON.stringify({
            fullName: customer.fullName,
            phone: customer.phone,
            selectedProvince,
            selectedDistrict,
            selectedWard,
            specificAddress,
          })
        );
      }
    } catch (e) {}
  }, [loggedInCustomer, customer.fullName, customer.phone, selectedProvince, selectedDistrict, selectedWard, specificAddress]);

  // Reactive auto-clear error banner when customer fixes corresponding field
  useEffect(() => {
    if (customer.fullName.trim() && errorMessage.includes('họ và tên')) {
      setErrorMessage('');
    }
  }, [customer.fullName, errorMessage]);

  useEffect(() => {
    if (customer.phone.trim() && (errorMessage.includes('số điện thoại') || errorMessage.includes('10 số'))) {
      setErrorMessage('');
    }
  }, [customer.phone, errorMessage]);

  useEffect(() => {
    if (selectedProvince.trim() && errorMessage.includes('Tỉnh / Thành phố')) {
      setErrorMessage('');
    }
  }, [selectedProvince, errorMessage]);

  useEffect(() => {
    if (selectedWard.trim() && errorMessage.includes('Phường / Xã')) {
      setErrorMessage('');
    }
  }, [selectedWard, errorMessage]);

  useEffect(() => {
    if (specificAddress.trim() && errorMessage.includes('số nhà')) {
      setErrorMessage('');
    }
  }, [specificAddress, errorMessage]);

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

  const applySavedAddress = (addr: { id?: string; address: string; district?: string; city?: string; ward?: string }) => {
    setSelectedProvince(addr.city || '');
    setSelectedDistrict(addr.district || '');
    setSelectedWard((addr as any).ward || '');
    setSpecificAddress(addr.address || '');
  };

  useEffect(() => {
    if (loggedInCustomer) {
      // Purge any guest checkout residue from localStorage
      try { localStorage.removeItem('omachi_checkout_shipping_info'); } catch (e) {}

      // Prioritize account's name and phone
      setCustomer((prev) => ({
        ...prev,
        fullName: loggedInCustomer.fullName || '',
        phone: loggedInCustomer.phone || '',
      }));

      const hasValidSavedAddress = savedAddresses.length > 0;
      const hasProfileAddress = Boolean(loggedInCustomer.address && loggedInCustomer.address.trim());

      if (hasValidSavedAddress) {
        const defaultSaved = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        applySavedAddress(defaultSaved);
        setIsEditingAddress(false);
      } else if (hasProfileAddress) {
        setSelectedProvince(loggedInCustomer.city || '');
        setSelectedDistrict(loggedInCustomer.district || '');
        setSelectedWard((loggedInCustomer as any).ward || '');
        setSpecificAddress(loggedInCustomer.address || '');
        setIsEditingAddress(false);
      } else {
        // Brand new customer with NO saved address:
        // Clear all fields so user can enter their own address cleanly!
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setSpecificAddress('');
        setIsEditingAddress(true);
      }
    }
  }, [loggedInCustomer, savedAddresses]);

  const provinceOptions = useMemo(() => {
    return VIETNAM_PROVINCES.map((p) => ({
      value: p.name,
      label: p.name,
    }));
  }, []);

  const wardOptions = useMemo(() => {
    return currentWards.map((w) => ({
      value: w,
      label: w,
    }));
  }, [currentWards]);

  const currentProvinceData = useMemo(() => {
    if (!selectedProvince) return null;
    const clean = selectedProvince.trim().toLowerCase();
    return VIETNAM_PROVINCES.find(
      (p) =>
        p.name.toLowerCase() === clean ||
        p.name.toLowerCase().includes(clean) ||
        clean.includes(p.name.toLowerCase())
    );
  }, [selectedProvince]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [hasNotifiedPaid, setHasNotifiedPaid] = useState(false);

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

    if (!selectedWard.trim()) {
      errors.ward = 'Vui lòng chọn hoặc nhập Phường / Xã';
      setFieldErrors(errors);
      setErrorMessage('Vui lòng nhập hoặc chọn Phường / Xã nhận hàng');
      setIsEditingAddress(true);
      setTimeout(() => {
        wardRef.current?.focus();
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
        customerId: loggedInCustomer?.id || undefined,
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
        shippingFee: effectiveShippingFee,
        totalWeight: checkoutTotalWeightGram,
        discount: checkoutTotalSavings,
        totalAmount: checkoutFinalTotal,
        finalTotalAmount: checkoutFinalTotal,
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
        try {
          const orderWithCustomer = {
            ...data.data,
            customerId: data.data.customerId || loggedInCustomer?.id || undefined,
          };
          const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
          localStorage.setItem('omachi_customer_orders', JSON.stringify([orderWithCustomer, ...custOrders.filter((o: any) => o.id !== data.data.id)]));

          const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
          localStorage.setItem('omachi_admin_orders_v2', JSON.stringify([orderWithCustomer, ...adminOrders.filter((o: any) => o.id !== data.data.id)]));
        } catch (e) {}
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

  // MÀN HÌNH ĐÃ TẠO ĐƠN THÀNH CÔNG / CHỜ THANH TOÁN
  if (createdOrder) {
    const isPrepaidOrder = createdOrder.paymentMethod === 'BANK';
    const zaloShopPhone = (settings?.zaloPhone || '0375408256').replace(/[^0-9]/g, '');
    const prefilledMsg = encodeURIComponent(
      `Chào shop Omachi! Mình vừa đặt đơn #${createdOrder.code} (${createdOrder.items.reduce((s: number, i: any) => s + i.quantity, 0)} món). Mình nhắn qua để shop tư vấn thêm nhé! 💕`
    );
    const zaloShopUrl = `https://zalo.me/${zaloShopPhone}?text=${prefilledMsg}`;

    return (
      <div className="py-8 max-w-lg mx-auto space-y-4 font-sans px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center space-y-4">
          {isPrepaidOrder ? (
            <div className="space-y-2.5">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-xs border border-amber-200">
                ⏳
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  ĐANG CHỜ THANH TOÁN
                </span>
                <h2 className="text-xl font-black text-gray-900 pt-1">
                  Mã Đơn: #{createdOrder.code}
                </h2>
                <p className="text-xs text-gray-500">
                  Chào <strong>{createdOrder.customer.fullName}</strong>! Vui lòng quét mã bên dưới để thanh toán đơn hàng nhé!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-xs">
                ✨
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                  ĐẶT HÀNG THÀNH CÔNG
                </span>
                <h2 className="text-xl font-black text-gray-900 pt-1.5">
                  Mã Đơn: #{createdOrder.code}
                </h2>
                <p className="text-xs text-gray-500">
                  Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong> đã đặt hàng tại Omachi!
                </p>
              </div>
            </div>
          )}

          {/* Shopee Style Compact Receipt */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Tiền hàng tạm tính:</span>
              <strong className="text-gray-900 font-bold">
                {formatVND(createdOrder.subtotal || createdOrder.totalAmount || 0)}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phí vận chuyển:</span>
              {(createdOrder.shippingFee || 0) > 0 ? (
                <strong className="text-rose-600 font-bold">
                  +{formatVND(createdOrder.shippingFee)}
                </strong>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 line-through text-[11px]">15.000đ</span>
                  <strong className="text-emerald-600 font-bold text-xs">0đ</strong>
                </div>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Tổng thanh toán:</span>
              <strong className={`${curr.priceText} text-base font-black`}>
                {formatVND(createdOrder.finalTotalAmount || createdOrder.totalAmount)}
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
              <strong className="text-gray-800">
                {createdOrder.paymentMethod === 'BANK'
                  ? '💳 Chuyển khoản VietQR'
                  : '💵 COD (Khi nhận hàng)'}
              </strong>
            </div>
          </div>

          {/* 💳 VIETQR BANK PAYMENT BOX */}
          {createdOrder.paymentMethod === 'BANK' && (
            <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-4 text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                  QR
                </div>
                <div>
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-wider">
                    Chuyển Khoản Ngân Hàng (VietQR)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Quét mã VietQR bằng bất kỳ App ngân hàng nào (MB, VCB, BIDV, Techcombank...)
                  </p>
                </div>
              </div>

              {/* VietQR Dynamic Code */}
              <div className="bg-white p-3 rounded-xl border border-blue-200 flex flex-col items-center text-center space-y-2">
                <div className="relative p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                  {(() => {
                    const rawBank = (settings?.bankId || 'VCB').toUpperCase().trim();
                    const qrBank = rawBank.includes('VIETCOM') ? 'VCB' : rawBank.includes('MB') ? 'MB' : rawBank;
                    const qrUrl = `https://img.vietqr.io/image/${qrBank}-${settings?.bankAccount || '1018880066'}-compact2.png?amount=${
                      createdOrder.finalTotalAmount || createdOrder.totalAmount
                    }&addInfo=${encodeURIComponent(`DH ${createdOrder.code}`)}&accountName=${encodeURIComponent(
                      settings?.bankOwner || 'DUONG QUOC KHANH'
                    )}`;
                    return (
                      <>
                        <img
                          src={qrUrl}
                          alt="VietQR Chuyển khoản"
                          className="w-52 h-auto object-contain rounded-md"
                        />
                        <div className="mt-2 w-full">
                          <button
                            type="button"
                            disabled={isDownloadingQr}
                            onClick={() => downloadQrImage(qrUrl, `vietqr-omachi-${createdOrder.code}.png`)}
                            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isDownloadingQr ? 'Đang tải ảnh...' : '📥 Tải ảnh mã QR về máy (Để quét từ ảnh)'}</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  Mở App <strong>Ngân hàng bất kỳ</strong> hoặc <strong>Ví MoMo</strong> &gt; Chọn <strong>Quét mã QR</strong> để chuyển tiền nhanh tự động
                </p>

                {/* Hướng dẫn quét từ ảnh trên cùng 1 điện thoại */}
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 text-left space-y-1 w-full">
                  <p className="font-bold flex items-center gap-1 text-[11px] text-blue-800">
                    <span>💡</span>
                    <span>Thanh toán dễ dàng trên 1 chiếc điện thoại:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10.5px] text-blue-700 leading-relaxed">
                    <li>Bấm nút <strong>&quot;Tải ảnh mã QR về máy&quot;</strong> ở trên (hoặc chụp màn hình).</li>
                    <li>Mở App Ngân hàng hoặc MoMo &gt; Bấm <strong>Quét QR</strong>.</li>
                    <li>Chọn biểu tượng <strong>&quot;Ảnh / Thư viện&quot;</strong> để chọn mã vừa tải về là xong!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1 text-left">
            <p className="font-bold flex items-center gap-1 text-stone-900">
              <span>📦</span>
              <span>Shop đã nhận được đơn hàng tự động!</span>
            </p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Xưởng Omachi sẽ soạn hàng, đóng gói cẩn thận và liên hệ qua SĐT/Zalo của bạn để xác nhận đơn hàng sớm nhất nhé! 💕
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {isPrepaidOrder && !hasNotifiedPaid && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/orders', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: createdOrder.id,
                        paymentStatus: 'PAID'
                      })
                    });
                    setHasNotifiedPaid(true);
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                  } catch {
                    setHasNotifiedPaid(true);
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <span>✅ Tôi Đã Chuyển Khoản Xong</span>
              </button>
            )}

            {hasNotifiedPaid && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <span>🎉</span>
                <span>Đã ghi nhận thanh toán! Shop sẽ đối soát và xuất kho gửi bạn sớm nhất.</span>
              </div>
            )}

            <Link
              href="/"
              className={`w-full py-3 rounded-xl ${curr.btnPrimary} font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition active:scale-98`}
            >
              <span>🏠 Về Trang Chủ Tiếp Tục Mua Sắm</span>
            </Link>

            <Link
              href={loggedInCustomer ? '/tra-cuu-don-hang' : `/tra-cuu-don-hang?code=${encodeURIComponent(createdOrder.code)}`}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>{loggedInCustomer ? '📦 Xem Đơn Hàng Của Tôi' : '🔍 Tra Cứu Đơn Hàng'}</span>
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
        <div className="max-w-2xl mx-auto px-3 pt-3 animate-fade-in">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 flex items-center justify-between gap-2 shadow-xs animate-shake">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-md text-xs font-black transition"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <form onSubmit={handleSubmitOrder} noValidate className="max-w-2xl mx-auto px-2 sm:px-4 py-2.5 space-y-2.5">

        {/* 2. SHOPEE ADDRESS CARD */}
        <div ref={addressSectionRef} className="bg-white rounded-2xl shadow-2xs overflow-hidden border border-gray-100">
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
                      {[specificAddress, selectedWard, selectedProvince].filter(Boolean).join(', ') || 'Chưa nhập địa chỉ chi tiết - Bấm để thêm'}
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
                        const val = e.target.value;
                        setCustomer((prev) => ({ ...prev, fullName: val }));
                        if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
                        if (errorMessage && errorMessage.includes('họ và tên')) setErrorMessage('');
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
                        const val = e.target.value;
                        setCustomer((prev) => ({ ...prev, phone: val }));
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                        if (errorMessage && (errorMessage.includes('số điện thoại') || errorMessage.includes('10 số'))) setErrorMessage('');
                      }}
                      className={`w-full px-3 py-2 text-xs bg-gray-50 border ${
                        fieldErrors.phone ? 'border-rose-400 ring-1 ring-rose-200' : 'border-gray-200'
                      } rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}`}
                    />
                    {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">⚠️ {fieldErrors.phone}</p>}
                  </div>
                </div>

                {/* 2 CẤP HÀNH CHÍNH MỚI: TỈNH/THÀNH PHỐ VÀ PHƯỜNG/XÃ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SearchableDropdown
                    label="Tỉnh / Thành phố"
                    required
                    placeholder="Chọn Tỉnh / TP..."
                    searchPlaceholder="Tìm tỉnh thành (VD: Bắc Giang, Hà Nội...)"
                    value={selectedProvince}
                    onChange={(prov) => {
                      setSelectedProvince(prov);
                      setSelectedWard('');
                      if (fieldErrors.province) setFieldErrors((p) => ({ ...p, province: undefined }));
                      if (errorMessage && errorMessage.includes('Tỉnh')) setErrorMessage('');
                    }}
                    options={provinceOptions}
                    error={fieldErrors.province}
                    buttonRef={provinceRef}
                  />

                  {/* Phường / Xã / Thị trấn (Cấp 2 trực tiếp) */}
                  <SearchableDropdown
                    label="Phường / Xã / Thị trấn"
                    required
                    disabled={!selectedProvince}
                    disabledText="Chọn Tỉnh / TP trước..."
                    placeholder={
                      !selectedProvince
                        ? 'Chọn Tỉnh / TP trước...'
                        : isLoadingWards
                        ? 'Đang tải danh sách...'
                        : 'Chọn Phường / Xã...'
                    }
                    searchPlaceholder="Gõ tìm xã, phường, thị trấn..."
                    value={selectedWard}
                    onChange={(ward) => {
                      setSelectedWard(ward);
                      if (fieldErrors.ward) setFieldErrors((p) => ({ ...p, ward: undefined }));
                      if (errorMessage && errorMessage.includes('Phường')) setErrorMessage('');
                    }}
                    options={wardOptions}
                    error={fieldErrors.ward}
                    buttonRef={wardRef}
                  />
                </div>

                {/* Hàng 4: 1 DÒNG ĐỂ ĐIỀN TAY ĐỊA CHỈ CHI TIẾT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      Số nhà, tên ngõ, đường hoặc thôn/xóm <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Điền tay chi tiết</span>
                  </div>
                  <input
                    ref={addressRef}
                    type="text"
                    placeholder="VD: Thôn Giá, Xóm Đình (hoặc Số 12, ngõ 85, phố Chùa Láng...)"
                    value={specificAddress}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecificAddress(val);
                      if (fieldErrors.specificAddress) setFieldErrors((p) => ({ ...p, specificAddress: undefined }));
                      if (errorMessage && errorMessage.includes('số nhà')) setErrorMessage('');
                    }}
                    className={`w-full px-3 py-2.5 text-xs bg-gray-50 border ${
                      fieldErrors.specificAddress ? 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/20' : 'border-gray-200'
                    } rounded-lg font-medium text-gray-900 focus:outline-none focus:bg-white ${curr.focusBorder}`}
                  />
                  {fieldErrors.specificAddress && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">⚠️ {fieldErrors.specificAddress}</p>
                  )}
                </div>

                {/* Nút Thu gọn địa chỉ nhẹ nhàng */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Cuộn xuống để chọn thanh toán &amp; đặt hàng
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setErrorMessage('');
                    }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Thu gọn</span>
                    <span className="text-[10px]">▲</span>
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
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-800">Phương thức vận chuyển</span>
                <p className="text-[11px] text-gray-500 font-medium">
                  SPX Express • Giao tận nơi
                </p>
              </div>
            </div>
            {effectiveShippingFee === 0 ? (
              <span className="text-xs font-bold text-emerald-600 shrink-0">0đ</span>
            ) : (
              <span className="text-xs font-bold text-rose-600 shrink-0">+{formatVND(checkoutShippingFee)}</span>
            )}
          </div>
        </div>

        {/* 4. SHOPEE PAYMENT METHOD CARD */}
        <div className="bg-white rounded-lg shadow-2xs p-3.5 space-y-3 border border-gray-100">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-stone-700" />
              <span className="text-xs font-bold text-gray-900">Phương thức thanh toán</span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Option 1: COD */}
            <label
              onClick={() => setPaymentMethod('COD')}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                paymentMethod === 'COD'
                  ? 'bg-rose-50/40 border-rose-400 ring-1 ring-rose-200'
                  : 'bg-gray-50/60 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-400 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-[10px] text-gray-400 font-medium">Tiền mặt</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Thanh toán trực tiếp cho shipper khi nhận kiện hàng.
                  </p>
                  {isOrderOverThreshold && isPrepaidFreeshipEnabled && (
                    <p className="text-[10px] text-amber-700 font-bold mt-1 bg-amber-50 px-1.5 py-0.5 rounded inline-block border border-amber-200">
                      💡 Mẹo: Chuyển khoản hoặc MoMo để được MIỄN PHÍ SHIP 0đ (tiết kiệm {formatVND(checkoutShippingFee)})
                    </p>
                  )}
                </div>
              </div>
            </label>

            {/* Option 2: BANK TRANSFER */}
            <label
              onClick={() => setPaymentMethod('BANK')}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                paymentMethod === 'BANK'
                  ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-200'
                  : 'bg-gray-50/60 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'BANK'}
                  onChange={() => setPaymentMethod('BANK')}
                  className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-400 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-900">Chuyển khoản VietQR (Mọi App Ngân hàng &amp; Ví MoMo)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isOrderOverThreshold && isPrepaidFreeshipEnabled ? (
                      <strong className="text-emerald-700 font-bold">
                        Đơn từ {formatVND(FREESHIP_THRESHOLD)} được shop MIỄN 100% cước ship khi thanh toán chuyển khoản!
                      </strong>
                    ) : (
                      <span>Quét mã VietQR tiện lợi qua mọi App ngân hàng ({settings?.bankId || 'Vietcombank'}) hoặc App MoMo.</span>
                    )}
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 5. SHOPEE VOUCHER / DISCOUNT ROW */}
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

          <div className="flex justify-between items-center">
            <span>Tổng tiền phí vận chuyển:</span>
            {effectiveShippingFee === 0 ? (
              <span className="font-bold text-xs flex items-center gap-1.5">
                {checkoutShippingFee > 0 && (
                  <span className="line-through text-gray-400 font-normal">{formatVND(checkoutShippingFee)}</span>
                )}
                <span className="text-emerald-600 font-bold">0đ</span>
              </span>
            ) : (
              <span className="text-rose-600 font-bold text-xs">
                +{formatVND(checkoutShippingFee)}
              </span>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-100 items-baseline">
            <span className="font-bold text-gray-900 text-xs block">Tổng thanh toán:</span>
            <span className={`text-base font-black ${curr.priceText}`}>
              {formatVND(checkoutFinalTotal)}
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
                {formatVND(checkoutFinalTotal)}
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
