export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import vietnamWardsRaw from '@/data/vietnamWards.json';

const vietnamWardsMap = vietnamWardsRaw as Record<string, string[]>;

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
    const queryParam = searchParams.get('query') || searchParams.get('q');

    if (!provinceParam || !provinceParam.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const normProv = provinceParam
      .toLowerCase()
      .replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '')
      .trim();

    // 1. Check local comprehensive wards dataset first (Instant 0ms response)
    const matchedKey = Object.keys(vietnamWardsMap).find((k) => {
      const kNorm = k.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
      return kNorm === normProv || kNorm.includes(normProv) || normProv.includes(kNorm);
    });

    if (matchedKey && vietnamWardsMap[matchedKey]) {
      let wards = vietnamWardsMap[matchedKey];
      if (queryParam && queryParam.trim()) {
        const qClean = queryParam.toLowerCase().trim();
        const qStripped = qClean.replace(/^(xã|phường|thị trấn|tt\.|thị xã|tx\.)\s+/i, '').trim();
        wards = wards.filter((w) => {
          const wLower = w.toLowerCase();
          const wStripped = wLower.replace(/^(xã|phường|thị trấn|tt\.|thị xã|tx\.)\s+/i, '').trim();
          return wLower.includes(qClean) || (qStripped && wStripped.includes(qStripped));
        });
      }
      return NextResponse.json({ success: true, data: wards });
    }

    // 2. Fallback: Fetch from external esgoo API if province not found locally
    if (!cachedProvinces) {
      const provRes = await fetchJson('https://esgoo.net/api-tinhthanh/1/0.htm');
      if (provRes && provRes.error === 0 && Array.isArray(provRes.data)) {
        cachedProvinces = provRes.data;
      }
    }

    if (!cachedProvinces) {
      return NextResponse.json({ success: true, data: [] });
    }

    const matchedEsgooProvinces = cachedProvinces.filter((p) => {
      const pNorm = p.name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
      return pNorm === normProv || pNorm.includes(normProv) || normProv.includes(pNorm);
    });

    if (matchedEsgooProvinces.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // If district is specified:
    if (districtParam && districtParam.trim()) {
      const normDist = districtParam
        .toLowerCase()
        .replace(/^(huyện|quận|thị xã|thành phố|tp\.?)\s+/i, '')
        .trim();

      const cacheKey = `${normProv}::${normDist}`;
      if (wardCache.has(cacheKey)) {
        return NextResponse.json({ success: true, data: wardCache.get(cacheKey) });
      }

      let targetDistrict: DivisionItem | undefined;
      for (const prov of matchedEsgooProvinces) {
        let districts = districtCache.get(prov.id);
        if (!districts) {
          const distRes = await fetchJson(`https://esgoo.net/api-tinhthanh/2/${prov.id}.htm`);
          if (distRes && distRes.error === 0 && Array.isArray(distRes.data)) {
            districts = distRes.data;
            districtCache.set(prov.id, districts);
          }
        }
        if (districts) {
          targetDistrict = districts.find((d) => {
            const dNorm = d.name.toLowerCase().replace(/^(huyện|quận|thị xã|thành phố|tp\.?)\s+/i, '').trim();
            return dNorm.includes(normDist) || normDist.includes(dNorm);
          });
          if (targetDistrict) break;
        }
      }

      if (targetDistrict) {
        const wardRes = await fetchJson(`https://esgoo.net/api-tinhthanh/3/${targetDistrict.id}.htm`);
        if (wardRes && wardRes.error === 0 && Array.isArray(wardRes.data)) {
          const wards: string[] = wardRes.data.map((w: any) => w.name);
          wardCache.set(cacheKey, wards);
          return NextResponse.json({ success: true, data: wards });
        }
      }
    }

    // Fetch districts for matched provinces
    const allDistricts: DivisionItem[] = [];
    for (const prov of matchedEsgooProvinces) {
      let districts = districtCache.get(prov.id);
      if (!districts) {
        try {
          const distRes = await fetchJson(`https://esgoo.net/api-tinhthanh/2/${prov.id}.htm`);
          if (distRes && distRes.error === 0 && Array.isArray(distRes.data)) {
            districts = distRes.data;
            districtCache.set(prov.id, districts);
          }
        } catch {}
      }
      if (districts) allDistricts.push(...districts);
    }

    const wardPromises = allDistricts.map(async (dist) => {
      try {
        const wardRes = await fetchJson(`https://esgoo.net/api-tinhthanh/3/${dist.id}.htm`);
        if (wardRes && wardRes.error === 0 && Array.isArray(wardRes.data)) {
          return wardRes.data.map((w: any) => w.name);
        }
      } catch {}
      return [];
    });

    const wardArrays = await Promise.all(wardPromises);
    const wardSet = new Set<string>();
    wardArrays.forEach((arr) => {
      arr.forEach((w: string) => {
        if (w && w.trim()) wardSet.add(w.trim());
      });
    });

    const allWards = Array.from(wardSet).sort((a, b) => a.localeCompare(b, 'vi'));
    let result = allWards;
    if (queryParam && queryParam.trim()) {
      const qClean = queryParam.toLowerCase().trim();
      result = result.filter((w) => w.toLowerCase().includes(qClean));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching wards:', error.message);
    return NextResponse.json({ success: true, data: [] });
  }
}
