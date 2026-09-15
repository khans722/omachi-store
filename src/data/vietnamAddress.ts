export type Region = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface ProvinceData {
  id: string;
  name: string;
  region: Region;
  districts: string[];
}

export const VIETNAM_PROVINCES: ProvinceData[] = [
  // --- MIỀN BẮC (25 TỈNH THÀNH) ---
  {
    id: 'bac-giang',
    name: 'Bắc Giang',
    region: 'NORTH',
    districts: ['Huyện Yên Dũng', 'Thị xã Việt Yên', 'TP Bắc Giang', 'Huyện Hiệp Hòa', 'Huyện Lạng Giang', 'Huyện Lục Nam', 'Huyện Lục Ngạn', 'Huyện Sơn Động', 'Huyện Tân Yên', 'Huyện Yên Thế']
  },
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'NORTH',
    districts: ['Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Long Biên', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Quận Tây Hồ', 'Quận Hà Đông', 'Thị xã Sơn Tây', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 'Huyện Đông Anh', 'Huyện Gia Lâm', 'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai', 'Huyện Sóc Sơn', 'Huyện Thạch Thất', 'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Ứng Hòa']
  },
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh',
    region: 'NORTH',
    districts: ['TP Bắc Ninh', 'TP Từ Sơn', 'Thị xã Thuận Thành', 'Thị xã Quế Võ', 'Huyện Gia Bình', 'Huyện Lương Tài', 'Huyện Tiên Du', 'Huyện Yên Phong']
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    region: 'NORTH',
    districts: ['Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Quận Kiến An', 'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện Thủy Nguyên', 'Huyện An Dương', 'Huyện An Lão', 'Huyện Kiến Thụy', 'Huyện Tiên Lãng', 'Huyện Vĩnh Bảo', 'Huyện Cát Hải', 'Huyện Bạch Long Vĩ']
  },
  {
    id: 'hai-duong',
    name: 'Hải Dương',
    region: 'NORTH',
    districts: ['TP Hải Dương', 'TP Chí Linh', 'Thị xã Kinh Môn', 'Huyện Bình Giang', 'Huyện Cẩm Giàng', 'Huyện Gia Lộc', 'Huyện Kim Thành', 'Huyện Nam Sách', 'Huyện Ninh Giang', 'Huyện Thanh Hà', 'Huyện Thanh Miện', 'Huyện Tứ Kỳ']
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    region: 'NORTH',
    districts: ['TP Hạ Long', 'TP Cẩm Phả', 'TP Uông Bí', 'TP Móng Cái', 'Thị xã Đông Triều', 'Thị xã Quảng Yên', 'Huyện Ba Chẽ', 'Huyện Bình Liêu', 'Huyện Cô Tô', 'Huyện Đầm Hà', 'Huyện Hải Hà', 'Huyện Tiên Yên', 'Huyện Vân Đồn']
  },
  {
    id: 'hung-yen',
    name: 'Hưng Yên',
    region: 'NORTH',
    districts: ['TP Hưng Yên', 'Thị xã Mỹ Hào', 'Huyện Ân Thi', 'Huyện Khoái Châu', 'Huyện Kim Động', 'Huyện Phù Cừ', 'Huyện Tiên Lữ', 'Huyện Văn Giang', 'Huyện Văn Lâm', 'Huyện Yên Mỹ']
  },
  {
    id: 'thai-nguyen',
    name: 'Thái Nguyên',
    region: 'NORTH',
    districts: ['TP Thái Nguyên', 'TP Sông Công', 'TP Phổ Yên', 'Huyện Đại Từ', 'Huyện Định Hóa', 'Huyện Đồng Hỷ', 'Huyện Phú Bình', 'Huyện Phú Lương', 'Huyện Võ Nhai']
  },
  {
    id: 'vinh-phuc',
    name: 'Vĩnh Phúc',
    region: 'NORTH',
    districts: ['TP Vĩnh Yên', 'TP Phúc Yên', 'Huyện Bình Xuyên', 'Huyện Lập Thạch', 'Huyện Sông Lô', 'Huyện Tam Đảo', 'Huyện Tam Dương', 'Huyện Vĩnh Tường', 'Huyện Yên Lạc']
  },
  {
    id: 'phu-tho',
    name: 'Phú Thọ',
    region: 'NORTH',
    districts: ['TP Việt Trì', 'Thị xã Phú Thọ', 'Huyện Cẩm Khê', 'Huyện Đoan Hùng', 'Huyện Hạ Hòa', 'Huyện Lâm Thao', 'Huyện Phù Ninh', 'Huyện Tam Nông', 'Huyện Tân Sơn', 'Huyện Thanh Ba', 'Huyện Thanh Sơn', 'Huyện Thanh Thủy', 'Huyện Yên Lập']
  },
  {
    id: 'nam-dinh',
    name: 'Nam Định',
    region: 'NORTH',
    districts: ['TP Nam Định', 'Huyện Giao Thủy', 'Huyện Hải Hậu', 'Huyện Mỹ Lộc', 'Huyện Nam Trực', 'Huyện Nghĩa Hưng', 'Huyện Trực Ninh', 'Huyện Vụ Bản', 'Huyện Xuân Trường', 'Huyện Ý Yên']
  },
  {
    id: 'thai-binh',
    name: 'Thái Bình',
    region: 'NORTH',
    districts: ['TP Thái Bình', 'Huyện Đông Hưng', 'Huyện Hưng Hà', 'Huyện Kiến Xương', 'Huyện Quỳnh Phụ', 'Huyện Thái Thụy', 'Huyện Tiền Hải', 'Huyện Vũ Thư']
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'NORTH',
    districts: ['TP Ninh Bình', 'TP Tam Điệp', 'Huyện Gia Viễn', 'Huyện Hoa Lư', 'Huyện Kim Sơn', 'Huyện Nho Quan', 'Huyện Yên Khánh', 'Huyện Yên Mô']
  },
  {
    id: 'ha-nam',
    name: 'Hà Nam',
    region: 'NORTH',
    districts: ['TP Phủ Lý', 'Thị xã Duy Tiên', 'Huyện Bình Lục', 'Huyện Kim Bảng', 'Huyện Lý Nhân', 'Huyện Thanh Liêm']
  },
  {
    id: 'lang-son',
    name: 'Lạng Sơn',
    region: 'NORTH',
    districts: ['TP Lạng Sơn', 'Huyện Bắc Sơn', 'Huyện Bình Gia', 'Huyện Cao Lộc', 'Huyện Chi Lăng', 'Huyện Đình Lập', 'Huyện Hữu Lũng', 'Huyện Lộc Bình', 'Huyện Tràng Định', 'Huyện Văn Lãng', 'Huyện Văn Quan']
  },
  {
    id: 'lao-cai',
    name: 'Lào Cai',
    region: 'NORTH',
    districts: ['TP Lào Cai', 'Thị xã Sa Pa', 'Huyện Bát Xát', 'Huyện Bảo Thắng', 'Huyện Bảo Yên', 'Huyện Bắc Hà', 'Huyện Mường Khương', 'Huyện Si Ma Cai', 'Huyện Văn Bàn']
  },
  {
    id: 'yen-bai',
    name: 'Yên Bái',
    region: 'NORTH',
    districts: ['TP Yên Bái', 'Thị xã Nghĩa Lộ', 'Huyện Lục Yên', 'Huyện Mù Cang Chải', 'Huyện Trạm Tấu', 'Huyện Trấn Yên', 'Huyện Văn Chấn', 'Huyện Văn Yên', 'Huyện Yên Bình']
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyên Quang',
    region: 'NORTH',
    districts: ['TP Tuyên Quang', 'Huyện Chiêm Hóa', 'Huyện Hàm Yên', 'Huyện Lâm Bình', 'Huyện Na Hang', 'Huyện Sơn Dương', 'Huyện Yên Sơn']
  },
  {
    id: 'ha-giang',
    name: 'Hà Giang',
    region: 'NORTH',
    districts: ['TP Hà Giang', 'Huyện Bắc Mê', 'Huyện Bắc Quang', 'Huyện Đồng Văn', 'Huyện Hoàng Su Phì', 'Huyện Mèo Vạc', 'Huyện Quản Bạ', 'Huyện Quang Bình', 'Huyện Vị Xuyên', 'Huyện Xín Mần', 'Huyện Yên Minh']
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng',
    region: 'NORTH',
    districts: ['TP Cao Bằng', 'Huyện Bảo Lạc', 'Huyện Bảo Lâm', 'Huyện Hạ Lang', 'Huyện Hà Quảng', 'Huyện Hòa An', 'Huyện Nguyên Bình', 'Huyện Quảng Hòa', 'Huyện Thạch An', 'Huyện Trùng Khánh']
  },
  {
    id: 'bac-kan',
    name: 'Bắc Kạn',
    region: 'NORTH',
    districts: ['TP Bắc Kạn', 'Huyện Ba Bể', 'Huyện Bạch Thông', 'Huyện Chợ Đồn', 'Huyện Chợ Mới', 'Huyện Na Rì', 'Huyện Ngân Sơn', 'Huyện Pác Nặm']
  },
  {
    id: 'son-la',
    name: 'Sơn La',
    region: 'NORTH',
    districts: ['TP Sơn La', 'Huyện Bắc Yên', 'Huyện Mai Sơn', 'Huyện Mộc Châu', 'Huyện Mường La', 'Huyện Phù Yên', 'Huyện Quỳnh Nhai', 'Huyện Sông Mã', 'Huyện Sốp Cộp', 'Huyện Thuận Châu', 'Huyện Vân Hồ', 'Huyện Yên Châu']
  },
  {
    id: 'hoa-binh',
    name: 'Hòa Bình',
    region: 'NORTH',
    districts: ['TP Hòa Bình', 'Huyện Cao Phong', 'Huyện Đà Bắc', 'Huyện Kim Bôi', 'Huyện Lạc Sơn', 'Huyện Lạc Thủy', 'Huyện Lương Sơn', 'Huyện Mai Châu', 'Huyện Tân Lạc', 'Huyện Yên Thủy']
  },
  {
    id: 'dien-bien',
    name: 'Điện Biên',
    region: 'NORTH',
    districts: ['TP Điện Biên Phủ', 'Thị xã Mường Lay', 'Huyện Điện Biên', 'Huyện Điện Biên Đông', 'Huyện Mường Ảng', 'Huyện Mường Chà', 'Huyện Mường Nhé', 'Huyện Nậm Pồ', 'Huyện Tủa Chùa', 'Huyện Tuần Giáo']
  },
  {
    id: 'lai-chau',
    name: 'Lai Châu',
    region: 'NORTH',
    districts: ['TP Lai Châu', 'Huyện Mường Tè', 'Huyện Nậm Nhùn', 'Huyện Phong Thổ', 'Huyện Sìn Hồ', 'Huyện Tam Đường', 'Huyện Tân Uyên', 'Huyện Than Uyên']
  },

  // --- MIỀN TRUNG & TÂY NGUYÊN (19 TỈNH THÀNH) ---
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    region: 'CENTRAL',
    districts: ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hòa Vang', 'Huyện Hoàng Sa']
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    region: 'CENTRAL',
    districts: ['TP Thanh Hóa', 'TP Sầm Sơn', 'Thị xã Bỉm Sơn', 'Thị xã Nghi Sơn', 'Huyện Bá Thước', 'Huyện Cẩm Thủy', 'Huyện Đông Sơn', 'Huyện Hà Trung', 'Huyện Hậu Lộc', 'Huyện Hoằng Hóa', 'Huyện Lang Chánh', 'Huyện Mường Lát', 'Huyện Nga Sơn', 'Huyện Ngọc Lặc', 'Huyện Như Thanh', 'Huyện Như Xuân', 'Huyện Nông Cống', 'Huyện Quan Hóa', 'Huyện Quan Sơn', 'Huyện Quảng Xương', 'Huyện Thạch Thành', 'Huyện Thiệu Hóa', 'Huyện Thọ Xuân', 'Huyện Thường Xuân', 'Huyện Triệu Sơn', 'Huyện Vĩnh Lộc', 'Huyện Yên Định']
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    region: 'CENTRAL',
    districts: ['TP Vinh', 'Thị xã Cửa Lò', 'Thị xã Thái Hòa', 'Thị xã Hoàng Mai', 'Huyện Anh Sơn', 'Huyện Con Cuông', 'Huyện Diễn Châu', 'Huyện Đô Lương', 'Huyện Hưng Nguyên', 'Huyện Kỳ Sơn', 'Huyện Nam Đàn', 'Huyện Nghi Lộc', 'Huyện Nghĩa Đàn', 'Huyện Quế Phong', 'Huyện Quỳ Châu', 'Huyện Quỳ Hợp', 'Huyện Quỳnh Lưu', 'Huyện Tân Kỳ', 'Huyện Thanh Chương', 'Huyện Tương Dương', 'Huyện Yên Thành']
  },
  {
    id: 'ha-tinh',
    name: 'Hà Tĩnh',
    region: 'CENTRAL',
    districts: ['TP Hà Tĩnh', 'Thị xã Hồng Lĩnh', 'Thị xã Kỳ Anh', 'Huyện Cẩm Xuyên', 'Huyện Can Lộc', 'Huyện Đức Thọ', 'Huyện Hương Khê', 'Huyện Hương Sơn', 'Huyện Kỳ Anh', 'Huyện Lộc Hà', 'Huyện Nghi Xuân', 'Huyện Thạch Hà', 'Huyện Vũ Quang']
  },
  {
    id: 'quang-binh',
    name: 'Quảng Bình',
    region: 'CENTRAL',
    districts: ['TP Đồng Hới', 'Thị xã Ba Đồn', 'Huyện Bố Trạch', 'Huyện Lệ Thủy', 'Huyện Minh Hóa', 'Huyện Quảng Ninh', 'Huyện Quảng Trạch', 'Huyện Tuyên Hóa']
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị',
    region: 'CENTRAL',
    districts: ['TP Đông Hà', 'Thị xã Quảng Trị', 'Huyện Cam Lộ', 'Huyện Cồn Cỏ', 'Huyện Đakrông', 'Huyện Gio Linh', 'Huyện Hải Lăng', 'Huyện Hướng Hóa', 'Huyện Triệu Phong', 'Huyện Vĩnh Linh']
  },
  {
    id: 'thua-thien-hue',
    name: 'Thừa Thiên Huế',
    region: 'CENTRAL',
    districts: ['TP Huế', 'Thị xã Hương Thủy', 'Thị xã Hương Trà', 'Huyện A Lưới', 'Huyện Nam Đông', 'Huyện Phong Điền', 'Huyện Phú Lộc', 'Huyện Phú Vang', 'Huyện Quảng Điền']
  },
  {
    id: 'quang-nam',
    name: 'Quảng Nam',
    region: 'CENTRAL',
    districts: ['TP Tam Kỳ', 'TP Hội An', 'Thị xã Điện Bàn', 'Huyện Bắc Trà My', 'Huyện Đại Lộc', 'Huyện Đông Giang', 'Huyện Duy Xuyên', 'Huyện Hiệp Đức', 'Huyện Nam Giang', 'Huyện Nam Trà My', 'Huyện Nông Sơn', 'Huyện Núi Thành', 'Huyện Phú Ninh', 'Huyện Phước Sơn', 'Huyện Quế Sơn', 'Huyện Tây Giang', 'Huyện Thăng Bình', 'Huyện Tiên Phước']
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    region: 'CENTRAL',
    districts: ['TP Quảng Ngãi', 'Thị xã Đức Phổ', 'Huyện Ba Tơ', 'Huyện Bình Sơn', 'Huyện Lý Sơn', 'Huyện Minh Long', 'Huyện Mộ Đức', 'Huyện Nghĩa Hành', 'Huyện Sơn Hà', 'Huyện Sơn Tây', 'Huyện Sơn Tịnh', 'Huyện Trà Bồng', 'Huyện Tư Nghĩa']
  },
  {
    id: 'binh-dinh',
    name: 'Bình Định',
    region: 'CENTRAL',
    districts: ['TP Quy Nhơn', 'Thị xã An Nhơn', 'Thị xã Hoài Nhơn', 'Huyện An Lão', 'Huyện Hoài Ân', 'Huyện Phù Cát', 'Huyện Phù Mỹ', 'Huyện Tây Sơn', 'Huyện Tuy Phước', 'Huyện Vân Canh', 'Huyện Vĩnh Thạnh']
  },
  {
    id: 'phu-yen',
    name: 'Phú Yên',
    region: 'CENTRAL',
    districts: ['TP Tuy Hòa', 'Thị xã Sông Cầu', 'Thị xã Đông Hòa', 'Huyện Đồng Xuân', 'Huyện Phú Hòa', 'Huyện Sơn Hòa', 'Huyện Sông Hinh', 'Huyện Tây Hòa', 'Huyện Tuy An']
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa',
    region: 'CENTRAL',
    districts: ['TP Nha Trang', 'TP Cam Ranh', 'Thị xã Ninh Hòa', 'Huyện Cam Lâm', 'Huyện Diên Khánh', 'Huyện Khánh Sơn', 'Huyện Khánh Vĩnh', 'Huyện Vạn Ninh', 'Huyện Trường Sa']
  },
  {
    id: 'ninh-thuan',
    name: 'Ninh Thuận',
    region: 'CENTRAL',
    districts: ['TP Phan Rang - Tháp Chàm', 'Huyện Bác Ái', 'Huyện Ninh Hải', 'Huyện Ninh Phước', 'Huyện Ninh Sơn', 'Huyện Thuận Bắc', 'Huyện Thuận Nam']
  },
  {
    id: 'binh-thuan',
    name: 'Bình Thuận',
    region: 'CENTRAL',
    districts: ['TP Phan Thiết', 'Thị xã La Gi', 'Huyện Bắc Bình', 'Huyện Đức Linh', 'Huyện Hàm Tân', 'Huyện Hàm Thuận Bắc', 'Huyện Hàm Thuận Nam', 'Huyện Phú Quý', 'Huyện Tánh Linh', 'Huyện Tuy Phong']
  },
  {
    id: 'kon-tum',
    name: 'Kon Tum',
    region: 'CENTRAL',
    districts: ['TP Kon Tum', 'Huyện Đắk Glei', 'Huyện Đắk Hà', 'Huyện Đắk Tô', 'Huyện Ia H\' Drai', 'Huyện Kon Plông', 'Huyện Kon Rẫy', 'Huyện Ngọc Hồi', 'Huyện Sa Thầy', 'Huyện Tu Mơ Rông']
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai',
    region: 'CENTRAL',
    districts: ['TP Pleiku', 'Thị xã An Khê', 'Thị xã Ayun Pa', 'Huyện Chư Păh', 'Huyện Chư Prông', 'Huyện Chư Pưh', 'Huyện Chư Sê', 'Huyện Đắk Đoa', 'Huyện Đắk Pơ', 'Huyện Đức Cơ', 'Huyện Ia Grai', 'Huyện Ia Pa', 'Huyện K\'Bang', 'Huyện Kông Chro', 'Huyện Krông Pa', 'Huyện Mang Yang', 'Huyện Phú Thiện']
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk',
    region: 'CENTRAL',
    districts: ['TP Buôn Ma Thuột', 'Thị xã Buôn Hồ', 'Huyện Buôn Đôn', 'Huyện Cư Kuin', 'Huyện Cư M\'gar', 'Huyện Ea H\'leo', 'Huyện Ea Kar', 'Huyện Ea Súp', 'Huyện Krông Ana', 'Huyện Krông Bông', 'Huyện Krông Búk', 'Huyện Krông Năng', 'Huyện Krông Pắc', 'Huyện Lắk', 'Huyện M\'Đrắk']
  },
  {
    id: 'dak-nong',
    name: 'Đắk Nông',
    region: 'CENTRAL',
    districts: ['TP Gia Nghĩa', 'Huyện Cư Jút', 'Huyện Đắk Glong', 'Huyện Đắk Mil', 'Huyện Đắk R\'Lấp', 'Huyện Đắk Song', 'Huyện Krông Nô', 'Huyện Tuy Đức']
  },
  {
    id: 'lam-dong',
    name: 'Lâm Đồng',
    region: 'CENTRAL',
    districts: ['TP Đà Lạt', 'TP Bảo Lộc', 'Huyện Bảo Lâm', 'Huyện Cát Tiên', 'Huyện Di Linh', 'Huyện Đạ Huoai', 'Huyện Đạ Tẻh', 'Huyện Đam Rông', 'Huyện Đơn Dương', 'Huyện Đức Trọng', 'Huyện Lạc Dương', 'Huyện Lâm Hà']
  },

  // --- MIỀN NAM (19 TỈNH THÀNH) ---
  {
    id: 'tp-ho-chi-minh',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
    districts: ['TP Thủ Đức', 'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè']
  },
  {
    id: 'binh-duong',
    name: 'Bình Dương',
    region: 'SOUTH',
    districts: ['TP Thủ Dầu Một', 'TP Dĩ An', 'TP Thuận An', 'TP Tân Uyên', 'TP Bến Cát', 'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Huyện Bắc Tân Uyên']
  },
  {
    id: 'dong-nai',
    name: 'Đồng Nai',
    region: 'SOUTH',
    districts: ['TP Biên Hòa', 'TP Long Khánh', 'Huyện Cẩm Mỹ', 'Huyện Định Quán', 'Huyện Long Thành', 'Huyện Nhơn Trạch', 'Huyện Tân Phú', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc']
  },
  {
    id: 'ba-ria-vung-tau',
    name: 'Bà Rịa - Vũng Tàu',
    region: 'SOUTH',
    districts: ['TP Vũng Tàu', 'TP Bà Rịa', 'Thị xã Phú Mỹ', 'Huyện Châu Đức', 'Huyện Côn Đảo', 'Huyện Đất Đỏ', 'Huyện Long Điền', 'Huyện Xuyên Mộc']
  },
  {
    id: 'tay-ninh',
    name: 'Tây Ninh',
    region: 'SOUTH',
    districts: ['TP Tây Ninh', 'Thị xã Hòa Thành', 'Thị xã Trảng Bàng', 'Huyện Bến Cầu', 'Huyện Châu Thành', 'Huyện Dương Minh Châu', 'Huyện Gò Dầu', 'Huyện Tân Biên', 'Huyện Tân Châu']
  },
  {
    id: 'binh-phuoc',
    name: 'Bình Phước',
    region: 'SOUTH',
    districts: ['TP Đồng Xoài', 'Thị xã Bình Long', 'Thị xã Phước Long', 'Thị xã Chơn Thành', 'Huyện Bù Đăng', 'Huyện Bù Đốp', 'Huyện Bù Gia Mập', 'Huyện Đồng Phú', 'Huyện Hớn Quản', 'Huyện Lộc Ninh', 'Huyện Phú Riềng']
  },
  {
    id: 'long-an',
    name: 'Long An',
    region: 'SOUTH',
    districts: ['TP Tân An', 'Thị xã Kiến Tường', 'Huyện Bến Lức', 'Huyện Cần Đước', 'Huyện Cần Giuộc', 'Huyện Châu Thành', 'Huyện Đức Hòa', 'Huyện Đức Huệ', 'Huyện Mộc Hóa', 'Huyện Tân Hưng', 'Huyện Tân Thạnh', 'Huyện Tân Trụ', 'Huyện Thạnh Hóa', 'Huyện Thủ Thừa', 'Huyện Vĩnh Hưng']
  },
  {
    id: 'tien-giang',
    name: 'Tiền Giang',
    region: 'SOUTH',
    districts: ['TP Mỹ Tho', 'Thị xã Gò Công', 'Thị xã Cai Lậy', 'Huyện Cái Bè', 'Huyện Cai Lậy', 'Huyện Châu Thành', 'Huyện Chợ Gạo', 'Huyện Gò Công Đông', 'Huyện Gò Công Tây', 'Huyện Tân Phú Đông', 'Huyện Tân Phước']
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    region: 'SOUTH',
    districts: ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Quận Thốt Nốt', 'Huyện Cờ Đỏ', 'Huyện Phong Điền', 'Huyện Thới Lai', 'Huyện Vĩnh Thạnh']
  },
  {
    id: 'dong-thap',
    name: 'Đồng Tháp',
    region: 'SOUTH',
    districts: ['TP Cao Lãnh', 'TP Sa Đéc', 'TP Hồng Ngự', 'Huyện Cao Lãnh', 'Huyện Châu Thành', 'Huyện Hồng Ngự', 'Huyện Lai Vung', 'Huyện Lấp Vò', 'Huyện Tam Nông', 'Huyện Tân Hồng', 'Huyện Thanh Bình', 'Huyện Tháp Mười']
  },
  {
    id: 'an-giang',
    name: 'An Giang',
    region: 'SOUTH',
    districts: ['TP Long Xuyên', 'TP Châu Đốc', 'Thị xã Tân Châu', 'Thị xã Tịnh Biên', 'Huyện An Phú', 'Huyện Châu Phú', 'Huyện Châu Thành', 'Huyện Chợ Mới', 'Huyện Phú Tân', 'Huyện Thoại Sơn', 'Huyện Tri Tôn']
  },
  {
    id: 'ben-tre',
    name: 'Bến Tre',
    region: 'SOUTH',
    districts: ['TP Bến Tre', 'Huyện Ba Tri', 'Huyện Bình Đại', 'Huyện Châu Thành', 'Huyện Chợ Lách', 'Huyện Giồng Trôm', 'Huyện Mỏ Cày Bắc', 'Huyện Mỏ Cày Nam', 'Huyện Thạnh Phú']
  },
  {
    id: 'vinh-long',
    name: 'Vĩnh Long',
    region: 'SOUTH',
    districts: ['TP Vĩnh Long', 'Thị xã Bình Minh', 'Huyện Bình Tân', 'Huyện Long Hồ', 'Huyện Mang Thít', 'Huyện Tam Bình', 'Huyện Trà Ôn', 'Huyện Vũng Liêm']
  },
  {
    id: 'tra-vinh',
    name: 'Trà Vinh',
    region: 'SOUTH',
    districts: ['TP Trà Vinh', 'Thị xã Duyên Hải', 'Huyện Càng Long', 'Huyện Cầu Kè', 'Huyện Cầu Ngang', 'Huyện Châu Thành', 'Huyện Duyên Hải', 'Huyện Tiểu Cần', 'Huyện Trà Cú']
  },
  {
    id: 'hau-giang',
    name: 'Hậu Giang',
    region: 'SOUTH',
    districts: ['TP Vị Thanh', 'TP Ngã Bảy', 'Thị xã Long Mỹ', 'Huyện Châu Thành', 'Huyện Châu Thành A', 'Huyện Phụng Hiệp', 'Huyện Vị Thủy', 'Huyện Long Mỹ']
  },
  {
    id: 'kien-giang',
    name: 'Kiên Giang',
    region: 'SOUTH',
    districts: ['TP Rạch Giá', 'TP Hà Tiên', 'TP Phú Quốc', 'Huyện An Biên', 'Huyện An Minh', 'Huyện Châu Thành', 'Huyện Giang Thành', 'Huyện Giồng Riềng', 'Huyện Gò Quao', 'Huyện Hòn Đất', 'Huyện Kiên Hải', 'Huyện Kiên Lương', 'Huyện Tân Hiệp', 'Huyện U Minh Thượng', 'Huyện Vĩnh Thuận']
  },
  {
    id: 'soc-trang',
    name: 'Sóc Trăng',
    region: 'SOUTH',
    districts: ['TP Sóc Trăng', 'Thị xã Vĩnh Châu', 'Thị xã Ngã Năm', 'Huyện Châu Thành', 'Huyện Cù Lao Dung', 'Huyện Kế Sách', 'Huyện Long Phú', 'Huyện Mỹ Tú', 'Huyện Mỹ Xuyên', 'Huyện Thạnh Trị', 'Huyện Trần Đề']
  },
  {
    id: 'bac-lieu',
    name: 'Bạc Liêu',
    region: 'SOUTH',
    districts: ['TP Bạc Liêu', 'Thị xã Giá Rai', 'Huyện Đông Hải', 'Huyện Hòa Bình', 'Huyện Hồng Dân', 'Huyện Phước Long', 'Huyện Vĩnh Lợi']
  },
  {
    id: 'ca-mau',
    name: 'Cà Mau',
    region: 'SOUTH',
    districts: ['TP Cà Mau', 'Huyện Cái Nước', 'Huyện Đầm Dơi', 'Huyện Năm Căn', 'Huyện Ngọc Hiển', 'Huyện Phú Tân', 'Huyện Thới Bình', 'Huyện Trần Văn Thời', 'Huyện U Minh']
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
 * Tính toán cước phí vận chuyển SPX Express chuẩn cho gói hàng phụ kiện / cườm handmade
 * @param destinationProvince Tên tỉnh nhận hàng (vd: 'Bắc Giang', 'Hà Nội', 'TP. Hồ Chí Minh')
 * @param subtotal Tiền hàng tạm tính
 * @param originProvince Tỉnh kho của Shop (mặc định: 'Bắc Giang' hoặc 'Hà Nội')
 * @param freeShippingThreshold Mức tiền hàng được miễn phí ship (mặc định 0: không tự ý freeship, tính đúng cước)
 */
export function calculateSPXShipping(
  destinationProvince: string,
  subtotal: number,
  originProvince: string = 'Bắc Giang',
  freeShippingThreshold: number = 0
): SPXShippingQuote {
  const cleanDest = (destinationProvince || '').trim().toLowerCase();
  const cleanOrig = (originProvince || 'Bắc Giang').trim().toLowerCase();

  const destInfo = VIETNAM_PROVINCES.find(
    (p) => p.name.toLowerCase() === cleanDest || cleanDest.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanDest)
  );
  const origInfo = VIETNAM_PROVINCES.find(
    (p) => p.name.toLowerCase() === cleanOrig || cleanOrig.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanOrig)
  ) || VIETNAM_PROVINCES[0]; // Mặc định Bắc Giang

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
    tierName = `SPX Nội Tỉnh (${destInfo.name})`;
  } else if (destInfo.region === origInfo.region) {
    routeType = 'SAME_REGION';
    originalFee = 24000;
    estimatedDelivery = '2 - 3 ngày';
    tierName = `SPX Nội Miền (${destInfo.region === 'NORTH' ? 'Miền Bắc' : destInfo.region === 'CENTRAL' ? 'Miền Trung' : 'Miền Nam'})`;
  } else {
    routeType = 'INTER_REGION';
    originalFee = 30000;
    estimatedDelivery = '3 - 4 ngày';
    tierName = 'SPX Liên Miền';
  }

  // Không tự ý miễn phí ship: Tính đúng phí vận chuyển SPX theo tuyến
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
