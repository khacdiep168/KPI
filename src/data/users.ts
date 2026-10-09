export interface AppUser {
  manv: string;
  name: string;
  dept: string;
  title: string;
  password: string;
  role: "User" | "Manager" | "Admin";
}

export const INITIAL_USERS: AppUser[] = [
  {
    "manv": "BGD01",
    "name": "BAN GIÁM ĐỐC",
    "dept": "BAN GIÁM ĐỐC",
    "title": "GIÁM ĐỐC",
    "password": "bgd@2026",
    "role": "Admin"
  },
  {
    "manv": "HC01",
    "name": "QUẢN LÝ HÀNH CHÍNH",
    "dept": "HÀNH CHÍNH",
    "title": "QUẢN LÝ",
    "password": "123",
    "role": "Manager"
  },
  {
    "manv": "DTK01",
    "name": "QUẢN LÝ ĐIỂM TẬP KẾT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "QUẢN LÝ",
    "password": "123",
    "role": "Manager"
  },
  {
    "manv": "KD01",
    "name": "QUẢN LÝ KINH DOANH",
    "dept": "PHÒNG KINH DOANH",
    "title": "QUẢN LÝ",
    "password": "123",
    "role": "Manager"
  },
  {
    "manv": "KT01",
    "name": "QUẢN LÝ KẾ TOÁN",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "QUẢN LÝ",
    "password": "123",
    "role": "Manager"
  },
  {
    "manv": "TKV11",
    "name": "TRỊNH THANH THÚY",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "abc",
    "role": "User"
  },
  {
    "manv": "TKV33",
    "name": "TRẦN VĂN ĐẠT",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "password": "TKV33184",
    "role": "User"
  },
  {
    "manv": "TKV17",
    "name": "TRẦN THỊ HIỀN",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "QUẢN LÝ KẾ TOÁN",
    "password": "TKV17474",
    "role": "Manager"
  },
  {
    "manv": "TKV40",
    "name": "LÊ VĂN CHƯƠNG",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV40380",
    "role": "User"
  },
  {
    "manv": "TKV28",
    "name": "VÕ THỊ TRÀ GIANG",
    "dept": "PHÒNG KẾ TOÁN",
    "title": "NHÂN VIÊN",
    "password": "TKV28493",
    "role": "User"
  },
  {
    "manv": "TKV24",
    "name": "PHẠM QUỐC SƠN",
    "dept": "KỸ THUẬT",
    "title": "NHÂN VIÊN",
    "password": "TKV24 911",
    "role": "User"
  },
  {
    "manv": "TKV12",
    "name": "NGUYỄN THỊ HƯNG",
    "dept": "PHÒNG KINH DOANH",
    "title": "QUẢN LÝ KINH DOANH",
    "password": "TKV12315",
    "role": "Manager"
  },
  {
    "manv": "TKV30",
    "name": "PHAN HOÀNG HUYNH",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "password": "TKV30727",
    "role": "User"
  },
  {
    "manv": "TKV06",
    "name": "NGUYỄN HỒNG ĐỢI",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "password": "TKV06597",
    "role": "User"
  },
  {
    "manv": "TKV21",
    "name": "TRỊNH THỊ HUYỀN",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "TKV21949",
    "role": "User"
  },
  {
    "manv": "TKV03",
    "name": "VÕ TRẦN NGỌC THƠM",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "TKV03309",
    "role": "User"
  },
  {
    "manv": "TKV36",
    "name": "HUỲNH TIẾN PHÁT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV36228",
    "role": "User"
  },
  {
    "manv": "TKV20",
    "name": "NGUYỄN THỊ KIM YẾN",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "TKV20326",
    "role": "User"
  },
  {
    "manv": "TKV19",
    "name": "NGUYỄN VĂN THÀNH",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "password": "TKV19968",
    "role": "User"
  },
  {
    "manv": "TKV29",
    "name": "NGUYỄN VĂN NHẤT",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "password": "TKV29373",
    "role": "User"
  },
  {
    "manv": "TKV32",
    "name": "TRẦN CHÍ TRUNG ĐẠI",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "password": "TKV32668",
    "role": "User"
  },
  {
    "manv": "TKV25",
    "name": "PHẠM VĂN NHỦ",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "password": "TKV25157",
    "role": "User"
  },
  {
    "manv": "TKV22",
    "name": "NGUYỄN CÔNG THÀNH",
    "dept": "KHO",
    "title": "NHÂN VIÊN",
    "password": "TKV22194",
    "role": "User"
  },
  {
    "manv": "TKV07",
    "name": "NGUYỄN TRIẾT THANH",
    "dept": "KỸ THUẬT",
    "title": "NHÂN VIÊN",
    "password": "TKV07303",
    "role": "User"
  },
  {
    "manv": "TKV18",
    "name": "LÊ Hoàng NGHĨA",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV18776",
    "role": "User"
  },
  {
    "manv": "TKV34",
    "name": "BÙI VĂN TÂM",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV34768",
    "role": "User"
  },
  {
    "manv": "TKV39",
    "name": "LÊ HỒNG THÁI",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV39123",
    "role": "User"
  },
  {
    "manv": "TKV38",
    "name": "NGUYỄN DUY ĐAL",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV38500",
    "role": "User"
  },
  {
    "manv": "TKV41",
    "name": "PHẠM THÀNH MÁT",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV41343",
    "role": "User"
  },
  {
    "manv": "TKV26",
    "name": "TRẦN MINH TRÍ",
    "dept": "BẢO VỆ",
    "title": "NHÂN VIÊN",
    "password": "TKV26541",
    "role": "User"
  },
  {
    "manv": "TKV31",
    "name": "TRẦN ANH KIỆT",
    "dept": "Lái xe",
    "title": "NHÂN VIÊN",
    "password": "TKV31280",
    "role": "User"
  },
  {
    "manv": "TKV43",
    "name": "LÊ HOÀNG QUÂN",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV43440",
    "role": "User"
  },
  {
    "manv": "TKV13",
    "name": "LÊ THỊ NGỌC SIM",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV13821",
    "role": "User"
  },
  {
    "manv": "TKV35",
    "name": "VÕ THỊ MƯỢN",
    "dept": "TẠP VỤ",
    "title": "NHÂN VIÊN",
    "password": "TKV35481",
    "role": "User"
  },
  {
    "manv": "TKV14",
    "name": "NGÔ THỊ NGỌC SANG",
    "dept": "TẠP VỤ",
    "title": "NHÂN VIÊN",
    "password": "TKV14295",
    "role": "User"
  },
  {
    "manv": "TKV37",
    "name": "HUỲNH THANH PHONG",
    "dept": "ĐIỂM TẬP KẾT",
    "title": "NHÂN VIÊN",
    "password": "TKV37504",
    "role": "User"
  },
  {
    "manv": "TKV15",
    "name": "NGUYỄN THỊ BÍCH NGỌC",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "TKV15429",
    "role": "User"
  },
  {
    "manv": "TKV23",
    "name": "DƯ THỊ NGỌC THUY",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "TKV23592",
    "role": "User"
  },
  {
    "manv": "TKV09",
    "name": "NGUYỄN KHẮC DIỆP",
    "dept": "IT",
    "title": "QUẢN LÝ",
    "password": "Tinhxa168@",
    "role": "Admin"
  },
  {
    "manv": "TKV45",
    "name": "Nguyễn Thanh Công Dung",
    "dept": "CHMT",
    "title": "NHÂN VIÊN",
    "password": "Ut16082605",
    "role": "User"
  }
];
