import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
};

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || [];
    if (!segments.length) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Sanitize to prevent directory traversal
    const safeSegments = segments.map((s) => path.basename(s));
    const tmpPath = path.join('/tmp', 'uploads', ...safeSegments);
    const publicPath = path.join(process.cwd(), 'public', 'uploads', ...safeSegments);
    const filePath = fs.existsSync(tmpPath) ? tmpPath : publicPath;

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('Error serving upload:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
