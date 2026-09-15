'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, ProductVariant, ProductPackageOption } from '@/types';
import { formatVND } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Star, ArrowLeft, Plus, Minus, MessageCircle, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, setIsCartOpen, totalItems } = useCart();

  const productId = params?.id as string;
  const initialFound = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
  const [product, setProduct] = useState<Product | undefined>(initialFound);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState<ProductPackageOption | undefined>(
    initialFound?.packageOptions?.[0] || undefined
  );
  const [variantError, setVariantError] = useState(false);
  const [packageError, setPackageError] = useState(false);
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>(
    initialFound?.images?.[0] || 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&auto=format&fit=crop&q=80'
  );
  const [isAddedToast, setIsAddedToast] = useState(false);

  // Shopee Mobile Sheet Modal State
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetAction, setMobileSheetAction] = useState<'cart' | 'buy'>('cart');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  const zaloPhone = settings?.hotline || '0339798083';
  const zaloUrl = `https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}`;

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data) {
          const found = data.data.find((p: Product) => p.id === productId || p.slug === productId);
          if (found) {
            setProduct(found);
            if (found.images && found.images[0]) {
              setSelectedImage(found.images[0]);
            }
            if (found.packageOptions && found.packageOptions.length > 0 && !selectedPackage) {
              setSelectedPackage(found.packageOptions[0]);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLatest();
  }, [productId]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-gray-500">Mẫu charm hoặc phụ kiện này có thể đã hết hàng hoặc đổi link.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    );
  }

  // Clear unit price: packageOption price > variant price > product basePrice
  const unitPrice = selectedPackage?.price ?? selectedVariant?.price ?? product.basePrice;
  const totalPrice = unitPrice * quantity;

  // Price range calculation for initial display (Shopee style e.g. 9.923 - 31.020 đ)
  const allPrices = [];
  if (product.basePrice) allPrices.push(product.basePrice);
  if (product.packageOptions) product.packageOptions.forEach((p) => p.price && allPrices.push(p.price));
  if (product.variants) product.variants.forEach((v) => v.price && allPrices.push(v.price));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceDisplay =
    selectedPackage || selectedVariant
      ? formatVND(unitPrice)
      : minPrice !== maxPrice
      ? `${formatVND(minPrice)} - ${formatVND(maxPrice)}`
      : formatVND(product.basePrice);

  const totalStockCount =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
      : product.stock || 0;

  const maxAvailable =
    selectedVariant?.stock !== undefined ? Math.max(0, selectedVariant.stock) : product.stock || 9999;

  const validateSelection = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setVariantError(true);
      setWarningToast('⚠️ Vui lòng chọn Phân loại (Màu sắc / Mẫu) trước nhé!');
      setTimeout(() => setWarningToast(null), 3000);
      variantSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (product.packageOptions && product.packageOptions.length > 0 && !selectedPackage) {
      setPackageError(true);
      setWarningToast('⚠️ Vui lòng chọn Kích cỡ / Quy cách đóng gói!');
      setTimeout(() => setWarningToast(null), 3000);
      return false;
    }

    if (selectedVariant && (selectedVariant.stock ?? 0) <= 0) {
      setWarningToast(`⚠️ Mẫu "${selectedVariant.name}" hiện đã hết hàng, vui lòng chọn mẫu khác nhé!`);
      setTimeout(() => setWarningToast(null), 3000);
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    let finalQty = quantity;
    if (selectedVariant && selectedVariant.stock !== undefined && quantity > selectedVariant.stock) {
      finalQty = Math.max(1, selectedVariant.stock);
      setQuantity(finalQty);
    }

    addItem(product, finalQty, selectedVariant, customNote, selectedPackage);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    let finalQty = quantity;
    if (selectedVariant && selectedVariant.stock !== undefined && quantity > selectedVariant.stock) {
      finalQty = Math.max(1, selectedVariant.stock);
      setQuantity(finalQty);
    }

    addItem(product, finalQty, selectedVariant, customNote, selectedPackage);
    router.push('/checkout');
  };

  return (
    <div className="py-4 sm:py-6 space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* Toast feedback (Success) */}
      {isAddedToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce-slow">
          <Check className="w-4 h-4" />
          <span>Đã thêm vào giỏ hàng thành công! ✨</span>
        </div>
      )}

      {/* Toast feedback (Warning / Validation) */}
      {warningToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-rose-400 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-rose-600">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-rose-600 font-semibold">{product.categoryName}</span>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-6 space-y-3">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-pink-50 border border-pink-100 shadow-md">
            <img
              src={selectedImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/charm_feed_1.jpg';
              }}
              className="w-full h-full object-cover object-center"
            />
            {product.isHot && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                🔥 BÁN CHẠY NHẤT
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === img
                      ? 'border-rose-500 shadow-sm scale-105'
                      : 'border-pink-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/charm_feed_1.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Config & Buy Form (SHOPEE STYLE) */}
        <div className="md:col-span-6 space-y-5">
          <div>
            <span className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {product.categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 mt-2 leading-snug">
              {product.name}
            </h1>

            {/* Rating, Sold count & Stock Badge */}
            <div className="flex items-center flex-wrap gap-2.5 mt-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-gray-800">{product.rating || 5.0}</span>
                <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount || 0})</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">
                Đã bán: <strong className="text-gray-800 font-bold">{product.soldCount}</strong>
              </span>
              <span className="text-gray-300">•</span>
              {totalStockCount > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>
                    Sẵn hàng trong kho:{' '}
                    <strong className="text-emerald-800 font-black">{totalStockCount.toLocaleString('vi-VN')}</strong> cái
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Tạm thời hết hàng</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Tag (Shopee Style) */}
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#ee4d2d]">{priceDisplay}</span>
            {product.originalPrice && unitPrice < product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Variant Selection (SHOPEE STYLE - Group 1: Màu sắc / Phân loại) */}
          {product.variants && product.variants.length > 0 && (
            <div
              ref={variantSectionRef}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-300 ${
                variantError
                  ? 'bg-rose-50/70 border-2 border-[#ee4d2d] ring-4 ring-rose-200 shadow-md'
                  : 'bg-stone-50/60 border border-stone-200/80'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-xs text-gray-500 font-bold min-w-[70px] pt-1.5">Màu Sắc:</span>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const vStock = v.stock ?? 0;
                      const isOutOfStock = vStock <= 0;

                      if (isOutOfStock) {
                        return (
                          <div
                            key={v.id}
                            title={`Mẫu "${v.name}" tạm thời hết hàng`}
                            className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-400 text-xs flex items-center gap-1.5 opacity-45 line-through select-none cursor-not-allowed"
                          >
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover grayscale opacity-50" />
                            )}
                            <span>{v.name}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedVariant(undefined);
                            } else {
                              setSelectedVariant(v);
                              setVariantError(false);
                              if (v.image || v.imageUrl) {
                                setSelectedImage(v.image || v.imageUrl || selectedImage);
                              }
                              if (quantity > vStock && vStock > 0) {
                                setQuantity(vStock);
                              }
                            }
                          }}
                          className={`relative px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 select-none overflow-hidden ${
                            isSelected
                              ? 'border-2 border-[#ee4d2d] text-[#ee4d2d] bg-white font-black shadow-xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d] hover:bg-rose-50/30'
                          }`}
                        >
                          {v.imageUrl ? (
                            <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover shrink-0" />
                          ) : v.colorHex ? (
                            <span
                              className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-transform ${
                                isSelected ? 'border-[#ee4d2d] scale-110' : 'border-black/10'
                              }`}
                              style={{ backgroundColor: v.colorHex }}
                            />
                          ) : null}
                          <span>{v.name}</span>

                          {/* Shopee Selected Triangle Ribbon with Checkmark */}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent border-b-[#ee4d2d] border-r-[#ee4d2d] border-b-[12px] border-r-[12px]" />
                              <svg
                                className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedVariant ? (
                    <p className="text-[11px] text-gray-500 pt-0.5">
                      Đã chọn: <strong className="text-[#ee4d2d] font-bold">{selectedVariant.name}</strong> • Còn{' '}
                      <strong className="text-emerald-700 font-bold">{selectedVariant.stock?.toLocaleString('vi-VN')}</strong> cái
                    </p>
                  ) : variantError ? (
                    <p className="text-xs text-[#ee4d2d] font-bold flex items-center gap-1 animate-pulse pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Vui lòng chọn một phân loại trước khi tiếp tục</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Package Selection (SHOPEE STYLE - Group 2: Kích cỡ / Quy cách nếu có) */}
          {product.packageOptions && product.packageOptions.length > 0 && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-300 ${
                packageError
                  ? 'bg-rose-50/70 border-2 border-[#ee4d2d] ring-4 ring-rose-200 shadow-md'
                  : 'bg-stone-50/60 border border-stone-200/80'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-xs text-gray-500 font-bold min-w-[70px] pt-1.5">Quy Cách:</span>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.packageOptions.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            setSelectedPackage(isSelected ? undefined : pkg);
                            setPackageError(false);
                          }}
                          className={`relative px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 select-none overflow-hidden ${
                            isSelected
                              ? 'border-2 border-[#ee4d2d] text-[#ee4d2d] bg-white font-black shadow-xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d] hover:bg-rose-50/30'
                          }`}
                        >
                          <span>{pkg.name}</span>
                          {pkg.price && (
                            <span className="text-[10px] text-gray-400 font-normal">({formatVND(pkg.price)})</span>
                          )}

                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent border-b-[#ee4d2d] border-r-[#ee4d2d] border-b-[12px] border-r-[12px]" />
                              <svg
                                className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector (SHOPEE STYLE - Clean & Simple) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-xs text-gray-500 font-bold min-w-[70px]">Số Lượng:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#ee4d2d] border-r border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max={maxAvailable > 0 ? maxAvailable : 1}
                value={quantity}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value) || 1;
                  if (selectedVariant && maxAvailable > 0 && parsed > maxAvailable) {
                    setQuantity(maxAvailable);
                    setWarningToast(`Kho chỉ còn ${maxAvailable} cái cho phân loại này.`);
                    setTimeout(() => setWarningToast(null), 2500);
                  } else {
                    setQuantity(Math.max(1, parsed));
                  }
                }}
                className="w-14 h-8 text-center text-xs font-black text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                disabled={selectedVariant !== undefined && quantity >= maxAvailable}
                onClick={() => {
                  if (selectedVariant && quantity >= maxAvailable) {
                    setWarningToast(`Màu này chỉ còn tối đa ${maxAvailable} cái trong kho.`);
                    setTimeout(() => setWarningToast(null), 2500);
                    return;
                  }
                  setQuantity(quantity + 1);
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#ee4d2d] border-l border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-xs text-gray-500">
              <strong className="text-gray-800 font-bold">{maxAvailable.toLocaleString('vi-VN')}</strong> sản phẩm có sẵn
            </span>
          </div>

          {/* Custom Note */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs text-gray-500 font-bold min-w-[70px]">Ghi Chú:</span>
            <input
              type="text"
              placeholder="Lưu ý cho shop (VD: cỡ tay 15cm, đổi charm...)"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-rose-200 text-gray-700 transition"
            />
          </div>

          {/* Action Buttons - Desktop & Tablet (SHOPEE STYLE) */}
          <div className="hidden md:flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="min-w-[190px] h-12 px-6 rounded-xl border-2 border-[#ee4d2d] bg-[#fef0ee] hover:bg-[#fde2de] text-[#ee4d2d] font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition transform active:scale-98"
            >
              <ShoppingBag className="w-5 h-5 text-[#ee4d2d]" />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="min-w-[170px] h-12 px-8 rounded-xl bg-[#ee4d2d] hover:bg-[#d73211] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition transform active:scale-98"
            >
              <span>Mua Ngay</span>
            </button>
          </div>

          {/* Description & Specifications */}
          <div className="pt-4 border-t border-pink-100 space-y-3 text-xs text-gray-600 leading-relaxed">
            <h4 className="font-bold text-gray-800">Thông tin chi tiết sản phẩm:</h4>

            <div className="grid grid-cols-2 gap-2 bg-pink-50/40 p-3 rounded-2xl border border-pink-100 text-[11px]">
              {product.sku && (
                <div>
                  <span className="text-gray-400 block">Mã SKU:</span>
                  <strong className="font-mono text-gray-800">{product.sku}</strong>
                </div>
              )}
              {product.material && (
                <div>
                  <span className="text-gray-400 block">Chất liệu:</span>
                  <strong className="text-gray-800">{product.material}</strong>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <span className="text-gray-400 block">Kích thước:</span>
                  <strong className="text-gray-800">{product.dimensions}</strong>
                </div>
              )}
              <div className="bg-white/80 p-2 rounded-xl border border-pink-100">
                <span className="text-gray-500 block font-medium">📦 Tồn kho sẵn:</span>
                <strong className="text-emerald-700 font-extrabold text-xs">
                  {(product.stock || 0).toLocaleString('vi-VN')} sản phẩm
                </strong>
              </div>
            </div>

            <p className="pt-1">{product.description}</p>

            {/* Purchase Policies Trust Box */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-pink-50/60 to-rose-50/40 border border-pink-100 space-y-2.5">
              <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <span>🎀 Cam Kết &amp; Chính Sách Mua Hàng Tại Tiệm</span>
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <span className="text-sm">📦</span>
                  <span>Đồng kiểm khi nhận hàng</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <span className="text-sm">🔄</span>
                  <span>Đổi trả 1-1 trong 48h</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <span className="text-sm">🎀</span>
                  <span>100% Ảnh thật handmade</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <span className="text-sm">🚚</span>
                  <span>Gói quà pastel &amp; ship nhanh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (SHOPEE STYLE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl flex items-stretch h-14">
        {/* Chat Zalo */}
        <a
          href={zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center px-3.5 text-[10px] text-gray-600 hover:text-blue-600 border-r border-gray-100 shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-blue-500 mb-0.5" />
          <span>Chat Zalo</span>
        </a>

        {/* Giỏ Hàng Icon */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center px-3.5 text-[10px] text-gray-600 hover:text-[#ee4d2d] border-r border-gray-100 shrink-0"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-[#ee4d2d]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ee4d2d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="mt-0.5">Giỏ hàng</span>
        </button>

        {/* Thêm Vào Giỏ */}
        <button
          type="button"
          onClick={() => {
            setMobileSheetAction('cart');
            setIsMobileSheetOpen(true);
          }}
          className="flex-1 bg-[#fef0ee] hover:bg-[#fde2de] text-[#ee4d2d] font-bold text-xs flex flex-col items-center justify-center active:bg-rose-100 transition px-2"
        >
          <span>Thêm Vào Giỏ</span>
        </button>

        {/* Mua Ngay */}
        <button
          type="button"
          onClick={() => {
            setMobileSheetAction('buy');
            setIsMobileSheetOpen(true);
          }}
          className="flex-1 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-black text-xs flex flex-col items-center justify-center active:brightness-95 transition px-2 shadow-sm"
        >
          <span>Mua Ngay</span>
          <span className="text-[10px] font-normal opacity-90">{formatVND(totalPrice)}</span>
        </button>
      </div>

      {/* SHOPEE MOBILE BOTTOM SHEET DRAWER (EXACT MATCH TO REFERENCE SCREENSHOTS) */}
      {isMobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsMobileSheetOpen(false)} />

          <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col z-10 shadow-2xl animate-slide-up pb-safe">
            {/* Header: Product Preview & Close Button */}
            <div className="p-3.5 border-b border-gray-100 flex items-start gap-3 relative">
              <div className="relative w-22 h-22 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-8 pt-0.5">
                <p className="text-xl font-black text-[#ee4d2d] leading-tight">{priceDisplay}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Kho: <strong className="text-gray-800 font-bold">{maxAvailable.toLocaleString('vi-VN')}</strong>
                </p>
                {(selectedVariant || selectedPackage) && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    Đã chọn:{' '}
                    <span className="font-bold text-[#ee4d2d]">
                      {[selectedVariant?.name, selectedPackage?.name].filter(Boolean).join(' • ')}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Options */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[55vh]">
              {/* Group 1: Màu sắc / Phân loại */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700">Màu sắc:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const vStock = v.stock ?? 0;
                      const isOutOfStock = vStock <= 0;

                      if (isOutOfStock) {
                        return (
                          <div
                            key={v.id}
                            className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-400 text-xs flex items-center gap-1.5 opacity-45 line-through select-none"
                          >
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover grayscale opacity-50" />
                            )}
                            <span>{v.name}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedVariant(undefined);
                            } else {
                              setSelectedVariant(v);
                              setVariantError(false);
                              if (v.image || v.imageUrl) setSelectedImage(v.image || v.imageUrl || selectedImage);
                              if (quantity > vStock && vStock > 0) setQuantity(vStock);
                            }
                          }}
                          className={`relative px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 select-none overflow-hidden transition ${
                            isSelected
                              ? 'border-2 border-[#ee4d2d] text-[#ee4d2d] bg-white font-black'
                              : 'border-transparent bg-[#f5f5f5] text-gray-700 active:bg-gray-200'
                          }`}
                        >
                          {v.imageUrl ? (
                            <img src={v.imageUrl} alt={v.name} className="w-5 h-5 rounded object-cover shrink-0" />
                          ) : v.colorHex ? (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          ) : null}
                          <span>{v.name}</span>

                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent border-b-[#ee4d2d] border-r-[#ee4d2d] border-b-[12px] border-r-[12px]" />
                              <svg
                                className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Kích cỡ / Quy cách */}
              {product.packageOptions && product.packageOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700">Kích cỡ / Quy cách:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.packageOptions.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            setSelectedPackage(isSelected ? undefined : pkg);
                            setPackageError(false);
                          }}
                          className={`relative px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 select-none overflow-hidden transition ${
                            isSelected
                              ? 'border-2 border-[#ee4d2d] text-[#ee4d2d] bg-white font-black'
                              : 'border-transparent bg-[#f5f5f5] text-gray-700 active:bg-gray-200'
                          }`}
                        >
                          <span>{pkg.name}</span>
                          {pkg.price && (
                            <span className="text-[10px] text-gray-400 font-normal">({formatVND(pkg.price)})</span>
                          )}

                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden pointer-events-none">
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-l-transparent border-b-[#ee4d2d] border-r-[#ee4d2d] border-b-[12px] border-r-[12px]" />
                              <svg
                                className="absolute bottom-[0.5px] right-[0.5px] w-2 h-2 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 3: Số lượng */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={maxAvailable > 0 ? maxAvailable : 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 h-8 text-center text-xs font-black text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={selectedVariant !== undefined && quantity >= maxAvailable}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 4: Custom Note */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block">Ghi chú custom:</label>
                <input
                  type="text"
                  placeholder="VD: Cỡ tay 15cm, đổi charm..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>
            </div>

            {/* Footer Confirm Button (Full Width Shopee Red) */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => {
                  if (!validateSelection()) return;
                  setIsMobileSheetOpen(false);
                  if (mobileSheetAction === 'buy') {
                    handleBuyNow();
                  } else {
                    handleAddToCart();
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d73211] active:bg-[#c22d0f] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition active:scale-98"
              >
                {mobileSheetAction === 'buy' ? (
                  <span>Mua Ngay ({formatVND(totalPrice)})</span>
                ) : (
                  <span>Thêm Vào Giỏ Hàng ({formatVND(totalPrice)})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
