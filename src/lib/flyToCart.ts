/**
 * Omachi Store - Fly-To-Cart Animation
 * Hiệu ứng hình ảnh sản phẩm bay theo quỹ đạo parabol lượn vào giỏ hàng
 * kèm hiệu ứng nảy giỏ (bounce) và pháo hoa lấp lánh (sparkles) khi tiếp đất.
 */

export function createCartSparkleBurst(x: number, y: number) {
  if (typeof window === 'undefined') return;

  const sparkles = ['✨', '🌸', '⭐', '💫', '🎀', '🍬'];
  const count = 6;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.innerHTML = sparkles[i % sparkles.length];
    star.style.position = 'fixed';
    star.style.zIndex = '99999';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.pointerEvents = 'none';
    star.style.fontSize = `${12 + Math.random() * 6}px`;
    star.style.userSelect = 'none';
    star.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    star.style.opacity = '1';
    star.style.transform = 'translate(-50%, -50%) scale(0.5)';

    document.body.appendChild(star);

    // Random burst angle and distance
    const angle = (i * (360 / count) + Math.random() * 20) * (Math.PI / 180);
    const distance = 25 + Math.random() * 30;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    requestAnimationFrame(() => {
      star.style.opacity = '0';
      star.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.2) rotate(${Math.random() * 90}deg)`;
    });

    setTimeout(() => {
      star.remove();
    }, 550);
  }
}

export function flyToCart(
  source: Element | HTMLElement | { x: number; y: number } | React.MouseEvent<any> | MouseEvent | any,
  imageUrl: string
) {
  try {
    if (typeof window === 'undefined') return;

  // 1. Xác định toạ độ xuất phát (startX, startY)
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (source && typeof source === 'object') {
    try {
      if (typeof (source as HTMLElement).getBoundingClientRect === 'function') {
        const rect = (source as HTMLElement).getBoundingClientRect();
        if (rect && (rect.width > 0 || rect.height > 0 || rect.top !== 0 || rect.left !== 0)) {
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }
      } else if (typeof (source as MouseEvent).clientX === 'number' && typeof (source as MouseEvent).clientY === 'number') {
        startX = (source as MouseEvent).clientX;
        startY = (source as MouseEvent).clientY;
      } else if (typeof (source as { x: number; y: number }).x === 'number' && typeof (source as { x: number; y: number }).y === 'number') {
        startX = (source as { x: number; y: number }).x;
        startY = (source as { x: number; y: number }).y;
      }
    } catch (_) {}
  }

  // Fallback nếu không phải số hữu hạn
  if (!Number.isFinite(startX)) startX = window.innerWidth / 2;
  if (!Number.isFinite(startY)) startY = window.innerHeight / 2;

  // 2. Tìm toạ độ đích (Icon Giỏ Hàng)
  let targetX = window.innerWidth - 60;
  let targetY = 40;
  let targetEl: HTMLElement | null = null;

  // Ưu tiên thanh điều hướng đáy di động nếu đang hiển thị
  const bottomCart = document.getElementById('bottom-cart-btn');
  if (bottomCart) {
    try {
      const rect = bottomCart.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetEl = bottomCart;
      }
    } catch (_) {}
  }

  // Nếu không thấy đáy di động, tìm giỏ hàng trên Navbar (Desktop hoặc Mobile Header)
  if (!targetEl) {
    const navCart = document.getElementById('navbar-cart-btn');
    if (navCart) {
      try {
        const rect = navCart.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
          targetEl = navCart;
        }
      } catch (_) {}
    }
  }

  // Hoặc giỏ hàng dính ở trang chi tiết sản phẩm
  if (!targetEl) {
    const stickyCart = document.getElementById('product-sticky-cart-btn');
    if (stickyCart) {
      try {
        const rect = stickyCart.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
          targetEl = stickyCart;
        }
      } catch (_) {}
    }
  }

  if (!Number.isFinite(targetX)) targetX = window.innerWidth - 60;
  if (!Number.isFinite(targetY)) targetY = 40;

  // 3. Tạo phần tử ảnh bay (Flyer)
  const flyer = document.createElement('div');
  flyer.className = 'fly-to-cart-element';
  flyer.style.position = 'fixed';
  flyer.style.zIndex = '999999';
  flyer.style.left = '0px';
  flyer.style.top = '0px';
  flyer.style.width = '60px';
  flyer.style.height = '60px';
  flyer.style.borderRadius = '18px';
  flyer.style.overflow = 'hidden';
  flyer.style.pointerEvents = 'none';
  flyer.style.boxShadow = '0 10px 25px -3px rgba(255, 107, 139, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.95)';
  flyer.style.border = '2px solid rgba(255, 255, 255, 0.95)';
  flyer.style.backgroundColor = '#ffffff';
  flyer.style.willChange = 'transform, opacity';
  flyer.style.transform = `translate3d(${startX - 30}px, ${startY - 30}px, 0) scale(1)`;

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Sản phẩm';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '16px';
    flyer.appendChild(img);
  } else {
    const icon = document.createElement('div');
    icon.innerHTML = '🌸';
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.fontSize = '24px';
    flyer.appendChild(icon);
  }

  // Huy hiệu nhỏ xinh lấp lánh ở góc ảnh bay
  const badge = document.createElement('div');
  badge.innerHTML = '✨';
  badge.style.position = 'absolute';
  badge.style.top = '-3px';
  badge.style.right = '-3px';
  badge.style.fontSize = '11px';
  badge.style.background = 'linear-gradient(135deg, #FF6B8B, #FF8E53)';
  badge.style.borderRadius = '50%';
  badge.style.width = '18px';
  badge.style.height = '18px';
  badge.style.display = 'flex';
  badge.style.alignItems = 'center';
  badge.style.justifyContent = 'center';
  badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  badge.style.border = '1.5px solid #fff';
  flyer.appendChild(badge);

  document.body.appendChild(flyer);

  // 4. Lập trình quỹ đạo parabol ném bóng vút lên rồi rơi xuống giỏ
  const duration = 720; // 0.72 giây, tốc độ mắt người nhìn thấy đã nhất
  const startTime = performance.now();

  // Đỉnh cong parabol: uốn vồng lên trên cao
  const controlX = (startX + targetX) / 2;
  const controlY = Math.min(startY, targetY) - Math.max(120, Math.abs(targetY - startY) * 0.45);

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);

    // Bézier bậc 2: B(t) = (1-t)^2 * P0 + 2(1-t)t * P_ctrl + t^2 * P_end
    const t = progress;
    const invT = 1 - t;

    const currentX = invT * invT * startX + 2 * invT * t * controlX + t * t * targetX;
    const currentY = invT * invT * startY + 2 * invT * t * controlY + t * t * targetY;

    // Thu nhỏ dần từ 1.0 về 0.18 khi chạm giỏ
    const scale = 1 - 0.82 * Math.pow(t, 0.8);
    // Nghiêng xoay nhẹ từ -12deg sang +18deg
    const rotate = -12 + 30 * t;
    // Mờ dần ở 15% thời gian cuối
    const opacity = t > 0.85 ? (1 - t) / 0.15 : 1;

    flyer.style.transform = `translate3d(${currentX - 30}px, ${currentY - 30}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    flyer.style.opacity = `${opacity}`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Kết thúc bay: xoá flyer
      flyer.remove();

      // Hiệu ứng giỏ hàng nảy tưng tưng (Bounce)
      if (targetEl) {
        targetEl.classList.remove('animate-cart-bounce');
        void targetEl.offsetWidth; // force reflow
        targetEl.classList.add('animate-cart-bounce');
        setTimeout(() => {
          targetEl?.classList.remove('animate-cart-bounce');
        }, 700);

        // Nổ pháo hoa hạt sparkle xinh xắn
        createCartSparkleBurst(targetX, targetY);
      }
    }
  }

    requestAnimationFrame(animate);
  } catch (err) {
    console.error('[FLY TO CART ERROR]:', err);
  }
}
