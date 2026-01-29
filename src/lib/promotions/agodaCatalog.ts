import { PromotionGroup, PromotionTemplate, TargetSubCategory } from "@/types/agoda";

export const AGODA_PROMOTION_CATALOG: PromotionTemplate[] = [
    // A) Seasonal promotions
    {
        id: 'agoda-seasonal-double-day',
        name: 'Double Day Sale',
        group: PromotionGroup.SEASONAL,
        defaultPercent: null,
        description: 'Chiến dịch ngày đôi (10/10, 11/11, 12/12...)'
    },
    {
        id: 'agoda-seasonal-payday',
        name: 'Payday Sale',
        group: PromotionGroup.SEASONAL,
        defaultPercent: null,
        description: 'Khuyến mãi cuối tháng khi nhận lương'
    },
    {
        id: 'agoda-seasonal-night-owl',
        name: 'Night Owl Sale',
        group: PromotionGroup.SEASONAL,
        defaultPercent: null,
        description: 'Khuyến mãi đặt phòng đêm muộn'
    },
    {
        id: 'agoda-seasonal-summer',
        name: 'Summer Vibes',
        group: PromotionGroup.SEASONAL,
        defaultPercent: null,
        description: 'Chiến dịch mùa hè rực rỡ'
    },
    {
        id: 'agoda-seasonal-abroad',
        name: 'Deals Abroad',
        group: PromotionGroup.SEASONAL,
        defaultPercent: null,
        description: 'Chương trình ưu đãi cho thị trường nước ngoài'
    },

    // B) Essential promotions
    {
        id: 'agoda-essential-early-bird',
        name: 'Early Bird',
        group: PromotionGroup.ESSENTIAL,
        defaultPercent: null,
        description: 'Ưu đãi đặt sớm (vd: trước 14 ngày)'
    },
    {
        id: 'agoda-essential-last-minute',
        name: 'Last-Minute',
        group: PromotionGroup.ESSENTIAL,
        defaultPercent: null,
        description: 'Ưu đãi phút chót'
    },
    {
        id: 'agoda-essential-long-stay',
        name: 'Long Stay',
        group: PromotionGroup.ESSENTIAL,
        defaultPercent: null,
        description: 'Ưu đãi cho khách lưu trú dài ngày'
    },
    {
        id: 'agoda-essential-occupancy',
        name: 'Occupancy Promotion',
        group: PromotionGroup.ESSENTIAL,
        defaultPercent: null,
        description: 'Khuyến mãi dựa trên công suất phòng'
    },
    {
        id: 'agoda-essential-customized',
        name: 'Customized Promotion',
        group: PromotionGroup.ESSENTIAL,
        defaultPercent: null,
        description: 'Khuyến mãi tùy chỉnh, có tùy chọn stacking'
    },

    // C) Targeted promotions
    {
        id: 'agoda-targeted-vip-silver',
        name: 'VIP Silver',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.LOYALTY,
        defaultPercent: null,
        description: 'Dành cho khách hàng VIP Bạc'
    },
    {
        id: 'agoda-targeted-vip-gold',
        name: 'VIP Gold',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.LOYALTY,
        defaultPercent: null,
        description: 'Dành cho khách hàng VIP Vàng'
    },
    {
        id: 'agoda-targeted-vip-platinum',
        name: 'VIP Platinum',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.LOYALTY,
        defaultPercent: null,
        description: 'Dành cho khách hàng VIP Bạch Kim'
    },
    {
        id: 'agoda-targeted-mobile',
        name: 'Mobile Users',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.PLATFORM,
        defaultPercent: null,
        description: 'Ưu đãi chỉ dành cho ứng dụng di động'
    },
    {
        id: 'agoda-targeted-geo',
        name: 'Country/Geo Target',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.GEOGRAPHY,
        defaultPercent: null,
        description: 'Ưu đãi theo vùng lãnh thổ'
    },
    {
        id: 'agoda-targeted-package',
        name: 'Package / Bundle Product',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.PRODUCT,
        defaultPercent: null,
        description: 'Ưu đãi khi mua kèm gói dịch vụ'
    },
    {
        id: 'agoda-targeted-beds',
        name: 'Beds Network',
        group: PromotionGroup.TARGETED,
        subCategory: TargetSubCategory.BEDS_NETWORK,
        defaultPercent: null,
        description: 'Khuyến mãi hệ thống liên minh'
    }
];
