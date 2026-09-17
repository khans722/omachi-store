import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const settings = await db.settings.get();
  return NextResponse.json({ success: true, data: settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.settings.update(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}

