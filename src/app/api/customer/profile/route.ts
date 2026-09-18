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
    const { id, fullName, phone, address, district, city, ward, email, password, savedAddresses, saveNewAddress, setDefaultAddressId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    const currentCustomer = await db.customers.getById(id);
    if (!currentCustomer) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (phone) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (ward !== undefined) updateData.ward = ward.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (password && password.trim().length >= 4) updateData.password = password.trim();
    if (savedAddresses && Array.isArray(savedAddresses)) updateData.savedAddresses = savedAddresses;

    // Chức năng: Lưu thêm hoặc cập nhật địa chỉ vào danh sách
    if (saveNewAddress && saveNewAddress.address) {
      const list = [...(currentCustomer.savedAddresses || [])];
      const isDefault = saveNewAddress.isDefault !== false || list.length === 0;
      const newAddressText = saveNewAddress.address.trim();
      const newCity = (saveNewAddress.city || city || '').trim();
      const newWard = (saveNewAddress.ward || ward || '').trim();
      const newDistrict = (saveNewAddress.district || district || '').trim();
      const newFullName = (saveNewAddress.fullName || fullName || currentCustomer.fullName || '').trim();
      const newPhone = (saveNewAddress.phone || phone || currentCustomer.phone || '').trim();

      if (isDefault) {
        list.forEach((a) => { a.isDefault = false; });
        updateData.address = newAddressText;
        updateData.city = newCity;
        updateData.ward = newWard;
        updateData.district = newDistrict;
        if (newFullName) updateData.fullName = newFullName;
        if (newPhone) updateData.phone = newPhone;
      }

      // Check if this address already exists
      const existingIdx = list.findIndex(
        (a) => a.address.trim().toLowerCase() === newAddressText.toLowerCase() &&
               a.city.trim().toLowerCase() === newCity.toLowerCase()
      );

      if (existingIdx !== -1) {
        list[existingIdx] = {
          ...list[existingIdx],
          fullName: newFullName,
          phone: newPhone,
          address: newAddressText,
          city: newCity,
          ward: newWard,
          district: newDistrict,
          isDefault,
        };
      } else {
        list.push({
          id: `addr-${Date.now()}`,
          fullName: newFullName,
          phone: newPhone,
          address: newAddressText,
          district: newDistrict,
          ward: newWard,
          city: newCity,
          isDefault,
          createdAt: new Date().toISOString(),
        });
      }
      updateData.savedAddresses = list;
    }

    // Chức năng: Đổi địa chỉ nào đó làm mặc định
    if (setDefaultAddressId && currentCustomer.savedAddresses) {
      const list = currentCustomer.savedAddresses.map((a) => {
        if (a.id === setDefaultAddressId) {
          updateData.address = a.address;
          updateData.district = a.district;
          updateData.ward = (a as any).ward || '';
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
