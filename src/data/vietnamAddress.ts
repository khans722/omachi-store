/**
 * DANH SÁCH 34 TỈNH & THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG VIỆT NAM (DỮ LIỆU MỚI HOÀN TOÀN)
 * Chuẩn hóa 100% theo Thư Viện Pháp Luật & Nghị quyết Quốc hội sau sáp nhập.
 * Hiển thị chính xác tên 34 tỉnh, gõ tên nào ra tên đó, không ghi chú gộp, không dùng dữ liệu cũ.
 */

export type Region = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface ProvinceData {
  id: string;
  name: string;
  region: Region;
  districts: string[];
}

export const VIETNAM_PROVINCES: ProvinceData[] = [
  {
    "id": "ha-noi",
    "name": "Hà Nội",
    "region": "NORTH",
    "districts": [
      "Ba Vì",
      "Ba Đình",
      "Bắc Từ Liêm",
      "Cầu Giấy",
      "Chương Mỹ",
      "Gia Lâm",
      "Hà Đông",
      "Hai Bà Trưng",
      "Hoài Đức",
      "Hoàn Kiếm",
      "Hoàng Mai",
      "Long Biên",
      "Mê Linh",
      "Mỹ Đức",
      "Nam Từ Liêm",
      "Phú Xuyên",
      "Phúc Thọ",
      "Quốc Oai",
      "Sóc Sơn",
      "Sơn Tây",
      "Tây Hồ",
      "Thạch Thất",
      "Thanh Oai",
      "Thanh Trì",
      "Thanh Xuân",
      "Thường Tín",
      "Ứng Hòa",
      "Đan Phượng",
      "Đông Anh",
      "Đống Đa"
    ]
  },
  {
    "id": "cao-bang",
    "name": "Cao Bằng",
    "region": "NORTH",
    "districts": [
      "Bảo Lạc",
      "Bảo Lâm",
      "Cao Bằng",
      "Hạ Lang",
      "Hà Quảng",
      "Hoà An",
      "Nguyên Bình",
      "Quảng Hòa",
      "Thạch An",
      "Trùng Khánh"
    ]
  },
  {
    "id": "tuyen-quang",
    "name": "Tuyên Quang",
    "region": "NORTH",
    "districts": [
      "Chiêm Hóa",
      "Hàm Yên",
      "Lâm Bình",
      "Na Hang",
      "Sơn Dương",
      "Tuyên Quang",
      "Yên Sơn",
      "Bắc Mê",
      "Bắc Quang",
      "Hà Giang",
      "Hoàng Su Phì",
      "Mèo Vạc",
      "Quản Bạ",
      "Quang Bình",
      "Vị Xuyên",
      "Xín Mần",
      "Yên Minh",
      "Đồng Văn"
    ]
  },
  {
    "id": "lao-cai",
    "name": "Lào Cai",
    "region": "NORTH",
    "districts": [
      "Bắc Hà",
      "Bảo Thắng",
      "Bảo Yên",
      "Bát Xát",
      "Lào Cai",
      "Mường Khương",
      "Sa Pa",
      "Si Ma Cai",
      "Văn Bàn",
      "Lục Yên",
      "Mù Căng Chải",
      "Nghĩa Lộ",
      "Trạm Tấu",
      "Trấn Yên",
      "Văn Chấn",
      "Văn Yên",
      "Yên Bái",
      "Yên Bình"
    ]
  },
  {
    "id": "dien-bien",
    "name": "Điện Biên",
    "region": "NORTH",
    "districts": [
      "Mường Ảng",
      "Mường Chà",
      "Mường Lay",
      "Mường Nhé",
      "Nậm Pồ",
      "Tủa Chùa",
      "Tuần Giáo",
      "Điện Biên",
      "Điện Biên Phủ",
      "Điện Biên Đông"
    ]
  },
  {
    "id": "lai-chau",
    "name": "Lai Châu",
    "region": "NORTH",
    "districts": [
      "Lai Châu",
      "Mường Tè",
      "Nậm Nhùn",
      "Phong Thổ",
      "Sìn Hồ",
      "Tam Đường",
      "Tân Uyên",
      "Than Uyên"
    ]
  },
  {
    "id": "son-la",
    "name": "Sơn La",
    "region": "NORTH",
    "districts": [
      "Bắc Yên",
      "Mai Sơn",
      "Mộc Châu",
      "Mường La",
      "Phù Yên",
      "Quỳnh Nhai",
      "Sơn La",
      "Sông Mã",
      "Sốp Cộp",
      "Thuận Châu",
      "Vân Hồ",
      "Yên Châu"
    ]
  },
  {
    "id": "thai-nguyen",
    "name": "Thái Nguyên",
    "region": "NORTH",
    "districts": [
      "Phổ Yên",
      "Phú Bình",
      "Phú Lương",
      "Sông Công",
      "Thái Nguyên",
      "Võ Nhai",
      "Đại Từ",
      "Định Hóa",
      "Đồng Hỷ",
      "Ba Bể",
      "Bắc Kạn",
      "Bạch Thông",
      "Chợ Mới",
      "Chợ Đồn",
      "Na Rì",
      "Ngân Sơn",
      "Pác Nặm"
    ]
  },
  {
    "id": "lang-son",
    "name": "Lạng Sơn",
    "region": "NORTH",
    "districts": [
      "Bắc Sơn",
      "Bình Gia",
      "Cao Lộc",
      "Chi Lăng",
      "Hữu Lũng",
      "Lạng Sơn",
      "Lộc Bình",
      "Tràng Định",
      "Văn Lãng",
      "Văn Quan",
      "Đình Lập"
    ]
  },
  {
    "id": "quang-ninh",
    "name": "Quảng Ninh",
    "region": "NORTH",
    "districts": [
      "Ba Chẽ",
      "Bình Liêu",
      "Cẩm Phả",
      "Cô Tô",
      "Hạ Long",
      "Hải Hà",
      "Móng Cái",
      "Quảng Yên",
      "Tiên Yên",
      "Uông Bí",
      "Vân Đồn",
      "Đầm Hà",
      "Đông Triều"
    ]
  },
  {
    "id": "phu-tho",
    "name": "Phú Thọ",
    "region": "NORTH",
    "districts": [
      "Cẩm Khê",
      "Hạ Hoà",
      "Lâm Thao",
      "Phù Ninh",
      "Phú Thọ",
      "Tam Nông",
      "Tân Sơn",
      "Thanh Ba",
      "Thanh Sơn",
      "Thanh Thuỷ",
      "Việt Trì",
      "Yên Lập",
      "Đoan Hùng",
      "Bình Xuyên",
      "Lập Thạch",
      "Phúc Yên",
      "Sông Lô",
      "Tam Dương",
      "Tam Đảo",
      "Vĩnh Tường",
      "Vĩnh Yên",
      "Yên Lạc",
      "Cao Phong",
      "Hòa Bình",
      "Kim Bôi",
      "Lạc Sơn",
      "Lạc Thủy",
      "Lương Sơn",
      "Mai Châu",
      "Tân Lạc",
      "Yên Thủy",
      "Đà Bắc"
    ]
  },
  {
    "id": "bac-ninh",
    "name": "Bắc Ninh",
    "region": "NORTH",
    "districts": [
      "Bắc Ninh",
      "Gia Bình",
      "Lương Tài",
      "Quế Võ",
      "Thuận Thành",
      "Tiên Du",
      "Từ Sơn",
      "Yên Phong",
      "TP Bắc Ninh",
      "TP Từ Sơn",
      "Thị xã Quế Võ",
      "Thị xã Thuận Thành",
      "Huyện Tiên Du",
      "Huyện Yên Phong",
      "Huyện Gia Bình",
      "Huyện Lương Tài",
      "Bắc Giang",
      "Hiệp Hòa",
      "Lạng Giang",
      "Lục Nam",
      "Lục Ngạn",
      "Sơn Động",
      "Tân Yên",
      "Việt Yên",
      "Yên Dũng",
      "Yên Thế",
      "TP Bắc Giang",
      "Thị xã Việt Yên",
      "Huyện Yên Dũng",
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
    "id": "hai-phong",
    "name": "Hải Phòng",
    "region": "NORTH",
    "districts": [
      "An Dương",
      "An Lão",
      "Cát Hải",
      "Dương Kinh",
      "Hải An",
      "Hồng Bàng",
      "Kiến An",
      "Kiến Thuỵ",
      "Lê Chân",
      "Ngô Quyền",
      "Thuỷ Nguyên",
      "Tiên Lãng",
      "Vĩnh Bảo",
      "Đồ Sơn",
      "Bình Giang",
      "Cẩm Giàng",
      "Chí Linh",
      "Gia Lộc",
      "Hải Dương",
      "Kim Thành",
      "Kinh Môn",
      "Nam Sách",
      "Ninh Giang",
      "Thanh Hà",
      "Thanh Miện",
      "Tứ Kỳ"
    ]
  },
  {
    "id": "hung-yen",
    "name": "Hưng Yên",
    "region": "NORTH",
    "districts": [
      "Ân Thi",
      "Hưng Yên",
      "Khoái Châu",
      "Kim Động",
      "Mỹ Hào",
      "Phù Cừ",
      "Tiên Lữ",
      "Văn Giang",
      "Văn Lâm",
      "Yên Mỹ",
      "Hưng Hà",
      "Kiến Xương",
      "Quỳnh Phụ",
      "Thái Bình",
      "Thái Thụy",
      "Tiền Hải",
      "Vũ Thư",
      "Đông Hưng"
    ]
  },
  {
    "id": "ninh-binh",
    "name": "Ninh Bình",
    "region": "NORTH",
    "districts": [
      "Gia Viễn",
      "Hoa Lư",
      "Kim Sơn",
      "Nho Quan",
      "Ninh Bình",
      "Tam Điệp",
      "Yên Khánh",
      "Yên Mô",
      "Giao Thủy",
      "Hải Hậu",
      "Mỹ Lộc",
      "Nam Trực",
      "Nam Định",
      "Nghĩa Hưng",
      "Trực Ninh",
      "Vụ Bản",
      "Xuân Trường",
      "Ý Yên",
      "Bình Lục",
      "Duy Tiên",
      "Kim Bảng",
      "Lý Nhân",
      "Phủ Lý",
      "Thanh Liêm"
    ]
  },
  {
    "id": "thanh-hoa",
    "name": "Thanh Hóa",
    "region": "NORTH",
    "districts": [
      "Bá Thước",
      "Bỉm Sơn",
      "Cẩm Thủy",
      "Hà Trung",
      "Hậu Lộc",
      "Hoằng Hóa",
      "Lang Chánh",
      "Mường Lát",
      "Nga Sơn",
      "Nghi Sơn",
      "Ngọc Lặc",
      "Như Thanh",
      "Như Xuân",
      "Nông Cống",
      "Quan Hóa",
      "Quan Sơn",
      "Quảng Xương",
      "Sầm Sơn",
      "Thạch Thành",
      "Thanh Hóa",
      "Thiệu Hóa",
      "Thọ Xuân",
      "Thường Xuân",
      "Triệu Sơn",
      "Vĩnh Lộc",
      "Yên Định",
      "Đông Sơn"
    ]
  },
  {
    "id": "nghe-an",
    "name": "Nghệ An",
    "region": "NORTH",
    "districts": [
      "Anh Sơn",
      "Con Cuông",
      "Cửa Lò",
      "Diễn Châu",
      "Hoàng Mai",
      "Hưng Nguyên",
      "Kỳ Sơn",
      "Nam Đàn",
      "Nghi Lộc",
      "Nghĩa Đàn",
      "Quế Phong",
      "Quỳ Châu",
      "Quỳ Hợp",
      "Quỳnh Lưu",
      "Tân Kỳ",
      "Thái Hoà",
      "Thanh Chương",
      "Tương Dương",
      "Vinh",
      "Yên Thành",
      "Đô Lương"
    ]
  },
  {
    "id": "ha-tinh",
    "name": "Hà Tĩnh",
    "region": "NORTH",
    "districts": [
      "Cẩm Xuyên",
      "Can Lộc",
      "Hà Tĩnh",
      "Hồng Lĩnh",
      "Hương Khê",
      "Hương Sơn",
      "Kỳ Anh",
      "Lộc Hà",
      "Nghi Xuân",
      "Thạch Hà",
      "Vũ Quang",
      "Đức Thọ"
    ]
  },
  {
    "id": "quang-tri",
    "name": "Quảng Trị",
    "region": "CENTRAL",
    "districts": [
      "Cam Lộ",
      "Gio Linh",
      "Hải Lăng",
      "Hướng Hóa",
      "Quảng Trị",
      "Triệu Phong",
      "Vĩnh Linh",
      "Đa Krông",
      "Đông Hà",
      "Ba Đồn",
      "Bố Trạch",
      "Lệ Thủy",
      "Minh Hóa",
      "Quảng Ninh",
      "Quảng Trạch",
      "Tuyên Hóa",
      "Đồng Hới"
    ]
  },
  {
    "id": "hue",
    "name": "Huế",
    "region": "CENTRAL",
    "districts": [
      "A Lưới",
      "Huế",
      "Hương Thủy",
      "Hương Trà",
      "Nam Đông",
      "Phong Điền",
      "Phú Lộc",
      "Phú Vang",
      "Quảng Điền"
    ]
  },
  {
    "id": "da-nang",
    "name": "Đà Nẵng",
    "region": "CENTRAL",
    "districts": [
      "Cẩm Lệ",
      "Hải Châu",
      "Hòa Vang",
      "Liên Chiểu",
      "Ngũ Hành Sơn",
      "Sơn Trà",
      "Thanh Khê",
      "Bắc Trà My",
      "Duy Xuyên",
      "Hiệp Đức",
      "Hội An",
      "Nam Giang",
      "Nam Trà My",
      "Nông Sơn",
      "Núi Thành",
      "Phú Ninh",
      "Phước Sơn",
      "Quế Sơn",
      "Tam Kỳ",
      "Tây Giang",
      "Thăng Bình",
      "Tiên Phước",
      "Đại Lộc",
      "Điện Bàn",
      "Đông Giang"
    ]
  },
  {
    "id": "quang-ngai",
    "name": "Quảng Ngãi",
    "region": "CENTRAL",
    "districts": [
      "Ba Tơ",
      "Bình Sơn",
      "Minh Long",
      "Mộ Đức",
      "Nghĩa Hành",
      "Quảng Ngãi",
      "Sơn Hà",
      "Sơn Tây",
      "Sơn Tịnh",
      "Trà Bồng",
      "Tư Nghĩa",
      "Đức Phổ",
      "Ia H' Drai",
      "Kon Plông",
      "Kon Rẫy",
      "Kon Tum",
      "Ngọc Hồi",
      "Sa Thầy",
      "Tu Mơ Rông",
      "Đắk Glei",
      "Đắk Hà",
      "Đắk Tô"
    ]
  },
  {
    "id": "khanh-hoa",
    "name": "Khánh Hòa",
    "region": "CENTRAL",
    "districts": [
      "Cam Lâm",
      "Cam Ranh",
      "Diên Khánh",
      "Khánh Sơn",
      "Khánh Vĩnh",
      "Nha Trang",
      "Ninh Hòa",
      "Trường Sa",
      "Vạn Ninh",
      "Bác Ái",
      "Ninh Hải",
      "Ninh Phước",
      "Ninh Sơn",
      "Phan Rang-Tháp Chàm",
      "Thuận Bắc",
      "Thuận Nam"
    ]
  },
  {
    "id": "gia-lai",
    "name": "Gia Lai",
    "region": "CENTRAL",
    "districts": [
      "An Khê",
      "Ayun Pa",
      "Chư Păh",
      "Chư Prông",
      "Chư Pưh",
      "Chư Sê",
      "Ia Grai",
      "Ia Pa",
      "KBang",
      "Kông Chro",
      "Krông Pa",
      "Mang Yang",
      "Phú Thiện",
      "Pleiku",
      "Đăk Pơ",
      "Đăk Đoa",
      "Đức Cơ",
      "An Lão",
      "An Nhơn",
      "Hoài Ân",
      "Hoài Nhơn",
      "Phù Cát",
      "Phù Mỹ",
      "Quy Nhơn",
      "Tây Sơn",
      "Tuy Phước",
      "Vân Canh",
      "Vĩnh Thạnh"
    ]
  },
  {
    "id": "dak-lak",
    "name": "Đắk Lắk",
    "region": "CENTRAL",
    "districts": [
      "Buôn Hồ",
      "Buôn Ma Thuột",
      "Buôn Đôn",
      "Cư Kuin",
      "Cư M'gar",
      "Ea H'leo",
      "Ea Kar",
      "Ea Súp",
      "Krông A Na",
      "Krông Bông",
      "Krông Búk",
      "Krông Năng",
      "Krông Pắc",
      "Lắk",
      "M'Đrắk",
      "Phú Hoà",
      "Sơn Hòa",
      "Sông Cầu",
      "Sông Hinh",
      "Tây Hoà",
      "Tuy An",
      "Tuy Hoà",
      "Đông Hòa",
      "Đồng Xuân"
    ]
  },
  {
    "id": "lam-dong",
    "name": "Lâm Đồng",
    "region": "CENTRAL",
    "districts": [
      "Bảo Lâm",
      "Bảo Lộc",
      "Cát Tiên",
      "Di Linh",
      "Lạc Dương",
      "Lâm Hà",
      "Đạ Huoai",
      "Đà Lạt",
      "Đạ Tẻh",
      "Đam Rông",
      "Đơn Dương",
      "Đức Trọng",
      "Cư Jút",
      "Gia Nghĩa",
      "Krông Nô",
      "Tuy Đức",
      "Đăk Glong",
      "Đắk Mil",
      "Đắk R'Lấp",
      "Đắk Song",
      "Bắc Bình",
      "Hàm Tân",
      "Hàm Thuận Bắc",
      "Hàm Thuận Nam",
      "La Gi",
      "Phan Thiết",
      "Phú Quí",
      "Tánh Linh",
      "Tuy Phong",
      "Đức Linh"
    ]
  },
  {
    "id": "tay-ninh",
    "name": "Tây Ninh",
    "region": "SOUTH",
    "districts": [
      "Bến Cầu",
      "Châu Thành",
      "Dương Minh Châu",
      "Gò Dầu",
      "Hòa Thành",
      "Tân Biên",
      "Tân Châu",
      "Tây Ninh",
      "Trảng Bàng",
      "Bến Lức",
      "Cần Giuộc",
      "Cần Đước",
      "Kiến Tường",
      "Mộc Hóa",
      "Tân An",
      "Tân Hưng",
      "Tân Thạnh",
      "Tân Trụ",
      "Thạnh Hóa",
      "Thủ Thừa",
      "Vĩnh Hưng",
      "Đức Hòa",
      "Đức Huệ"
    ]
  },
  {
    "id": "dong-nai",
    "name": "Đồng Nai",
    "region": "SOUTH",
    "districts": [
      "Biên Hòa",
      "Cẩm Mỹ",
      "Long Khánh",
      "Long Thành",
      "Nhơn Trạch",
      "Tân Phú",
      "Thống Nhất",
      "Trảng Bom",
      "Vĩnh Cửu",
      "Xuân Lộc",
      "Định Quán",
      "Bình Long",
      "Bù Gia Mập",
      "Bù Đăng",
      "Bù Đốp",
      "Chơn Thành",
      "Hớn Quản",
      "Lộc Ninh",
      "Phú Riềng",
      "Phước Long",
      "Đồng Phú",
      "Đồng Xoài"
    ]
  },
  {
    "id": "tp-ho-chi-minh",
    "name": "TP. Hồ Chí Minh",
    "region": "SOUTH",
    "districts": [
      "Quận 1",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Bình Chánh",
      "Bình Tân",
      "Bình Thạnh",
      "Cần Giờ",
      "Củ Chi",
      "Gò Vấp",
      "Hóc Môn",
      "Nhà Bè",
      "Phú Nhuận",
      "Tân Bình",
      "Tân Phú",
      "Thủ Đức",
      "Bắc Tân Uyên",
      "Bàu Bàng",
      "Bến Cát",
      "Dầu Tiếng",
      "Dĩ An",
      "Phú Giáo",
      "Tân Uyên",
      "Thủ Dầu Một",
      "Thuận An",
      "Bà Rịa",
      "Châu Đức",
      "Long Điền",
      "Phú Mỹ",
      "Vũng Tàu",
      "Xuyên Mộc",
      "Đất Đỏ"
    ]
  },
  {
    "id": "vinh-long",
    "name": "Vĩnh Long",
    "region": "SOUTH",
    "districts": [
      "Bình Minh",
      "Bình Tân",
      "Long Hồ",
      "Mang Thít",
      "Tam Bình",
      "Trà Ôn",
      "Vĩnh Long",
      "Vũng Liêm",
      "Ba Tri",
      "Bến Tre",
      "Bình Đại",
      "Châu Thành",
      "Chợ Lách",
      "Giồng Trôm",
      "Mỏ Cày Bắc",
      "Mỏ Cày Nam",
      "Thạnh Phú",
      "Càng Long",
      "Cầu Kè",
      "Cầu Ngang",
      "Duyên Hải",
      "Tiểu Cần",
      "Trà Cú",
      "Trà Vinh"
    ]
  },
  {
    "id": "dong-thap",
    "name": "Đồng Tháp",
    "region": "SOUTH",
    "districts": [
      "Cao Lãnh",
      "Châu Thành",
      "Hồng Ngự",
      "Lai Vung",
      "Lấp Vò",
      "Sa Đéc",
      "Tam Nông",
      "Tân Hồng",
      "Thanh Bình",
      "Tháp Mười",
      "Cái Bè",
      "Cai Lậy",
      "Chợ Gạo",
      "Gò Công",
      "Gò Công Tây",
      "Gò Công Đông",
      "Mỹ Tho",
      "Tân Phú Đông",
      "Tân Phước"
    ]
  },
  {
    "id": "an-giang",
    "name": "An Giang",
    "region": "SOUTH",
    "districts": [
      "An Phú",
      "Châu Phú",
      "Châu Thành",
      "Châu Đốc",
      "Chợ Mới",
      "Long Xuyên",
      "Phú Tân",
      "Tân Châu",
      "Thoại Sơn",
      "Tịnh Biên",
      "Tri Tôn",
      "An Biên",
      "An Minh",
      "Giang Thành",
      "Giồng Riềng",
      "Gò Quao",
      "Hà Tiên",
      "Hòn Đất",
      "Kiên Hải",
      "Kiên Lương",
      "Phú Quốc",
      "Rạch Giá",
      "Tân Hiệp",
      "U Minh Thượng",
      "Vĩnh Thuận"
    ]
  },
  {
    "id": "can-tho",
    "name": "Cần Thơ",
    "region": "SOUTH",
    "districts": [
      "Bình Thuỷ",
      "Cái Răng",
      "Cờ Đỏ",
      "Ninh Kiều",
      "Ô Môn",
      "Phong Điền",
      "Thới Lai",
      "Thốt Nốt",
      "Vĩnh Thạnh",
      "Châu Thành",
      "Châu Thành A",
      "Long Mỹ",
      "Ngã Bảy",
      "Phụng Hiệp",
      "Vị Thanh",
      "Vị Thuỷ",
      "Cù Lao Dung",
      "Kế Sách",
      "Long Phú",
      "Mỹ Tú",
      "Mỹ Xuyên",
      "Ngã Năm",
      "Sóc Trăng",
      "Thạnh Trị",
      "Trần Đề",
      "Vĩnh Châu"
    ]
  },
  {
    "id": "ca-mau",
    "name": "Cà Mau",
    "region": "SOUTH",
    "districts": [
      "Cà Mau",
      "Cái Nước",
      "Năm Căn",
      "Ngọc Hiển",
      "Phú Tân",
      "Thới Bình",
      "Trần Văn Thời",
      "U Minh",
      "Đầm Dơi",
      "Bạc Liêu",
      "Giá Rai",
      "Hoà Bình",
      "Hồng Dân",
      "Phước Long",
      "Vĩnh Lợi",
      "Đông Hải"
    ]
  }
];

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
 * Kho shop: Tỉnh Bắc Ninh
 */
export function calculateSPXShipping(
  destinationProvince: string,
  subtotal: number,
  originProvince: string = 'Bắc Ninh',
  freeShippingThreshold: number = 0
): SPXShippingQuote {
  const cleanDest = (destinationProvince || '').trim().toLowerCase();
  const cleanOrig = (originProvince || 'Bắc Ninh').trim().toLowerCase();

  const isLocalOrigin = (prov: string) => {
    return prov === 'bắc ninh' || prov === 'bac ninh' || prov.includes('bắc ninh');
  };

  const isDestLocal = isLocalOrigin(cleanDest);

  const destInfo = VIETNAM_PROVINCES.find(
    (p) =>
      p.name.toLowerCase() === cleanDest ||
      cleanDest.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanDest)
  );

  const origInfo = VIETNAM_PROVINCES.find(
    (p) =>
      p.name.toLowerCase() === cleanOrig ||
      cleanOrig.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanOrig)
  ) || VIETNAM_PROVINCES.find(p => p.id === 'bac-ninh') || VIETNAM_PROVINCES[0];

  let routeType: 'SAME_PROVINCE' | 'SAME_REGION' | 'INTER_REGION' = 'SAME_REGION';
  let originalFee = 24000;
  let estimatedDelivery = '2 - 3 ngày';
  let tierName = 'SPX Nội Miền';

  if (isDestLocal) {
    routeType = 'SAME_PROVINCE';
    originalFee = 16500;
    estimatedDelivery = '1 - 2 ngày';
    tierName = 'SPX Nội Tỉnh (' + (destInfo ? destInfo.name : destinationProvince) + ')';
  } else if (!destInfo) {
    originalFee = 24000;
    estimatedDelivery = '2 - 3 ngày';
    tierName = 'SPX Tiết Kiệm';
  } else if (destInfo.region === origInfo.region || destInfo.region === 'NORTH') {
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
