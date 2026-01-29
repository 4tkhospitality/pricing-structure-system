"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    PromotionInstance,
    PromotionTemplate,
    CalculationMode,
    AgodaPricingSettings,
    PromotionGroup
} from '@/types/agoda';
import { calculateNetToBar, calculateBarToNet } from '@/lib/calculators/agodaEngine';
import AgodaPromotionPanel from './AgodaPromotionPanel';
import PromotionPickerModal from './PromotionPickerModal';
import AgodaTracePanel from './AgodaTracePanel';
import { Plus, Calculator, ArrowRightLeft, ShieldCheck, AlertCircle, ChevronDown } from 'lucide-react';

interface AgodaPricingTabProps {
    roomTypes: any[];
    initialSettings?: AgodaPricingSettings;
    onSettingsChange?: (settings: AgodaPricingSettings) => void;
}

export default function AgodaPricingTab({
    roomTypes,
    initialSettings,
    onSettingsChange
}: AgodaPricingTabProps) {
    // 1. State
    const [settings, setSettings] = useState<AgodaPricingSettings>(initialSettings || {
        commission: 20,
        calcMode: CalculationMode.ADDITIVE,
        promotions: []
    });

    const [selectedRoomId, setSelectedRoomId] = useState<string>(roomTypes[0]?.id || '');
    const [calcDirection, setCalcDirection] = useState<'NET_TO_BAR' | 'BAR_TO_NET'>('NET_TO_BAR');
    const [manualPrice, setManualPrice] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectedRoom = roomTypes.find(r => r.id === selectedRoomId);
    const basePrice = selectedRoom?.basePrice || 0;

    // 2. Calculations
    const result = useMemo(() => {
        if (calcDirection === 'NET_TO_BAR') {
            return calculateNetToBar(
                basePrice,
                settings.commission,
                settings.promotions,
                settings.calcMode
            );
        } else {
            return calculateBarToNet(
                manualPrice || basePrice * 1.5, // Default BAR if not entered
                settings.commission,
                settings.promotions,
                settings.calcMode
            );
        }
    }, [basePrice, manualPrice, settings, calcDirection]);

    // 3. Handlers
    const handleAddPromotion = (template: PromotionTemplate, percent: number) => {
        const newInstance: PromotionInstance = {
            ...template,
            instanceId: `agoda-${Date.now()}`,
            percent,
            isEnabled: true,
            applyOrder: settings.promotions.length
        };

        setSettings(prev => ({
            ...prev,
            promotions: [...prev.promotions, newInstance]
        }));
    };

    const updatePromotion = (id: string, updates: Partial<PromotionInstance>) => {
        setSettings(prev => ({
            ...prev,
            promotions: prev.promotions.map(p => p.instanceId === id ? { ...p, ...updates } : p)
        }));
    };

    const deletePromotion = (id: string) => {
        setSettings(prev => ({
            ...prev,
            promotions: prev.promotions.filter(p => p.instanceId !== id)
        }));
    };

    // Sync with parent
    useEffect(() => {
        if (onSettingsChange) onSettingsChange(settings);
    }, [settings, onSettingsChange]);

    const formatVND = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="space-y-8">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Promotion Configuration */}
                <div className="lg:col-span-5 space-y-6">
                    {/* 1. Channel Settings (Moved Top) */}
                    <section className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Cài đặt hoa hồng</h3>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                <span>ID: {settings.commission}%</span>
                                <span className="text-slate-700">|</span>
                                <span>{settings.calcMode === CalculationMode.ADDITIVE ? 'ADDIT' : 'PROGR'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-2 font-medium">Hoa hồng (%)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={settings.commission}
                                        onChange={(e) => setSettings(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                                        className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono text-sm group-hover:border-slate-600"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-2 font-medium">Cách tính</label>
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, calcMode: CalculationMode.PROGRESSIVE }))}
                                        className={`flex-1 h-8 rounded text-[10px] font-bold transition-all uppercase ${settings.calcMode === CalculationMode.PROGRESSIVE
                                            ? 'bg-orange-600 text-white shadow'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Lũy tiến
                                    </button>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, calcMode: CalculationMode.ADDITIVE }))}
                                        className={`flex-1 h-8 rounded text-[10px] font-bold transition-all uppercase ${settings.calcMode === CalculationMode.ADDITIVE
                                            ? 'bg-orange-600 text-white shadow'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Cộng dồn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Promotion Stack */}
                    <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-orange-500" />
                                Cộng dồn khuyến mãi
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-600"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm Khuyến Mãi
                            </button>
                        </div>

                        <div className="p-5">
                            <AgodaPromotionPanel
                                promotions={settings.promotions}
                                onToggle={(id, enabled) => updatePromotion(id, { isEnabled: enabled })}
                                onPercentChange={(id, p) => updatePromotion(id, { percent: p })}
                                onDelete={deletePromotion}
                            />
                        </div>
                    </section>
                </div>

                {/* RIGHT: Calculator */}
                <div className="lg:col-span-7 space-y-6">
                    <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                            <Calculator className="w-48 h-48" />
                        </div>

                        {/* Input / Output Display */}
                        <div className="relative z-10 space-y-8">

                            {/* Step 1: Room Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Bước 1: Chọn Hạng Phòng
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRoomId}
                                        onChange={(e) => setSelectedRoomId(e.target.value)}
                                        className="w-full h-14 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-4 text-lg font-semibold text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {roomTypes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} - {formatVND(r.basePrice)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Step 2: Calculation Mode & Input */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    {calcDirection === 'NET_TO_BAR' ? 'Bước 2: Nhập giá mong muốn (NET)' : 'Bước 2: Nhập giá niêm yết (BAR)'}
                                </label>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        {calcDirection === 'NET_TO_BAR' ? (
                                            <div className="h-14 bg-slate-900/50 border border-slate-700 rounded-xl px-4 flex items-center text-slate-400 italic">
                                                (Tự động tính từ giá gốc hạng phòng)
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={manualPrice ? manualPrice.toLocaleString('vi-VN') : ''}
                                                onChange={(e) => {
                                                    // Remove non-digit characters
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    setManualPrice(rawValue ? parseFloat(rawValue) : 0);
                                                }}
                                                className="w-full h-14 bg-slate-950 border border-slate-700 rounded-xl px-4 text-2xl font-bold text-white focus:border-orange-500 transition-all font-mono"
                                                placeholder="0"
                                            />
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setCalcDirection(prev => prev === 'NET_TO_BAR' ? 'BAR_TO_NET' : 'NET_TO_BAR')}
                                        className="px-6 h-14 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all border border-slate-600 active:scale-95 font-medium"
                                        title="Đổi chiều tính"
                                    >
                                        <ArrowRightLeft className="w-5 h-5" />
                                        {calcDirection === 'NET_TO_BAR' ? 'NET → BAR' : 'BAR → NET'}
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-slate-700 w-full" />

                            {/* Step 3: Result */}
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-orange-500 uppercase tracking-widest">
                                        {calcDirection === 'NET_TO_BAR' ? 'Kết quả: Giá cần bán (BAR)' : 'Kết quả: Thực lãnh (NET)'}
                                    </label>
                                    <p className="text-xs text-slate-400 max-w-[200px]">
                                        {calcDirection === 'NET_TO_BAR'
                                            ? 'Cài giá này lên Agoda để nhận về đúng số NET mong muốn.'
                                            : 'Số tiền thực tế bạn nhận được sau khi trừ mọi chi phí.'}
                                    </p>
                                </div>

                                <div className={`text-4xl md:text-5xl font-black font-mono tracking-tight ${result.isValid ? 'text-white' : 'text-red-500'
                                    }`}>
                                    {formatVND(result.finalPrice)}
                                </div>
                            </div>
                        </div>

                        {!result.isValid && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-400">{result.errors[0]}</p>
                            </div>
                        )}
                    </section>

                    <AgodaTracePanel
                        trace={result.trace}
                        startPrice={calcDirection === 'NET_TO_BAR' ? (basePrice / (1 - (settings.commission / 100))) : (manualPrice || basePrice * 1.5)}
                        finalPrice={result.finalPrice}
                        mode={settings.calcMode}
                        startLabel={calcDirection === 'NET_TO_BAR' ? 'Gross (Sau Commission)' : 'Market BAR'}
                        endLabel={calcDirection === 'NET_TO_BAR' ? 'Cần bán tại OTA' : 'NET Cuối cùng'}
                    />
                </div>
            </div>

            <PromotionPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleAddPromotion}
            />
        </div>
    );
}
