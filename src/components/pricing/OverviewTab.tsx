"use client";

import React, { useState, useMemo } from 'react';

interface Promo {
    id: string;
    name: string;
    discountValue: number;
    isActive: boolean;
}

interface OTAChannel {
    id: string;
    name: string;
    calcType: string;
    defaultComm: number;
    promotions: Promo[];
}

interface RoomType {
    id: string;
    name: string;
    basePrice: number;
}

interface OverviewTabProps {
    roomTypes: RoomType[];
    selectedRoomIds: string[];
    onSelectionChange: (ids: string[]) => void;
    otaChannels: OTAChannel[];
}

// Format number with thousand separators
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
};

// Parse formatted string back to number
const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/\D/g, '')) || 0;
};

export default function OverviewTab({
    roomTypes,
    selectedRoomIds,
    onSelectionChange,
    otaChannels
}: OverviewTabProps) {
    // Bulk Calculator State
    const [bulkMode, setBulkMode] = useState<'net-to-display' | 'display-to-net'>('net-to-display');
    const [bulkPriceStr, setBulkPriceStr] = useState('1.000.000');

    const selectedRooms = roomTypes.filter(r => selectedRoomIds.includes(r.id));

    // Core Calculation Logic (shared with OTAConfigTab)
    const calculateStats = (inputPrice: number, ota: OTAChannel, mode: 'net-to-display' | 'display-to-net') => {
        const commissionRate = ota.defaultComm / 100;
        const activePromos = ota.promotions.filter(p => p.isActive);
        let result = 0;

        if (mode === 'net-to-display') {
            // NET (Nhận về) → DISPLAY (Giá bán)
            // Display = Net / (1 - Comm) / (1 - Disc1) / (1 - Disc2) ...
            let currentPrice = inputPrice;

            // Markup commission
            if (ota.defaultComm > 0) {
                currentPrice = currentPrice / (1 - commissionRate);
            }

            // Markup promotions
            if (ota.calcType === 'PROGRESSIVE') {
                activePromos.forEach(promo => {
                    currentPrice = currentPrice / (1 - (promo.discountValue / 100));
                });
            } else {
                const totalDiscount = activePromos.reduce((sum, p) => sum + p.discountValue, 0);
                if (totalDiscount > 0 && totalDiscount < 100) {
                    currentPrice = currentPrice / (1 - (totalDiscount / 100));
                }
            }
            result = currentPrice;
        } else {
            // DISPLAY (Giá bán) → NET (Nhận về)
            // Net = Display * (1 - Disc1) * (1 - Disc2) ... * (1 - Comm)
            let currentPrice = inputPrice;

            // Apply promotions first
            if (ota.calcType === 'PROGRESSIVE') {
                activePromos.forEach(promo => {
                    currentPrice = currentPrice * (1 - (promo.discountValue / 100));
                });
            } else {
                const totalDiscount = activePromos.reduce((sum, p) => sum + p.discountValue, 0);
                if (totalDiscount > 0) {
                    currentPrice = currentPrice * (1 - (totalDiscount / 100));
                }
            }

            // Apply commission last
            if (ota.defaultComm > 0) {
                currentPrice = currentPrice * (1 - commissionRate);
            }
            result = currentPrice;
        }

        return Math.round(result);
    };

    // Matrix 1: Target Net (from RoomTypes) -> See Selling Prices
    const sellPriceMatrix = useMemo(() => {
        return selectedRooms.map(room => {
            const otaResults = otaChannels.map(ota => ({
                otaId: ota.id,
                value: calculateStats(room.basePrice, ota, 'net-to-display')
            }));
            return { roomId: room.id, roomName: room.name, targetNet: room.basePrice, otaResults };
        });
    }, [selectedRooms, otaChannels]);

    // Matrix 2: Bulk Selling Price -> See Net Revenues
    const bulkNetMatrix = useMemo(() => {
        const inputPrice = parseFormattedNumber(bulkPriceStr);
        if (inputPrice <= 0) return [];

        return otaChannels.map(ota => ({
            otaId: ota.id,
            otaName: ota.name,
            netRevenue: calculateStats(inputPrice, ota, 'display-to-net')
        }));
    }, [bulkPriceStr, otaChannels]);

    // UI Helpers
    const toggleRoom = (roomId: string) => {
        if (selectedRoomIds.includes(roomId)) {
            onSelectionChange(selectedRoomIds.filter(id => id !== roomId));
        } else {
            onSelectionChange([...selectedRoomIds, roomId]);
        }
    };

    const handleBulkPriceInput = (value: string) => {
        const num = parseFormattedNumber(value);
        if (num >= 0) setBulkPriceStr(formatNumber(num));
    };

    return (
        <div className="space-y-10 pb-20">
            {/* --- SECTION 1: UNIFIED BULK CALCULATOR --- */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header Row: Title + Inputs */}
                <div className="bg-slate-800 px-8 py-6 border-b border-slate-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <span className="p-1.5 bg-indigo-500 rounded text-lg">🌍</span>
                                Công cụ Tính giá Đồng bộ
                            </h2>
                            <p className="text-slate-500 text-xs mt-1">So sánh hiệu quả thu về hoặc giá bán trên tất cả các kênh.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-72">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Chế độ tính toán</label>
                                <select
                                    value={bulkMode}
                                    onChange={(e) => setBulkMode(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                                >
                                    <option value="net-to-display">🏨 Muốn thu về (NET) → Giá Bán</option>
                                    <option value="display-to-net">🌐 Giá Bán OTA → Thu về (NET)</option>
                                </select>
                            </div>
                            <div className="w-full md:w-72">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    {bulkMode === 'net-to-display' ? 'Số tiền thực nhận (VND)' : 'Giá hiển thị trên OTA (VND)'}
                                </label>
                                <input
                                    type="text"
                                    value={bulkPriceStr}
                                    onChange={(e) => handleBulkPriceInput(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-indigo-500/50 rounded-lg px-4 py-1.5 text-white text-right font-mono text-xl font-black focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Row: Horizontal Cards */}
                <div className="px-8 py-8 bg-slate-900/30">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {bulkNetMatrix.map(item => (
                            <div key={item.otaId} className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 text-center transition-all hover:border-indigo-500">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
                                    {item.otaName}
                                </div>
                                <div className="text-xl font-black text-white font-mono">
                                    {bulkMode === 'display-to-net' ? formatNumber(item.netRevenue) : formatNumber(calculateStats(parseFormattedNumber(bulkPriceStr), otaChannels.find(o => o.id === item.otaId)!, 'net-to-display'))}
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                    {bulkMode === 'display-to-net' ? 'Thực thu' : 'Giá cài đặt'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: COMPARISON TABLES --- */}
            <div className="space-y-8">
                {/* Room Selection Tabs */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chọn Hạng Phòng để so sánh chi tiết:</label>
                        <button
                            onClick={() => onSelectionChange(roomTypes.map(r => r.id))}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Chọn tất cả
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {roomTypes.map(room => (
                            <button
                                key={room.id}
                                onClick={() => toggleRoom(room.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedRoomIds.includes(room.id)
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                    : 'bg-slate-700/50 border-transparent text-slate-500 hover:border-slate-500'}`}
                            >
                                {room.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedRooms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10">
                        {/* Table 1: Display Prices (Giá bán) */}
                        <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Bảng 1: So sánh Giá Hiển thị (Best Available Rate)
                                </h3>
                                <div className="text-xs text-slate-400">Dựa trên <strong>Giá thực nhận (Net)</strong> của khách sạn</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-800/80 text-slate-500 text-xs uppercase tracking-widest">
                                            <th className="px-6 py-4">Hạng Phòng / Target NET</th>
                                            {otaChannels.map(ota => (
                                                <th key={ota.id} className="px-6 py-4 text-center">{ota.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {sellPriceMatrix.map(row => (
                                            <tr key={row.roomId} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-bold">{row.roomName}</div>
                                                    <div className="text-xs font-mono text-emerald-500">Net: {formatNumber(row.targetNet)} ₫</div>
                                                </td>
                                                {row.otaResults.map(p => (
                                                    <td key={p.otaId} className="px-6 py-4 text-center">
                                                        <div className="text-lg font-bold text-white font-mono">{formatNumber(p.value)} ₫</div>
                                                        <div className="text-[10px] text-slate-500 mt-1">Cài trên CM</div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Table 2: Net Revenues (Giá thu về) */}
                        <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Bảng 2: So sánh Giá Thu về (Net Revenue)
                                </h3>
                                <div className="text-xs text-slate-400">Dựa trên <strong>Giá bán chung</strong> (VD: 1.200.000)</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-800/80 text-slate-500 text-xs uppercase tracking-widest">
                                            <th className="px-6 py-4">Giá bán giả định (Display)</th>
                                            {otaChannels.map(ota => (
                                                <th key={ota.id} className="px-6 py-4 text-center">{ota.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-slate-700/20">
                                            <td className="px-6 py-8">
                                                <div className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">
                                                    {bulkPriceStr} ₫
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 uppercase font-bold">Bán đồng đều các kênh</div>
                                            </td>
                                            {bulkNetMatrix.map(item => (
                                                <td key={item.otaId} className="px-6 py-8 text-center border-l border-slate-700/30">
                                                    <div className="text-xl font-bold text-white font-mono">{formatNumber(item.netRevenue)} ₫</div>
                                                    <div className="mt-2">
                                                        {item.netRevenue < parseFormattedNumber(bulkPriceStr) * 0.5 ? (
                                                            <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 uppercase font-bold">Lỗ nặng KM</span>
                                                        ) : (
                                                            <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 uppercase font-bold">Thực thu</span>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 rounded-2xl p-16 text-center border border-slate-700 border-dashed">
                        <div className="text-4xl mb-4 grayscale opacity-50">📊</div>
                        <h3 className="text-slate-400 font-medium">Chọn hạng phòng để kích hoạt bảng so sánh chi tiết</h3>
                        <p className="text-slate-600 text-sm mt-1">Dữ liệu sẽ được tự động tính toán từ cấu hình KM của từng OTA</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-slate-400 text-sm italic leading-relaxed">
                * Lưu ý: Các con số được làm tròn đến hàng đơn vị. Công thức tính bù trừ được áp dụng nghịch đảo để đảm bảo tính chính xác của giá nhận về.
            </div>
        </div>
    );
}
