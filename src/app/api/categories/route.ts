import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.categories.getAll();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Tên danh mục không được để trống' }, { status: 400 });
    }

    const newCat = await db.categories.create({
      name: body.name.trim(),
      icon: body.icon?.trim() || '🌸',
      description: body.description?.trim() || '',
      displayOrder: body.displayOrder ? Number(body.displayOrder) : undefined,
      code: body.code?.trim(),
      slug: body.slug?.trim(),
    });

    return NextResponse.json({ success: true, data: newCat, message: 'Tạo danh mục mới thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID danh mục' }, { status: 400 });
    }

    const updated = await db.categories.update(body.id, {
      name: body.name?.trim(),
      icon: body.icon?.trim(),
      description: body.description?.trim(),
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
      slug: body.slug?.trim(),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy danh mục để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Cập nhật danh mục thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID danh mục' }, { status: 400 });
    }

    const ok = await db.categories.delete(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa danh mục thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
