# Changelog

## [2026-01-29]
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
