import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    if (!phone && !id) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin tra cứu khách hàng' }, { status: 400 });
    }

    const customer = id ? await db.customers.getById(id) : await db.customers.findByPhone(phone!);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thông tin khách hàng' }, { status: 404 });
    }

    const safeCustomer = { ...customer };
    delete safeCustomer.password;

    return NextResponse.json({ success: true, data: safeCustomer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, fullName, address, district, city, email, password, savedAddresses, saveNewAddress, setDefaultAddressId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    const currentCustomer = await db.customers.getById(id);
    if (!currentCustomer) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (password && password.trim().length >= 4) updateData.password = password.trim();
    if (savedAddresses && Array.isArray(savedAddresses)) updateData.savedAddresses = savedAddresses;

    // Chức năng: Lưu thêm 1 địa chỉ mới vào danh sách
    if (saveNewAddress && saveNewAddress.address) {
      const list = [...(currentCustomer.savedAddresses || [])];
      const isDefault = saveNewAddress.isDefault !== false || list.length === 0;
      if (isDefault) {
        list.forEach((a) => { a.isDefault = false; });
        updateData.address = saveNewAddress.address.trim();
        updateData.district = (saveNewAddress.district || '').trim();
        updateData.city = (saveNewAddress.city || 'Bắc Giang').trim();
      }
      list.push({
        id: `addr-${Date.now()}`,
        address: saveNewAddress.address.trim(),
        district: (saveNewAddress.district || '').trim(),
        city: (saveNewAddress.city || 'Bắc Giang').trim(),
        isDefault,
        createdAt: new Date().toISOString(),
      });
      updateData.savedAddresses = list;
    }

    // Chức năng: Đổi địa chỉ nào đó làm mặc định
    if (setDefaultAddressId && currentCustomer.savedAddresses) {
      const list = currentCustomer.savedAddresses.map((a) => {
        if (a.id === setDefaultAddressId) {
          updateData.address = a.address;
          updateData.district = a.district;
          updateData.city = a.city;
          return { ...a, isDefault: true };
        }
        return { ...a, isDefault: false };
      });
      updateData.savedAddresses = list;
    }

    const updated = await db.customers.update(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Cập nhật thông tin thất bại' }, { status: 500 });
    }

    const safeCustomer = { ...updated };
    delete safeCustomer.password;

    return NextResponse.json({ success: true, data: safeCustomer, message: 'Cập nhật thông tin thành công! ✨' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
