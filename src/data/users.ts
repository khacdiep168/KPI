export interface AppUser {
  manv: string;
  name: string;
  dept: string;
  title: string;
  password?: string;
  status?: "ACTIVE" | "INACTIVE";
  role: "User" | "Manager" | "Admin";
}

export const INITIAL_USERS: AppUser[] = [
  {
    "manv": "BGD01",
    "name": "BAN GIÁM ĐỐC",
    "dept": "BAN GIÁM ĐỐC",
    "title": "GIÁM ĐỐC",
    "role": "Admin"
  },
  {
    "manv": "HC01",
    "name": "QUẢN LÝ HÀNH CHÍNH",
    "dept": "HÀNH CHÍNH",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "DTK01",
    "name": "QUẢN LÝ ĐIỂM TẬP KẾT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "KD01",
    "name": "QUẢN LÝ KINH DOANH",
    "dept": "PHÒNG KINH DOANH",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "KT01",
    "name": "QUẢN LÝ KẾ TOÁN",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "TKV11",
    "name": "TRỊNH THANH THÚY",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV33",
    "name": "TRẦN VĂN ĐẠT",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV17",
    "name": "TRẦN THỊ HIỀN",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "QUẢN LÝ KẾ TOÁN",
    "role": "Manager"
  },
  {
    "manv": "TKV40",
    "name": "LÊ VĂN CHƯƠNG",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV28",
    "name": "VÕ THỊ TRÀ GIANG",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV24",
    "name": "PHẠM QUỐC SƠN",
    "dept": "KỸ THUẬT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV12",
    "name": "NGUYỄN THỊ HƯNG",
    "dept": "PHÒNG KINH DOANH",
    "title": "QUẢN LÝ KINH DOANH",
    "role": "Manager"
  },
  {
    "manv": "TKV30",
    "name": "PHAN HOÀNG HUYNH",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV06",
    "name": "NGUYỄN HỒNG ĐỢI",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV21",
    "name": "TRỊNH THỊ HUYỀN",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV03",
    "name": "VÕ TRẦN NGỌC THƠM",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV36",
    "name": "HUỲNH TIẾN PHÁT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV20",
    "name": "NGUYỄN THỊ KIM YẾN",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV19",
    "name": "NGUYỄN VĂN THÀNH",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV29",
    "name": "NGUYỄN VĂN NHẤT",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV32",
    "name": "TRẦN CHÍ TRUNG ĐẠI",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV25",
    "name": "PHẠM VĂN NHỦ",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV22",
    "name": "NGUYỄN CÔNG THÀNH",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV07",
    "name": "NGUYỄN TRIẾT THANH",
    "dept": "KỸ THUẬT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV18",
    "name": "LÊ Hoàng NGHĨA",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV34",
    "name": "BÙI VĂN TÂM",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV39",
    "name": "LÊ HỒNG THÁI",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV38",
    "name": "NGUYỄN DUY ĐAL",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV41",
    "name": "PHẠM THÀNH MÁT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV26",
    "name": "TRẦN MINH TRÍ",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV31",
    "name": "TRẦN ANH KIỆT",
    "dept": "Lái xe",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV43",
    "name": "LÊ HOÀNG QUÂN",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV13",
    "name": "LÊ THỊ NGỌC SIM",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV35",
    "name": "VÕ THỊ MƯỢN",
    "dept": "TẠP VỤ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV14",
    "name": "NGÔ THỊ NGỌC SANG",
    "dept": "TẠP VỤ",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV37",
    "name": "HUỲNH THANH PHONG",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV15",
    "name": "NGUYỄN THỊ BÍCH NGỌC",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV23",
    "name": "DƯ THỊ NGỌC THUY",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV09",
    "name": "NGUYỄN KHẮC DIỆP",
    "dept": "IT",
    "title": "QUẢN LÝ",
    "role": "Admin"
  },
  {
    "manv": "TKV45",
    "name": "Nguyễn Thanh Công Dung",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "role": "User"
  },
  {
    "manv": "TKV02",
    "name": "ĐẶNG NGỌC TRUNG",
    "dept": "IT",
    "title": "PHÓ PHÒNG",
    "role": "Manager"
  },
  {
    "manv": "TKV08",
    "name": "NGUYỄN THANH THÙY DUNG",
    "dept": "PHÒNG TCHC",
    "title": "TRƯỞNG PHÒNG",
    "role": "Manager"
  },
  {
    "manv": "TKV10",
    "name": "TRẦN VĂN DƯƠNG",
    "dept": "KHO",
    "title": "QUẢN LÝ KHO",
    "role": "Manager"
  },
  {
    "manv": "TKV16",
    "name": "PHAN KHẮC NINH",
    "dept": "XUẤT NHẬP KHẨU",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "TKV27",
    "name": "VÕ KIM HỒNG",
    "dept": "PHÒNG KINH DOANH",
    "title": "PHÓ PHÒNG",
    "role": "Manager"
  },
  {
    "manv": "TKV42",
    "name": "LÂM TẤN ĐẠT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "QUẢN LÝ",
    "role": "Manager"
  },
  {
    "manv": "NVTKV025",
    "name": "Admin",
    "dept": "Vi tính",
    "title": "Admin",
    "role": "Admin"
  }
];
