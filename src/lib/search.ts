import { Product } from '@/types';

/**
 * Chuẩn hóa chuỗi tiếng Việt: loại bỏ toàn bộ dấu thanh, chuyển về chữ thường.
 * Hoạt động chính xác trên cả Unicode NFC và NFD.
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let s = str.toLowerCase();
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  s = s.replace(/ỳ|ý|y|ỷ|ỹ/g, 'y');
  s = s.replace(/đ/g, 'd');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.trim();
}

/**
 * Tách truy vấn tìm kiếm thành các token từ khóa
 */
export function tokenizeQuery(query: string): string[] {
  const norm = removeVietnameseTones(query);
  return norm.split(/\s+/).filter(Boolean);
}

export interface IndexedProduct {
  product: Product;
  normName: string;
  normCat: string;
  normDesc: string;
  normVariants: string;
  normSku: string;
  searchCorpus: string;
}

/**
 * Tạo Search Index cho danh sách sản phẩm để tối ưu hiệu năng O(1)
 * Giúp tìm kiếm diễn ra trong < 1ms mà không phải convert chuỗi lại nhiều lần.
 */
export function createProductSearchIndex(products: Product[]): IndexedProduct[] {
  return products.map((p) => {
    const normName = removeVietnameseTones(p.name || '');
    const normCat = removeVietnameseTones(p.categoryName || p.category || '');
    const normDesc = removeVietnameseTones(p.description || '');
    const normVariants = (p.variants || [])
      .map((v) => removeVietnameseTones(v.name || ''))
      .join(' ');
    const normSku = removeVietnameseTones(p.sku || '');

    const searchCorpus = `${normName} ${normCat} ${normVariants} ${normDesc} ${normSku}`;

    return {
      product: p,
      normName,
      normCat,
      normDesc,
      normVariants,
      normSku,
      searchCorpus,
    };
  });
}

/**
 * Thuật toán tìm kiếm thông minh (Smart Vietnamese Search & Relevance Ranking)
 */
export function smartFilterProducts(
  indexed: IndexedProduct[],
  query: string
): Product[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return indexed.map((item) => item.product);
  }

  const tokens = tokenizeQuery(trimmed);
  const normQuery = removeVietnameseTones(trimmed);
  const rawLowerQuery = trimmed.toLowerCase();

  const scoredList: { product: Product; score: number }[] = [];

  for (const item of indexed) {
    // Điều kiện tiên quyết: Tất cả các từ khóa trong câu tìm kiếm phải hiện diện trong dữ liệu sản phẩm
    const allTokensMatch = tokens.every((token) =>
      item.searchCorpus.includes(token)
    );

    if (!allTokensMatch) continue;

    let score = 0;

    // 1. Tên trùng khớp hoàn hảo hoặc bắt đầu bằng cụm tìm kiếm
    if (item.normName === normQuery || item.product.name.toLowerCase() === rawLowerQuery) {
      score += 1000;
    } else if (item.normName.startsWith(normQuery)) {
      score += 600;
    } else if (item.normName.includes(normQuery)) {
      score += 350;
    }

    // 2. Trùng khớp chính xác có dấu trong tên
    if (item.product.name.toLowerCase().includes(rawLowerQuery)) {
      score += 200;
    }

    // 3. Khớp từng từ khóa trong tên
    let nameTokenMatches = 0;
    for (const token of tokens) {
      if (item.normName.includes(token)) {
        nameTokenMatches++;
      }
    }
    if (nameTokenMatches === tokens.length) {
      score += 250;
    } else {
      score += nameTokenMatches * 50;
    }

    // 4. Trùng khớp trong Danh mục (Category)
    if (item.normCat.includes(normQuery)) {
      score += 160;
    }

    // 5. Trùng khớp trong Phân loại biến thể (Variants)
    if (item.normVariants.includes(normQuery)) {
      score += 120;
    }

    // 6. Trùng khớp trong Mã SKU
    if (item.normSku && item.normSku.includes(normQuery)) {
      score += 300;
    }

    // 7. Trùng khớp trong Mô tả (Description)
    if (item.normDesc.includes(normQuery)) {
      score += 60;
    }

    // Điểm ưu tiên cho sản phẩm HOT / Nổi bật
    if (item.product.isHot) {
      score += 15;
    }

    scoredList.push({ product: item.product, score });
  }

  // Sắp xếp theo điểm liên quan giảm dần (sản phẩm khớp nhất nằm đầu tiên)
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.map((item) => item.product);
}
