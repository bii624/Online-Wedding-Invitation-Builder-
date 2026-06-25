# Wedding Card Builder Database Documentation

## 1. Tổng quan hệ thống

Wedding Card Builder là nền tảng tạo thiệp cưới điện tử với trình chỉnh sửa kéo-thả tự do (Canva-like Editor).

Các chức năng chính:

- Quản lý người dùng và gói dịch vụ
- Thư viện mẫu thiệp (Templates)
- Tạo thiệp cá nhân từ mẫu
- Trình chỉnh sửa kéo-thả (Canvas Editor)
- Quản lý sự kiện cưới
- RSVP xác nhận tham dự
- Tường lời chúc
- Quản lý media assets
- Thống kê lượt xem

---

# 2. ERD Logic

```
Users
 ├── Cards
 │    ├── CardPages
 │    │     └── CardBlocks
 │    │
 │    ├── WeddingEvents
 │    ├── Guests
 │    │     ├── RSVPResponses
 │    │     └── Wishes
 │    │
 │    ├── Assets
 │    └── CardViews
 │
 └── Plans

Templates
 ├── TemplatePages
 │     └── TemplateBlocks
 │
 └── TemplateCategories
```

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

### Quan hệ

```
User
 ├── Plans
 ├── Cards
 └── Assets
```

---

# 4. TEMPLATE SYSTEM

Template là mẫu thiệp do Admin thiết kế sẵn.

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

| Cột           | Mô tả             |
| ------------- | ----------------- |
| name          | Tên mẫu           |
| slug          | URL SEO           |
| thumbnail_url | Ảnh xem trước     |
| canvas_width  | Chiều rộng canvas |
| canvas_height | Chiều cao canvas  |
| status        | draft/published   |

---

## template_pages

Mỗi template gồm nhiều page.

Ví dụ:

```
Page 1 - Cover
Page 2 - Couple Intro
Page 3 - Love Story
Page 4 - Event Info
Page 5 - RSVP
Page 6 - Wishes
```

### background JSON

```json
{
    "type": "color",
    "value": "#FFFFFF"
}
```

hoặc

```json
{
    "type": "image",
    "url": "https://cdn.example.com/bg.jpg"
}
```

---

## template_blocks

Các thành phần xuất hiện trên page.

### Thuộc tính editor

| Cột      | Ý nghĩa      |
| -------- | ------------ |
| pos_x    | Tọa độ X     |
| pos_y    | Tọa độ Y     |
| width    | Chiều rộng   |
| height   | Chiều cao    |
| rotation | Góc xoay     |
| z_index  | Lớp hiển thị |

---

# 5. CARD SYSTEM

Card là thiệp thực tế của khách hàng.

## cards

Thông tin tổng thể của thiệp.

| Cột        | Mô tả             |
| ---------- | ----------------- |
| title      | Tên thiệp         |
| groom_name | Tên chú rể        |
| bride_name | Tên cô dâu        |
| slug       | URL công khai     |
| status     | draft/published   |
| settings   | Cấu hình toàn cục |

---

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

## card_pages

Trang thuộc thiệp.

Cho phép:

- Thêm page mới
- Xóa page
- Đổi thứ tự
- Ẩn page

---

## card_blocks

Bảng quan trọng nhất của hệ thống.

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

### content

```json
{
    "fields": ["name", "phone", "attending", "numAttendees"],
    "eventId": "uuid",
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

# 7. WEDDING EVENTS

## wedding_events

Một thiệp có thể chứa nhiều sự kiện.

Ví dụ:

### Nhà trai

```text
Lễ Vu Quy
08:00
12/12/2026
```

### Nhà gái

```text
Tiệc Cưới
18:00
12/12/2026
```

### Quan hệ

```
Card
 └── WeddingEvents
```

---

# 8. GUEST MANAGEMENT

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

# 9. RSVP

## rsvp_responses

Lưu phản hồi tham dự.

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

# 10. WISHES

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

# 11. ASSETS

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

# 12. VIEW ANALYTICS

## card_views

Theo dõi lượt xem.

### Mục đích

- Dashboard
- Thống kê khách truy cập
- Biết khách nào đã mở thiệp

### Quan hệ

```
Card
 └── CardViews
```

---

# 13. Luồng hoạt động chính

## Tạo thiệp

```
Admin tạo Template
        ↓
User chọn Template
        ↓
Clone Template
        ↓
Cards
        ↓
CardPages
        ↓
CardBlocks
```

## RSVP

```
Khách mở thiệp
        ↓
Điền RSVP
        ↓
rsvp_responses
```

## Wishes

```
Khách nhập lời chúc
        ↓
wishes
        ↓
Hiển thị Wishes Wall
```

---

# 14. Bảng quan trọng nhất

| Bảng            | Vai trò          |
| --------------- | ---------------- |
| users           | Người dùng       |
| templates       | Mẫu thiệp        |
| template_blocks | Block mẫu        |
| cards           | Thiệp thực tế    |
| card_blocks     | Canvas editor    |
| wedding_events  | Sự kiện cưới     |
| guests          | Khách mời        |
| rsvp_responses  | Xác nhận tham dự |
| wishes          | Lời chúc         |
| assets          | Kho media        |

`card_blocks` là trung tâm của toàn bộ hệ thống editor kéo-thả.
