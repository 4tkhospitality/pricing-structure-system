"use client";

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { PromotionTemplate, PromotionGroup, TargetSubCategory } from '@/types/agoda';
import { AGODA_PROMOTION_CATALOG } from '@/lib/promotions/agodaCatalog';

interface PromotionPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: PromotionTemplate, customPercent: number) => void;
}

export default function PromotionPickerModal({ isOpen, onClose, onSelect }: PromotionPickerModalProps) {
    const [activeTab, setActiveTab] = useState<PromotionGroup>(PromotionGroup.SEASONAL);
    const [searchQuery, setSearchQuery] = useState('');
    const [customPercent, setCustomPercent] = useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = useState<PromotionTemplate | null>(null);

    if (!isOpen) return null;

    const filteredCatalog = AGODA_PROMOTION_CATALOG.filter(item => {
        const matchesTab = item.group === activeTab;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleAdd = (template: PromotionTemplate) => {
        if (template.defaultPercent !== null) {
            onSelect(template, template.defaultPercent);
            onClose();
        } else {
            setSelectedTemplate(template);
        }
    };

    const confirmAdd = () => {
        if (selectedTemplate && customPercent) {
            onSelect(selectedTemplate, parseFloat(customPercent));
            setSelectedTemplate(null);
            setCustomPercent('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-orange-500" />
                        Thêm Khuyến mãi Agoda
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                {!selectedTemplate ? (
                    <>
                        {/* Tabs & Search */}
                        <div className="p-4 bg-slate-900/50 space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                                {[
                                    { id: PromotionGroup.SEASONAL, label: 'Seasonal' },
                                    { id: PromotionGroup.ESSENTIAL, label: 'Essential' },
                                    { id: PromotionGroup.TARGETED, label: 'Targeted' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as PromotionGroup)}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-orange-600 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm chương trình..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>
                        </div>

                        {/* Catalog List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg p-3 flex justify-between items-center transition-all"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">{item.name}</span>
                                                {item.subCategory && (
                                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                                                        {item.subCategory}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(item)}
                                            className="bg-slate-700 group-hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Thêm
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Không tìm thấy khuyến mãi nào phù hợp.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Step 2: Input % for null defaultPercent */
                    <div className="p-8 space-y-6 text-center">
                        <div className="inline-flex p-3 bg-orange-500/10 rounded-full text-orange-500 mb-2">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                            <p className="text-slate-400 text-sm mt-1">Vui lòng nhập tỷ lệ giảm giá cho chương trình này.</p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="relative">
                                <input
                                    type="number"
                                    autoFocus
                                    placeholder="0"
                                    value={customPercent}
                                    onChange={(e) => setCustomPercent(e.target.value)}
                                    className="w-32 bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-2xl font-bold text-center text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                                <span className="absolute right-[-24px] top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">%</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-700 transition-all"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={confirmAdd}
                                disabled={!customPercent}
                                className="flex-1 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Xác nhận thêm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
