# Changelog

## [2026-01-29]
### Added
- **UI Branding Refresh**: Updated all titles and labels to new Vietnamese branding (e.g., "Nhìn Tổng thể").
- **OTA Default Rates**: Agoda 20%, Booking 18%, Expedia 17%, Traveloka 17%, CTRIP 18%.
- **Manual Deployment Workflow**: Standardized deployment to `pricing-structure-system` project.

### Fixed
- **JSX Syntax**: Escaped `->` in component labels for build stability.
- **Firebase Project Error**: Resolved deployment hang due to missing active project ID.
- **Duplicate Return**: Fixed multiple `return` statements in `AgodaPricingTab.tsx`.

### Changed
- **Agoda UI Overhaul**:
    - **Reordering**: Moved "Channel Settings" above "Promotion Stack".
    - **Localization**: Full Vietnamese translation ("Cộng dồn khuyến mãi", "Thêm Khuyến Mãi", "Cài đặt hoa hồng", "Lũy tiến", "Cộng dồn", "Cách diễn giải tính toán từng bước").
    - **Workflow**: Updated Calculator flow to: Choose Room -> Choose Direction (NET/BAR) -> Input Price -> Result.
    - **Defaults**: Commission 20%, Additive Mode.
    - **UX**: Input field now formats numbers with thousands separators (e.g., 4.000.000) for better readability.
### Added
- RatePlan CRUD API endpoints (`/api/rate-plans`).
- OTAChannel CRUD API endpoints (`/api/ota-channels`).
- New fields `calcType` and `defaultComm` to `OTAChannel` model.
- Comprehensive Audit Report at `docs/reports/audit_20260129.md`.
- `useMemo` optimization in `PricingPage` for better render performance.
- **Tab-Based Pricing Calculator UI** with 7 tabs (Hạng Phòng, 5 OTAs, Tổng Quan).
- New components: `TabContainer`, `RoomTypesTab`, `OTAConfigTab`, `OverviewTab`.
- Multi-room comparison feature with lowest price highlighting.
- Auto-save functionality for OTA commission changes.

### Changed
- Refactored `PricingPage` to fetch OTA data dynamically from the database.
- Cleaned up API routes (`campaigns/route.ts`) by removing debug `console.error`.
- Disabled Prisma query logging in `prisma.ts` for cleaner production logs.

### Fixed
- Performance bottlenecks in calculation-heavy UI components.
- Next.js build error in `PricingPage` by adding `"use client"` directive.
- **Inverse Pricing Logic**: Corrected markup formula from subtraction to division (Net markup).
- **Prisma 7 Sync**: Fixed `db push` hangs/errors by moving URLs to `prisma.config.ts`.
- **Data Persistence**: Resolved API 500 errors by successfully syncing DB schema.
- **UI Robustness**: Added Optimistic UI and error handling to Room Management.
- **Price Input Formatting**: Added thousand separators (1.000.000) for all price inputs.
- **Data Persistence**: Fixed state propagation issue where RoomType changes didn't update OTA tabs.

### Added
- **Price Calculator Preview**: Interactive tool in OTA tabs for testing formulas (Net ↔ Display).
- **Calculation Breakdown**: Detailed step-by-step logic display in the calculator preview.

## [2026-01-28]
### Added
- Initial project structure and memory files.
- RoomType & Campaign CRUD with API routes.
- Integrated `DataManagementModal` into UI.

### Fixed
- Prisma 7 engine issues using `@prisma/adapter-pg`.
- Database schema synchronization for nullable `otaChannelId`.
