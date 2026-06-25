# Luồng dữ liệu (Data Flow) — Wedding Card Builder

> Mô tả chi tiết từng luồng xử lý chính trong hệ thống. Dùng kèm
> `ARCHITECTURE.md` (tổng quan hệ thống) và `wedding_card_schema.sql`
> (cấu trúc bảng được tham chiếu trong mỗi luồng).

## 1. Tạo thiệp mới từ mẫu

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React App
    participant BE as NestJS API
    participant DB as PostgreSQL

    U->>FE: Chọn 1 template trong danh sách
    FE->>BE: POST /cards { templateId }
    BE->>DB: SELECT template_pages + template_blocks WHERE template_id = ?
    BE->>DB: INSERT INTO cards (clone metadata cơ bản)
    BE->>DB: INSERT INTO card_pages (clone từ template_pages)
    BE->>DB: INSERT INTO card_blocks (clone từ template_blocks,<br/>set source_template_block_id)
    BE-->>FE: 201 { cardId, slug, pages: [...], blocks: [...] }
    FE->>U: Redirect vào /editor/:cardId
```

**Lưu ý:** việc clone thực hiện trong 1 transaction Prisma
(`prisma.$transaction`) để đảm bảo không tạo ra `card` mồ côi nếu việc clone
block bị lỗi giữa đường.

## 2. Chỉnh sửa block trong editor (kéo-thả / resize / xoay)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React (Zustand + react-moveable)
    participant BE as NestJS API
    participant DB as PostgreSQL

    U->>FE: Kéo / resize / xoay block
    FE->>FE: Update Zustand store ngay (UI phản hồi tức thì)
    Note over FE: Debounce ~400ms sau khi ngừng tương tác
    FE->>BE: PATCH /cards/:cardId/blocks/:blockId<br/>{ pos_x, pos_y, width, height, rotation }
    BE->>BE: Kiểm tra block thuộc card của user đang login
    BE->>DB: UPDATE card_blocks SET ...
    DB-->>BE: updated_at mới
    BE-->>FE: 200 { block đã cập nhật }
    alt Lỗi mạng / lỗi server
        FE->>FE: Rollback về giá trị trước khi kéo + hiện toast lỗi
    end
```

**Quy tắc quan trọng:** mọi thay đổi nội dung (`content`) hoặc style
(`style`) cũng đi qua endpoint `PATCH` tương tự, chỉ khác payload — không
tạo endpoint riêng cho từng loại thay đổi để giữ API gọn.

## 3. Autosave cục bộ & phát hiện bản sao lưu

Tính năng này xử lý trường hợp mất mạng / đóng tab giữa lúc đang chỉnh sửa
(tương ứng banner "Phát hiện bản sao lưu" trong UI thật).

```mermaid
sequenceDiagram
    participant FE as React App
    participant LS as localStorage / IndexedDB
    participant BE as NestJS API

    loop Mỗi khi state editor thay đổi
        FE->>LS: Lưu draft { cardId, pages, blocks, updatedAt: now() }
        FE->>BE: PATCH (debounced, như luồng #2)
    end

    Note over FE: User mở lại thiệp (load editor)
    FE->>BE: GET /cards/:cardId
    BE-->>FE: { ...card, updatedAt: serverTime }
    FE->>LS: Đọc draft đã lưu (nếu có)
    alt draft.updatedAt > serverTime
        FE->>FE: Hiện banner "Phát hiện bản sao lưu"
        Note over FE: 3 lựa chọn cho user
        alt User chọn "Khôi phục"
            FE->>FE: Áp dụng draft vào canvas
            FE->>BE: PATCH toàn bộ pages/blocks (ghi đè server)
        else User chọn "Xem trước"
            FE->>FE: Render draft ở chế độ preview, chưa ghi đè
        else User chọn "Bỏ qua"
            FE->>LS: Xoá draft cục bộ, dùng bản server
        end
    else draft cũ hơn hoặc không có
        FE->>FE: Load bình thường từ server, không hiện banner
    end
```

**Không cần thêm bảng DB cho tính năng này** — chỉ cần backend luôn trả
`updated_at` chính xác ở mọi response liên quan đến `cards`/`card_pages`/
`card_blocks`, frontend tự so sánh với bản lưu cục bộ.

## 4. Upload ảnh & xóa nền bằng AI

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React App
    participant BE as NestJS API
    participant S3 as Object Storage
    participant AI as AI Background Removal API

    U->>FE: Chọn ảnh từ máy
    FE->>BE: POST /assets/upload (multipart/form-data)
    BE->>S3: Lưu file gốc
    BE->>DB: INSERT INTO assets (type='image', url=...)
    BE-->>FE: { assetId, url }
    FE->>FE: Gắn url vào content.url của block image

    U->>FE: Bấm "Xóa nền"
    FE->>BE: POST /assets/:id/remove-background
    BE->>AI: Gửi ảnh gốc
    AI-->>BE: Ảnh đã xóa nền (PNG nền trong suốt)
    BE->>S3: Lưu ảnh kết quả (asset mới, giữ asset gốc để hoàn tác)
    BE->>DB: INSERT INTO assets (ảnh đã xử lý)
    BE-->>FE: { newAssetId, url }
    FE->>BE: PATCH block { content: { assetId: newAssetId, url } }
```

**Lưu ý chi phí:** gọi AI xóa nền tốn phí theo lượt — nên cache kết quả
(không gọi lại nếu user bấm "Xóa nền" nhiều lần trên cùng 1 ảnh gốc đã xử
lý rồi) bằng cách kiểm tra asset đã có bản `processedFrom = originalAssetId`
chưa trước khi gọi AI.

## 5. Publish thiệp

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React App
    participant BE as NestJS API
    participant DB as PostgreSQL
    participant R as Redis

    U->>FE: Bấm "Xuất bản"
    FE->>BE: PATCH /cards/:id { status: 'published' }
    BE->>DB: Validate slug unique, kiểm tra điều kiện gói (plan)
    BE->>DB: UPDATE cards SET status='published', published_at=now()
    BE->>R: DEL card:{slug}:public_data  (xoá cache cũ nếu có)
    BE-->>FE: 200 { card đã publish, publicUrl }
```

## 6. Khách xem thiệp công khai (có cache)

```mermaid
sequenceDiagram
    participant G as Khách mời
    participant FE as Public Card Page
    participant BE as NestJS API
    participant R as Redis
    participant DB as PostgreSQL

    G->>FE: Mở link /thiep/:slug
    FE->>BE: GET /public/cards/:slug
    BE->>R: GET card:{slug}:public_data
    alt Cache hit
        R-->>BE: JSON đã build sẵn
    else Cache miss
        BE->>DB: JOIN cards + card_pages + card_blocks + wedding_events
        BE->>BE: Build JSON đầy đủ
        BE->>R: SET card:{slug}:public_data (TTL hoặc vô hạn tới khi invalidate)
    end
    BE-->>FE: 200 { card data }
    FE->>BE: POST /public/cards/:slug/view (ghi nhận lượt xem, async/fire-and-forget)
    BE->>DB: INSERT INTO card_views
```

**Invalidate cache:** mỗi lần card được publish lại hoặc chỉnh sửa sau khi
đã publish → xoá key `card:{slug}:public_data` (xem luồng #5).

## 7. RSVP (xác nhận tham dự)

```mermaid
sequenceDiagram
    participant G as Khách mời
    participant FE as Public Card Page
    participant BE as NestJS API
    participant R as Redis
    participant DB as PostgreSQL

    G->>FE: Điền form RSVP (tên, SĐT, tham dự, số người)
    FE->>BE: POST /public/cards/:slug/rsvp { ...formData, inviteToken? }
    BE->>R: Kiểm tra rate limit theo IP
    BE->>BE: Validate DTO
    BE->>DB: INSERT INTO rsvp_responses
    opt Có inviteToken
        BE->>DB: UPDATE guests SET viewed_at = now() WHERE invite_token = ?
    end
    BE-->>FE: 201 { đã ghi nhận }
```

## 8. Lời chúc (Wishes)

```mermaid
sequenceDiagram
    participant G as Khách mời
    participant FE as Public Card Page
    participant BE as NestJS API
    participant Owner as Chủ thiệp (Dashboard)

    G->>FE: Gửi lời chúc
    FE->>BE: POST /public/cards/:slug/wishes { displayName, message }
    BE->>BE: Rate limit + validate (chặn nội dung rỗng/spam cơ bản)
    BE->>DB: INSERT INTO wishes (is_approved = cards.settings.requireWishApproval ? false : true)
    BE-->>FE: 201 { đã gửi, chờ duyệt nếu cần }

    opt Card yêu cầu duyệt trước khi public
        Owner->>BE: GET /cards/:id/wishes?status=pending
        Owner->>BE: PATCH /wishes/:id { is_approved: true }
    end
```

## 9. Xác thực (Auth)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React App
    participant BE as NestJS API
    participant R as Redis
    participant DB as PostgreSQL

    U->>FE: Đăng nhập (email/password)
    FE->>BE: POST /auth/login
    BE->>DB: Kiểm tra email + so sánh bcrypt hash
    BE->>BE: Tạo access_token (15p) + refresh_token (7 ngày)
    BE->>R: SET refresh:{userId} = refresh_token (whitelist)
    BE-->>FE: { accessToken, refreshToken }

    Note over FE: Khi access_token hết hạn
    FE->>BE: POST /auth/refresh { refreshToken }
    BE->>R: Kiểm tra refresh_token còn trong whitelist
    BE-->>FE: { accessToken mới }

    U->>FE: Đăng xuất
    FE->>BE: POST /auth/logout
    BE->>R: DEL refresh:{userId}
```

Social login (Google/Facebook) dùng Passport strategy riêng
(`passport-google-oauth20`, `passport-facebook`), sau khi callback thành
công thì tạo/tìm `user` theo `provider` + `provider_id`, rồi cấp token theo
đúng luồng trên.
