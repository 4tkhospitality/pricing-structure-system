# API Documentation Reference

## Room Types
### `GET /api/room-types`
- **Description:** Lấy danh sách tất cả các loại phòng.
- **Response:** Mảng các đối tượng `RoomType`.

### `POST /api/room-types`
- **Description:** Tạo loại phòng mới.
- **Body:** `{ name, description? }`

---

## Campaigns
### `GET /api/campaigns`
- **Description:** Lấy danh sách các chương trình khuyến mãi.
- **Response:** Mảng các đối tượng `CampaignInstance`.

### `POST /api/campaigns`
- **Description:** Tạo chương trình khuyến mãi mới.
- **Body:** `{ name, discountValue, calcType, isActive? }`

---

## Rate Plans (Mới)
### `GET /api/rate-plans`
- **Description:** Lấy tất cả các gói giá, bao gồm thông tin loại phòng đi kèm.
- **Response:** `RatePlan[]` (with `roomType` included).

### `POST /api/rate-plans`
- **Description:** Tạo gói giá mới cho một loại phòng.
- **Body:** `{ name, basePrice, roomTypeId }`

### `PUT /api/rate-plans/[id]`
- **Description:** Cập nhật thông tin gói giá.
- **Body:** `{ name, basePrice, roomTypeId }`

---

## OTA Channels (Mới)
### `GET /api/ota-channels`
- **Description:** Lấy danh sách các kênh OTA từ database.
- **Response:** `OTAChannel[]`.

### `POST /api/ota-channels`
- **Description:** Tạo kênh OTA mới.
- **Body:** `{ name, calcType?, defaultComm? }`

### `PUT /api/ota-channels/[id]`
- **Description:** Cập nhật kênh OTA.
- **Body:** `{ name, calcType, defaultComm }`
