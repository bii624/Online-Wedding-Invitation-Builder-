# Wedding Card Builder Database Documentation

## 1. Tổng quan hệ thống

Wedding Card Builder là nền tảng tạo thiệp cưới điện tử với trình chỉnh sửa kéo-thả tự do (Canva-like Editor).

**Kiến trúc Single-page**: Toàn bộ nội dung thiệp được hiển thị trên một canvas cuộn dài duy nhất. Người dùng thêm/sắp xếp các block (text, ảnh, countdown, map...) tự do theo trục Y.

Các chức năng chính:

- Quản lý người dùng và gói dịch vụ
- Thư viện mẫu thiệp (Templates)
- Tạo thiệp cá nhân từ mẫu hoặc từ trang trắng
- Trình chỉnh sửa kéo-thả (Canvas Editor)
- RSVP xác nhận tham dự (gắn với toàn bộ thiệp)
- Tường lời chúc
- Quản lý media assets
- Thống kê lượt xem

---

# 2. ERD Logic

```
Users
 ├── Cards
 │    ├── CardBlocks          ← trỏ thẳng vào Card (không qua CardPage)
 │    ├── Guests
 │    │     ├── RSVPResponses ← RSVP cho toàn thiệp (không theo sự kiện)
 │    │     └── Wishes
 │    ├── Assets
 │    └── CardViews
 │
 └── Plans

Templates
 ├── TemplateBlocks           ← trỏ thẳng vào Template (không qua TemplatePage)
 └── TemplateCategories

LibraryElements
 └── ElementCategories
```

> **Đã loại bỏ**: `CardPage`, `TemplatePage`, `WeddingEvent`.

---

# 3. USERS & PLANS

## plans

Lưu các gói dịch vụ.

| Cột           | Kiểu    | Mô tả               |
| ------------- | ------- | ------------------- |
| id            | UUID    | Khóa chính          |
| name          | TEXT    | Tên gói             |
| price         | NUMERIC | Giá tiền            |
| duration_days | INTEGER | Thời hạn sử dụng    |
| max_cards     | INTEGER | Số thiệp tối đa     |
| features      | JSONB   | Danh sách tính năng |
| is_active     | BOOLEAN | Trạng thái          |

### Example features

```json
{
    "remove_watermark": true,
    "custom_domain": false,
    "max_assets": 500,
    "priority_support": true
}
```

---

## users

Thông tin tài khoản.

| Cột             | Kiểu |
| --------------- | ---- |
| id              | UUID |
| email           | TEXT |
| phone           | TEXT |
| password_hash   | TEXT |
| full_name       | TEXT |
| avatar_url      | TEXT |
| auth_provider   | ENUM |
| role            | ENUM |
| status          | ENUM |
| current_plan_id | UUID |

---

# 4. TEMPLATE SYSTEM

Template là mẫu thiệp do Admin thiết kế sẵn (single-page, không phân trang).

## template_categories

Phân loại mẫu.

Ví dụ:

```
Thiệp cưới
 ├── Luxury
 ├── Minimal
 ├── Vintage
 └── Floral
```

---

## templates

Thông tin template.

| Cột           | Mô tả                             |
| ------------- | --------------------------------- |
| name          | Tên mẫu                           |
| slug          | URL SEO                           |
| thumbnail_url | Ảnh xem trước                     |
| canvas_width  | Chiều rộng canvas (px, mobile-first) |
| background    | JSONB nền canvas mặc định         |
| status        | draft/published/archived          |

> **Lưu ý**: Đã bỏ `canvas_height` — thiệp cuộn dài không có chiều cao cố định.

### background JSON

```json
{ "type": "color", "value": "#FFFFFF" }
```

hoặc

```json
{ "type": "image", "url": "https://cdn.example.com/bg.jpg" }
```

---

## template_blocks

Các block kéo-thả trong template. Trỏ **thẳng vào `template_id`** (không qua page).

### Thuộc tính vị trí

| Cột       | Ý nghĩa      |
| --------- | ------------ |
| template_id | FK → templates |
| pos_x     | Tọa độ X     |
| pos_y     | Tọa độ Y     |
| width     | Chiều rộng   |
| height    | Chiều cao    |
| rotation  | Góc xoay     |
| z_index   | Lớp hiển thị |

---

# 5. CARD SYSTEM

Card là thiệp thực tế của khách hàng (single-page).

## cards

Thông tin tổng thể của thiệp.

| Cột        | Mô tả                         |
| ---------- | ----------------------------- |
| title      | Tên thiệp                     |
| groom_name | Tên chú rể                    |
| bride_name | Tên cô dâu                    |
| slug       | URL công khai                 |
| status     | draft/published/archived      |
| background | Nền canvas toàn cục (JSONB)   |
| settings   | Cấu hình toàn cục (JSONB)     |

### settings JSON

```json
{
    "themeColor": "#D4AF37",
    "primaryFont": "Playfair Display",
    "backgroundMusic": "https://cdn.example.com/music.mp3",
    "showCountdown": true,
    "rsvpDeadline": "2026-12-01"
}
```

---

## card_blocks

Bảng quan trọng nhất của hệ thống.

Trỏ **thẳng vào `card_id`** (không qua `card_pages`).

Mọi thao tác trong editor đều cập nhật bảng này.

### Ví dụ

Người dùng:

- Kéo text
- Resize ảnh
- Xoay icon
- Thay đổi font

=> UPDATE card_blocks

---

# 6. BLOCK JSON STRUCTURES

---

## Text Block

### content

```json
{
    "text": "Thanh & Thuận",
    "isHtml": false
}
```

### style

```json
{
    "fontFamily": "Playfair Display",
    "fontSize": 48,
    "fontWeight": 700,
    "color": "#333333",
    "textAlign": "center"
}
```

---

## Image Block

### content

```json
{
    "assetId": "uuid",
    "url": "https://cdn.example.com/photo.jpg",
    "objectFit": "cover"
}
```

### style

```json
{
    "borderRadius": 16,
    "opacity": 1,
    "shadow": {
        "x": 0,
        "y": 4,
        "blur": 16,
        "color": "#00000033"
    }
}
```

---

## Shape Block

### content

```json
{
    "shapeType": "rectangle"
}
```

### style

```json
{
    "fill": "#FFFFFF",
    "stroke": "#000000",
    "strokeWidth": 2
}
```

---

## Countdown Block

Người dùng tự nhập ngày tháng trực tiếp trên canvas.

### content

```json
{
    "targetDate": "2026-12-12T09:00:00+07:00"
}
```

### style

```json
{
    "numberColor": "#FFFFFF",
    "labelColor": "#CCCCCC"
}
```

---

## Map Block

Người dùng tự nhập địa điểm trực tiếp trên canvas.

### content

```json
{
    "lat": 16.06778,
    "lng": 108.22083,
    "zoom": 15,
    "address": "Da Nang"
}
```

---

## Gallery Block

### content

```json
{
    "assetIds": ["uuid1", "uuid2", "uuid3"],
    "layout": "grid"
}
```

---

## Button Block

### content

```json
{
    "label": "Chỉ đường",
    "action": "open_map",
    "url": "https://maps.google.com"
}
```

---

## RSVP Form Block

> **Lưu ý**: Không còn `eventId` trong content. RSVP gắn với toàn bộ thiệp.

### content

```json
{
    "fields": ["name", "phone", "attending", "numAttendees"],
    "submitLabel": "Xác nhận tham dự"
}
```

---

## Wishes Wall Block

### content

```json
{
    "layout": "grid",
    "maxItems": 20,
    "requireApproval": true
}
```

---

## QR Code Block

### content

```json
{
    "value": "https://wedding.example.com/thiep/thanh-thuan",
    "size": 256
}
```

---

# 7. GUEST MANAGEMENT

## guests

Danh sách khách mời.

### Ví dụ

```json
{
    "name": "Nguyễn Văn A",
    "group_name": "Bạn chú rể",
    "side": "groom",
    "max_companions": 2
}
```

---

## invite_token

Sinh link cá nhân hóa.

```text
/thiep/thanh-thuan?to=abc123xyz
```

---

# 8. RSVP

## rsvp_responses

Lưu phản hồi tham dự **cho toàn bộ thiệp** (không theo sự kiện riêng lẻ).

| Cột          | Kiểu | Mô tả                                     |
| ------------ | ---- | ----------------------------------------- |
| card_id      | UUID | FK → cards                                |
| guest_id     | UUID | FK → guests (NULL nếu điền tự do)         |
| guest_name   | TEXT | Tên tự điền                               |
| phone        | TEXT | SĐT                                       |
| attending    | ENUM | yes / no / maybe                          |
| num_attendees| INT  | Số người tham dự                          |
| note         | TEXT | Ghi chú                                   |

### Example

```json
{
    "guest_name": "Nguyễn Văn A",
    "attending": "yes",
    "num_attendees": 2,
    "note": "Sẽ đến đúng giờ"
}
```

---

# 9. WISHES

## wishes

Lưu lời chúc từ khách.

### Example

```json
{
    "display_name": "Minh",
    "message": "Chúc hai bạn trăm năm hạnh phúc"
}
```

---

# 10. ASSETS

## assets

Thư viện media.

Hỗ trợ:

- Image
- Video
- Audio
- Font

### Example

```json
{
    "type": "image",
    "url": "https://cdn.example.com/photo.jpg",
    "width": 1920,
    "height": 1080
}
```

---

# 11. VIEW ANALYTICS

## card_views

Theo dõi lượt xem.

### Mục đích

- Dashboard
- Thống kê khách truy cập
- Biết khách nào đã mở thiệp

---

# 12. Luồng hoạt động chính

## Tạo thiệp

```
Admin tạo Template (+ TemplateBlocks)
        ↓
User chọn Template
        ↓
Clone Template → Cards + CardBlocks (card_id trỏ thẳng)
        ↓
User chỉnh sửa tự do trên Canvas
        ↓
Publish → thiệp live tại /thiep/<slug>
```

## RSVP

```
Khách mở thiệp
        ↓
Điền RSVP Form (block trên canvas)
        ↓
rsvp_responses (card_id, không cần event_id)
```

## Wishes

```
Khách nhập lời chúc
        ↓
wishes
        ↓
Hiển thị Wishes Wall Block
```

---

# 13. Bảng quan trọng nhất

| Bảng            | Vai trò               |
| --------------- | --------------------- |
| users           | Người dùng            |
| templates       | Mẫu thiệp             |
| template_blocks | Block mẫu (no page)   |
| cards           | Thiệp thực tế         |
| card_blocks     | Canvas editor (no page)|
| guests          | Khách mời             |
| rsvp_responses  | Xác nhận tham dự      |
| wishes          | Lời chúc              |
| assets          | Kho media             |
| library_elements| Thư viện icon/sticker |

`card_blocks` là trung tâm của toàn bộ hệ thống editor kéo-thả.

---

# 14. Những gì đã loại bỏ & lý do

| Bỏ               | Lý do                                                         |
| ---------------- | ------------------------------------------------------------- |
| `card_pages`     | Kiến trúc chuyển sang single-page, canvas cuộn dài            |
| `template_pages` | Tương tự                                                      |
| `wedding_events` | Người dùng nhập ngày/địa điểm trực tiếp qua block trên canvas |
| `event_id` (RSVP)| RSVP gắn với toàn bộ thiệp, không còn phân theo buổi lễ       |
