import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const isAuthed = verifyAdminAuth(req);
  return NextResponse.json({
    authenticated: isAuthed,
  });
}
