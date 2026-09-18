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
  Download,
  CheckCircle2,
  Loader2,
  Bookmark,
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

  // Freeship cấu hình hoàn toàn theo settings khi thanh toán Chuyển Khoản VietQR
  const FREESHIP_THRESHOLD = settings?.prepaidFreeShipThreshold !== undefined && settings?.prepaidFreeShipThreshold !== null
    ? Number(settings.prepaidFreeShipThreshold)
    : (settings?.freeShippingThreshold !== undefined && settings?.freeShippingThreshold !== null ? Number(settings.freeShippingThreshold) : 0);
  const isPrepaidFreeshipEnabled = settings?.enablePrepaidFreeShip !== false && FREESHIP_THRESHOLD > 0;
  const isOrderOverThreshold = FREESHIP_THRESHOLD > 0 && checkoutSubtotal >= FREESHIP_THRESHOLD;
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
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSavedNotice, setAddressSavedNotice] = useState(false);

  const savedAddresses = useMemo(() => {
    if (!loggedInCustomer) return [];
    if (loggedInCustomer.savedAddresses && loggedInCustomer.savedAddresses.length > 0) {
      return loggedInCustomer.savedAddresses;
    }
    if (loggedInCustomer.address) {
      return [{
        id: 'default-legacy',
        fullName: loggedInCustomer.fullName,
        phone: loggedInCustomer.phone,
        address: loggedInCustomer.address,
        ward: (loggedInCustomer as any).ward || '',
        district: loggedInCustomer.district || '',
        city: loggedInCustomer.city || '',
        isDefault: true,
      }];
    }
    return [];
  }, [loggedInCustomer]);

  const applySavedAddress = (addr: { id?: string; address: string; district?: string; city?: string; ward?: string; fullName?: string; phone?: string }) => {
    if (addr.fullName) setCustomer((prev) => ({ ...prev, fullName: addr.fullName || prev.fullName }));
    if (addr.phone) setCustomer((prev) => ({ ...prev, phone: addr.phone || prev.phone }));
    setSelectedProvince(addr.city || '');
    setSelectedDistrict(addr.district || '');
    setSelectedWard((addr as any).ward || '');
    setSpecificAddress(addr.address || '');
  };

  // 1. Khôi phục thông tin địa chỉ (ưu tiên tài khoản, sau đó đến bản nháp đã lưu)
  useEffect(() => {
    if (loggedInCustomer) {
      // Ưu tiên tên và SĐT từ tài khoản
      setCustomer((prev) => ({
        ...prev,
        fullName: loggedInCustomer.fullName || prev.fullName || '',
        phone: loggedInCustomer.phone || prev.phone || '',
      }));

      const hasValidSavedAddress = (loggedInCustomer.savedAddresses || []).length > 0;
      const hasProfileAddress = Boolean(loggedInCustomer.address && loggedInCustomer.address.trim());

      // Bản nháp gần nhất của tài khoản này
      let userDraft: any = null;
      try {
        const raw = localStorage.getItem(`omachi_customer_shipping_info_${loggedInCustomer.id}`);
        if (raw) userDraft = JSON.parse(raw);
      } catch (e) {}

      if (hasValidSavedAddress) {
        const defaultSaved = (loggedInCustomer.savedAddresses || []).find((a) => a.isDefault) || loggedInCustomer.savedAddresses![0];
        applySavedAddress(defaultSaved);
        setIsEditingAddress(false);
      } else if (hasProfileAddress) {
        setSelectedProvince(loggedInCustomer.city || '');
        setSelectedDistrict(loggedInCustomer.district || '');
        setSelectedWard((loggedInCustomer as any).ward || '');
        setSpecificAddress(loggedInCustomer.address || '');
        setIsEditingAddress(false);
      } else if (userDraft && userDraft.specificAddress && userDraft.selectedProvince) {
        if (userDraft.fullName) setCustomer((p) => ({ ...p, fullName: userDraft.fullName }));
        if (userDraft.phone) setCustomer((p) => ({ ...p, phone: userDraft.phone }));
        setSelectedProvince(userDraft.selectedProvince || '');
        setSelectedDistrict(userDraft.selectedDistrict || '');
        setSelectedWard(userDraft.selectedWard || '');
        setSpecificAddress(userDraft.specificAddress || '');

        const isComplete = Boolean(
          userDraft.fullName?.trim() &&
          userDraft.phone?.trim() &&
          userDraft.selectedProvince?.trim() &&
          userDraft.selectedWard?.trim() &&
          userDraft.specificAddress?.trim()
        );
        setIsEditingAddress(!isComplete);

        // Tự động đồng bộ lên tài khoản database nếu draft đã hoàn chỉnh
        if (isComplete && updateProfile) {
          updateProfile({
            fullName: userDraft.fullName?.trim(),
            phone: userDraft.phone?.trim(),
            address: userDraft.specificAddress?.trim(),
            city: userDraft.selectedProvince?.trim(),
            ward: userDraft.selectedWard?.trim(),
            district: userDraft.selectedDistrict?.trim(),
            saveNewAddress: {
              fullName: userDraft.fullName?.trim(),
              phone: userDraft.phone?.trim(),
              address: userDraft.specificAddress?.trim(),
              city: userDraft.selectedProvince?.trim(),
              ward: userDraft.selectedWard?.trim(),
              district: userDraft.selectedDistrict?.trim(),
              isDefault: true,
            },
          }).catch(() => {});
        }
      } else {
        // Nếu tài khoản mới chưa lưu địa chỉ, kiểm tra xem đã từng đặt đơn nào trước đây chưa
        try {
          const pastOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
          const myRecentOrder = pastOrders.find((o: any) => 
            (o.customerId && o.customerId === loggedInCustomer.id) ||
            (o.customer?.phone && loggedInCustomer.phone && o.customer.phone.replace(/[^0-9]/g, '') === loggedInCustomer.phone.replace(/[^0-9]/g, ''))
          );
          if (myRecentOrder && myRecentOrder.customer) {
            const oc = myRecentOrder.customer;
            if (oc.city) setSelectedProvince(oc.city);
            if (oc.district) setSelectedDistrict(oc.district);
            if (oc.ward) setSelectedWard(oc.ward);
            if (oc.specificAddress || oc.address) setSpecificAddress(oc.specificAddress || oc.address);
            if (oc.fullName) setCustomer((p) => ({ ...p, fullName: oc.fullName }));
            if (oc.phone) setCustomer((p) => ({ ...p, phone: oc.phone }));
            setIsEditingAddress(false);
          } else {
            setIsEditingAddress(true);
          }
        } catch (e) {
          setIsEditingAddress(true);
        }
      }
    } else {
      // Khách vãng lai: Khôi phục từ localStorage
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
  }, [loggedInCustomer?.id, loggedInCustomer?.address, loggedInCustomer?.savedAddresses?.length, loggedInCustomer?.city, (loggedInCustomer as any)?.ward]);

  // 2. Tự động ghi nhớ ngay lập tức khi khách gõ địa chỉ
  useEffect(() => {
    try {
      if (customer.fullName || customer.phone || specificAddress || selectedProvince || selectedWard) {
        const dataToSave = {
          fullName: customer.fullName,
          phone: customer.phone,
          selectedProvince,
          selectedDistrict,
          selectedWard,
          specificAddress,
        };
        if (loggedInCustomer?.id) {
          localStorage.setItem(`omachi_customer_shipping_info_${loggedInCustomer.id}`, JSON.stringify(dataToSave));
        } else {
          localStorage.setItem('omachi_checkout_shipping_info', JSON.stringify(dataToSave));
        }
      }
    } catch (e) {}
  }, [loggedInCustomer?.id, customer.fullName, customer.phone, selectedProvince, selectedDistrict, selectedWard, specificAddress]);

  // 3. Hàm Xác nhận & Lưu địa chỉ vào tài khoản
  const handleSaveAndConfirmAddress = async () => {
    const errors: any = {};
    if (!customer.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
    if (!customer.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(customer.phone.replace(/[^0-9]/g, ''))) errors.phone = 'Số điện thoại không hợp lệ (10 số)';
    if (!selectedProvince.trim()) errors.province = 'Vui lòng chọn Tỉnh / Thành phố';
    if (!selectedWard.trim()) errors.ward = 'Vui lòng chọn Phường / Xã';
    if (!specificAddress.trim()) errors.specificAddress = 'Vui lòng nhập số nhà, tên đường hoặc thôn xóm';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Vui lòng điền đầy đủ các mục địa chỉ bắt buộc (*)');
      return;
    }

    setFieldErrors({});
    setErrorMessage('');

    if (loggedInCustomer?.id && updateProfile) {
      setIsSavingAddress(true);
      try {
        await updateProfile({
          fullName: customer.fullName.trim(),
          address: specificAddress.trim(),
          city: selectedProvince.trim(),
          ward: selectedWard.trim(),
          district: selectedDistrict.trim(),
          saveNewAddress: {
            fullName: customer.fullName.trim(),
            phone: customer.phone.trim(),
            address: specificAddress.trim(),
            city: selectedProvince.trim(),
            ward: selectedWard.trim(),
            district: selectedDistrict.trim(),
            isDefault: saveAsDefault,
          },
        });
        setAddressSavedNotice(true);
        setTimeout(() => setAddressSavedNotice(false), 4000);
      } catch (err) {
        console.error('Lỗi khi lưu địa chỉ vào tài khoản:', err);
      } finally {
        setIsSavingAddress(false);
      }
    }

    try {
      const dataToSave = {
        fullName: customer.fullName,
        phone: customer.phone,
        selectedProvince,
        selectedDistrict,
        selectedWard,
        specificAddress,
      };
      if (loggedInCustomer?.id) {
        localStorage.setItem(`omachi_customer_shipping_info_${loggedInCustomer.id}`, JSON.stringify(dataToSave));
      } else {
        localStorage.setItem('omachi_checkout_shipping_info', JSON.stringify(dataToSave));
      }
    } catch (e) {}

    setIsEditingAddress(false);
  };

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

  // Polling tự động kiểm tra trạng thái thanh toán VietQR từ SePay
  useEffect(() => {
    if (!createdOrder) return;
    if (createdOrder.paymentMethod !== 'BANK') return;
    if (createdOrder.paymentStatus === 'PAID') return;

    let isMounted = true;
    const checkOrderPayment = async () => {
      try {
        const orderIdOrCode = createdOrder.id || createdOrder.code;
        const res = await fetch(`/api/orders/${encodeURIComponent(orderIdOrCode)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          const freshOrder = data.data;
          if (freshOrder.paymentStatus === 'PAID') {
            if (isMounted) {
              setCreatedOrder(freshOrder);
              try {
                const custOrders = JSON.parse(localStorage.getItem('omachi_customer_orders') || '[]');
                localStorage.setItem(
                  'omachi_customer_orders',
                  JSON.stringify([freshOrder, ...custOrders.filter((o: any) => o.id !== freshOrder.id)])
                );
                const adminOrders = JSON.parse(localStorage.getItem('omachi_admin_orders_v2') || '[]');
                localStorage.setItem(
                  'omachi_admin_orders_v2',
                  JSON.stringify([freshOrder, ...adminOrders.filter((o: any) => o.id !== freshOrder.id)])
                );
              } catch (e) {}

              // Chỉ bung pháo hoa khi thanh toán thành công
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.5 },
              });
            }
          }
        }
      } catch (err) {
        // silent
      }
    };

    const firstTimer = setTimeout(checkOrderPayment, 1200);
    const intervalId = setInterval(checkOrderPayment, 2500);

    return () => {
      isMounted = false;
      clearTimeout(firstTimer);
      clearInterval(intervalId);
    };
  }, [createdOrder?.id, createdOrder?.code, createdOrder?.paymentMethod, createdOrder?.paymentStatus]);

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

        // CHỈ BUNG PHÁO HOA KHI LÀ ĐƠN COD (ĐẶT XONG LÀ THÀNH CÔNG NGAY)
        // NẾU LÀ ĐƠN CHUYỂN KHOẢN VIETQR: CHỈ BUNG HOA KHI TIỀN VÀO TÀI KHOẢN THÀNH CÔNG
        if (paymentMethod === 'COD') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        if (loggedInCustomer && updateProfile) {
          updateProfile({
            fullName: customer.fullName.trim(),
            phone: customer.phone.trim(),
            address: specificAddress.trim(),
            ward: selectedWard.trim(),
            district: selectedDistrict.trim(),
            city: selectedProvince.trim(),
            saveNewAddress: {
              fullName: customer.fullName.trim(),
              phone: customer.phone.trim(),
              address: specificAddress.trim(),
              ward: selectedWard.trim(),
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
    const isAwaitingPayment = isPrepaidOrder && createdOrder.paymentStatus !== 'PAID';
    const zaloShopPhone = (settings?.zaloPhone || settings?.hotline || '').replace(/[^0-9]/g, '');
    const prefilledMsg = encodeURIComponent(
      `Chào shop Omachi! Mình vừa đặt đơn #${createdOrder.code} (${createdOrder.items.reduce((s: number, i: any) => s + i.quantity, 0)} món). Mình nhắn qua để shop tư vấn thêm nhé! 💕`
    );
    const zaloShopUrl = settings?.zaloOfficialUrl
      ? `${settings.zaloOfficialUrl}?text=${prefilledMsg}`
      : (zaloShopPhone ? `https://zalo.me/${zaloShopPhone}?text=${prefilledMsg}` : 'https://zalo.me');

    return (
      <div className="py-5 max-w-lg mx-auto space-y-3 font-sans px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center space-y-3.5">
          {isAwaitingPayment ? (
            /* ========================================================
               MÀN HÌNH CHUYỂN KHOẢN VIETQR: ĐƯA MÃ QR LÊN ĐẦU, TỐI ƯU KHÔNG GIAN
               ======================================================== */
            <div className="space-y-3">
              {/* 1. Header siêu gọn: 1 hàng duy nhất */}
              <div className="flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200/80 rounded-2xl text-left shadow-2xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-full shadow-2xs animate-pulse">
                      ⏳ Chờ chuyển khoản
                    </span>
                    <span className="text-xs font-black text-gray-900">
                      Đơn #{createdOrder.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    Khách hàng: <strong>{createdOrder.customer.fullName}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Số tiền cần chuyển</span>
                  <span className="text-base sm:text-lg font-black text-rose-600">
                    {formatVND(createdOrder.finalTotalAmount || createdOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* 2. KHUNG VIETQR NỔI BẬT ĐƯA LÊN VỊ TRÍ TRUNG TÂM (ABOVE THE FOLD) */}
              <div className="rounded-2xl border-2 border-blue-300/80 bg-gradient-to-b from-blue-50/40 via-white to-white p-3.5 sm:p-4 text-center space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-blue-100/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black flex items-center justify-center text-[10px] shadow-2xs">
                      QR
                    </div>
                    <span className="text-xs font-black text-blue-800 uppercase tracking-wide">
                      Quét mã VietQR Chuyển Tiền
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full">
                    Khớp tự động SePay
                  </span>
                </div>

                {/* QR Image Box */}
                {(() => {
                  const rawBank = (settings?.bankId || '').toUpperCase().trim();
                  const isVietin = rawBank.includes('VIETIN') || rawBank.includes('CTG') || rawBank.includes('ICB') || (settings?.bankAccount || '').trim() === '106873248315';
                  const qrBank = rawBank.includes('VIETCOM') ? 'VCB' : rawBank.includes('MB') ? 'MB' : isVietin ? 'ICB' : rawBank;
                  const bankAccount = (settings?.bankAccount || '').trim();
                  const bankOwner = (settings?.bankOwner || '').trim();
                  const transferContent = isVietin ? `SEVQR DH ${createdOrder.code}` : `DH ${createdOrder.code}`;

                  if (!bankAccount || !qrBank) {
                    return (
                      <div className="py-8 px-4 text-center space-y-2">
                        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-stone-500 font-medium">Đang tải mã thanh toán VietQR từ hệ thống...</p>
                      </div>
                    );
                  }

                  const qrUrl = `https://img.vietqr.io/image/${qrBank}-${bankAccount}-compact2.png?amount=${
                    createdOrder.finalTotalAmount || createdOrder.totalAmount
                  }&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(
                    bankOwner
                  )}`;

                  return (
                    <div className="space-y-2.5">
                      {/* Ảnh QR */}
                      <div className="inline-block p-2 bg-white rounded-xl border border-blue-200 shadow-xs">
                        <img
                          src={qrUrl}
                          alt="VietQR Chuyển khoản"
                          className="w-48 sm:w-52 h-auto object-contain mx-auto rounded-lg"
                        />
                      </div>

                      {/* Nút Tải ảnh QR */}
                      <div>
                        <button
                          type="button"
                          disabled={isDownloadingQr}
                          onClick={() => downloadQrImage(qrUrl, `vietqr-omachi-${createdOrder.code}.png`)}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isDownloadingQr ? 'Đang tải ảnh...' : '📥 Tải ảnh mã QR về máy (Để quét từ thư viện ảnh)'}</span>
                        </button>
                      </div>

                      {/* Bảng chi tiết chuyển khoản có nút Copy 1 chạm */}
                      <div className="grid grid-cols-2 gap-2 text-left pt-1">
                        {/* Ngân hàng */}
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200/80">
                          <span className="text-[10px] text-gray-500 block font-medium">Ngân hàng:</span>
                          <span className="text-xs font-bold text-gray-900 block truncate">
                            {rawBank || 'VietinBank'}
                          </span>
                        </div>

                        {/* Số tài khoản */}
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-gray-500 block font-medium">Số tài khoản:</span>
                            <span className="text-xs font-extrabold text-blue-700 font-mono block truncate">
                              {bankAccount}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankAccount, 'stk')}
                            className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded shrink-0 transition"
                          >
                            {copiedField === 'stk' ? '✓' : 'Copy'}
                          </button>
                        </div>

                        {/* Chủ tài khoản */}
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200/80">
                          <span className="text-[10px] text-gray-500 block font-medium">Chủ tài khoản:</span>
                          <span className="text-xs font-bold text-gray-900 block truncate">
                            {bankOwner || 'DUONG QUOC KHANH'}
                          </span>
                        </div>

                        {/* Nội dung CK */}
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-amber-800 block font-bold">Nội dung CK (bắt buộc):</span>
                            <span className="text-xs font-black text-rose-600 font-mono block truncate">
                              {transferContent}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(transferContent, 'nd')}
                            className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded shrink-0 transition"
                          >
                            {copiedField === 'nd' ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {/* Ghi chú mẹo thanh toán */}
                      <p className="text-[10.5px] text-stone-500 text-center font-medium">
                        💡 Mở App <strong>Ngân hàng</strong> &gt; Chọn <strong>Quét mã QR</strong> &gt; Tiền &amp; Nội dung được điền tự động 100%.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* 3. Khung Radar Tự Động Kiểm Tra Chuyển Khoản */}
              <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-left shadow-2xs">
                <div className="relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-blue-600/10 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-xs font-black text-blue-900">
                      Đang tự động kiểm tra chuyển khoản...
                    </p>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
                    Hệ thống sẽ <strong>tự động chuyển sang Đặt Hàng Thành Công</strong> ngay khi ngân hàng báo có tiền. Quý khách không cần thao tác thêm!
                  </p>
                </div>
              </div>

              {/* 4. Bộ đếm thời gian 24h */}
              <OrderCountdownTimer createdAt={createdOrder.createdAt} />

              {/* 5. Thông tin người nhận & Hóa đơn rút gọn */}
              <div className="p-3 rounded-xl bg-gray-50/90 border border-gray-200 text-xs text-left space-y-1.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-semibold text-[11px]">Thông tin nhận hàng:</span>
                  <span className="text-[11px] font-bold text-gray-800">
                    {createdOrder.customer.fullName} • {createdOrder.customer.phone}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 flex justify-between gap-2">
                  <span className="shrink-0 text-gray-500">Địa chỉ:</span>
                  <span className="text-right font-medium text-gray-800 truncate">
                    {createdOrder.customer.address}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Tiền hàng tạm tính:</span>
                  <strong className="text-gray-800">
                    {formatVND(createdOrder.subtotal || createdOrder.totalAmount || 0)}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  {(createdOrder.shippingFee || 0) > 0 ? (
                    <strong className="text-rose-600 font-bold">+{formatVND(createdOrder.shippingFee)}</strong>
                  ) : (
                    <span className="text-emerald-600 font-bold">Freeship (0đ)</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               MÀN HÌNH ĐẶT HÀNG / THANH TOÁN THÀNH CÔNG (COD HOẶC VIETQR ĐÃ PAID)
               ======================================================== */
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-xs">
                {createdOrder.paymentStatus === 'PAID' ? '🎉' : '✨'}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                  {createdOrder.paymentStatus === 'PAID'
                    ? '✅ ĐÃ THANH TOÁN THÀNH CÔNG (VIETQR)'
                    : '✨ ĐẶT HÀNG THÀNH CÔNG (COD)'}
                </span>
                <h2 className="text-xl font-black text-gray-900 pt-1">
                  Mã Đơn: #{createdOrder.code}
                </h2>
                <p className="text-xs text-gray-500">
                  {createdOrder.paymentStatus === 'PAID' ? (
                    <>Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong>! Omachi đã nhận đủ tiền thanh toán qua chuyển khoản ngân hàng.</>
                  ) : (
                    <>Cảm ơn bạn <strong>{createdOrder.customer.fullName}</strong> đã đặt hàng tại Omachi!</>
                  )}
                </p>
              </div>

              {/* Compact Receipt */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền hàng tạm tính:</span>
                  <strong className="text-gray-900">{formatVND(createdOrder.subtotal || createdOrder.totalAmount || 0)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  {(createdOrder.shippingFee || 0) > 0 ? (
                    <strong className="text-rose-600">+{formatVND(createdOrder.shippingFee)}</strong>
                  ) : (
                    <span className="text-emerald-600 font-bold">0đ (Miễn phí)</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-800">
                    {createdOrder.paymentStatus === 'PAID' ? 'Đã thanh toán (VietQR):' : 'Tổng thanh toán (COD):'}
                  </span>
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
              </div>

              {createdOrder.paymentStatus === 'PAID' ? (
                <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1 text-left">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <span>📦</span>
                    <span>Xưởng Omachi đã nhận đơn và tiền thanh toán!</span>
                  </p>
                  <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                    Đơn hàng <strong>#{createdOrder.code}</strong> đã được xác nhận thanh toán tự động qua VietQR. Xưởng Omachi đang chuẩn bị đóng gói và chuyển giao cho đơn vị vận chuyển sớm nhất nhé! 💕
                  </p>
                </div>
              ) : (
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1 text-left">
                  <p className="font-bold flex items-center gap-1.5 text-stone-900">
                    <span>📦</span>
                    <span>Shop đã nhận được đơn hàng của bạn!</span>
                  </p>
                  <p className="text-[11.5px] text-stone-600 leading-relaxed">
                    Xưởng Omachi sẽ soạn hàng, đóng gói cẩn thận và gọi xác nhận trước khi giao. Bạn thanh toán tiền mặt khi nhận hàng nhé! 💕
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Các nút điều hướng */}
          <div className="space-y-2 pt-1">
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
          {/* Top Shipping ribbon (Shopee envelope stripe) */}
          <div
            className="h-1.5 w-full"
            style={{
              backgroundImage: curr.ribbonBg,
            }}
          />

          <div className="p-3.5 space-y-3">
            {/* Header / Click to toggle */}
            <div
              onClick={() => {
                if (isEditingAddress) {
                  if (isAddressComplete) {
                    handleSaveAndConfirmAddress();
                  } else {
                    setIsEditingAddress(false);
                    setErrorMessage('');
                  }
                } else {
                  setIsEditingAddress(true);
                }
              }}
              className="flex items-start gap-2.5 cursor-pointer select-none group"
            >
              <MapPin className={`w-4 h-4 ${curr.priceText} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">Địa chỉ nhận hàng</span>
                    {loggedInCustomer && (
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                        Tài khoản
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 group-hover:opacity-80">
                    <span className={`${curr.priceText} font-semibold`}>{isEditingAddress ? 'Thu gọn' : 'Thay đổi'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isEditingAddress ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Collapsed Address Preview (Chuẩn Shopee) */}
                {!isEditingAddress && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-gray-900">
                        {customer.fullName || '(Chưa nhập tên người nhận)'}
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {customer.phone || '(Chưa có SĐT)'}
                      </span>
                      {isAddressComplete && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm">
                          Mặc định
                        </span>
                      )}
                      {loggedInCustomer && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-sm">
                          Đã lưu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      {[specificAddress, selectedWard, selectedProvince].filter(Boolean).join(', ') || (
                        <span className="text-rose-500 font-medium italic">
                          Chưa có địa chỉ chi tiết - Bấm &quot;Thay đổi&quot; để thêm địa chỉ nhận hàng
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Address Form */}
            {isEditingAddress && (
              <div className="space-y-3 pt-2 border-t border-gray-100 animate-fade-in">
                {/* Sổ địa chỉ đã lưu trong tài khoản nếu có */}
                {loggedInCustomer && savedAddresses.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        Sổ địa chỉ trong tài khoản ({savedAddresses.length}):
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">Bấm chọn nhanh</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                      {savedAddresses.map((addr, idx) => {
                        const isSelected =
                          specificAddress.trim().toLowerCase() === (addr.address || '').trim().toLowerCase() &&
                          selectedProvince.trim().toLowerCase() === (addr.city || '').trim().toLowerCase();
                        return (
                          <div
                            key={addr.id || idx}
                            onClick={() => applySavedAddress(addr)}
                            className={`p-2 rounded-lg border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-white border-emerald-500 ring-1 ring-emerald-400 shadow-xs'
                                : 'bg-white/90 border-amber-200/70 hover:bg-white hover:border-amber-400'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-gray-900">
                                  {addr.fullName || customer.fullName || 'Địa chỉ'}
                                </span>
                                {(addr.phone || customer.phone) && (
                                  <span className="text-[11px] text-gray-500">
                                    ({addr.phone || customer.phone})
                                  </span>
                                )}
                                {addr.isDefault && (
                                  <span className="px-1 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 truncate mt-0.5">
                                {[addr.address, (addr as any).ward, addr.district, addr.city].filter(Boolean).join(', ')}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

                {/* KHU VỰC LƯU & GHI NHỚ ĐỊA CHỈ (KHUNG ĐỎ ĐƯỢC KHOANH TRONG ẢNH) */}
                <div className="pt-1 space-y-2">
                  {/* Checkbox lưu mặc định */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="text-[11px] font-semibold text-gray-700">
                      {loggedInCustomer
                        ? 'Lưu làm địa chỉ nhận hàng mặc định trong tài khoản của bạn'
                        : 'Ghi nhớ thông tin địa chỉ này cho các lần mua sau'}
                    </span>
                  </label>

                  {/* Thông báo đã lưu thành công */}
                  {addressSavedNotice && (
                    <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✓ Đã lưu địa chỉ vào tài khoản thành công! Lần sau sẽ tự động điền sẵn. ✨</span>
                    </div>
                  )}

                  {/* Hàng nút hành động: Xác nhận & Lưu địa chỉ + Thu gọn */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveAndConfirmAddress}
                      disabled={isSavingAddress}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${curr.btnPrimary}`}
                    >
                      {isSavingAddress ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu địa chỉ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{loggedInCustomer ? 'Xác nhận & Lưu địa chỉ' : 'Xác nhận & Ghi nhớ địa chỉ'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isAddressComplete) {
                          handleSaveAndConfirmAddress();
                        } else {
                          setIsEditingAddress(false);
                          setErrorMessage('');
                        }
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>Thu gọn</span>
                      <span className="text-[10px]">▲</span>
                    </button>
                  </div>
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
                      💡 Mẹo: Chuyển khoản để được MIỄN PHÍ SHIP 0đ (tiết kiệm {formatVND(checkoutShippingFee)})
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
                    <span className="text-xs font-bold text-gray-900">Chuyển khoản VietQR (Mọi App Ngân hàng)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isOrderOverThreshold && isPrepaidFreeshipEnabled ? (
                      <strong className="text-emerald-700 font-bold">
                        Đơn từ {formatVND(FREESHIP_THRESHOLD)} được shop MIỄN 100% cước ship khi thanh toán chuyển khoản!
                      </strong>
                    ) : (
                      <span>Quét mã VietQR tiện lợi qua mọi App ngân hàng ({settings?.bankId || 'Vietcombank'}).</span>
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
