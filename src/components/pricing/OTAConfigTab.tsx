"use client";

import React, { useState, useMemo } from 'react';

interface Promotion {
    id: string;
    name: string;
    discountValue: number;
    calcType: string;
    isActive: boolean;
}

interface RoomType {
    id: string;
    name: string;
    basePrice: number;
}

interface OTAConfigTabProps {
    otaId: string;
    otaName: string;
    brandColor: string;
    commission: number;
    calcType: string;
    promotions: Promotion[];
    roomTypes: RoomType[];
    onCommissionChange: (value: number) => void;
    onCalcTypeChange: (value: string) => void;
    onPromotionToggle: (promoId: string, isActive: boolean) => void;
    onAddPromotion: (name: string, discountValue: number) => void;
    onDeletePromotion: (promoId: string) => void;
}

// Format number with thousand separators
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
};

// Parse formatted string back to number
const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/\D/g, '')) || 0;
};

export default function OTAConfigTab({
    otaId,
    otaName,
    brandColor,
    commission,
    calcType,
    promotions,
    roomTypes,
    onCommissionChange,
    onCalcTypeChange,
    onPromotionToggle,
    onAddPromotion,
    onDeletePromotion
}: OTAConfigTabProps) {
    const [isAddingPromo, setIsAddingPromo] = useState(false);
    const [newPromoName, setNewPromoName] = useState('');
    const [newPromoDiscount, setNewPromoDiscount] = useState(10);

    // Price Calculator State
    const [calcMode, setCalcMode] = useState<'net-to-display' | 'display-to-net'>('net-to-display');
    const [inputPriceStr, setInputPriceStr] = useState('1.000.000');
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');

    const handleAddPromo = () => {
        if (!newPromoName.trim()) return;
        onAddPromotion(newPromoName, newPromoDiscount);
        setNewPromoName('');
        setNewPromoDiscount(10);
        setIsAddingPromo(false);
    };

    // Calculate price based on mode and active promotions
    const calculatedResult = useMemo(() => {
        const inputPrice = parseFormattedNumber(inputPriceStr);
        if (inputPrice <= 0) return { result: 0, breakdown: [] };

        const activePromos = promotions.filter(p => p.isActive);
        const commissionRate = commission / 100;

        let breakdown: string[] = [];
        let result = 0;

        if (calcMode === 'net-to-display') {
            // NET (Nhận về) → DISPLAY (Giá bán)
            // Display = Net / (1 - Comm) / (1 - Disc1) / (1 - Disc2) ...
            let currentPrice = inputPrice;
            breakdown.push(`Giá muốn nhận về: ${formatNumber(inputPrice)} ₫`);

            // Apply commission first in the reverse calculation
            if (commission > 0) {
                const afterComm = currentPrice / (1 - commissionRate);
                breakdown.push(`+ Tính bù Hoa hồng (${commission}%): → ${formatNumber(afterComm)} ₫`);
                currentPrice = afterComm;
            }

            if (calcType === 'PROGRESSIVE') {
                // Reverse progressive: divide by (1 - discount) for each promo
                activePromos.forEach(promo => {
                    const nextPrice = currentPrice / (1 - (promo.discountValue / 100));
                    breakdown.push(`+ Tính bù KM ${promo.name} (${promo.discountValue}%): → ${formatNumber(nextPrice)} ₫`);
                    currentPrice = nextPrice;
                });
            } else {
                // ADDITIVE: Sum all discounts first, then divide once
                const totalDiscount = activePromos.reduce((sum, p) => sum + p.discountValue, 0);
                if (totalDiscount > 0 && totalDiscount < 100) {
                    const nextPrice = currentPrice / (1 - (totalDiscount / 100));
                    breakdown.push(`+ Tính bù Tổng KM (${totalDiscount}%): → ${formatNumber(nextPrice)} ₫`);
                    currentPrice = nextPrice;
                }
            }
            result = currentPrice;

        } else {
            // DISPLAY (Giá bán) → NET (Nhận về)
            // Net = Display * (1 - Disc1) * (1 - Disc2) ... * (1 - Comm)
            let currentPrice = inputPrice;
            breakdown.push(`Giá hiển thị (Bán): ${formatNumber(inputPrice)} ₫`);

            if (calcType === 'PROGRESSIVE') {
                // Apply promotions progressively
                activePromos.forEach(promo => {
                    const discount = currentPrice * (promo.discountValue / 100);
                    currentPrice = currentPrice - discount;
                    breakdown.push(`- Chiết khấu ${promo.name} (${promo.discountValue}%): -${formatNumber(discount)} ₫ → ${formatNumber(currentPrice)} ₫`);
                });
            } else {
                // ADDITIVE: Sum all discounts first
                const totalDiscount = activePromos.reduce((sum, p) => sum + p.discountValue, 0);
                if (totalDiscount > 0) {
                    const discountAmount = currentPrice * (totalDiscount / 100);
                    currentPrice = currentPrice - discountAmount;
                    breakdown.push(`- Chiết khấu Tổng KM (${totalDiscount}%): -${formatNumber(discountAmount)} ₫ → ${formatNumber(currentPrice)} ₫`);
                }
            }

            // Apply commission last
            if (commission > 0) {
                const commAmount = currentPrice * commissionRate;
                const netReceive = currentPrice - commAmount;
                breakdown.push(`- Trừ Hoa hồng (${commission}%): -${formatNumber(commAmount)} ₫ → ${formatNumber(netReceive)} ₫`);
                currentPrice = netReceive;
            }
            result = currentPrice;
        }

        return { result, breakdown };
    }, [inputPriceStr, calcMode, promotions, commission, calcType]);

    // Handle price input with formatting
    const handlePriceInput = (value: string) => {
        const num = parseFormattedNumber(value);
        if (num >= 0) {
            setInputPriceStr(formatNumber(num));
        }
    };

    // Auto-fill from selected room
    const handleRoomSelect = (roomId: string) => {
        setSelectedRoomId(roomId);
        const room = roomTypes.find(r => r.id === roomId);
        if (room) {
            setInputPriceStr(formatNumber(room.basePrice));
            setCalcMode('net-to-display');
        }
    };

    return (
        <div className="space-y-6">
            {/* Row 1: Commission + Promotions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Commission Settings */}
                <div className="bg-slate-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Cài đặt Hoa hồng</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Tỷ lệ hoa hồng (%)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={commission}
                                    onChange={(e) => onCommissionChange(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                    className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
                                />
                                <span className="text-slate-400">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Loại tính toán</label>
                            <select
                                value={calcType}
                                onChange={(e) => onCalcTypeChange(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="PROGRESSIVE">PROGRESSIVE (Lũy tiến)</option>
                                <option value="ADDITIVE">ADDITIVE (Cộng dồn)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-slate-400">
                            <strong className="text-slate-300">PROGRESSIVE:</strong> KM tính lần lượt trên giá đã giảm.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            <strong className="text-slate-300">ADDITIVE:</strong> Cộng dồn % rồi tính một lần.
                        </p>
                    </div>
                </div>

                {/* Right: Promotions */}
                <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Khuyến mãi đang áp dụng</h3>
                        <button
                            onClick={() => setIsAddingPromo(true)}
                            className="text-sm px-3 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: brandColor, color: 'white' }}
                        >
                            + Thêm
                        </button>
                    </div>

                    {/* Add Promotion Form */}
                    {isAddingPromo && (
                        <div className="mb-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
                            <input
                                type="text"
                                value={newPromoName}
                                onChange={(e) => setNewPromoName(e.target.value)}
                                placeholder="Tên khuyến mãi (VD: Early Bird)"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={newPromoDiscount}
                                    onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                                    className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                                />
                                <span className="text-slate-400 self-center">%</span>
                                <button onClick={handleAddPromo} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                                    Lưu
                                </button>
                                <button onClick={() => setIsAddingPromo(false)} className="px-4 py-2 bg-slate-600 text-white rounded">
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Promotions List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {promotions.map((promo) => (
                            <div
                                key={promo.id}
                                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                            >
                                <div>
                                    <span className="text-white font-medium">{promo.name}</span>
                                    <span className="ml-2 text-slate-400">{promo.discountValue}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onPromotionToggle(promo.id, !promo.isActive)}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${promo.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${promo.isActive ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                    <button onClick={() => onDeletePromotion(promo.id)} className="p-1 text-red-400 hover:text-red-300">🗑</button>
                                </div>
                            </div>
                        ))}
                        {promotions.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-sm">
                                Chưa có khuyến mãi nào.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Price Calculator Preview */}
            <div className="bg-slate-800/50 rounded-lg p-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4" style={{ color: brandColor }}>
                    🧮 Kiểm tra Công thức Tính giá - {otaName}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Chọn hạng phòng (tùy chọn)</label>
                            <select
                                value={selectedRoomId}
                                onChange={(e) => handleRoomSelect(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="">-- Nhập thủ công --</option>
                                {roomTypes.map(room => (
                                    <option key={room.id} value={room.id}>{room.name} ({formatNumber(room.basePrice)} ₫)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Hướng tính</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCalcMode('net-to-display')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${calcMode === 'net-to-display' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                                >
                                    Giá nhận về → Hiển thị
                                </button>
                                <button
                                    onClick={() => setCalcMode('display-to-net')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${calcMode === 'display-to-net' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                                >
                                    Giá hiển thị → Nhận về
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">
                                {calcMode === 'net-to-display' ? 'Nhập Số tiền thực nhận (VND)' : 'Nhập Giá hiển thị OTA (VND)'}
                            </label>
                            <input
                                type="text"
                                value={inputPriceStr}
                                onChange={(e) => handlePriceInput(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-right font-mono text-lg font-bold"
                            />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h4 className="text-sm font-medium text-slate-400 mb-3 underline">Chi tiết diễn giải:</h4>
                        <div className="space-y-2 text-sm font-mono">
                            {calculatedResult.breakdown.map((line, i) => (
                                <div key={i} className={`text-slate-300 ${line.includes('→') ? 'border-b border-slate-800 pb-1' : ''}`}>
                                    {line.startsWith('+') ? <span className="text-emerald-400 mr-2">▲</span> : line.startsWith('-') ? <span className="text-red-400 mr-2">▼</span> : null}
                                    {line.replace(/^[+-]\s/, '')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Result */}
                    <div className="flex flex-col justify-center items-center bg-slate-900/50 rounded-lg p-6 border-2" style={{ borderColor: brandColor + '33' }}>
                        <div className="text-sm text-slate-400 mb-2 font-medium">
                            {calcMode === 'net-to-display' ? 'Cần bán trên OTA giá:' : 'Tiền bạn nhận về túi:'}
                        </div>
                        <div className="text-3xl font-black font-mono" style={{ color: brandColor }}>
                            {formatNumber(calculatedResult.result)} ₫
                        </div>
                        <div className="mt-4 text-xs text-slate-500 text-center leading-relaxed">
                            {calcMode === 'net-to-display'
                                ? '💡 Giá đã cộng bù các khoản khuyến mãi và hoa hồng để đảm bảo số tiền nhận về.'
                                : '💡 Số tiền còn lại sau khi trừ sạch các khoản hoa hồng và chiết khấu nội bộ.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
