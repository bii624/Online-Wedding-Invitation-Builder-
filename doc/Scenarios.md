# Kịch bản người dùng (User Scenarios / Use Cases) — Wedding Card Builder

> Mỗi use case viết theo format chuẩn để AI coding agent (Claude Code,
> Cursor...) hoặc dev đọc và sinh code/test trực tiếp. Tham chiếu bảng DB
> theo `wedding_card_schema.sql`, luồng xử lý chi tiết theo `DATA_FLOW.md`.

## Actors

| Actor                 | Mô tả                                                                |
| --------------------- | -------------------------------------------------------------------- |
| **User** (Chủ thiệp)  | Người đăng ký tài khoản, tạo và quản lý thiệp cưới                   |
| **Guest** (Khách mời) | Người nhận link thiệp, không cần tài khoản, có thể RSVP/gửi lời chúc |
| **Admin**             | Quản lý thư viện mẫu thiệp, gói dịch vụ                              |

---

## Epic 1: Tài khoản

### UC-01: Đăng ký bằng email

- **Điều kiện trước:** Chưa có tài khoản với email này.
- **Luồng chính:**
    1. User nhập email, mật khẩu, họ tên.
    2. Hệ thống validate (email đúng format, mật khẩu ≥ 8 ký tự).
    3. Hash mật khẩu bằng bcrypt, `INSERT INTO users (status='unverified')`.
    4. Trả về access/refresh token (hoặc yêu cầu xác thực email trước, tuỳ
       chính sách).
- **Luồng lỗi:** Email đã tồn tại → trả lỗi 409 `EMAIL_ALREADY_EXISTS`.
- **Bảng liên quan:** `users`.

### UC-02: Đăng nhập bằng Google/Facebook

- **Luồng chính:**
    1. User bấm "Đăng nhập với Google".
    2. Redirect qua OAuth provider, callback về `/auth/google/callback`.
    3. Tìm `users` theo `auth_provider` + `provider_id`; nếu chưa có → tạo
       mới (status = `active` ngay, không cần verify email).
    4. Trả access/refresh token, redirect vào dashboard.
- **Bảng liên quan:** `users`.

### UC-03: Quên mật khẩu

- **Luồng chính:** Gửi email chứa link reset có token hết hạn sau 15 phút
  (token có thể lưu tạm ở Redis, không cần bảng riêng).

---

## Epic 2: Chọn & tạo thiệp

### UC-10: Xem danh sách mẫu thiệp theo danh mục

- **Luồng chính:**
    1. User vào trang "Chọn mẫu".
    2. FE gọi `GET /templates?categoryId=&page=`.
    3. BE trả danh sách `templates` đã `status='published'`, kèm
       `thumbnail_url`, `is_premium`.
- **Bảng liên quan:** `templates`, `template_categories`.

### UC-11: Chọn 1 mẫu → tạo thiệp mới

- Xem chi tiết luồng tại `DATA_FLOW.md` § 1.
- **Điều kiện trước:** Nếu mẫu `is_premium = true`, user phải có
  `current_plan_id` thoả `required_plan_id` của mẫu — nếu không, trả lỗi
  403 và gợi ý nâng cấp gói.
- **Kết quả:** Tạo `cards` mới (status='draft') + clone toàn bộ
  `card_pages`/`card_blocks` từ template.

### UC-12: Tạo thiệp từ trang trắng

- Giống UC-11 nhưng `template_id = NULL`, tạo 1 `card_page` mặc định loại
  `cover` trống.

---

## Epic 3: Chỉnh sửa thiệp (Editor)

### UC-20: Thêm / sửa văn bản

- **Luồng chính:** User kéo công cụ "Văn bản" từ toolbar vào canvas →
  `POST /cards/:id/blocks { block_type: 'text', pos_x, pos_y, content: {text: ''} }`
  → user gõ nội dung → debounce → `PATCH` cập nhật `content.text`.

### UC-21: Thêm / đổi / cắt / xóa nền ảnh

- **Luồng chính:**
    1. Thêm block `image` (từ toolbar hoặc từ panel "Thay ảnh nhanh").
    2. "Đổi ảnh": mở lại flow upload (UC tương tự upload asset, xem
       `DATA_FLOW.md` § 4), gán `assetId` mới vào `content`.
    3. "Cắt ảnh": xử lý phía client (crop UI), khi xác nhận thì gửi toạ độ
       crop lên server để tạo asset đã crop (giữ ảnh gốc).
    4. "Xóa nền": gọi `POST /assets/:id/remove-background` — xem
       `DATA_FLOW.md` § 4.
- **Bảng liên quan:** `card_blocks`, `assets`.

### UC-22: Kéo-thả, resize, xoay block tự do

- Xem chi tiết tại `DATA_FLOW.md` § 2. Đây là tương tác xảy ra nhiều nhất
  trong toàn hệ thống — bắt buộc có optimistic update + debounce.

### UC-23: Thêm nhạc nền

- **Luồng chính:** User chọn nhạc từ thư viện có sẵn hoặc upload file audio
  → lưu vào `cards.settings.backgroundMusic = { assetId, url, autoplay }`.

### UC-24: Đổi nền trang (màu / ảnh)

- **Luồng chính:** `PATCH /cards/:id/pages/:pageId { background: {...} }`.
  `background` là JSONB, dạng `{"type":"color","value":"#fff"}` hoặc
  `{"type":"image","url":"...","overlayOpacity":0.3}`.

### UC-25: Khôi phục bản sao lưu cục bộ

- Xem chi tiết tại `DATA_FLOW.md` § 3 (banner "Phát hiện bản sao lưu").
- **Acceptance criteria:**
    - Nếu draft local mới hơn server → PHẢI hiện banner trước khi cho phép
      chỉnh sửa tiếp (tránh user vô tình ghi đè bản mới hơn bằng bản cũ).
    - "Xem trước" không được phép tự động lưu lên server.

### UC-26: Sắp xếp lại thứ tự các trang

- **Luồng chính:** Kéo-thả thumbnail trang trong danh sách trang →
  `PATCH /cards/:id/pages/reorder { pageIds: [...] }` → BE update lại
  `position` cho từng `card_page` theo thứ tự mới.

### UC-27: Thêm block đồng hồ đếm ngược / bản đồ / nút hành động

- **Luồng chính:** Tương tự UC-20 nhưng `block_type` khác nhau
  (`countdown`, `map`, `button`). Mỗi loại có cấu trúc `content` riêng —
  xem chú thích JSONB cuối file `wedding_card_schema.sql`.

---

## Epic 4: Sự kiện & khách mời

### UC-30: Thêm thông tin giờ / địa điểm lễ cưới

- **Luồng chính:** `POST /cards/:id/events { eventName, eventDate, venueName, address, lat, lng }`.
  Có thể thêm nhiều `wedding_events` cho 1 thiệp (lễ nhà trai, nhà gái, tiệc).

### UC-31: Tạo danh sách khách mời + sinh link cá nhân hoá

- **Luồng chính:**
    1. User thêm khách (nhập tay hoặc import từ file Excel/CSV — tính năng
       mở rộng).
    2. BE sinh `invite_token` ngẫu nhiên (unique) cho mỗi `guest`.
    3. Link cá nhân hoá dạng `https://domain.com/thiep/:slug?to=:inviteToken`.
- **Bảng liên quan:** `guests`.

### UC-32: Xem trạng thái khách đã xem / chưa xem

- **Luồng chính:** Dashboard hiển thị danh sách `guests` kèm `viewed_at`
  (NULL = chưa xem). Cập nhật `viewed_at` khi khách mở link có `inviteToken`
  hợp lệ (xem `DATA_FLOW.md` § 6).

---

## Epic 5: Xuất bản & chia sẻ

### UC-40: Xuất bản thiệp

- Xem `DATA_FLOW.md` § 5.
- **Acceptance criteria:** Không cho publish nếu thiệp chưa có ít nhất 1
  `card_page` loại `cover`.

### UC-41: Đặt mật khẩu xem thiệp

- **Luồng chính:** User bật toggle "Bảo vệ bằng mật khẩu" → nhập mật khẩu →
  lưu (nên hash) vào `cards.access_password`. Trang public yêu cầu nhập
  đúng mật khẩu trước khi trả nội dung thiệp.

### UC-42: Chia sẻ link

- Không cần xử lý backend đặc biệt — chỉ cần `cards.slug` ổn định, FE tạo
  nút "Copy link" / share trực tiếp tới Zalo/Facebook/SMS qua Web Share API
  hoặc deep link.

---

## Epic 6: Khách mời tương tác

### UC-50: Khách xem thiệp qua link

- Xem `DATA_FLOW.md` § 6.
- **Acceptance criteria:** Nếu `cards.status != 'published'` hoặc
  `expires_at < now()` → trả trang "Thiệp không tồn tại hoặc đã hết hạn",
  không tiết lộ chi tiết lỗi.

### UC-51: Khách xác nhận tham dự (RSVP)

- Xem `DATA_FLOW.md` § 7.
- **Acceptance criteria:** Rate limit theo IP (ví dụ tối đa 5 lần/phút) để
  chống spam; mỗi `inviteToken` không bắt buộc chỉ RSVP 1 lần (cho phép
  sửa lại phản hồi — tuỳ chọn thiết kế, cần thống nhất khi code).

### UC-52: Khách gửi lời chúc

- Xem `DATA_FLOW.md` § 8.
- **Acceptance criteria:** Giới hạn độ dài `message` (ví dụ ≤ 500 ký tự),
  lọc cơ bản nội dung spam/link lạ trước khi lưu.

### UC-53: Chủ thiệp duyệt / ẩn lời chúc

- **Luồng chính:** Dashboard liệt kê `wishes` theo `card_id`, có nút
  "Duyệt" (`is_approved = true`) và "Ẩn" (`is_hidden = true`).

---

## Epic 7: Quản trị (Admin)

### UC-60: Admin thêm / sửa mẫu thiệp mới

- **Luồng chính:** Admin dùng chính trình editor (tái sử dụng UI) nhưng
  lưu vào `templates`/`template_pages`/`template_blocks` thay vì
  `cards`/`card_pages`/`card_blocks`. Có thể tách 1 flag `mode: 'template' | 'card'`
  ở tầng FE để dùng chung component editor cho cả 2 trường hợp.

### UC-61: Admin quản lý gói dịch vụ

- **Luồng chính:** CRUD `plans` (giá, số thiệp tối đa, tính năng JSONB).

---

## Ghi chú cho AI coding agent

- Khi sinh code cho 1 UC, luôn kiểm tra lại bảng/cột liên quan trong
  `wedding_card_schema.sql` trước khi viết DTO/Prisma query — schema là
  nguồn sự thật duy nhất về cấu trúc dữ liệu.
- Các UC trong **Epic 3 (Editor)** đều thao tác trên `card_blocks` —
  nên tạo 1 `CardBlocksService` chung xử lý create/update/delete/reorder,
  tránh lặp logic giữa các loại `block_type`.
- Mọi endpoint dưới `/public/*` (Epic 6) **không yêu cầu JWT** nhưng
  **phải có rate limiting** — đây là nhóm endpoint duy nhất mở cho người
  dùng ẩn danh.
