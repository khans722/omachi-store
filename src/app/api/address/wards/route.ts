export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface DivisionItem {
  id: string;
  name: string;
}

let cachedProvinces: DivisionItem[] | null = null;
const districtCache = new Map<string, DivisionItem[]>();
const wardCache = new Map<string, string[]>();

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Fetch failed status: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provinceParam = searchParams.get('province');
    const districtParam = searchParams.get('district');

    if (!provinceParam || !districtParam) {
      return NextResponse.json({ success: true, data: [] });
    }

    const cacheKey = `${provinceParam.trim().toLowerCase()}::${districtParam.trim().toLowerCase()}`;
    if (wardCache.has(cacheKey)) {
      return NextResponse.json({ success: true, data: wardCache.get(cacheKey) });
    }

    // 1. Get provinces
    if (!cachedProvinces) {
      const provRes = await fetchJson('https://esgoo.net/api-tinhthanh/1/0.htm');
      if (provRes && provRes.error === 0 && Array.isArray(provRes.data)) {
        cachedProvinces = provRes.data;
      }
    }

    if (!cachedProvinces) {
      return NextResponse.json({ success: true, data: [] });
    }

    const normProv = provinceParam
      .toLowerCase()
      .replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '')
      .trim();

    const matchedProv = cachedProvinces.find(
      (p) =>
        p.name.toLowerCase().includes(normProv) ||
        normProv.includes(p.name.toLowerCase())
    );

    if (!matchedProv) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Get districts for matched province
    let districts = districtCache.get(matchedProv.id);
    if (!districts) {
      const distRes = await fetchJson(`https://esgoo.net/api-tinhthanh/2/${matchedProv.id}.htm`);
      if (distRes && distRes.error === 0 && Array.isArray(distRes.data)) {
        districts = distRes.data;
        districtCache.set(matchedProv.id, districts);
      }
    }

    if (!districts) {
      return NextResponse.json({ success: true, data: [] });
    }

    const normDist = districtParam
      .toLowerCase()
      .replace(/^(huyện|quận|thị xã|thành phố|tp\.?)\s+/i, '')
      .trim();

    const matchedDist = districts.find(
      (d) =>
        d.name.toLowerCase().includes(normDist) ||
        normDist.includes(d.name.toLowerCase())
    );

    if (!matchedDist) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Get wards for matched district
    const wardRes = await fetchJson(`https://esgoo.net/api-tinhthanh/3/${matchedDist.id}.htm`);
    if (wardRes && wardRes.error === 0 && Array.isArray(wardRes.data)) {
      const wards: string[] = wardRes.data.map((w: any) => w.name);
      wardCache.set(cacheKey, wards);
      return NextResponse.json({ success: true, data: wards });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Error fetching wards:', error.message);
    return NextResponse.json({ success: true, data: [] });
  }
}
