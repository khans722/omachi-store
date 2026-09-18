import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const products = await db.products.getAll();
  return NextResponse.json(
    { success: true, data: products },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProd = await db.products.create(body);
    return NextResponse.json({ success: true, data: newProd });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.products.update(body.id, body);
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
    const success = await db.products.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
}

