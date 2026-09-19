import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file tải lên' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, WEBP, GIF, SVG)' },
        { status: 400 }
      );
    }

    // Read bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/webp';

    // Create safe clean filename
    const ext = path.extname(file.name) || '.webp';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `charm_${Date.now()}_${cleanBase}${ext}`;

    let publicUrl = '';

    // 1. Primary: Upload to Supabase Storage Cloud (Permanent CDN across all devices)
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filename);
          if (urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
          }
        } else if (error) {
          console.warn('[Supabase Storage upload warning]:', error.message);
        }
      } catch (storageErr) {
        console.warn('[Supabase Storage upload exception]:', storageErr);
      }
    }

    // 2. Secondary fallback: Write to local /tmp or public/uploads
    if (!publicUrl) {
      const IS_SERVERLESS = Boolean(
        process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
      );

      const uploadsDir = IS_SERVERLESS
        ? path.join('/tmp', 'uploads')
        : path.join(process.cwd(), 'public', 'uploads');

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        publicUrl = `/uploads/${filename}`;
      } catch (fsErr) {
        // Fallback to Base64 Data URL if file system write fails
        publicUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lưu ảnh: ' + (err.message || err) },
      { status: 500 }
    );
  }
}
