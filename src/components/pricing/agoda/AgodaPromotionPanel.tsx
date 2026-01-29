"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Info, Tag } from 'lucide-react';
import { PromotionInstance, PromotionGroup } from '@/types/agoda';
import PromotionRow from './PromotionRow';

interface AgodaPromotionPanelProps {
    promotions: PromotionInstance[];
    onToggle: (id: string, enabled: boolean) => void;
    onPercentChange: (id: string, percent: number) => void;
    onDelete: (id: string) => void;
}

export default function AgodaPromotionPanel({
    promotions,
    onToggle,
    onPercentChange,
    onDelete
}: AgodaPromotionPanelProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        SEASONAL: true,
        ESSENTIAL: true,
        TARGETED: true
    });

    const toggleSection = (group: string) => {
        setExpanded(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const seasonal = promotions.filter(p => p.group === PromotionGroup.SEASONAL);
    const essential = promotions.filter(p => p.group === PromotionGroup.ESSENTIAL);
    const targeted = promotions.filter(p => p.group === PromotionGroup.TARGETED);

    const renderSection = (title: string, group: PromotionGroup, list: PromotionInstance[], dotColor: string) => {
        const isExpanded = expanded[group];
        const activeCount = list.filter(p => p.isEnabled).length;

        return (
            <div className="border-b border-slate-700/50 last:border-0">
                <button
                    onClick={() => toggleSection(group)}
                    className="w-full flex items-center justify-between px-2 py-3 hover:bg-slate-800/50 transition-colors rounded-lg group"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            : <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />}

                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {title}
                            </span>
                        </div>

                        {activeCount > 0 && (
                            <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-600">
                                {activeCount} Active
                            </span>
                        )}
                    </div>

                    <div className="text-[10px] text-slate-600 font-mono">
                        {list.length} ITEMS
                    </div>
                </button>

                {isExpanded && (
                    <div className="pl-4 pr-1 pb-4 space-y-2">
                        {list.length > 0 ? (
                            list.map(p => (
                                <PromotionRow
                                    key={p.instanceId}
                                    promotion={p}
                                    onToggle={onToggle}
                                    onPercentChange={onPercentChange}
                                    onDelete={onDelete}
                                />
                            ))
                        ) : (
                            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/20 group hover:border-slate-700 transition-colors">
                                <Tag className="w-8 h-8 text-slate-700 mb-2 group-hover:text-slate-600" />
                                <span className="text-xs text-slate-500 font-medium">Chưa có khuyến mãi</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-1">
            {renderSection(
                "Seasonal (Theo mùa)",
                PromotionGroup.SEASONAL,
                seasonal,
                "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]"
            )}

            {renderSection(
                "Essential (Cơ bản)",
                PromotionGroup.ESSENTIAL,
                essential,
                "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            )}

            {renderSection(
                "Targeted (Mục tiêu)",
                PromotionGroup.TARGETED,
                targeted,
                "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            )}

            {/* Special Warning if Additive > 80 */}
            {promotions.filter(p => p.isEnabled).reduce((sum, p) => sum + p.percent, 0) > 80 && (
                <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex gap-3 items-center text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Tổng giảm giá vượt quá 80%. Vui lòng kiểm tra lại.</span>
                </div>
            )}
        </div>
    );
}
