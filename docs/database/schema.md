# Database Schema Documentation

## Models

### `RoomType`
- `id`: String (Primary Key, cuid)
- `name`: String (e.g., Deluxe Ocean View)
- `description`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `RatePlan`
- `id`: String (Primary Key, cuid)
- `name`: String (e.g., BAR, Non-Ref)
- `basePrice`: Float
- `roomTypeId`: String (Foreign Key to `RoomType`)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `OTAChannel`
- `id`: String (Primary Key, cuid)
- `name`: String (Agoda, Booking.com, etc.)
- `calcType`: CalculationType (ADDITIVE, PROGRESSIVE)
- `defaultComm`: Float (Default: 15)

### `CampaignInstance`
- `id`: String (Primary Key, cuid)
- `name`: String
- `discountValue`: Float
- `isPercentage`: Boolean (Default: true)
- `calcType`: CalculationType
- `applyOrder`: Int (For sorting)
- `isActive`: Boolean (Default: true)
- `otaChannelId`: String? (Foreign Key to `OTAChannel`)
- `incompatibleWith`: String[] (List of conflicting Campaign IDs)

---

## Enums

### `CalculationType`
- `ADDITIVE`: Cộng dồn
- `PROGRESSIVE`: Tính theo bậc thang (lũy tiến)

---

## Relationships
- `RoomType` 1-N `RatePlan`
- `OTAChannel` 1-N `CampaignInstance`
