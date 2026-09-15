import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = db.products.getAll();
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProd = db.products.create(body);
    return NextResponse.json({ success: true, data: newProd });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.products.update(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
    }
    const success = db.products.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
}

