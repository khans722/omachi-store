import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const feedbacks = db.feedbacks.getAll();
  return NextResponse.json({ success: true, data: feedbacks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newFb = db.feedbacks.create(body);
    return NextResponse.json({ success: true, data: newFb });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add feedback' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.feedbacks.update(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Feedback not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update feedback' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing feedback ID' }, { status: 400 });
    }
    const success = db.feedbacks.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete feedback' }, { status: 500 });
  }
}