"use client";

import React from 'react';
import { CalculationTraceStep, CalculationMode } from '@/types/agoda';
import { Info, ArrowRight, TrendingDown } from 'lucide-react';

interface AgodaTracePanelProps {
    trace: CalculationTraceStep[];
    startPrice: number;
    finalPrice: number;
    mode: CalculationMode;
    startLabel: string;
    endLabel: string;
}

export default function AgodaTracePanel({
    trace,
    startPrice,
    finalPrice,
    mode,
    startLabel,
    endLabel
}: AgodaTracePanelProps) {
    const formatVND = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    Cách diễn giải tính toán từng bước
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${mode === CalculationMode.PROGRESSIVE
                    ? 'bg-blue-900/20 text-blue-400 border-blue-900/50'
                    : 'bg-purple-900/20 text-purple-400 border-purple-900/50'
                    }`}>
                    {mode === CalculationMode.PROGRESSIVE ? 'LŨY TIẾN (PROG)' : 'CỘNG DỒN (ADD)'}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            <th className="px-5 py-3 font-medium">Bước thực hiện</th>
                            <th className="px-5 py-3 text-center font-medium">% Giảm</th>
                            <th className="px-5 py-3 text-right font-medium">Giá sau bước</th>
                            <th className="px-5 py-3 text-right font-medium">So với gốc</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {/* Start Price */}
                        <tr className="bg-slate-800/20">
                            <td className="px-5 py-3 font-semibold text-slate-300">{startLabel}</td>
                            <td className="px-5 py-3 text-center text-slate-600">-</td>
                            <td className="px-5 py-3 text-right font-mono text-slate-300 font-bold">{formatVND(startPrice)}</td>
                            <td className="px-5 py-3 text-right text-slate-600">-</td>
                        </tr>

                        {/* Steps */}
                        {trace.map((step, idx) => (
                            <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-3 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700 group-hover:border-orange-500/30 group-hover:text-orange-500 transition-colors">
                                        {idx + 1}
                                    </div>
                                    <span className="text-slate-300 group-hover:text-white transition-colors text-xs font-medium">{step.stepName}</span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className="text-red-400 bg-red-900/10 px-1.5 py-0.5 rounded text-xs font-bold border border-red-900/20">
                                        -{step.percent}%
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-mono text-slate-300 text-xs">
                                    {formatVND(step.priceAfterStep)}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1 text-slate-500 text-xs">
                                        <TrendingDown className="w-3 h-3" />
                                        <span>{step.cumulativeDiscountVsBAR.toFixed(1)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Final Price */}
                        <tr className="bg-gradient-to-r from-orange-950/20 to-transparent">
                            <td className="px-5 py-4 font-bold text-orange-500 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                {endLabel}
                            </td>
                            <td className="px-5 py-4 text-center">
                                {/* Empty */}
                            </td>
                            <td className="px-5 py-4 text-right">
                                <div className="text-lg font-black text-orange-500 font-mono">
                                    {formatVND(finalPrice)}
                                </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                                <span className="text-[9px] text-orange-500/50 font-bold uppercase tracking-widest border border-orange-900/30 px-2 py-1 rounded">
                                    Hoàn tất
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
