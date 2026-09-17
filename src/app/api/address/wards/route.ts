export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { VIETNAM_PROVINCES } from '@/data/vietnamAddress';

interface DivisionItem {
  id: string;
  name: string;
}

let cachedProvinces: DivisionItem[] | null = null;
const districtCache = new Map<string, DivisionItem[]>();
const wardCache = new Map<string, string[]>();
const provinceWardsCache = new Map<string, string[]>();

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

    // 1. Get national provinces list from esgoo
    if (!cachedProvinces) {
      const provRes = await fetchJson('https://esgoo.net/api-tinhthanh/1/0.htm');
      if (provRes && provRes.error === 0 && Array.isArray(provRes.data)) {
        cachedProvinces = provRes.data;
      }
    }

    if (!cachedProvinces) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Identify all constituent former provinces under the 34 provinces plan
    const matched34 = VIETNAM_PROVINCES.find(
      (p) =>
        p.name.toLowerCase().includes(normProv) ||
        normProv.includes(p.name.toLowerCase())
    );

    const targetFormerNames: string[] = matched34?.formerProvinces?.length
      ? matched34.formerProvinces
      : [normProv];

    // Match each former province name to its esgoo province ID
    const matchedEsgooProvinces = cachedProvinces.filter((p) => {
      const pNorm = p.name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
      return targetFormerNames.some((f) => {
        const fNorm = f.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
        return pNorm.includes(fNorm) || fNorm.includes(pNorm);
      });
    });

    if (matchedEsgooProvinces.length === 0) {
      // Fallback single match
      const fallbackProv = cachedProvinces.find((p) =>
        p.name.toLowerCase().includes(normProv) || normProv.includes(p.name.toLowerCase())
      );
      if (fallbackProv) matchedEsgooProvinces.push(fallbackProv);
    }

    if (matchedEsgooProvinces.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. If district is specified (backward compatibility):
    if (districtParam && districtParam.trim()) {
      const normDist = districtParam
        .toLowerCase()
        .replace(/^(huyện|quận|thị xã|thành phố|tp\.?)\s+/i, '')
        .trim();

      const cacheKey = `${normProv}::${normDist}`;
      if (wardCache.has(cacheKey)) {
        return NextResponse.json({ success: true, data: wardCache.get(cacheKey) });
      }

      // Find district among matched provinces
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

    // 4. District is omitted -> Fetch ALL wards across the province (Modern 2-Tier Model)
    const provCacheKey = normProv;
    if (provinceWardsCache.has(provCacheKey)) {
      let wards = provinceWardsCache.get(provCacheKey)!;
      if (queryParam) {
        const qClean = queryParam.toLowerCase().trim();
        wards = wards.filter((w) => w.toLowerCase().includes(qClean));
      }
      return NextResponse.json({ success: true, data: wards });
    }

    // Fetch districts for all matched provinces
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

    // Fetch wards for all districts in parallel
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
    provinceWardsCache.set(provCacheKey, allWards);

    let result = allWards;
    if (queryParam) {
      const qClean = queryParam.toLowerCase().trim();
      result = result.filter((w) => w.toLowerCase().includes(qClean));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching wards:', error.message);
    return NextResponse.json({ success: true, data: [] });
  }
}

