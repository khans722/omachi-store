/**
 * DANH SÁCH 34 TỈNH & THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG
 * Cập nhật chuẩn hóa theo Nghị quyết số 202/2025/QH15 của Quốc hội ngày 12/06/2025
 * (Chính thức có hiệu lực và đi vào vận hành từ 01/07/2025).
 *
 * Tỉnh Bắc Giang đã chính thức sáp nhập vào Tỉnh Bắc Ninh (mang tên gọi mới là Tỉnh Bắc Ninh).
 * Toàn bộ các quận, huyện, thị xã cũ của 63 tỉnh thành được bảo toàn và phân loại chính xác theo 34 tỉnh thành mới.
 */

export type Region = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface ProvinceData {
  id: string;
  name: string;
  region: Region;
  districts: string[];
  subLabel?: string;
  formerProvinces?: string[];
}

export const VIETNAM_PROVINCES: ProvinceData[] = [
  {
    "id": "ha-noi",
    "name": "Hà Nội",
    "region": "NORTH",
    "subLabel": "Thủ đô Hà Nội (Giữ nguyên)",
    "formerProvinces": [
      "Hà Nội"
    ],
    "districts": [
      "Quận Cầu Giấy",
      "Quận Đống Đa",
      "Quận Hoàn Kiếm",
      "Quận Ba Đình",
      "Quận Hai Bà Trưng",
      "Quận Hoàng Mai",
      "Quận Thanh Xuân",
      "Quận Long Biên",
      "Quận Nam Từ Liêm",
      "Quận Bắc Từ Liêm",
      "Quận Tây Hồ",
      "Quận Hà Đông",
      "Thị xã Sơn Tây",
      "Huyện Ba Vì",
      "Huyện Chương Mỹ",
      "Huyện Đan Phượng",
      "Huyện Đông Anh",
      "Huyện Gia Lâm",
      "Huyện Hoài Đức",
      "Huyện Mê Linh",
      "Huyện Mỹ Đức",
      "Huyện Phú Xuyên",
      "Huyện Phúc Thọ",
      "Huyện Quốc Oai",
      "Huyện Sóc Sơn",
      "Huyện Thạch Thất",
      "Huyện Thanh Oai",
      "Huyện Thanh Trì",
      "Huyện Thường Tín",
      "Huyện Ứng Hòa"
    ]
  },
  {
    "id": "hai-phong",
    "name": "Hải Phòng",
    "region": "NORTH",
    "subLabel": "Hợp nhất Hải Phòng & Hải Dương",
    "formerProvinces": [
      "Hải Phòng",
      "Hải Dương"
    ],
    "districts": [
      "Quận Hồng Bàng",
      "Quận Ngô Quyền",
      "Quận Lê Chân",
      "Quận Hải An",
      "Quận Kiến An",
      "Quận Đồ Sơn",
      "Quận Dương Kinh",
      "Huyện Thủy Nguyên",
      "Huyện An Dương",
      "Huyện An Lão",
      "Huyện Kiến Thụy",
      "Huyện Tiên Lãng",
      "Huyện Vĩnh Bảo",
      "Huyện Cát Hải",
      "Huyện Bạch Long Vĩ",
      "TP Hải Dương",
      "TP Chí Linh",
      "Thị xã Kinh Môn",
      "Huyện Bình Giang",
      "Huyện Cẩm Giàng",
      "Huyện Gia Lộc",
      "Huyện Kim Thành",
      "Huyện Nam Sách",
      "Huyện Ninh Giang",
      "Huyện Thanh Hà",
      "Huyện Thanh Miện",
      "Huyện Tứ Kỳ"
    ]
  },
  {
    "id": "bac-ninh",
    "name": "Bắc Ninh",
    "region": "NORTH",
    "subLabel": "Hợp nhất Bắc Giang & Bắc Ninh",
    "formerProvinces": [
      "Bắc Ninh",
      "Bắc Giang"
    ],
    "districts": [
      "TP Bắc Ninh",
      "TP Từ Sơn",
      "Thị xã Thuận Thành",
      "Thị xã Quế Võ",
      "Huyện Gia Bình",
      "Huyện Lương Tài",
      "Huyện Tiên Du",
      "Huyện Yên Phong",
      "Huyện Yên Dũng",
      "Thị xã Việt Yên",
      "TP Bắc Giang",
      "Huyện Hiệp Hòa",
      "Huyện Lạng Giang",
      "Huyện Lục Nam",
      "Huyện Lục Ngạn",
      "Huyện Sơn Động",
      "Huyện Tân Yên",
      "Huyện Yên Thế",
      "Thị xã Chũ"
    ]
  },
  {
    "id": "quang-ninh",
    "name": "Quảng Ninh",
    "region": "NORTH",
    "subLabel": "Tỉnh Quảng Ninh (Giữ nguyên)",
    "formerProvinces": [
      "Quảng Ninh"
    ],
    "districts": [
      "TP Hạ Long",
      "TP Cẩm Phả",
      "TP Uông Bí",
      "TP Móng Cái",
      "Thị xã Đông Triều",
      "Thị xã Quảng Yên",
      "Huyện Ba Chẽ",
      "Huyện Bình Liêu",
      "Huyện Cô Tô",
      "Huyện Đầm Hà",
      "Huyện Hải Hà",
      "Huyện Tiên Yên",
      "Huyện Vân Đồn"
    ]
  },
  {
    "id": "hung-yen",
    "name": "Hưng Yên",
    "region": "NORTH",
    "subLabel": "Hợp nhất Hưng Yên & Thái Bình",
    "formerProvinces": [
      "Hưng Yên",
      "Thái Bình"
    ],
    "districts": [
      "TP Hưng Yên",
      "Thị xã Mỹ Hào",
      "Huyện Ân Thi",
      "Huyện Khoái Châu",
      "Huyện Kim Động",
      "Huyện Phù Cừ",
      "Huyện Tiên Lữ",
      "Huyện Văn Giang",
      "Huyện Văn Lâm",
      "Huyện Yên Mỹ",
      "TP Thái Bình",
      "Huyện Đông Hưng",
      "Huyện Hưng Hà",
      "Huyện Kiến Xương",
      "Huyện Quỳnh Phụ",
      "Huyện Thái Thụy",
      "Huyện Tiền Hải",
      "Huyện Vũ Thư"
    ]
  },
  {
    "id": "ninh-binh",
    "name": "Ninh Bình",
    "region": "NORTH",
    "subLabel": "Hợp nhất Ninh Bình, Nam Định & Hà Nam",
    "formerProvinces": [
      "Ninh Bình",
      "Nam Định",
      "Hà Nam"
    ],
    "districts": [
      "TP Ninh Bình",
      "TP Tam Điệp",
      "Huyện Gia Viễn",
      "Huyện Hoa Lư",
      "Huyện Kim Sơn",
      "Huyện Nho Quan",
      "Huyện Yên Khánh",
      "Huyện Yên Mô",
      "TP Nam Định",
      "Huyện Giao Thủy",
      "Huyện Hải Hậu",
      "Huyện Mỹ Lộc",
      "Huyện Nam Trực",
      "Huyện Nghĩa Hưng",
      "Huyện Trực Ninh",
      "Huyện Vụ Bản",
      "Huyện Xuân Trường",
      "Huyện Ý Yên",
      "TP Phủ Lý",
      "Thị xã Duy Tiên",
      "Huyện Bình Lục",
      "Huyện Kim Bảng",
      "Huyện Lý Nhân",
      "Huyện Thanh Liêm"
    ]
  },
  {
    "id": "thai-nguyen",
    "name": "Thái Nguyên",
    "region": "NORTH",
    "subLabel": "Hợp nhất Thái Nguyên & Bắc Kạn",
    "formerProvinces": [
      "Thái Nguyên",
      "Bắc Kạn"
    ],
    "districts": [
      "TP Thái Nguyên",
      "TP Sông Công",
      "TP Phổ Yên",
      "Huyện Đại Từ",
      "Huyện Định Hóa",
      "Huyện Đồng Hỷ",
      "Huyện Phú Bình",
      "Huyện Phú Lương",
      "Huyện Võ Nhai",
      "TP Bắc Kạn",
      "Huyện Ba Bể",
      "Huyện Bạch Thông",
      "Huyện Chợ Đồn",
      "Huyện Chợ Mới",
      "Huyện Na Rì",
      "Huyện Ngân Sơn",
      "Huyện Pác Nặm"
    ]
  },
  {
    "id": "phu-tho",
    "name": "Phú Thọ",
    "region": "NORTH",
    "subLabel": "Hợp nhất Phú Thọ, Vĩnh Phúc & Hòa Bình",
    "formerProvinces": [
      "Phú Thọ",
      "Vĩnh Phúc",
      "Hòa Bình"
    ],
    "districts": [
      "TP Việt Trì",
      "Thị xã Phú Thọ",
      "Huyện Cẩm Khê",
      "Huyện Đoan Hùng",
      "Huyện Hạ Hòa",
      "Huyện Lâm Thao",
      "Huyện Phù Ninh",
      "Huyện Tam Nông",
      "Huyện Tân Sơn",
      "Huyện Thanh Ba",
      "Huyện Thanh Sơn",
      "Huyện Thanh Thủy",
      "Huyện Yên Lập",
      "TP Vĩnh Yên",
      "TP Phúc Yên",
      "Huyện Bình Xuyên",
      "Huyện Lập Thạch",
      "Huyện Sông Lô",
      "Huyện Tam Đảo",
      "Huyện Tam Dương",
      "Huyện Vĩnh Tường",
      "Huyện Yên Lạc",
      "TP Hòa Bình",
      "Huyện Cao Phong",
      "Huyện Đà Bắc",
      "Huyện Kim Bôi",
      "Huyện Lạc Sơn",
      "Huyện Lạc Thủy",
      "Huyện Lương Sơn",
      "Huyện Mai Châu",
      "Huyện Tân Lạc",
      "Huyện Yên Thủy"
    ]
  },
  {
    "id": "tuyen-quang",
    "name": "Tuyên Quang",
    "region": "NORTH",
    "subLabel": "Hợp nhất Tuyên Quang & Hà Giang",
    "formerProvinces": [
      "Tuyên Quang",
      "Hà Giang"
    ],
    "districts": [
      "TP Tuyên Quang",
      "Huyện Chiêm Hóa",
      "Huyện Hàm Yên",
      "Huyện Lâm Bình",
      "Huyện Na Hang",
      "Huyện Sơn Dương",
      "Huyện Yên Sơn",
      "TP Hà Giang",
      "Huyện Bắc Mê",
      "Huyện Bắc Quang",
      "Huyện Đồng Văn",
      "Huyện Hoàng Su Phì",
      "Huyện Mèo Vạc",
      "Huyện Quản Bạ",
      "Huyện Quang Bình",
      "Huyện Vị Xuyên",
      "Huyện Xín Mần",
      "Huyện Yên Minh"
    ]
  },
  {
    "id": "lao-cai",
    "name": "Lào Cai",
    "region": "NORTH",
    "subLabel": "Hợp nhất Lào Cai & Yên Bái",
    "formerProvinces": [
      "Lào Cai",
      "Yên Bái"
    ],
    "districts": [
      "TP Lào Cai",
      "Thị xã Sa Pa",
      "Huyện Bát Xát",
      "Huyện Bảo Thắng",
      "Huyện Bảo Yên",
      "Huyện Bắc Hà",
      "Huyện Mường Khương",
      "Huyện Si Ma Cai",
      "Huyện Văn Bàn",
      "TP Yên Bái",
      "Thị xã Nghĩa Lộ",
      "Huyện Lục Yên",
      "Huyện Mù Cang Chải",
      "Huyện Trạm Tấu",
      "Huyện Trấn Yên",
      "Huyện Văn Chấn",
      "Huyện Văn Yên",
      "Huyện Yên Bình"
    ]
  },
  {
    "id": "lang-son",
    "name": "Lạng Sơn",
    "region": "NORTH",
    "subLabel": "Tỉnh Lạng Sơn (Giữ nguyên)",
    "formerProvinces": [
      "Lạng Sơn"
    ],
    "districts": [
      "TP Lạng Sơn",
      "Huyện Bắc Sơn",
      "Huyện Bình Gia",
      "Huyện Cao Lộc",
      "Huyện Chi Lăng",
      "Huyện Đình Lập",
      "Huyện Hữu Lũng",
      "Huyện Lộc Bình",
      "Huyện Tràng Định",
      "Huyện Văn Lãng",
      "Huyện Văn Quan"
    ]
  },
  {
    "id": "cao-bang",
    "name": "Cao Bằng",
    "region": "NORTH",
    "subLabel": "Tỉnh Cao Bằng (Giữ nguyên)",
    "formerProvinces": [
      "Cao Bằng"
    ],
    "districts": [
      "TP Cao Bằng",
      "Huyện Bảo Lạc",
      "Huyện Bảo Lâm",
      "Huyện Hạ Lang",
      "Huyện Hà Quảng",
      "Huyện Hòa An",
      "Huyện Nguyên Bình",
      "Huyện Quảng Hòa",
      "Huyện Thạch An",
      "Huyện Trùng Khánh"
    ]
  },
  {
    "id": "son-la",
    "name": "Sơn La",
    "region": "NORTH",
    "subLabel": "Tỉnh Sơn La (Giữ nguyên)",
    "formerProvinces": [
      "Sơn La"
    ],
    "districts": [
      "TP Sơn La",
      "Huyện Bắc Yên",
      "Huyện Mai Sơn",
      "Huyện Mộc Châu",
      "Huyện Mường La",
      "Huyện Phù Yên",
      "Huyện Quỳnh Nhai",
      "Huyện Sông Mã",
      "Huyện Sốp Cộp",
      "Huyện Thuận Châu",
      "Huyện Vân Hồ",
      "Huyện Yên Châu"
    ]
  },
  {
    "id": "dien-bien",
    "name": "Điện Biên",
    "region": "NORTH",
    "subLabel": "Tỉnh Điện Biên (Giữ nguyên)",
    "formerProvinces": [
      "Điện Biên"
    ],
    "districts": [
      "TP Điện Biên Phủ",
      "Thị xã Mường Lay",
      "Huyện Điện Biên",
      "Huyện Điện Biên Đông",
      "Huyện Mường Ảng",
      "Huyện Mường Chà",
      "Huyện Mường Nhé",
      "Huyện Nậm Pồ",
      "Huyện Tủa Chùa",
      "Huyện Tuần Giáo"
    ]
  },
  {
    "id": "lai-chau",
    "name": "Lai Châu",
    "region": "NORTH",
    "subLabel": "Tỉnh Lai Châu (Giữ nguyên)",
    "formerProvinces": [
      "Lai Châu"
    ],
    "districts": [
      "TP Lai Châu",
      "Huyện Mường Tè",
      "Huyện Nậm Nhùn",
      "Huyện Phong Thổ",
      "Huyện Sìn Hồ",
      "Huyện Tam Đường",
      "Huyện Tân Uyên",
      "Huyện Than Uyên"
    ]
  },
  {
    "id": "thanh-hoa",
    "name": "Thanh Hóa",
    "region": "CENTRAL",
    "subLabel": "Tỉnh Thanh Hóa (Giữ nguyên)",
    "formerProvinces": [
      "Thanh Hóa"
    ],
    "districts": [
      "TP Thanh Hóa",
      "TP Sầm Sơn",
      "Thị xã Bỉm Sơn",
      "Thị xã Nghi Sơn",
      "Huyện Bá Thước",
      "Huyện Cẩm Thủy",
      "Huyện Đông Sơn",
      "Huyện Hà Trung",
      "Huyện Hậu Lộc",
      "Huyện Hoằng Hóa",
      "Huyện Lang Chánh",
      "Huyện Mường Lát",
      "Huyện Nga Sơn",
      "Huyện Ngọc Lặc",
      "Huyện Như Thanh",
      "Huyện Như Xuân",
      "Huyện Nông Cống",
      "Huyện Quan Hóa",
      "Huyện Quan Sơn",
      "Huyện Quảng Xương",
      "Huyện Thạch Thành",
      "Huyện Thiệu Hóa",
      "Huyện Thọ Xuân",
      "Huyện Thường Xuân",
      "Huyện Triệu Sơn",
      "Huyện Vĩnh Lộc",
      "Huyện Yên Định"
    ]
  },
  {
    "id": "nghe-an",
    "name": "Nghệ An",
    "region": "CENTRAL",
    "subLabel": "Tỉnh Nghệ An (Giữ nguyên)",
    "formerProvinces": [
      "Nghệ An"
    ],
    "districts": [
      "TP Vinh",
      "Thị xã Cửa Lò",
      "Thị xã Thái Hòa",
      "Thị xã Hoàng Mai",
      "Huyện Anh Sơn",
      "Huyện Con Cuông",
      "Huyện Diễn Châu",
      "Huyện Đô Lương",
      "Huyện Hưng Nguyên",
      "Huyện Kỳ Sơn",
      "Huyện Nam Đàn",
      "Huyện Nghi Lộc",
      "Huyện Nghĩa Đàn",
      "Huyện Quế Phong",
      "Huyện Quỳ Châu",
      "Huyện Quỳ Hợp",
      "Huyện Quỳnh Lưu",
      "Huyện Tân Kỳ",
      "Huyện Thanh Chương",
      "Huyện Tương Dương",
      "Huyện Yên Thành"
    ]
  },
  {
    "id": "ha-tinh",
    "name": "Hà Tĩnh",
    "region": "CENTRAL",
    "subLabel": "Tỉnh Hà Tĩnh (Giữ nguyên)",
    "formerProvinces": [
      "Hà Tĩnh"
    ],
    "districts": [
      "TP Hà Tĩnh",
      "Thị xã Hồng Lĩnh",
      "Thị xã Kỳ Anh",
      "Huyện Cẩm Xuyên",
      "Huyện Can Lộc",
      "Huyện Đức Thọ",
      "Huyện Hương Khê",
      "Huyện Hương Sơn",
      "Huyện Kỳ Anh",
      "Huyện Lộc Hà",
      "Huyện Nghi Xuân",
      "Huyện Thạch Hà",
      "Huyện Vũ Quang"
    ]
  },
  {
    "id": "quang-tri",
    "name": "Quảng Trị",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Quảng Trị & Quảng Bình",
    "formerProvinces": [
      "Quảng Trị",
      "Quảng Bình"
    ],
    "districts": [
      "TP Đông Hà",
      "Thị xã Quảng Trị",
      "Huyện Cam Lộ",
      "Huyện Cồn Cỏ",
      "Huyện Đakrông",
      "Huyện Gio Linh",
      "Huyện Hải Lăng",
      "Huyện Hướng Hóa",
      "Huyện Triệu Phong",
      "Huyện Vĩnh Linh",
      "TP Đồng Hới",
      "Thị xã Ba Đồn",
      "Huyện Bố Trạch",
      "Huyện Lệ Thủy",
      "Huyện Minh Hóa",
      "Huyện Quảng Ninh",
      "Huyện Quảng Trạch",
      "Huyện Tuyên Hóa"
    ]
  },
  {
    "id": "hue",
    "name": "Huế",
    "region": "CENTRAL",
    "subLabel": "Thành phố Huế trực thuộc TW",
    "formerProvinces": [
      "Thừa Thiên Huế"
    ],
    "districts": [
      "TP Huế",
      "Thị xã Hương Thủy",
      "Thị xã Hương Trà",
      "Huyện A Lưới",
      "Huyện Nam Đông",
      "Huyện Phong Điền",
      "Huyện Phú Lộc",
      "Huyện Phú Vang",
      "Huyện Quảng Điền"
    ]
  },
  {
    "id": "da-nang",
    "name": "Đà Nẵng",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất TP Đà Nẵng & Quảng Nam",
    "formerProvinces": [
      "Đà Nẵng",
      "Quảng Nam"
    ],
    "districts": [
      "Quận Hải Châu",
      "Quận Thanh Khê",
      "Quận Sơn Trà",
      "Quận Ngũ Hành Sơn",
      "Quận Liên Chiểu",
      "Quận Cẩm Lệ",
      "Huyện Hòa Vang",
      "Huyện Hoàng Sa",
      "TP Tam Kỳ",
      "TP Hội An",
      "Thị xã Điện Bàn",
      "Huyện Bắc Trà My",
      "Huyện Đại Lộc",
      "Huyện Đông Giang",
      "Huyện Duy Xuyên",
      "Huyện Hiệp Đức",
      "Huyện Nam Giang",
      "Huyện Nam Trà My",
      "Huyện Nông Sơn",
      "Huyện Núi Thành",
      "Huyện Phú Ninh",
      "Huyện Phước Sơn",
      "Huyện Quế Sơn",
      "Huyện Tây Giang",
      "Huyện Thăng Bình",
      "Huyện Tiên Phước"
    ]
  },
  {
    "id": "quang-ngai",
    "name": "Quảng Ngãi",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Quảng Ngãi & Kon Tum",
    "formerProvinces": [
      "Quảng Ngãi",
      "Kon Tum"
    ],
    "districts": [
      "TP Quảng Ngãi",
      "Thị xã Đức Phổ",
      "Huyện Ba Tơ",
      "Huyện Bình Sơn",
      "Huyện Lý Sơn",
      "Huyện Minh Long",
      "Huyện Mộ Đức",
      "Huyện Nghĩa Hành",
      "Huyện Sơn Hà",
      "Huyện Sơn Tây",
      "Huyện Sơn Tịnh",
      "Huyện Trà Bồng",
      "Huyện Tư Nghĩa",
      "TP Kon Tum",
      "Huyện Đắk Glei",
      "Huyện Đắk Hà",
      "Huyện Đắk Tô",
      "Huyện Ia H' Drai",
      "Huyện Kon Plông",
      "Huyện Kon Rẫy",
      "Huyện Ngọc Hồi",
      "Huyện Sa Thầy",
      "Huyện Tu Mơ Rông"
    ]
  },
  {
    "id": "gia-lai",
    "name": "Gia Lai",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Gia Lai & Bình Định",
    "formerProvinces": [
      "Gia Lai",
      "Bình Định"
    ],
    "districts": [
      "TP Pleiku",
      "Thị xã An Khê",
      "Thị xã Ayun Pa",
      "Huyện Chư Păh",
      "Huyện Chư Prông",
      "Huyện Chư Pưh",
      "Huyện Chư Sê",
      "Huyện Đắk Đoa",
      "Huyện Đắk Pơ",
      "Huyện Đức Cơ",
      "Huyện Ia Grai",
      "Huyện Ia Pa",
      "Huyện K'Bang",
      "Huyện Kông Chro",
      "Huyện Krông Pa",
      "Huyện Mang Yang",
      "Huyện Phú Thiện",
      "TP Quy Nhơn",
      "Thị xã An Nhơn",
      "Thị xã Hoài Nhơn",
      "Huyện An Lão",
      "Huyện Hoài Ân",
      "Huyện Phù Cát",
      "Huyện Phù Mỹ",
      "Huyện Tây Sơn",
      "Huyện Tuy Phước",
      "Huyện Vân Canh",
      "Huyện Vĩnh Thạnh"
    ]
  },
  {
    "id": "dak-lak",
    "name": "Đắk Lắk",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Đắk Lắk & Phú Yên",
    "formerProvinces": [
      "Đắk Lắk",
      "Phú Yên"
    ],
    "districts": [
      "TP Buôn Ma Thuột",
      "Thị xã Buôn Hồ",
      "Huyện Buôn Đôn",
      "Huyện Cư Kuin",
      "Huyện Cư M'gar",
      "Huyện Ea H'leo",
      "Huyện Ea Kar",
      "Huyện Ea Súp",
      "Huyện Krông Ana",
      "Huyện Krông Bông",
      "Huyện Krông Búk",
      "Huyện Krông Năng",
      "Huyện Krông Pắc",
      "Huyện Lắk",
      "Huyện M'Đrắk",
      "TP Tuy Hòa",
      "Thị xã Sông Cầu",
      "Thị xã Đông Hòa",
      "Huyện Đồng Xuân",
      "Huyện Phú Hòa",
      "Huyện Sơn Hòa",
      "Huyện Sông Hinh",
      "Huyện Tây Hòa",
      "Huyện Tuy An"
    ]
  },
  {
    "id": "khanh-hoa",
    "name": "Khánh Hòa",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Khánh Hòa & Ninh Thuận",
    "formerProvinces": [
      "Khánh Hòa",
      "Ninh Thuận"
    ],
    "districts": [
      "TP Nha Trang",
      "TP Cam Ranh",
      "Thị xã Ninh Hòa",
      "Huyện Cam Lâm",
      "Huyện Diên Khánh",
      "Huyện Khánh Sơn",
      "Huyện Khánh Vĩnh",
      "Huyện Vạn Ninh",
      "Huyện Trường Sa",
      "TP Phan Rang - Tháp Chàm",
      "Huyện Bác Ái",
      "Huyện Ninh Hải",
      "Huyện Ninh Phước",
      "Huyện Ninh Sơn",
      "Huyện Thuận Bắc",
      "Huyện Thuận Nam"
    ]
  },
  {
    "id": "lam-dong",
    "name": "Lâm Đồng",
    "region": "CENTRAL",
    "subLabel": "Hợp nhất Lâm Đồng, Đắk Nông & Bình Thuận",
    "formerProvinces": [
      "Lâm Đồng",
      "Đắk Nông",
      "Bình Thuận"
    ],
    "districts": [
      "TP Đà Lạt",
      "TP Bảo Lộc",
      "Huyện Bảo Lâm",
      "Huyện Cát Tiên",
      "Huyện Di Linh",
      "Huyện Đạ Huoai",
      "Huyện Đạ Tẻh",
      "Huyện Đam Rông",
      "Huyện Đơn Dương",
      "Huyện Đức Trọng",
      "Huyện Lạc Dương",
      "Huyện Lâm Hà",
      "TP Gia Nghĩa",
      "Huyện Cư Jút",
      "Huyện Đắk Glong",
      "Huyện Đắk Mil",
      "Huyện Đắk R'Lấp",
      "Huyện Đắk Song",
      "Huyện Krông Nô",
      "Huyện Tuy Đức",
      "TP Phan Thiết",
      "Thị xã La Gi",
      "Huyện Bắc Bình",
      "Huyện Đức Linh",
      "Huyện Hàm Tân",
      "Huyện Hàm Thuận Bắc",
      "Huyện Hàm Thuận Nam",
      "Huyện Phú Quý",
      "Huyện Tánh Linh",
      "Huyện Tuy Phong"
    ]
  },
  {
    "id": "ho-chi-minh",
    "name": "TP. Hồ Chí Minh",
    "region": "SOUTH",
    "subLabel": "Hợp nhất TP.HCM, Bình Dương & BR-VT",
    "formerProvinces": [
      "TP. Hồ Chí Minh",
      "Bình Dương",
      "Bà Rịa - Vũng Tàu"
    ],
    "districts": [
      "TP Thủ Đức",
      "Quận 1",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Thạnh",
      "Quận Gò Vấp",
      "Quận Phú Nhuận",
      "Quận Tân Bình",
      "Quận Tân Phú",
      "Quận Bình Tân",
      "Huyện Bình Chánh",
      "Huyện Cần Giờ",
      "Huyện Củ Chi",
      "Huyện Hóc Môn",
      "Huyện Nhà Bè",
      "TP Thủ Dầu Một",
      "TP Dĩ An",
      "TP Thuận An",
      "TP Tân Uyên",
      "TP Bến Cát",
      "Huyện Bàu Bàng",
      "Huyện Dầu Tiếng",
      "Huyện Phú Giáo",
      "Huyện Bắc Tân Uyên",
      "TP Vũng Tàu",
      "TP Bà Rịa",
      "Thị xã Phú Mỹ",
      "Huyện Châu Đức",
      "Huyện Côn Đảo",
      "Huyện Đất Đỏ",
      "Huyện Long Điền",
      "Huyện Xuyên Mộc"
    ]
  },
  {
    "id": "dong-nai",
    "name": "Đồng Nai",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Đồng Nai & Bình Phước",
    "formerProvinces": [
      "Đồng Nai",
      "Bình Phước"
    ],
    "districts": [
      "TP Biên Hòa",
      "TP Long Khánh",
      "Huyện Cẩm Mỹ",
      "Huyện Định Quán",
      "Huyện Long Thành",
      "Huyện Nhơn Trạch",
      "Huyện Tân Phú",
      "Huyện Thống Nhất",
      "Huyện Trảng Bom",
      "Huyện Vĩnh Cửu",
      "Huyện Xuân Lộc",
      "TP Đồng Xoài",
      "Thị xã Bình Long",
      "Thị xã Phước Long",
      "Thị xã Chơn Thành",
      "Huyện Bù Đăng",
      "Huyện Bù Đốp",
      "Huyện Bù Gia Mập",
      "Huyện Đồng Phú",
      "Huyện Hớn Quản",
      "Huyện Lộc Ninh",
      "Huyện Phú Riềng"
    ]
  },
  {
    "id": "tay-ninh",
    "name": "Tây Ninh",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Tây Ninh & Long An",
    "formerProvinces": [
      "Tây Ninh",
      "Long An"
    ],
    "districts": [
      "TP Tây Ninh",
      "Thị xã Hòa Thành",
      "Thị xã Trảng Bàng",
      "Huyện Bến Cầu",
      "Huyện Châu Thành",
      "Huyện Dương Minh Châu",
      "Huyện Gò Dầu",
      "Huyện Tân Biên",
      "Huyện Tân Châu",
      "TP Tân An",
      "Thị xã Kiến Tường",
      "Huyện Bến Lức",
      "Huyện Cần Đước",
      "Huyện Cần Giuộc",
      "Huyện Đức Hòa",
      "Huyện Đức Huệ",
      "Huyện Mộc Hóa",
      "Huyện Tân Hưng",
      "Huyện Tân Thạnh",
      "Huyện Tân Trụ",
      "Huyện Thạnh Hóa",
      "Huyện Thủ Thừa",
      "Huyện Vĩnh Hưng"
    ]
  },
  {
    "id": "can-tho",
    "name": "Cần Thơ",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Cần Thơ, Sóc Trăng & Hậu Giang",
    "formerProvinces": [
      "Cần Thơ",
      "Sóc Trăng",
      "Hậu Giang"
    ],
    "districts": [
      "Quận Ninh Kiều",
      "Quận Bình Thủy",
      "Quận Cái Răng",
      "Quận Ô Môn",
      "Quận Thốt Nốt",
      "Huyện Cờ Đỏ",
      "Huyện Phong Điền",
      "Huyện Thới Lai",
      "Huyện Vĩnh Thạnh",
      "TP Sóc Trăng",
      "Thị xã Vĩnh Châu",
      "Thị xã Ngã Năm",
      "Huyện Châu Thành",
      "Huyện Cù Lao Dung",
      "Huyện Kế Sách",
      "Huyện Long Phú",
      "Huyện Mỹ Tú",
      "Huyện Mỹ Xuyên",
      "Huyện Thạnh Trị",
      "Huyện Trần Đề",
      "TP Vị Thanh",
      "TP Ngã Bảy",
      "Thị xã Long Mỹ",
      "Huyện Châu Thành A",
      "Huyện Phụng Hiệp",
      "Huyện Vị Thủy",
      "Huyện Long Mỹ"
    ]
  },
  {
    "id": "vinh-long",
    "name": "Vĩnh Long",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Vĩnh Long, Bến Tre & Trà Vinh",
    "formerProvinces": [
      "Vĩnh Long",
      "Bến Tre",
      "Trà Vinh"
    ],
    "districts": [
      "TP Vĩnh Long",
      "Thị xã Bình Minh",
      "Huyện Bình Tân",
      "Huyện Long Hồ",
      "Huyện Mang Thít",
      "Huyện Tam Bình",
      "Huyện Trà Ôn",
      "Huyện Vũng Liêm",
      "TP Bến Tre",
      "Huyện Ba Tri",
      "Huyện Bình Đại",
      "Huyện Châu Thành",
      "Huyện Chợ Lách",
      "Huyện Giồng Trôm",
      "Huyện Mỏ Cày Bắc",
      "Huyện Mỏ Cày Nam",
      "Huyện Thạnh Phú",
      "TP Trà Vinh",
      "Thị xã Duyên Hải",
      "Huyện Càng Long",
      "Huyện Cầu Kè",
      "Huyện Cầu Ngang",
      "Huyện Duyên Hải",
      "Huyện Tiểu Cần",
      "Huyện Trà Cú"
    ]
  },
  {
    "id": "dong-thap",
    "name": "Đồng Tháp",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Đồng Tháp & Tiền Giang",
    "formerProvinces": [
      "Đồng Tháp",
      "Tiền Giang"
    ],
    "districts": [
      "TP Cao Lãnh",
      "TP Sa Đéc",
      "TP Hồng Ngự",
      "Huyện Cao Lãnh",
      "Huyện Châu Thành",
      "Huyện Hồng Ngự",
      "Huyện Lai Vung",
      "Huyện Lấp Vò",
      "Huyện Tam Nông",
      "Huyện Tân Hồng",
      "Huyện Thanh Bình",
      "Huyện Tháp Mười",
      "TP Mỹ Tho",
      "Thị xã Gò Công",
      "Thị xã Cai Lậy",
      "Huyện Cái Bè",
      "Huyện Cai Lậy",
      "Huyện Chợ Gạo",
      "Huyện Gò Công Đông",
      "Huyện Gò Công Tây",
      "Huyện Tân Phú Đông",
      "Huyện Tân Phước"
    ]
  },
  {
    "id": "ca-mau",
    "name": "Cà Mau",
    "region": "SOUTH",
    "subLabel": "Hợp nhất Cà Mau & Bạc Liêu",
    "formerProvinces": [
      "Cà Mau",
      "Bạc Liêu"
    ],
    "districts": [
      "TP Cà Mau",
      "Huyện Cái Nước",
      "Huyện Đầm Dơi",
      "Huyện Năm Căn",
      "Huyện Ngọc Hiển",
      "Huyện Phú Tân",
      "Huyện Thới Bình",
      "Huyện Trần Văn Thời",
      "Huyện U Minh",
      "TP Bạc Liêu",
      "Thị xã Giá Rai",
      "Huyện Đông Hải",
      "Huyện Hòa Bình",
      "Huyện Hồng Dân",
      "Huyện Phước Long",
      "Huyện Vĩnh Lợi"
    ]
  },
  {
    "id": "an-giang",
    "name": "An Giang",
    "region": "SOUTH",
    "subLabel": "Hợp nhất An Giang & Kiên Giang",
    "formerProvinces": [
      "An Giang",
      "Kiên Giang"
    ],
    "districts": [
      "TP Long Xuyên",
      "TP Châu Đốc",
      "Thị xã Tân Châu",
      "Thị xã Tịnh Biên",
      "Huyện An Phú",
      "Huyện Châu Phú",
      "Huyện Châu Thành",
      "Huyện Chợ Mới",
      "Huyện Phú Tân",
      "Huyện Thoại Sơn",
      "Huyện Tri Tôn",
      "TP Rạch Giá",
      "TP Hà Tiên",
      "TP Phú Quốc",
      "Huyện An Biên",
      "Huyện An Minh",
      "Huyện Giang Thành",
      "Huyện Giồng Riềng",
      "Huyện Gò Quao",
      "Huyện Hòn Đất",
      "Huyện Kiên Hải",
      "Huyện Kiên Lương",
      "Huyện Tân Hiệp",
      "Huyện U Minh Thượng",
      "Huyện Vĩnh Thuận"
    ]
  }
];

/**
 * Bản đồ tra cứu địa danh cũ (63 tỉnh thành trước đây) tự động ánh xạ sang 34 tỉnh thành mới
 * Giúp khách hàng gõ theo thói quen cũ (VD: Bắc Giang, Hải Dương, Bình Dương, Nam Định...)
 * vẫn lập tức tìm thấy đúng tỉnh thành mới.
 */
export const PROVINCE_ALIASES: Record<string, string> = {
  "bắc giang": "Bắc Ninh",
  "bac giang": "Bắc Ninh",
  "hải dương": "Hải Phòng",
  "hai duong": "Hải Phòng",
  "thái bình": "Hưng Yên",
  "thai binh": "Hưng Yên",
  "nam định": "Ninh Bình",
  "nam dinh": "Ninh Bình",
  "hà nam": "Ninh Bình",
  "ha nam": "Ninh Bình",
  "bắc kạn": "Thái Nguyên",
  "bac kan": "Thái Nguyên",
  "vĩnh phúc": "Phú Thọ",
  "vinh phuc": "Phú Thọ",
  "hòa bình": "Phú Thọ",
  "hoa binh": "Phú Thọ",
  "hà giang": "Tuyên Quang",
  "ha giang": "Tuyên Quang",
  "yên bái": "Lào Cai",
  "yen bai": "Lào Cai",
  "quảng bình": "Quảng Trị",
  "quang binh": "Quảng Trị",
  "thừa thiên huế": "Huế",
  "thua thien hue": "Huế",
  "quảng nam": "Đà Nẵng",
  "quang nam": "Đà Nẵng",
  "kon tum": "Quảng Ngãi",
  "bình định": "Gia Lai",
  "binh dinh": "Gia Lai",
  "phú yên": "Đắk Lắk",
  "phu yen": "Đắk Lắk",
  "ninh thuận": "Khánh Hòa",
  "ninh thuan": "Khánh Hòa",
  "đắk nông": "Lâm Đồng",
  "dak nong": "Lâm Đồng",
  "bình thuận": "Lâm Đồng",
  "binh thuan": "Lâm Đồng",
  "bình dương": "TP. Hồ Chí Minh",
  "binh duong": "TP. Hồ Chí Minh",
  "bà rịa - vũng tàu": "TP. Hồ Chí Minh",
  "bà rịa vũng tàu": "TP. Hồ Chí Minh",
  "vũng tàu": "TP. Hồ Chí Minh",
  "bình phước": "Đồng Nai",
  "binh phuoc": "Đồng Nai",
  "long an": "Tây Ninh",
  "sóc trăng": "Cần Thơ",
  "soc trang": "Cần Thơ",
  "hậu giang": "Cần Thơ",
  "hau giang": "Cần Thơ",
  "tiền giang": "Đồng Tháp",
  "tien giang": "Đồng Tháp",
  "bến tre": "Vĩnh Long",
  "ben tre": "Vĩnh Long",
  "trà vinh": "Vĩnh Long",
  "tra vinh": "Vĩnh Long",
  "kiên giang": "An Giang",
  "kien giang": "An Giang",
  "bạc liêu": "Cà Mau",
  "bac lieu": "Cà Mau"
};

export interface SPXShippingQuote {
  carrier: string;
  tierName: string;
  originalFee: number;
  fee: number;
  isFree: boolean;
  estimatedDelivery: string;
  routeType: 'SAME_PROVINCE' | 'SAME_REGION' | 'INTER_REGION';
}

/**
 * Tính toán cước phí vận chuyển SPX Express chuẩn theo 34 tỉnh thành mới
 * @param destinationProvince Tên tỉnh nhận hàng (vd: 'Bắc Ninh', 'Bắc Giang', 'Hà Nội', 'TP. Hồ Chí Minh')
 * @param subtotal Tiền hàng tạm tính
 * @param originProvince Tỉnh kho của Shop (mặc định: 'Bắc Ninh' - khu vực Bắc Giang cũ nay thuộc Bắc Ninh)
 * @param freeShippingThreshold Mức tiền hàng được miễn phí ship (mặc định 0: không tự ý freeship, tính đúng cước)
 */
export function calculateSPXShipping(
  destinationProvince: string,
  subtotal: number,
  originProvince: string = 'Bắc Ninh',
  freeShippingThreshold: number = 0
): SPXShippingQuote {
  let cleanDest = (destinationProvince || '').trim().toLowerCase();
  let cleanOrig = (originProvince || 'Bắc Ninh').trim().toLowerCase();

  // Ánh xạ tên tỉnh cũ sang tỉnh mới nếu khách hàng nhập tên cũ
  if (PROVINCE_ALIASES[cleanDest]) {
    cleanDest = PROVINCE_ALIASES[cleanDest].toLowerCase();
  }
  if (PROVINCE_ALIASES[cleanOrig]) {
    cleanOrig = PROVINCE_ALIASES[cleanOrig].toLowerCase();
  }

  const destInfo = VIETNAM_PROVINCES.find(
    (p) =>
      p.name.toLowerCase() === cleanDest ||
      cleanDest.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanDest) ||
      (p.formerProvinces && p.formerProvinces.some(fp => fp.toLowerCase() === cleanDest || cleanDest.includes(fp.toLowerCase())))
  );

  const origInfo = VIETNAM_PROVINCES.find(
    (p) =>
      p.name.toLowerCase() === cleanOrig ||
      cleanOrig.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanOrig) ||
      (p.formerProvinces && p.formerProvinces.some(fp => fp.toLowerCase() === cleanOrig || cleanOrig.includes(fp.toLowerCase())))
  ) || VIETNAM_PROVINCES.find(p => p.id === 'bac-ninh') || VIETNAM_PROVINCES[0];

  let routeType: 'SAME_PROVINCE' | 'SAME_REGION' | 'INTER_REGION' = 'SAME_REGION';
  let originalFee = 24000;
  let estimatedDelivery = '2 - 3 ngày';
  let tierName = 'SPX Nội Miền';

  if (!destInfo) {
    originalFee = 24000;
    estimatedDelivery = '2 - 3 ngày';
    tierName = 'SPX Tiết Kiệm';
  } else if (destInfo.id === origInfo.id || destInfo.name.toLowerCase() === origInfo.name.toLowerCase()) {
    routeType = 'SAME_PROVINCE';
    originalFee = 16500;
    estimatedDelivery = '1 - 2 ngày';
    tierName = 'SPX Nội Tỉnh (' + destInfo.name + ')';
  } else if (destInfo.region === origInfo.region) {
    routeType = 'SAME_REGION';
    originalFee = 24000;
    estimatedDelivery = '2 - 3 ngày';
    const regionName = destInfo.region === 'NORTH' ? 'Miền Bắc' : destInfo.region === 'CENTRAL' ? 'Miền Trung' : 'Miền Nam';
    tierName = 'SPX Nội Miền (' + regionName + ')';
  } else {
    routeType = 'INTER_REGION';
    originalFee = 30000;
    estimatedDelivery = '3 - 4 ngày';
    tierName = 'SPX Liên Miền';
  }

  const isFree = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const fee = isFree ? 0 : originalFee;

  return {
    carrier: 'SPX Express',
    tierName,
    originalFee,
    fee,
    isFree,
    estimatedDelivery,
    routeType
  };
}
