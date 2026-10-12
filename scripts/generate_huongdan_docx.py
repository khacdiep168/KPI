# -*- coding: utf-8 -*-
"""
Script tạo file Huongdan.docx hoàn chỉnh cho Hệ Thống Đánh Giá KPI TKV
Công ty TNHH TM Thế Kỷ Vàng
Bao gồm: Hướng dẫn Nhân viên, Quản lý, và Admin (Ban Giám Đốc)
Step-by-step kèm 13 hình ảnh minh họa thực tế từ hệ thống web app.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Đặt màu nền cho ô trong bảng"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Đặt lề trong cho ô (dxf)"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_cell_border_left_only(cell, hex_color="2563EB", sz="36"):
    """Tạo viền bên trái dày dạng callout box"""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{hex_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

def set_table_borders(table, hex_color="CBD5E1"):
    """Đặt viền mỏng thanh lịch cho bảng"""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{hex_color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{hex_color}"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def create_manual_document():
    doc = Document()

    # Thiết lập kích thước trang A4 & lề chuẩn 2.0 cm (xấp xỉ 0.8 inch)
    sections = doc.sections
    for section in sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("CÔNG TY TNHH TM THẾ KỶ VÀNG • TÀI LIỆU HƯỚNG DẪN KPI")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Hệ Thống Đánh Giá KPI Trực Tuyến • https://kpi-tkv.vercel.app/ • Lưu hành nội bộ")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # Thư mục chứa hình ảnh
    brain_dir = r"C:\Users\KhacDiep\.gemini\antigravity-ide\brain\9611cf57-6337-4524-be43-8221f5f84b44"
    temp_dir = os.path.join(brain_dir, ".tempmediaStorage")
    project_dir = r"e:\Vibe Coding\KPT_TKV"

    img_paths = {
        "logo": os.path.join(project_dir, "public", "logo.png"),
        "login": os.path.join(brain_dir, "guide_01_login_1791791878079.png"),
        "eval_form": os.path.join(brain_dir, "guide_02_evaluation_form_1791791922293.png"),
        "colleague": os.path.join(brain_dir, "guide_03_colleague_select_1791791948566.png"),
        "history": os.path.join(brain_dir, "guide_04_history_1791791969357.png"),
        "print_modal": os.path.join(brain_dir, "guide_05_print_modal_1791792003422.png"),
        "manager_review": os.path.join(brain_dir, "guide_manager_review_1791793149641.png"),
        "admin_dashboard": os.path.join(temp_dir, "media_1791788206959.png"),
        "admin_menu": os.path.join(temp_dir, "media_1791784586412.png"),
        "admin_users": os.path.join(temp_dir, "media_1791788458938.png"),
        "admin_period": os.path.join(brain_dir, "guide_period_modal_1791793383158.png"),
        "admin_annual": os.path.join(brain_dir, "guide_06_annual_report_1791792094280.png"),
        "admin_company": os.path.join(temp_dir, "media_1791784611339.png"),
    }

    # Helper functions tạo đoạn văn & tiêu đề
    def add_p(text, size=10.5, bold=False, italic=False, color=(15, 23, 42), align=WD_ALIGN_PARAGRAPH.LEFT, space_after=5, space_before=0):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = "Arial"
        run.font.size = Pt(size)
        run.font.color.rgb = RGBColor(*color)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(12.5)
        run.font.color.rgb = RGBColor(37, 99, 235) # Royal Blue
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(15, 23, 42) # Slate Dark
        return p

    def add_callout(title, text, hex_bg="EFF6FF", hex_border="2563EB"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, hex_bg)
        set_cell_border_left_only(cell, hex_color=hex_border, sz="36")
        set_cell_margins(cell, top=140, bottom=140, left=200, right=180)

        cp = cell.paragraphs[0]
        cp.paragraph_format.space_after = Pt(2)
        crun_title = cp.add_run(title)
        crun_title.bold = True
        crun_title.font.name = "Arial"
        crun_title.font.size = Pt(10.5)
        crun_title.font.color.rgb = RGBColor(30, 58, 138)

        cp2 = cell.add_paragraph()
        cp2.paragraph_format.space_after = Pt(0)
        crun_text = cp2.add_run(text)
        crun_text.font.name = "Arial"
        crun_text.font.size = Pt(9.5)
        crun_text.font.color.rgb = RGBColor(30, 41, 59)

        # Khoảng cách sau bảng
        sp_p = doc.add_paragraph()
        sp_p.paragraph_format.space_after = Pt(4)

    def add_image_box(img_key, caption):
        if img_key in img_paths and os.path.exists(img_paths[img_key]):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run()
            run.add_picture(img_paths[img_key], width=Inches(6.2))

            cp = doc.add_paragraph()
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_after = Pt(10)
            crun = cp.add_run(f"Hình: {caption}")
            crun.italic = True
            crun.font.name = "Arial"
            crun.font.size = Pt(9)
            crun.font.color.rgb = RGBColor(71, 85, 105)

    # ==========================================
    # 1. TRANG BÌA (COVER PAGE)
    # ==========================================
    cover_top = doc.add_paragraph()
    cover_top.paragraph_format.space_before = Pt(30)
    cover_top.paragraph_format.space_after = Pt(10)
    cover_top.alignment = WD_ALIGN_PARAGRAPH.CENTER

    if os.path.exists(img_paths["logo"]):
        logo_run = cover_top.add_run()
        logo_run.add_picture(img_paths["logo"], width=Inches(1.8))

    add_p("CÔNG TY TNHH TM THẾ KỶ VÀNG", size=15, bold=True, color=(30, 58, 138), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=3)
    add_p("HỆ THỐNG ĐÁNH GIÁ HIỆU QUẢ CÔNG VIỆC TRỰC TUYẾN (KPI PLATFORM)", size=10.5, italic=True, color=(100, 116, 139), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)

    add_p("TÀI LIỆU HƯỚNG DẪN SỬ DỤNG", size=24, bold=True, color=(15, 23, 42), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10)
    add_p("QUY TRÌNH ĐÁNH GIÁ KPI 3 CẤP HÀNG THÁNG", size=16, bold=True, color=(37, 99, 235), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=14)
    add_p("Dành cho Nhân Viên • Quản Lý Bộ Phận • Ban Giám Đốc & Hội Đồng", size=12, italic=True, color=(51, 65, 85), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=60)

    # Bảng thông tin văn bản bìa
    info_tbl = doc.add_table(rows=4, cols=2)
    info_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_tbl.autofit = False
    set_table_borders(info_tbl, hex_color="E2E8F0")

    metadata_rows = [
        ("Nền tảng ứng dụng:", "Web Application (Đám mây Supabase PostgreSQL & Vercel)"),
        ("Địa chỉ truy cập chính thức:", "https://kpi-tkv.vercel.app/"),
        ("Phiên bản tài liệu:", "Phiên bản 2.0 (Chuẩn hóa quy trình 3 cấp - Tháng 10/2026)"),
        ("Đơn vị ban hành:", "Ban Giám Đốc & Bộ phận CNTT - Công ty TNHH TM Thế Kỷ Vàng"),
    ]
    for idx, (label, val) in enumerate(metadata_rows):
        c1 = info_tbl.cell(idx, 0)
        c2 = info_tbl.cell(idx, 1)
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)
        set_cell_margins(c1, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c2, top=80, bottom=80, left=100, right=100)
        set_cell_background(c1, "F8FAFC")
        set_cell_background(c2, "FFFFFF")

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(label)
        r1.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(71, 85, 105)

        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(val)
        r2.font.name = "Arial"
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_page_break()

    # ==========================================
    # 2. MỤC LỤC & TỔNG QUAN HỆ THỐNG
    # ==========================================
    add_h1("MỤC LỤC TÀI LIỆU")

    toc_items = [
        ("PHẦN I: TỔNG QUAN QUY TRÌNH & ĐĂNG NHẬP HỆ THỐNG", "Trang 2"),
        ("    1. Mô hình đánh giá KPI 3 cấp khép kín", "Trang 2"),
        ("    2. Thang điểm chuẩn 100 và các mức xếp loại", "Trang 2"),
        ("    3. Bước 1: Đăng nhập vào hệ thống", "Trang 3"),
        ("    4. Bước 2: Đổi mật khẩu cá nhân để bảo mật", "Trang 4"),
        ("PHẦN II: HƯỚNG DẪN DÀNH CHO NHÂN VIÊN (ROLE: USER)", "Trang 5"),
        ("    1. Bước 1: Thực hiện Tự Đánh Giá 10 tiêu chí hàng tháng", "Trang 5"),
        ("    2. Bước 2: Thực hiện Đánh giá đồng nghiệp (Đánh giá chéo)", "Trang 7"),
        ("    3. Bước 3: Tra cứu Lịch Sử Đánh Giá cá nhân", "Trang 8"),
        ("    4. Bước 4: In Phiếu Đánh Giá Cá Nhân chuẩn mẫu văn bản", "Trang 9"),
        ("PHẦN III: HƯỚNG DẪN DÀNH CHO QUẢN LÝ BỘ PHẬN (ROLE: MANAGER)", "Trang 10"),
        ("    1. Bước 1: Truy cập trang 'Duyệt Bộ Phận' và xem danh sách", "Trang 10"),
        ("    2. Bước 2: Thẩm định điểm, ghi nhận xét và phê duyệt đề xuất", "Trang 11"),
        ("    3. Bước 3: Xuất bảng tổng hợp kết quả bộ phận ra file Excel", "Trang 12"),
        ("PHẦN IV: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN & BAN GIÁM ĐỐC (ROLE: ADMIN)", "Trang 13"),
        ("    1. Bảng điều khiển Hội Đồng & Phê duyệt điểm cuối cùng toàn công ty", "Trang 13"),
        ("    2. Quản lý nhân sự, phân quyền, khóa và xóa tài khoản an toàn", "Trang 15"),
        ("    3. Quản lý kỳ đánh giá hàng tháng & Cài đặt hạn nộp (Deadline)", "Trang 17"),
        ("    4. Báo cáo tổng kết thi đua 12 tháng & Xuất Excel năm", "Trang 18"),
        ("    5. Tùy biến thông tin công ty & Sao lưu / Phục hồi dữ liệu", "Trang 19"),
        ("PHẦN V: DANH SÁCH TÀI KHOẢN MẪU & CÂU HỎI THƯỜNG GẶP (FAQ)", "Trang 20"),
    ]

    for title, pg in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r_title = p.add_run(title)
        r_title.font.name = "Arial"
        r_title.font.size = Pt(10)
        if title.startswith("PHẦN"):
            r_title.bold = True
            r_title.font.color.rgb = RGBColor(30, 58, 138)
        else:
            r_title.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # =========================================================================
    # PHẦN I: TỔNG QUAN QUY TRÌNH & ĐĂNG NHẬP HỆ THỐNG
    # =========================================================================
    add_h1("PHẦN I: TỔNG QUAN QUY TRÌNH & ĐĂNG NHẬP HỆ THỐNG")

    add_h2("1. Mô hình đánh giá KPI 3 cấp khép kín")
    add_p(
        "Hệ thống KPI của Công ty TNHH TM Thế Kỷ Vàng vận hành theo cơ chế 3 cấp chặt chẽ, "
        "đảm bảo tính công bằng, minh bạch và gắn liền với kết quả lao động thực tế của từng vị trí công việc:"
    )

    flow_tbl = doc.add_table(rows=3, cols=3)
    flow_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(flow_tbl, hex_color="E2E8F0")

    flow_data = [
        ("CẤP 1: NHÂN VIÊN TỰ CHẤM", "Nhân viên tự rà soát kết quả công việc trong tháng, tự chấm điểm theo 10 tiêu chí và nộp giải trình/ý kiến cá nhân.", "Hạn nộp: Trước ngày 25 hàng tháng"),
        ("CẤP 2: QUẢN LÝ THẨM ĐỊNH", "Trưởng bộ phận/Quản lý rà soát số liệu, đối chiếu kết quả thực tế, chấm điểm thẩm định và ghi nhận xét chỉ đạo.", "Hạn nộp: Trước ngày 28 hàng tháng"),
        ("CẤP 3: HỘI ĐỒNG PHÊ DUYỆT", "Ban Giám Đốc và Hội đồng đánh giá xem xét toàn diện, phê duyệt điểm chốt cuối cùng làm căn cứ xếp loại và tính thưởng.", "Hạn nộp: Trước ngày 30 hàng tháng"),
    ]

    for idx, (cap, mota, han) in enumerate(flow_data):
        c1, c2, c3 = flow_tbl.cell(idx, 0), flow_tbl.cell(idx, 1), flow_tbl.cell(idx, 2)
        c1.width = Inches(1.8)
        c2.width = Inches(3.2)
        c3.width = Inches(1.5)
        set_cell_margins(c1, 80, 80, 100, 100)
        set_cell_margins(c2, 80, 80, 100, 100)
        set_cell_margins(c3, 80, 80, 100, 100)
        set_cell_background(c1, "F1F5F9")

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(cap)
        r1.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(30, 58, 138)

        p2 = c2.paragraphs[0]
        r2 = p2.add_run(mota)
        r2.font.name = "Arial"
        r2.font.size = Pt(9)
        r2.font.color.rgb = RGBColor(15, 23, 42)

        p3 = c3.paragraphs[0]
        r3 = p3.add_run(han)
        r3.italic = True
        r3.font.name = "Arial"
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = RGBColor(100, 116, 139)

    add_h2("2. Thang điểm chuẩn 100 và các mức xếp loại")
    add_p("Tổng điểm chuẩn tối đa là 100 điểm, được phân loại theo 4 mức chính thức sau đây:")

    grade_tbl = doc.add_table(rows=5, cols=4)
    grade_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(grade_tbl, hex_color="E2E8F0")

    headers = ["XẾP LOẠI", "KHOẢNG ĐIỂM", "ĐÁNH GIÁ CHẤT LƯỢNG", "CHÍNH SÁCH KHEN THƯỞNG"]
    for i, h in enumerate(headers):
        c = grade_tbl.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 90, 90, 90, 90)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    grades_data = [
        ("XUẤT SẮC / GIỎI", "Từ 80 đến 100 điểm", "Hoàn thành vượt mức nhiệm vụ, tinh thần trách nhiệm cao", "Thưởng 100% KPI + Thưởng thi đua tháng"),
        ("KHÁ", "Từ 65 đến 79 điểm", "Hoàn thành tốt các nhiệm vụ được giao, không có vi phạm", "Thưởng 80% - 90% KPI theo quy chế"),
        ("TRUNG BÌNH", "Từ 50 đến 64 điểm", "Hoàn thành nhiệm vụ ở mức đạt yêu cầu cơ bản", "Hưởng 50% - 60% KPI, cần cải thiện"),
        ("YẾU", "Dưới 50 điểm", "Không hoàn thành tiến độ/khối lượng hoặc có vi phạm", "Không xét thưởng KPI tháng, xem xét đào tạo lại"),
    ]

    for row_idx, r_data in enumerate(grades_data, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(r_data):
            cell = grade_tbl.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, 80, 80, 90, 90)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(37, 99, 235)
            else:
                r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    add_h2("3. Bước 1: Đăng nhập vào hệ thống")
    add_p("Mỗi cán bộ công nhân viên được cấp một tài khoản riêng gắn liền với Mã nhân viên (MANV) tại Thế Kỷ Vàng.")
    add_p("Các bước thực hiện:")
    add_p("• Bước 1.1: Mở trình duyệt web (Google Chrome, Microsoft Edge, Cốc Cốc hoặc Safari trên điện thoại/máy tính).")
    add_p("• Bước 1.2: Truy cập vào địa chỉ chính thức: https://kpi-tkv.vercel.app/")
    add_p("• Bước 1.3: Nhập Mã nhân viên (MANV) theo định dạng viết hoa (Ví dụ: BGD01, HC01, DTK01, TKV11...).")
    add_p("• Bước 1.4: Nhập Mật khẩu được cấp (Mật khẩu ban đầu mặc định cho nhân viên là 123).")
    add_p("• Bước 1.5: Nhấn nút 'Đăng Nhập ->' để truy cập vào không gian làm việc của mình.")

    add_callout(
        "LƯU Ý QUAN TRỌNG VỀ ĐĂNG NHẬP:",
        "Nếu tài khoản bị báo lỗi 'Mật khẩu không chính xác', vui lòng kiểm tra xem phím CapsLock có đang bật không. "
        "Nếu tài khoản bị báo 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động', vui lòng liên hệ Ban Giám Đốc hoặc Admin để được mở khóa."
    )

    add_image_box("login", "Màn hình Đăng nhập Hệ Thống KPI Thế Kỷ Vàng (https://kpi-tkv.vercel.app/)")

    # -------------------------------------------------------------
    add_h2("4. Bước 2: Đổi mật khẩu cá nhân để bảo mật")
    add_p("Để đảm bảo tính bảo mật và quyền riêng tư, mọi nhân viên được khuyến nghị đổi mật khẩu ngay sau lần đăng nhập đầu tiên.")
    add_p("Các bước đổi mật khẩu:")
    add_p("• Bước 2.1: Nhấn vào nút 'Đổi MK' trên thanh điều hướng trên cùng (hoặc bấm dòng chữ 'Nhân viên đổi mật khẩu tại đây' ở màn hình đăng nhập).")
    add_p("• Bước 2.2: Trong hộp thoại xuất hiện, nhập Mật khẩu hiện tại (ví dụ: 123).")
    add_p("• Bước 2.3: Nhập Mật khẩu mới mong muốn (tối thiểu 3 ký tự, khuyến nghị kết hợp chữ và số).")
    add_p("• Bước 2.4: Nhập lại Mật khẩu mới vào ô xác nhận.")
    add_p("• Bước 2.5: Bấm 'Lưu Mật Khẩu'. Hệ thống sẽ tự động cập nhật ngay lập tức lên máy chủ bảo mật.")

    doc.add_page_break()

    # =========================================================================
    # PHẦN II: HƯỚNG DẪN DÀNH CHO NHÂN VIÊN (ROLE: USER)
    # =========================================================================
    add_h1("PHẦN II: HƯỚNG DẪN DÀNH CHO NHÂN VIÊN (ROLE: USER)")
    add_p(
        "Đối tượng áp dụng: Toàn thể Cán bộ - Công nhân viên thuộc các phòng ban: "
        "Hành chính, Kế toán, Kinh doanh, Điểm tập kết, Bảo vệ, Tạp vụ, Kho vận..."
    )

    add_h2("1. Bước 1: Thực hiện Tự Đánh Giá 10 tiêu chí hàng tháng")
    add_p("Khi đến kỳ đánh giá hàng tháng, nhân viên mở tab 'Tự Đánh Giá' trên thanh menu chính.")
    add_p("Các bước tiến hành chấm điểm:")
    add_p("• Bước 1.1: Kiểm tra ô 'Kỳ đánh giá' đang chọn (Mặc định là kỳ đang mở, ví dụ: Kỳ Đánh Giá 10-2026).")
    add_p("• Bước 1.2: Tại mục 'Đánh giá cho', chọn 'Bản thân: [Họ và tên của bạn]'.")
    add_p("• Bước 1.3: Chọn chế độ hiển thị mong muốn: 'Hiện Từng Câu' (giúp tập trung) hoặc 'Hiện Tất Cả' (xem toàn bộ trên một trang).")
    add_p("• Bước 1.4: Lần lượt chấm điểm từ Câu 1 đến Câu 10 theo đúng thực tế công việc:")

    # Bảng 10 tiêu chí
    crit_tbl = doc.add_table(rows=11, cols=4)
    crit_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(crit_tbl, hex_color="E2E8F0")

    crit_headers = ["STT", "NỘI DUNG TIÊU CHÍ ĐÁNH GIÁ", "ĐIỂM TỐI ĐA", "HƯỚNG DẪN CHẤM ĐIỂM"]
    for i, h in enumerate(crit_headers):
        c = crit_tbl.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 80, 80, 80, 80)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    crit_list = [
        ("Câu 1", "Thái độ làm việc & Tinh thần hợp tác", "5 điểm", "Nhiệt tình, chủ động, hợp tác tốt với đồng nghiệp và cấp trên."),
        ("Câu 2", "Chấp hành nội quy, quy định công ty", "5 điểm", "Đi làm đúng giờ, mang đồng phục, bảo hộ lao động, tuân thủ an toàn."),
        ("Câu 3", "Kỹ năng chuyên môn, nghiệp vụ", "10 điểm", "Nắm vững quy trình nghiệp vụ, thao tác chuẩn xác, ít phát sinh sai sót."),
        ("Câu 4", "Khối lượng công việc hoàn thành", "15 điểm", "Đảm bảo hoặc vượt định mức năng suất, sản lượng được phân công."),
        ("Câu 5", "Chất lượng công việc", "15 điểm", "Sản phẩm/dịch vụ đạt chuẩn chất lượng, không bị khách hàng phản ánh."),
        ("Câu 6", "Tiến độ hoàn thành công việc", "15 điểm", "Đúng thời hạn yêu cầu, xử lý kịp thời các tình huống đột xuất."),
        ("Câu 7", "Tinh thần trách nhiệm & Tính chủ động", "10 điểm", "Chịu trách nhiệm về kết quả, sẵn sàng nhận thêm việc khi cần."),
        ("Câu 8", "Kỹ năng phối hợp & Làm việc nhóm", "10 điểm", "Hỗ trợ đồng đội, chia sẻ thông tin, vì mục tiêu chung của bộ phận."),
        ("Câu 9", "Tính sáng tạo & Đổi mới, cải tiến", "10 điểm", "Đóng góp sáng kiến cải tiến quy trình, tiết kiệm thời gian/chi phí."),
        ("Câu 10", "Ý thức bảo vệ tài sản & Tiết kiệm", "5 điểm", "Bảo quản tốt máy móc, trang thiết bị, tiết kiệm điện nước văn phòng."),
    ]

    for idx, (c_id, c_name, c_max, c_guide) in enumerate(crit_list, start=1):
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for col_i, txt in enumerate([c_id, c_name, c_max, c_guide]):
            c = crit_tbl.cell(idx, col_i)
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 80, 80)
            p = c.paragraphs[0]
            r = p.add_run(txt)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            if col_i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(37, 99, 235)
            elif col_i == 2:
                r.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129)
            else:
                r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_p("• Bước 1.5: Sau khi chọn điểm cho đủ 10 câu, thanh trạng thái sẽ hiển thị 'Đã làm 10/10 tiêu chí' và tổng điểm số tự động cộng dồn.")
    add_p("• Bước 1.6: Nhập ý kiến tự nhận xét hoặc giải trình (nếu có công việc nổi bật hoặc khó khăn cần cấp trên ghi nhận).")
    add_p("• Bước 1.7: Bấm nút 'Nộp Phiếu Đánh Giá'. Hệ thống sẽ lưu trữ và gửi lên Quản lý bộ phận xét duyệt.")

    add_image_box("eval_form", "Biểu mẫu Tự Đánh Giá 10 tiêu chí KPI hàng tháng")

    # -------------------------------------------------------------
    add_h2("2. Bước 2: Thực hiện Đánh giá đồng nghiệp (Đánh giá chéo)")
    add_p("Để tạo sự gắn kết và cái nhìn đa chiều, nhân viên có thể đánh giá chéo cho các đồng nghiệp cùng bộ phận của mình.")
    add_p("Các bước tiến hành:")
    add_p("• Bước 2.1: Tại mục 'Đánh giá cho', nhấp chuột vào ô chọn đối tượng.")
    add_p("• Bước 2.2: Danh sách nhân viên cùng bộ phận sẽ hiển thị (theo quy định phân quyền, nhân viên chỉ thấy đồng nghiệp cùng phòng).")
    add_p("• Bước 2.3: Chọn tên đồng nghiệp cần đánh giá.")
    add_p("• Bước 2.4: Chấm điểm khách quan theo 10 tiêu chí và bấm 'Nộp Phiếu Đánh Giá'.")

    add_image_box("colleague", "Lựa chọn đồng nghiệp cùng bộ phận để thực hiện đánh giá chéo")

    # -------------------------------------------------------------
    add_h2("3. Bước 3: Tra cứu Lịch Sử Đánh Giá cá nhân")
    add_p("Nhân viên có thể theo dõi toàn bộ tiến trình thẩm định điểm số của mình qua từng tháng:")
    add_p("• Bước 3.1: Nhấp vào tab 'Lịch Sử Cá Nhân' trên thanh điều hướng.")
    add_p("• Bước 3.2: Quan sát bảng tổng hợp bao gồm:")
    add_p("  + Cột Tự Chấm: Điểm và xếp loại do chính bạn tự đánh giá.")
    add_p("  + Cột Điểm Quản Lý: Điểm số sau khi Trưởng bộ phận đã xem xét và thẩm định.")
    add_p("  + Cột Hội Đồng Phê Duyệt: Điểm số chính thức do Ban Giám Đốc ký duyệt.")
    add_p("  + Cột Trạng Thái: 'Chờ Quản Lý Duyệt', 'Chờ HĐ Phê Duyệt', hoặc 'HĐ Đã Phê Duyệt'.")

    add_image_box("history", "Trang tra cứu Lịch Sử Cá Nhân và theo dõi tiến độ phê duyệt điểm")

    # -------------------------------------------------------------
    add_h2("4. Bước 4: In Phiếu Đánh Giá Cá Nhân chuẩn mẫu văn bản")
    add_p("Khi cần in phiếu nộp lưu hồ sơ hoặc ký biên bản giấy theo yêu cầu của Phòng Hành chính:")
    add_p("• Bước 4.1: Tại trang Lịch Sử Cá Nhân, tìm đến dòng kỳ đánh giá cần in.")
    add_p("• Bước 4.2: Nhấp vào biểu tượng máy in ('In Phiếu') ở cột thao tác.")
    add_p("• Bước 4.3: Hộp thoại xem trước Phiếu Đánh Giá KPI sẽ xuất hiện đúng chuẩn biểu mẫu doanh nghiệp:")
    add_p("  + Quốc hiệu, tiêu ngữ và tên Công ty TNHH TM Thế Kỷ Vàng.")
    add_p("  + Đầy đủ chi tiết điểm số của 10 tiêu chí.")
    add_p("  + Bảng tổng hợp xếp loại và chữ ký 3 bên: Người Tự Đánh Giá, Quản Lý Bộ Phận, và Ban Giám Đốc.")
    add_p("• Bước 4.4: Bấm nút 'In Phiếu Đánh Giá' màu xanh để mở hộp thoại in của máy tính hoặc chọn 'Lưu dưới dạng PDF'.")

    add_image_box("print_modal", "Hộp thoại In Phiếu Đánh Giá Cá Nhân chuẩn mẫu văn bản Thế Kỷ Vàng")

    doc.add_page_break()

    # =========================================================================
    # PHẦN III: HƯỚNG DẪN DÀNH CHO QUẢN LÝ BỘ PHẬN (ROLE: MANAGER)
    # =========================================================================
    add_h1("PHẦN III: HƯỚNG DẪN DÀNH CHO QUẢN LÝ BỘ PHẬN (ROLE: MANAGER)")
    add_p(
        "Đối tượng áp dụng: Trưởng phòng / Quản lý phụ trách các bộ phận trong công ty:\n"
        "• HC01: Quản lý Hành chính\n"
        "• DTK01: Quản lý Điểm tập kết\n"
        "• KD01: Quản lý Kinh doanh\n"
        "• KT01: Quản lý Kế toán\n"
        "• TKV09: Quản lý Bộ phận CNTT / Kỹ thuật..."
    )

    add_h2("1. Bước 1: Truy cập trang 'Duyệt Bộ Phận' và xem danh sách")
    add_p("• Bước 1.1: Đăng nhập bằng tài khoản Quản lý được phân quyền.")
    add_p("• Bước 1.2: Nhấp vào tab 'Duyệt Bộ Phận' trên thanh menu chính.")
    add_p("• Bước 1.3: Hệ thống kích hoạt cơ chế bảo mật RBAC, tự động lọc danh sách chỉ hiển thị đúng các nhân sự thuộc bộ phận mà bạn được phân công quản lý.")
    add_p("• Bước 1.4: Có thể dùng thanh tìm kiếm hoặc bộ lọc theo kỳ đánh giá để rà soát tiến độ nộp bài của nhân viên cấp dưới.")

    add_image_box("manager_review", "Giao diện Thẩm Định & Chấm Điểm Quản Lý dành cho Trưởng Bộ Phận")

    # -------------------------------------------------------------
    add_h2("2. Bước 2: Thẩm định điểm, ghi nhận xét và phê duyệt đề xuất")
    add_p("Quy trình chấm điểm và đánh giá nhân viên cấp dưới:")
    add_p("• Bước 2.1: Quan sát cột 'Tự Chấm' để biết điểm số và mức xếp loại nhân viên tự đề xuất.")
    add_p("• Bước 2.2: Nhấn vào nút 'Chấm Điểm' màu xanh dương tương ứng với nhân viên đó.")
    add_p("• Bước 2.3: Bảng chấm điểm chi tiết của Quản lý sẽ mở ra:")
    add_p("  + Quản lý có thể xem từng điểm thành phần nhân viên đã tự chấm.")
    add_p("  + Điều chỉnh điểm số từng câu tăng hoặc giảm căn cứ vào hiệu quả thực tế và dữ liệu giám sát trong tháng.")
    add_p("  + Nhập 'Ý kiến / Nhận xét của Quản lý': Đánh giá điểm mạnh, nhắc nhở tồn tại và giao chỉ tiêu trọng tâm cho tháng kế tiếp.")
    add_p("• Bước 2.4: Nhấn nút 'Lưu Điểm Quản Lý'. Phiếu đánh giá sẽ chuyển sang trạng thái 'Chờ HĐ Phê Duyệt' và gửi lên Ban Giám Đốc.")

    add_callout(
        "NGUYÊN TẮC THẨM ĐỊNH CỦA CẤP QUẢN LÝ:",
        "Quản lý bộ phận là người nắm rõ nhất năng suất và thái độ của nhân viên. "
        "Mọi sự điều chỉnh điểm số tăng hoặc giảm so với mức tự chấm cần có nhận xét giải trình ngắn gọn, rõ ràng "
        "để Hội đồng Ban Giám Đốc có cơ sở thông qua nhanh chóng."
    )

    # -------------------------------------------------------------
    add_h2("3. Bước 3: Xuất bảng tổng hợp kết quả bộ phận ra file Excel")
    add_p("Để phục vụ các cuộc họp giao ban nội bộ hoặc gửi báo cáo tổng kết tháng cho Ban Giám Đốc:")
    add_p("• Bước 3.1: Tại trang 'Duyệt Bộ Phận', chọn kỳ đánh giá cần xuất dữ liệu.")
    add_p("• Bước 3.2: Nhấn nút 'Xuất Excel (.xlsx)' màu xanh lá cây ở góc trên bên phải.")
    add_p("• Bước 3.3: Hệ thống sẽ tạo ngay một file Excel (.xlsx) chuẩn gồm đầy đủ: Mã NV, Họ tên, Chức vụ, Điểm tự chấm, Điểm quản lý, Xếp loại đề xuất và Nhận xét.")

    doc.add_page_break()

    # =========================================================================
    # PHẦN IV: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN & BAN GIÁM ĐỐC (ROLE: ADMIN)
    # =========================================================================
    add_h1("PHẦN IV: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN & BAN GIÁM ĐỐC (ROLE: ADMIN)")
    add_p(
        "Đối tượng áp dụng: Ban Giám Đốc (Mã NV: BGD01), Quản trị viên hệ thống (NVTKV025) "
        "và các thành viên được ủy quyền trong Hội Đồng Đánh Giá KPI Toàn Công Ty."
    )

    add_h2("1. Tổng quan Bảng Điều Khiển & Phê Duyệt Hội Đồng (Admin Dashboard)")
    add_p("Ban Giám Đốc truy cập tab 'Hội Đồng & Báo Cáo' để có cái nhìn toàn cảnh về tình hình thực hiện KPI toàn công ty:")
    add_p("• Hệ thống thống kê tự động 4 chỉ số theo thời gian thực:")
    add_p("  + Tổng Nhân Sự: Tổng số cán bộ công nhân viên đang hoạt động.")
    add_p("  + Đã Nộp Đánh Giá: Số lượng hồ sơ đã hoàn thành việc tự chấm.")
    add_p("  + Quản Lý Đã Chấm: Số lượng hồ sơ đã qua vòng thẩm định của Trưởng bộ phận.")
    add_p("  + HĐ Đã Phê Duyệt: Số lượng hồ sơ đã được Hội đồng chốt kết quả cuối cùng.")
    add_p("• Biểu đồ phân bổ xếp loại toàn công ty: Tỷ lệ và số lượng cụ thể các mức Giỏi, Khá, Trung bình, Yếu.")

    add_image_box("admin_dashboard", "Bảng Điều Khiển Quản Trị & Hội Đồng Phê Duyệt KPI Toàn Công Ty")

    add_p("Quy trình phê duyệt điểm Hội Đồng:")
    add_p("• Phê duyệt từng cá nhân: Nhấn nút 'Chốt Điểm HĐ' tại dòng nhân viên -> Xem xét điểm tự chấm, điểm quản lý -> Xác nhận mức điểm chuẩn cuối cùng.")
    add_p("• Phê duyệt hàng loạt: Nhấn nút 'Duyệt Hàng Loạt' màu tím ở góc trên để phê duyệt nhanh toàn bộ các hồ sơ mà Quản lý đã thẩm định hoàn tất.")
    add_p("• Xuất Báo Cáo Excel Tổng Hợp: Nhấn 'Xuất Báo Cáo Excel (.xlsx)' để tải toàn bộ bảng điểm toàn công ty phục vụ chi trả lương thưởng.")

    # -------------------------------------------------------------
    add_h2("2. Menu Quản Trị & Danh mục Chức năng Nâng Cao")
    add_p("Để truy cập các công cụ quản trị chuyên sâu, Ban Giám Đốc nhấp chuột vào tên tài khoản 'Ban Giám Đốc [BGD01]' ở góc trên bên phải màn hình:")

    add_image_box("admin_menu", "Danh mục chức năng Quản trị & Cài đặt nâng cao của Ban Giám Đốc")

    # -------------------------------------------------------------
    add_h2("3. Quản lý nhân sự, phân quyền, khóa và xóa tài khoản")
    add_p("Chọn 'Quản Lý Nhân Sự & Phân Quyền' từ menu hoặc nút trên thanh công cụ:")
    add_p("• Thêm Nhân Viên Mới: Bấm nút '+ Thêm Nhân Viên', điền Mã NV (duy nhất), Họ tên, Bộ phận, Chức vụ và Quyền hạn (User, Manager, Admin). Mật khẩu mặc định là 123.")
    add_p("• Chỉnh Sửa Thông Tin: Bấm biểu tượng cây bút để sửa Họ tên, Phòng ban hoặc điều chỉnh phân quyền vai trò.")
    add_p("• Đặt Lại Mật Khẩu (Reset Password): Bấm biểu tượng chìa khóa -> Xác nhận đặt lại mật khẩu của nhân viên về '123' khi nhân viên quên mật khẩu.")
    add_p("• Khóa Tài Khoản (Server-Backed Status Lock):")
    add_p("  + Khi nhân viên nghỉ việc hoặc tạm hoãn hợp đồng, bấm biểu tượng Ổ Khóa.")
    add_p("  + Hệ thống đổi trạng thái sang 'Đã Khóa' (màu đỏ) và lưu trực tiếp vào cơ sở dữ liệu Supabase.")
    add_p("  + Tài khoản bị khóa sẽ ngay lập tức bị chặn đăng nhập và tự động đăng xuất nếu đang mở phiên làm việc.")
    add_p("• Mở Khóa Tài Khoản: Bấm biểu tượng Mở Khóa màu xanh lá cây để kích hoạt tài khoản hoạt động trở lại.")
    add_p("• Xóa Vĩnh Viễn Tài Khoản: Bấm biểu tượng Thùng Rác -> Xác nhận 'Xóa Vĩnh Viễn' để xóa hoàn toàn tài khoản khỏi cơ sở dữ liệu.")

    add_image_box("admin_users", "Hộp thoại Quản Lý Nhân Sự: Thêm mới, phân quyền, khóa tài khoản và xóa vĩnh viễn")

    # -------------------------------------------------------------
    add_h2("4. Quản lý kỳ đánh giá hàng tháng & Cài đặt hạn nộp (Deadline)")
    add_p("Chọn 'Quản Lý Kỳ Đánh Giá & Hạn Nộp' từ menu quản trị:")
    add_p("• Tạo Kỳ Mới: Bấm nút '+ Tạo Kỳ Mới', chọn tháng/năm (ví dụ: Kỳ 11-2026), đặt ngày bắt đầu và ngày kết thúc.")
    add_p("• Đóng Kỳ Đánh Giá: Khi hết thời hạn nộp KPI của tháng, Ban Giám Đốc bấm nút 'Đóng Kỳ'. Hệ thống sẽ tự động khóa biểu mẫu nộp điểm, ngăn không cho nhân viên nộp trễ hạn.")
    add_p("• Mở Lại Kỳ: Trong trường hợp cần mở bổ sung cho nhân viên nộp bù, bấm 'Mở Kỳ' để gia hạn.")

    add_image_box("admin_period", "Hộp thoại Quản Lý Kỳ Đánh Giá & Cài đặt hạn nộp (Deadline) cho toàn công ty")

    # -------------------------------------------------------------
    add_h2("5. Báo cáo tổng kết thi đua 12 tháng & Xuất Excel năm")
    add_p("Chọn tab 'Báo Cáo Năm (12 Kỳ)' trên thanh menu:")
    add_p("• Bảng tổng hợp hiển thị toàn bộ 12 tháng đánh giá trong năm của từng cán bộ công nhân viên.")
    add_p("• Tự động tính toán điểm trung bình cả năm và xếp hạng thi đua danh hiệu:")
    add_p("  + Danh hiệu 'Lao Động Tiên Tiến' (Điểm TB >= 80, không có tháng nào dưới 65).")
    add_p("  + Danh hiệu 'Chiến Sĩ Thi Đua Cơ Sở' (Top đầu các cá nhân xuất sắc tiêu biểu).")
    add_p("• Nhấn 'Xuất Báo Cáo Năm (.xlsx)' để tải file bảng tính tổng hợp phục vụ công tác khen thưởng cuối năm.")

    add_image_box("admin_annual", "Tab Báo Cáo Năm tổng hợp kết quả 12 kỳ và xếp hạng thi đua khen thưởng")

    # -------------------------------------------------------------
    add_h2("6. Tùy biến thông tin công ty & Sao lưu / Phục hồi dữ liệu")
    add_p("• Cài Đặt Doanh Nghiệp: Tùy chỉnh Logo công ty, Tên chính thức, Đơn vị chủ quản, Địa chỉ trụ sở và Tỉnh/Thành phố ký văn bản in ấn.")
    add_p("• Sao Lưu & Phục Hồi Dữ Liệu: Định kỳ hàng quý, Ban Giám Đốc nên tải về file bản sao lưu JSON để lưu trữ an toàn ngoại tuyến.")

    add_image_box("admin_company", "Cài đặt thông tin thương hiệu doanh nghiệp và tiêu đề xuất bản in")

    doc.add_page_break()

    # =========================================================================
    # PHẦN V: DANH SÁCH TÀI KHOẢN MẪU & CÂU HỎI THƯỜNG GẶP (FAQ)
    # =========================================================================
    add_h1("PHẦN V: DANH SÁCH TÀI KHOẢN MẪU & CÂU HỎI THƯỜNG GẶP (FAQ)")

    add_h2("1. Bảng tài khoản mẫu các bộ phận chính")
    add_p("Bảng danh sách các tài khoản trọng yếu dùng để đăng nhập và điều hành hệ thống:")

    acc_tbl = doc.add_table(rows=8, cols=5)
    acc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(acc_tbl, hex_color="E2E8F0")

    acc_headers = ["MÃ NV", "HỌ VÀ TÊN", "PHÒNG BAN", "VAI TRÒ / QUYỀN", "MẬT KHẨU MẪU"]
    for i, h in enumerate(acc_headers):
        c = acc_tbl.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 80, 80, 80, 80)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    accounts_data = [
        ("BGD01", "BAN GIÁM ĐỐC", "BAN GIÁM ĐỐC", "Admin (Toàn quyền)", "bgd@2026"),
        ("NVTKV025", "Admin Dự Phòng", "BAN GIÁM ĐỐC", "Admin (Toàn quyền)", "admin@123"),
        ("HC01", "QUẢN LÝ HÀNH CHÍNH", "HÀNH CHÍNH", "Manager (Bộ phận)", "123"),
        ("DTK01", "QUẢN LÝ ĐIỂM TẬP KẾT", "ĐIỂM TẬP KẾT", "Manager (Bộ phận)", "123"),
        ("KD01", "QUẢN LÝ KINH DOANH", "PHÒNG KINH DOANH", "Manager (Bộ phận)", "123"),
        ("KT01", "QUẢN LÝ KẾ TOÁN", "PHÒNG KẾ TOÁN", "Manager (Bộ phận)", "123"),
        ("TKV11", "TRỊNH THANH THÚY", "ĐIỂM TẬP KẾT", "User (Nhân viên)", "123"),
    ]

    for row_i, row_data in enumerate(accounts_data, start=1):
        bg = "F8FAFC" if row_i % 2 == 1 else "FFFFFF"
        for col_i, txt in enumerate(row_data):
            c = acc_tbl.cell(row_i, col_i)
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 80, 80)
            p = c.paragraphs[0]
            r = p.add_run(txt)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            if col_i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(37, 99, 235)
            elif col_i == 3 and "Admin" in txt:
                r.bold = True
                r.font.color.rgb = RGBColor(225, 29, 72)
            else:
                r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    add_h2("2. Các câu hỏi thường gặp & Hướng dẫn xử lý sự cố (FAQ)")

    faqs = [
        (
            "Câu hỏi 1: Tôi quên mật khẩu đăng nhập thì phải làm thế nào?",
            "Trả lời: Nhân viên liên hệ trực tiếp với Trưởng bộ phận hoặc gửi yêu cầu tới Ban Giám Đốc/Admin. "
            "Admin sẽ mở modal 'Quản Lý Nhân Sự', tìm tên của bạn và bấm biểu tượng Chìa Khóa để đặt lại mật khẩu về mặc định '123'."
        ),
        (
            "Câu hỏi 2: Tại sao tôi là Quản lý nhưng không nhìn thấy tab 'Duyệt Bộ Phận'?",
            "Trả lời: Vui lòng kiểm tra vai trò tài khoản của bạn. Tab 'Duyệt Bộ Phận' chỉ hiển thị cho tài khoản có quyền 'Manager' hoặc 'Admin'. "
            "Nếu bạn là Trưởng phòng mới được bổ nhiệm, hãy nhờ Admin vào 'Quản Lý Nhân Sự' để chỉnh sửa vai trò của bạn sang 'Manager'."
        ),
        (
            "Câu hỏi 3: Tôi đã nộp phiếu đánh giá nhưng phát hiện chấm nhầm điểm, có sửa được không?",
            "Trả lời: Nếu kỳ đánh giá vẫn đang mở và Quản lý chưa phê duyệt, bạn chỉ cần chọn lại kỳ đó ở tab 'Tự Đánh Giá' và bấm nộp lại điểm mới. "
            "Hệ thống sẽ tự động cập nhật đè số điểm mới nhất của bạn."
        ),
        (
            "Câu hỏi 4: Khi hết hạn nộp bài thì hệ thống xử lý như thế nào?",
            "Trả lời: Khi Ban Giám Đốc bấm 'Đóng Kỳ', biểu mẫu tự đánh giá sẽ chuyển sang chế độ khóa. "
            "Nhân viên sẽ không thể nộp thêm điểm cho kỳ đó nữa nhằm đảm bảo kỷ luật thời hạn."
        ),
        (
            "Câu hỏi 5: Tôi có thể sử dụng điện thoại di động để chấm điểm KPI không?",
            "Trả lời: Hoàn toàn được. Hệ thống được thiết kế tương thích hoàn hảo (Responsive) với mọi kích thước màn hình từ điện thoại thông minh, máy tính bảng đến máy tính để bàn."
        ),
    ]

    for q, a in faqs:
        add_h3(q)
        add_p(a, space_after=6)

    add_callout(
        "KÊNH HỖ TRỢ KỸ THUẬT:",
        "Trong quá trình vận hành hệ thống, nếu gặp bất kỳ khó khăn hoặc sự cố kỹ thuật nào, "
        "cán bộ nhân viên vui lòng liên hệ Bộ phận Kỹ thuật CNTT (TKV09 - Nguyễn Khắc Diệp) "
        "hoặc phản hồi trực tiếp về Văn phòng Ban Giám Đốc để được hỗ trợ kịp thời."
    )

    # Lưu tài liệu
    output_path = os.path.join(project_dir, "Huongdan.docx")
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")
    print(f"File size: {os.path.getsize(output_path)} bytes")

if __name__ == "__main__":
    create_manual_document()
