"use client";

import React, { useEffect, useState } from 'react';
import { PromotionInstance } from '@/types/agoda';
import { Trash2, GripVertical, AlertTriangle } from 'lucide-react';

interface PromotionRowProps {
    promotion: PromotionInstance;
    onToggle: (id: string, enabled: boolean) => void;
    onPercentChange: (id: string, percent: number) => void;
    onDelete: (id: string) => void;
}

export default function PromotionRow({
    promotion,
    onToggle,
    onPercentChange,
    onDelete
}: PromotionRowProps) {
    const [localPercent, setLocalPercent] = useState(promotion.percent);

    // Sync local state if prop changes remotely
    useEffect(() => {
        setLocalPercent(promotion.percent);
    }, [promotion.percent]);

    const handleBlur = () => {
        let val = localPercent;
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        onPercentChange(promotion.instanceId, val);
    };

    return (
        <div className={`
            group flex items-center justify-between p-2 rounded-lg border transition-all
            ${promotion.isEnabled
                ? 'bg-slate-800 border-slate-700 shadow-sm'
                : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100'}
        `}>
            {/* LEFT: Drag + Name */}
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${promotion.isEnabled ? 'text-white' : 'text-slate-400 line-through'}`}>
                            {promotion.name}
                        </p>
                        {/* Sub-category Pill */}
                        {promotion.subCategory && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 uppercase font-mono">
                                {promotion.subCategory}
                            </span>
                        )}
                        {/* Warning Icon for Conflict (Future) */}
                        {!promotion.isEnabled && (
                            <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Controls */}
            <div className="flex items-center gap-3">
                {/* Percent Input */}
                <div className="relative w-16">
                    <input
                        type="number"
                        value={localPercent}
                        onChange={(e) => setLocalPercent(parseFloat(e.target.value))}
                        onBlur={handleBlur}
                        disabled={!promotion.isEnabled}
                        className="w-full h-7 bg-slate-950 border border-slate-700 rounded text-right pr-4 pl-1 text-xs font-mono font-bold text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={() => onToggle(promotion.instanceId, !promotion.isEnabled)}
                    className={`
                        w-9 h-5 rounded-full relative transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-orange-500
                        ${promotion.isEnabled ? 'bg-orange-600' : 'bg-slate-700'}
                    `}
                >
                    <span className={`
                        absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
                        ${promotion.isEnabled ? 'left-4.5' : 'left-0.5'}
                    `} />
                </button>

                {/* Delete */}
                <button
                    onClick={() => onDelete(promotion.instanceId)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
