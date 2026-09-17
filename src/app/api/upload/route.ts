import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
        { success: false, error: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, WEBP, GIF)' },
        { status: 400 }
      );
    }

    // Read bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create safe clean filename
    const ext = path.extname(file.name) || '.webp';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `charm_${Date.now()}_${cleanBase}${ext}`;

    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const IS_SERVERLESS = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
    );

    // Choose writable directory based on environment
    const uploadsDir = IS_SERVERLESS
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    let publicUrl = `/uploads/${filename}`;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn('File system write warning (falling back to dataUrl):', fsErr);
      // On serverless or read-only filesystem, use dataUrl directly so upload NEVER breaks
      publicUrl = base64Data;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      dataUrl: base64Data,
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
