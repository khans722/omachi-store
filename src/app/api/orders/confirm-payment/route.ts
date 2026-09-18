import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // TÍNH NĂNG DUYỆT 1-CHẠM NGOÀI BỊ VÔ HIỆU HÓA THEO YÊU CẦU BẢO MẬT CỦA SHOP
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thao tác không được phép</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff1f2; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #fff; max-width: 480px; width: 100%; padding: 36px 28px; border-radius: 28px; text-align: center; box-shadow: 0 20px 40px -15px rgba(225, 29, 72, 0.15); border: 1px solid #fecdd3; }
    .icon { width: 72px; height: 72px; background: #ffe4e6; color: #e11d48; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 38px; margin: 0 auto 20px; }
    h1 { color: #881337; font-size: 20px; font-weight: 900; margin: 0 0 10px; }
    p { color: #4b5563; font-size: 13.5px; line-height: 1.6; margin: 0 0 22px; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: #fff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 13px; box-shadow: 0 8px 18px rgba(225, 29, 72, 0.25); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⛔</div>
    <h1>THAO TÁC KHÔNG ĐƯỢC PHÉP</h1>
    <p>Để đảm bảo an ninh dòng tiền, tính năng duyệt thanh toán qua liên kết ngoài không được phép hoạt động.<br/>
    Vui lòng đăng nhập vào <b>Trang Quản Trị Shop</b> bằng mã PIN để kiểm tra hoặc để hệ thống ngân hàng <b>SePay tự động đối soát</b>.</p>
    <a href="/admin" class="btn">Đến Trang Quản Trị Shop</a>
  </div>
</body>
</html>`,
    { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
