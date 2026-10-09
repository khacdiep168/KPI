# CLAUDE.md - Hệ Thống Đánh Giá KPI Hàng Tháng (TKV KPI System)

Tài liệu hướng dẫn phát triển phần mềm (Project Charter & Architecture Guidelines) dành cho trợ lý AI và lập trình viên. Dự án xây dựng ứng dụng web hiện đại, tối giản, chuyên nghiệp phục vụ đánh giá KPI nhân viên định kỳ hàng tháng, thay thế quy trình thủ công Google Form/Excel trước đây.

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** TKV KPI Evaluation Web App (Hệ thống Quản lý & Đánh giá KPI Hàng tháng)
- **Mục tiêu:** 
  - Số hóa 100% quy trình đánh giá KPI hàng tháng cho cán bộ công nhân viên toàn công ty.
  - Tự động hóa tính điểm, xếp loại, tổng hợp kết quả theo chuẩn 10 tiêu chí công ty ban hành.
  - Quy trình đánh giá 3 cấp minh bạch: **Nhân viên tự đánh giá -> Quản lý trực tiếp thẩm định/chấm điểm -> Hội đồng/Ban giám đốc phê duyệt**.
  - Dashboard trực quan, thống kê theo phòng ban, theo dõi lịch sử và xuất báo cáo Excel tiện lợi.
- **Phong cách thiết kế:** Tối giản (Minimalist), Hiện đại (Modern), Đẳng cấp Doanh nghiệp (Enterprise Professional). Giao diện tối ưu đa thiết bị (Desktop, Tablet, Mobile) giúp nhân viên mọi bộ phận thao tác nhanh chóng trong 2-3 phút.

---

## 2. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ ĐỀ XUẤT (TECH STACK)

### 2.1. Frontend & Backend
- **Framework:** **Next.js 15+ (App Router)** hoặc **React (Vite) + Node.js (Express/NestJS)**.
  - *Khuyến nghị:* **Next.js App Router (TypeScript)** để có cả Server Actions/API Routes gọn nhẹ, SEO nội bộ tốt và triển khai một khối thống nhất (Monorepo/Single deployable).
- **Ngôn ngữ:** TypeScript 100% (Strict mode).
- **Styling:** Tailwind CSS + Radix UI / Shadcn UI components.
- **Biểu đồ (Analytics):** Recharts hoặc Chart.js.
- **Icons:** Lucide React.
- **Validation:** Zod (kiểm tra chặt chẽ dữ liệu đầu vào điểm số và phân quyền).

### 2.2. Cơ sở dữ liệu & Xác thực (Database & Auth)
- **Database:** PostgreSQL (Khuyến nghị **Supabase** hoặc PostgreSQL trên Docker/Cloud).
- **ORM:** Prisma ORM hoặc Drizzle ORM.
- **Authentication:** JWT Token / NextAuth.js / Supabase Auth kết hợp mã hóa bcrypt cho mật khẩu.
- **Role-Based Access Control (RBAC):** Kiểm soát truy cập theo vai trò ở cả tầng Middleware lẫn API Route.

---

## 3. CƠ CẤU TỔ CHỨC & DỮ LIỆU ĐẶC THÙ (DOMAIN CONTEXT)

Dựa trên dữ liệu thực tế từ hệ thống quản lý công ty:

### 3.1. Các Bộ Phận / Phòng Ban (Departments)
Hệ thống quản lý nhân sự thuộc 10 bộ phận chính:
1. `PHÒNG KINH DOANH`
2. `PHÒNG KẾ TOÁN`
3. `IT`
4. `KỸ THUẬT`
5. `KHO`
6. `ĐIỂM TẬP KẾT`
7. `Lái xe`
8. `BẢO VỆ`
9. `CHMT`
10. `TẠP VỤ`
11. `HÀNH CHÍNH`
12. `BAN GIÁM ĐỐC`

### 3.2. Hệ Thống Phân Quyền & Phạm Vi Quản Lý (Department RBAC Scope)

Hệ thống thiết lập 3 vai trò chính (`User`, `Manager`, `Admin`), trong đó phân quyền xem và chấm điểm của từng Quản lý được quy định chặt chẽ:

1. **Quản lý Hành chánh (HC01)**:
   - **Phạm vi hiển thị & chấm:** Thấy **toàn bộ** nhân viên công ty.
   - **Đặc quyền:** Được quyền **thêm nhân viên mới** vào hệ thống (MANV, Họ tên, Bộ phận, Chức vụ, Quyền hạn, Mật khẩu).
2. **Quản lý Kinh doanh (KD01)**:
   - **Phạm vi hiển thị & chấm:** Thấy 3 bộ phận liên đới: **`KHO`**, **`CHMT`**, **`PHÒNG KINH DOANH`**.
3. **Quản lý Điểm Tập Kết - DTK (DTK01)**:
   - **Phạm vi hiển thị & chấm:** Chỉ thấy nhân viên của **`ĐIỂM TẬP KẾT`**.
4. **Quản lý Kế toán (KT01)**:
   - **Phạm vi hiển thị & chấm:** Chỉ thấy nhân viên của **`PHÒNG KẾ TOÁN`**.
5. **Quản lý IT (TKV09 - Nguyễn Khắc Diệp)**:
   - **Phạm vi hiển thị & chấm:** Thấy **toàn bộ** nhân viên công ty.
6. **Ban Giám Đốc / Admin (BGD01)**:
   - Toàn quyền xem, phê duyệt cấp Hội Đồng, quản lý danh sách nhân sự và xuất báo cáo Excel toàn công ty.

### 3.3. Quy Định Chỉnh Sửa Đánh Giá Của Nhân Viên (Self-Evaluation Editing Lifecycle)
- **Khi Quản lý CHƯA chấm điểm (`status = SUBMITTED` / `managerScore = null`):**
  - Nhân viên được quyền mở lại phiếu đánh giá của mình để thay đổi điểm số 10 câu hỏi và cập nhật lại ý kiến cá nhân.
  - Hệ thống tự động điền sẵn (prefill) kết quả trước đó và hiển thị nút **"Cập Nhật Đánh Giá KPI"**.
- **Khi Quản lý ĐÃ chấm điểm (`status = MANAGER_REVIEWED` hoặc `APPROVED`):**
  - Hệ thống **tự động khóa chỉnh sửa** phiếu đánh giá để đảm bảo tính khách quan và minh bạch. Nhân viên chỉ có thể xem lại kết quả dưới dạng chỉ đọc.

---

## 4. CHI TIẾT BỘ 10 TIÊU CHÍ ĐÁNH GIÁ KPI (THANG ĐIỂM 100)

Tổng điểm tối đa là **100 điểm**, phân bổ theo 10 tiêu chí chuẩn hoá từ Google Form:

### Câu 1: Tính kỷ luật (Tối đa: 10 điểm)
- *Nội dung:* Tuân thủ quy định nội quy (giờ giấc, tác phong, đồng phục); ý thức an toàn lao động, bảo vệ tài sản công ty và con người.
- *Thang điểm lựa chọn:*
  - `9 - 10 điểm`: Luôn tuân thủ quy định công ty một cách chính xác, không vi phạm và tuân thủ nghiêm túc các quy tắc.
  - `7 - 8 điểm`: Tuân thủ tốt quy định, đôi khi xuất hiện một vài vi phạm nhỏ không đáng kể.
  - `5 - 6 điểm`: Có một số vi phạm, đòi hỏi sự chú ý và cần điều chỉnh cải thiện.
  - `3 - 4 điểm`: Tuân thủ không đạt yêu cầu, vi phạm thường xuyên.

### Câu 2: Thái độ làm việc (Tối đa: 10 điểm)
- *Nội dung:* Nhiệt tình, chủ động, tinh thần hợp tác, tôn trọng người khác trong công việc.
- *Thang điểm lựa chọn:*
  - `9 - 10 điểm`: Luôn có thái độ tích cực, hợp tác và nhiệt tình, luôn sẵn lòng giúp đỡ đồng đội.
  - `7 - 8 điểm`: Thái độ chủ động và tích cực nhưng đôi khi xuất hiện tình huống chưa triệt để.
  - `5 - 6 điểm`: Thái độ chung chung, đôi khi thiếu nhiệt tình, cần cải thiện sự tập trung.
  - `3 - 4 điểm`: Thiếu nhiệt tình, thụ động, có thái độ tiêu cực ảnh hưởng đến người khác.

### Câu 3: Giao tiếp (Tối đa: 10 điểm)
- *Nội dung:* Kỹ năng giao tiếp với cấp trên, đồng nghiệp và khách hàng/đối tác; khả năng lắng nghe và phản hồi.
- *Thang điểm lựa chọn:*
  - `9 - 10 điểm`: Giao tiếp hiệu quả, dễ dàng tương tác và truyền đạt thông tin rõ ràng, lắng nghe tốt.
  - `7 - 8 điểm`: Giao tiếp tốt nhưng cần cải thiện kỹ năng lắng nghe và phản hồi chính xác.
  - `5 - 6 điểm`: Mức độ trung bình, đôi khi gặp khó khăn khi truyền đạt hoặc chưa lắng nghe đầy đủ.
  - `3 - 4 điểm`: Giao tiếp kém hiệu quả, không rõ ràng, ít lắng nghe gây hiểu lầm.

### Câu 4: Mức độ hoàn thành & Chất lượng công việc (Tối đa: 30 điểm - Trọng tâm)
- *Nội dung:* Đạt mục tiêu đề ra; chất lượng công việc theo tiêu chuẩn; đảm bảo tiến độ và thời hạn; giải quyết phát sinh khó khăn hiệu quả.
- *Thang điểm lựa chọn:*
  - `28 - 30 điểm`: Đạt 100% mục tiêu và yêu cầu đề ra, chất lượng vượt trội, đúng hạn tuyệt đối.
  - `25 - 27 điểm`: Hoàn thành gần đạt 100%, rất ít sai sót nhỏ và đáp ứng tốt tiêu chuẩn.
  - `23 - 24 điểm`: Hoàn thành đạt 80% - 90%, có một số sai sót nhỏ nhưng vẫn kịp tiến độ.
  - `19 - 21 điểm`: Hoàn thành đạt 70% - 80%, có sai sót nhưng không ảnh hưởng nghiêm trọng.
  - `16 - 18 điểm`: Hoàn thành đạt 60% - 70%, có nhiều sai sót cần hỗ trợ khắc phục.
  - `4 - 6 điểm`: Đạt dưới 30%, rất nhiều sai sót, chất lượng không đáp ứng yêu cầu.

### Câu 5: Kiến thức (Tối đa: 10 điểm)
- *Nội dung:* Hiểu biết về ngành nghề kinh doanh, sản phẩm công ty và kiến thức chuyên môn phụ trách.
- *Thang điểm lựa chọn:*
  - `9 - 10 điểm`: Kiến thức rộng và sâu, am hiểu tường tận nghiệp vụ và ngành nghề.
  - `7 - 8 điểm`: Hiểu biết sâu sắc và áp dụng tốt vào công việc thực tế.
  - `5 - 6 điểm`: Kiến thức khá, hiểu biết ổn định về công việc thường nhật.
  - `3 - 4 điểm`: Kiến thức ở mức cơ bản, đơn giản, cần bồi dưỡng thêm.
  - `0 - 2 điểm`: Thiếu hiểu biết cơ bản, không đáp ứng được yêu cầu chuyên môn.

### Câu 6: Kỹ năng chuyên môn & Xử lý tình huống (Tối đa: 10 điểm)
- *Nội dung:* Sắp xếp và quản lý công việc cá nhân; kỹ năng giải quyết sự cố, linh hoạt thích ứng.
- *Thang điểm:* Chấm theo thang từ `1 đến 10 điểm` (Mức 9-10: Vững vàng, xử lý linh hoạt mọi sự cố; Mức 7-8: Khá, tự chủ được việc; Mức 5-6: Trung bình; Mức 1-4: Cần kèm cặp đào tạo).

### Câu 7: Đổi mới & Ứng dụng công nghệ (Tối đa: 5 điểm)
- *Nội dung:* Sử dụng phần mềm, công cụ công nghệ vào công việc; tư duy đổi mới cách làm việc.
- *Thang điểm:* Từ `1 đến 5 điểm` (5đ: Chủ động tìm tòi áp dụng công nghệ mới mang lại hiệu quả cao; 1đ: Thụ động, từ chối công nghệ).

### Câu 8: Khả năng tương tác & Hợp tác tập thể (Tối đa: 5 điểm)
- *Nội dung:* Tham gia các chương trình, phong trào tập thể, sự kiện nội bộ; hỗ trợ đồng nghiệp ngoài phạm vi cá nhân.
- *Thang điểm:* Từ `1 đến 5 điểm` (5đ: Nhiệt tình, gắn kết cao; 1đ: Tách biệt, không hòa nhập).

### Câu 9: Sự phát triển bản thân (Tối đa: 5 điểm)
- *Nội dung:* Tinh thần tự học hỏi, cập nhật kiến thức mới, nâng cao năng lực cá nhân.
- *Thang điểm:* Từ `1 đến 5 điểm` (5đ: Tự giác nâng cấp bản thân liên tục; 1đ: Trì trệ, không có ý thức học hỏi).

### Câu 10: Ý tưởng sáng tạo & Đóng góp cải tiến (Tối đa: 5 điểm)
- *Nội dung:* Đưa ra sáng kiến cải tiến quy trình, tiết kiệm chi phí, giải pháp nâng cao năng suất lao động.
- *Thang điểm:* Từ `1 đến 5 điểm` (5đ: Có sáng kiến đột phá tạo giá trị rõ rệt; 1đ: Không có đóng góp mới).

### Ý kiến / Góp ý cá nhân (Textarea không bắt buộc):
- Ghi nhận kiến nghị, nguyện vọng của nhân viên đối với công ty/bộ phận.

---

## 5. CÔNG THỨC & QUY TẮC XẾP LOẠI KPI (RATING SYSTEM)

Tổng điểm tự đánh giá = $\sum_{i=1}^{10} \text{Điểm tiêu chí}_i$ (Thang điểm 100)

Quy tắc phân loại xếp loại chuẩn:
- **`Giỏi`**: $\ge 80$ điểm (Hoàn thành vượt mức mong đợi, xuất sắc)
- **`Khá`**: $65 \le \text{Điểm} \le 79$ điểm (Hoàn thành tốt nhiệm vụ)
- **`Trung Bình`**: $50 \le \text{Điểm} \le 64$ điểm (Cần cải thiện một số mặt)
- **`Yếu`**: $< 50$ điểm (Không đạt yêu cầu công việc)

*Lưu ý:* Quy tắc xếp loại này áp dụng thống nhất cho cả **Tự xếp loại**, **Quản lý xếp loại** và **Hội đồng xếp loại**.

---

## 6. QUY TRÌNH NGHIỆP VỤ (3-TIER EVALUATION WORKFLOW)

```
[Bắt đầu tháng mới]
       │
       ▼
[1. Nhân viên (User) Đăng nhập] ───► Thực hiện "Tự đánh giá KPI" (10 tiêu chí + Góp ý)
       │                              Trạng thái: "Đã nộp" (SUBMITTED)
       ▼
[2. Quản lý (Manager) Thẩm định] ──► Xem xét kết quả nhân viên nộp
                                     Chấm: "Điểm Quản Lý" + "Ý kiến Quản lý"
                                     Trạng thái: "QL đã duyệt" (MANAGER_REVIEWED)
       ▼
[3. Hội đồng / BGĐ Phê duyệt] ───► Thẩm định cuối: "Điểm Hội Đồng" + "Ý kiến HĐ"
                                     Phê duyệt chốt bảng xếp loại chính thức
                                     Trạng thái: "Hoàn tất" (APPROVED)
       ▼
[4. Công bố & Lưu trữ] ──────────► Nhân viên xem phiếu kết quả KPI tháng
                                     Admin xuất báo cáo Excel & Báo cáo lương thưởng
```

---

## 7. CƠ SỞ DỮ LIỆU ĐỀ XUẤT (DATABASE SCHEMA)

```sql
-- 1. Bảng Bộ phận
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE, -- MANV (VD: TKV09, TKV11)
    full_name VARCHAR(150) NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'User', -- 'User' | 'Manager' | 'Admin'
    title VARCHAR(100) DEFAULT 'NHÂN VIÊN',    -- Chức vụ: 'NHÂN VIÊN' | 'QUẢN LÝ'
    email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Kỳ đánh giá KPI
CREATE TABLE kpi_periods (
    id SERIAL PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL UNIQUE, -- Định dạng: 'MM-YYYY' (VD: '10-2026')
    name VARCHAR(100) NOT NULL,           -- VD: 'Kỳ đánh giá KPI Tháng 10/2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Kết quả đánh giá KPI
CREATE TABLE kpi_evaluations (
    id SERIAL PRIMARY KEY,
    period_id INT NOT NULL REFERENCES kpi_periods(id) ON DELETE CASCADE,
    evaluator_id INT NOT NULL REFERENCES users(id),       -- Người thực hiện đánh giá
    evaluated_user_id INT NOT NULL REFERENCES users(id),  -- Người được đánh giá (chính mình hoặc đồng nghiệp)
    
    -- 10 tiêu chí đánh giá
    q1_discipline INT NOT NULL,              -- 10đ
    q2_attitude INT NOT NULL,                -- 10đ
    q3_communication INT NOT NULL,           -- 10đ
    q4_completion INT NOT NULL,              -- 30đ
    q5_knowledge INT NOT NULL,               -- 10đ
    q6_skills INT NOT NULL,                  -- 10đ
    q7_innovation INT NOT NULL,              -- 5đ
    q8_teamwork INT NOT NULL,                -- 5đ
    q9_self_development INT NOT NULL,        -- 5đ
    q10_creativity INT NOT NULL,             -- 5đ
    user_feedback TEXT,                      -- Ý kiến cá nhân
    
    -- Kết quả tự đánh giá
    self_total_score INT NOT NULL,
    self_classification VARCHAR(50) NOT NULL, -- 'Giỏi' | 'Khá' | 'Trung Bình' | 'Yếu'
    
    -- Thẩm định Quản lý
    manager_id INT REFERENCES users(id),
    manager_score INT,
    manager_classification VARCHAR(50),
    manager_feedback TEXT,
    manager_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Thẩm định Hội đồng / BGĐ
    council_id INT REFERENCES users(id),
    council_score INT,
    council_classification VARCHAR(50),
    council_feedback TEXT,
    council_approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Trạng thái bản đánh giá
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'DRAFT' | 'SUBMITTED' | 'MANAGER_REVIEWED' | 'APPROVED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_period_user UNIQUE (period_id, evaluator_id, evaluated_user_id)
);
```

---

## 8. HƯỚNG DẪN THIẾT KẾ UI/UX (DESIGN SYSTEM & GUIDELINES)

### 8.1. Triết lý Thiết kế
- **Tối giản (Minimalist):** Loại bỏ chi tiết thừa, khoảng trắng (whitespace) hợp lý, tập trung vào nội dung đánh giá và trực quan hóa số liệu.
- **Hiện đại & Sang trọng:** Tone màu nền trung tính cao cấp (Neutral Slate `#F8FAFC`, Dark `#0F172A`), kết hợp màu chủ đạo Sapphire Blue / Deep Indigo (`#2563EB` hoặc `#1E40AF`) tạo cảm giác tin cậy và chuyên nghiệp.
- **Màu sắc trạng thái xếp loại (Badges):**
  - **Giỏi:** Xanh ngọc lục bảo Emerald (`#10B981` / nền nhẹ `#ECFDF5`)
  - **Khá:** Xanh dương Sapphire (`#3B82F6` / nền nhẹ `#EFF6FF`)
  - **Trung Bình:** Vàng hổ phách Amber (`#F59E0B` / nền nhẹ `#FFFBEB`)
  - **Yếu:** Đỏ hồng Ruby Rose (`#EF4444` / nền nhẹ `#FEF2F2`)

### 8.2. Trải nghiệm người dùng khi đánh giá (Rating Form UX)
- **Score Calculation Realtime:** Khi nhân viên chọn từng tiêu chí, thanh điểm tổng và xếp loại dự kiến sẽ cập nhật mượt mà (smooth animation) ở thanh trạng thái dính (Sticky Header hoặc Floating Pill).
- **Interactive Radio Cards:** Mỗi mức điểm hiển thị dưới dạng Card có viền tinh tế, radio button rõ ràng, có tiêu đề số điểm nổi bật kèm giải thích tiêu chí chi tiết để nhân viên không bị nhầm lẫn.
- **Mobile-Friendly:** Hỗ trợ vuốt chạm, bố cục dạng đơn cột (single column) trên điện thoại, nút bấm to bản giúp nhân viên bộ phận bốc xếp, bảo vệ, lái xe thao tác thuận tiện.

---

## 9. QUY HOẠCH CÁC TRANG & CHỨC NĂNG (PAGES & FEATURES)

### 9.1. Xác thực (Authentication)
- `/login`: Form đăng nhập tối giản (Mã nhân viên / Mật khẩu). Có nút hiện/ẩn mật khẩu, ghi nhớ đăng nhập, hỗ trợ đổi mật khẩu lần đầu.

### 9.2. Phân hệ Nhân viên (Employee Portal)
- `/dashboard`: Trang chủ nhân viên. Hiển thị thông báo kỳ đánh giá hiện tại, trạng thái (Chưa đánh giá / Đã nộp / Đã duyệt), biểu đồ KPI các tháng gần nhất.
- `/kpi/evaluate`: Form làm bài đánh giá KPI tháng (10 tiêu chí chuẩn hoá, tự động tính tổng điểm và xếp loại).
- `/kpi/history`: Lịch sử các kỳ đánh giá cũ, xem chi tiết điểm tự chấm vs điểm Quản lý vs điểm Hội đồng.

### 9.3. Phân hệ Quản lý (Manager Portal)
- `/manager/evaluations`: Danh sách nhân viên trong bộ phận phụ trách. Lọc theo trạng thái nộp, tìm kiếm theo tên hoặc MANV.
- `/manager/evaluations/[id]`: Giao diện duyệt và chấm điểm quản lý (xem phiếu tự đánh giá của nhân viên bên cạnh, nhập Điểm QL và Nhận xét).

### 9.4. Phân hệ Quản trị & Hội đồng (Admin / Council Portal)
- `/admin/dashboard`: Báo cáo tổng thể toàn công ty (Tỷ lệ hoàn thành theo phòng ban, biểu đồ phổ điểm Giỏi/Khá/TB/Yếu).
- `/admin/periods`: Quản lý danh sách kỳ đánh giá (Mở kỳ mới, đóng kỳ, cấu hình thời gian).
- `/admin/approval`: Duyệt hàng loạt hoặc duyệt từng bản ghi cấp Hội Đồng.
- `/admin/users`: Quản lý danh sách nhân viên (35+ nhân sự hiện có), phân phòng ban, cấp lại mật khẩu, phân role (User, Manager, Admin).
- `/admin/export`: Xuất kết quả KPI ra Excel theo định dạng chuẩn khớp với sheet `KQDGNV`.

---

## 10. TIÊU CHUẨN MÃ NGUỒN & QUY TẮC PHÁT TRIỂN (CODING CONVENTIONS)

1. **Clean Code & Modularity:**
   - Mỗi component phục vụ đúng một mục đích (Single Responsibility Principle).
   - Tách biệt Logic (hooks/server actions), UI (components) và Types (interfaces/schemas).
2. **Type Safety:**
   - Không sử dụng kiểu `any`. Định nghĩa đầy đủ Type cho Employee, KPIForm, Criteria, EvaluationStatus.
3. **Validation & Security:**
   - Dùng Zod schema kiểm tra dữ liệu ở cả client và server: điểm từng câu phải nằm trong khoảng hợp lệ, tổng điểm từ 0 đến 100.
   - Luôn hash mật khẩu bằng `bcryptjs` với salt rounds $\ge 10$.
4. **Hiệu năng & Trải nghiệm:**
   - Tối ưu hóa tải trang dưới 1.5 giây.
   - Thêm trạng thái Loading skeletons và thông báo Toast (Sonner / React Hot Toast) cho các hành động nộp bài, lưu nháp, cập nhật.
5. **Git Workflow:**
   - Đặt tên commit rõ ràng: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`.

---

## 11. KẾ HOẠCH TRIỂN KHAI THEO GIAI ĐOẠN (ROADMAP)

- **Giai đoạn 1 (Khởi tạo & Core):** Khởi tạo dự án Next.js, cấu hình Tailwind, tạo schema DB, import dữ liệu 35 nhân sự và 10 bộ phận từ file Excel mẫu.
- **Giai đoạn 2 (Xác thực & Form Đánh Giá):** Xây dựng module đăng nhập RBAC, tạo Form 10 câu đánh giá KPI chuẩn UX tối giản, cơ chế tự động tính điểm và xếp loại.
- **Giai đoạn 3 (Quản Lý & Duyệt Cấp):** Xây dựng portal dành cho Quản lý chấm điểm và Hội đồng phê duyệt kết quả cuối cùng.
- **Giai đoạn 4 (Dashboard, Báo Cáo & Xuất Excel):** Bổ sung biểu đồ thống kê trực quan, tính năng xuất báo cáo Excel tương thích cấu trúc `KQDGNV`.
- **Giai đoạn 5 (Testing & Deploy):** Kiểm thử phân quyền, tối ưu giao diện trên thiết bị di động, deploy lên hạ tầng Cloud/Vercel.
