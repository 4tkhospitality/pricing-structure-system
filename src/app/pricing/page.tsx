'use client';

import React, { useState, useEffect } from 'react';
import { calculateNetToBar, calculateBarToNet, getPricingBreakdown, TaxConfig, Campaign } from '@/lib/calc-engine';

const INITIAL_OTA_CHANNELS = [
    { id: 'agoda', name: 'Agoda', calcType: 'ADDITIVE', defaultComm: 17 },
    { id: 'booking', name: 'Booking.com', calcType: 'PROGRESSIVE', defaultComm: 15 },
    { id: 'traveloka', name: 'Traveloka', calcType: 'PROGRESSIVE', defaultComm: 15 },
    { id: 'expedia', name: 'Expedia', calcType: 'PROGRESSIVE', defaultComm: 18 },
    { id: 'ctrip', name: 'Ctrip', calcType: 'PROGRESSIVE', defaultComm: 15 },
];

const DEFAULT_TAX: TaxConfig = {
    vatPercent: 10,
    serviceChargePercent: 5
};

export default function PricingPage() {
    const [calculationGoal, setCalculationGoal] = useState<'NET' | 'BAR'>('BAR');
    const [roomTypes, setRoomTypes] = useState([
        { id: '1', name: 'Standard Room', value: 1000000 }
    ]);

    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: 'c1', name: 'Early Bird', discountValue: 15, calcType: 'PROGRESSIVE', applyOrder: 1 },
        { id: 'c2', name: 'Mobile Rate', discountValue: 10, calcType: 'PROGRESSIVE', applyOrder: 2 }
    ]);

    const [otaChannels, setOtaChannels] = useState(INITIAL_OTA_CHANNELS);
    const [taxConfig, setTaxConfig] = useState(DEFAULT_TAX);

    const addRoomType = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setRoomTypes([...roomTypes, { id: newId, name: `New Room Type`, value: 1000000 }]);
    };

    const removeRoomType = (id: string) => {
        if (roomTypes.length <= 1) return;
        setRoomTypes(roomTypes.filter(r => r.id !== id));
    };

    const addCampaign = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setCampaigns([...campaigns, {
            id: newId,
            name: 'New Promotion',
            discountValue: 10,
            calcType: 'PROGRESSIVE',
            applyOrder: campaigns.length + 1
        }]);
    };

    const removeCampaign = (id: string) => {
        setCampaigns(campaigns.filter(c => c.id !== id));
    };

    const updateOtaComm = (id: string, newComm: number) => {
        setOtaChannels(otaChannels.map(ota => ota.id === id ? { ...ota, defaultComm: newComm } : ota));
    };

    const moveCampaign = (index: number, direction: 'up' | 'down') => {
        const next = [...campaigns];
        const newPos = direction === 'up' ? index - 1 : index + 1;
        if (newPos < 0 || newPos >= next.length) return;

        // Swap applyOrder and positions
        const tempOrder = next[index].applyOrder;
        next[index].applyOrder = next[newPos].applyOrder;
        next[newPos].applyOrder = tempOrder;

        setCampaigns(next.sort((a, b) => a.applyOrder - b.applyOrder));
    };

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8 pb-20">
            {/* Header & Global Settings */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-gray-600 bg-clip-text text-transparent italic tracking-tighter">
                        Rate Workspace
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Rule Engine & Editable OTA Commissions</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center bg-gray-900/50 p-2 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    {/* Goal Selector */}
                    <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
                        <button
                            onClick={() => setCalculationGoal('NET')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${calculationGoal === 'NET' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Goal: Net Recv
                        </button>
                        <button
                            onClick={() => setCalculationGoal('BAR')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${calculationGoal === 'BAR' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Goal: Display BAR
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-gray-800 mx-2" />

                    {/* Tax Settings */}
                    <div className="flex gap-4 px-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">VAT %</span>
                            <input
                                type="number"
                                value={taxConfig.vatPercent}
                                onChange={(e) => setTaxConfig({ ...taxConfig, vatPercent: Number(e.target.value) })}
                                className="w-10 bg-transparent text-sm font-mono font-bold text-blue-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">SVC %</span>
                            <input
                                type="number"
                                value={taxConfig.serviceChargePercent}
                                onChange={(e) => setTaxConfig({ ...taxConfig, serviceChargePercent: Number(e.target.value) })}
                                className="w-10 bg-transparent text-sm font-mono font-bold text-emerald-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Inputs */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* 01. Room Management */}
                    <section className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border font-black ${calculationGoal === 'BAR' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    01
                                </span>
                                Target {calculationGoal === 'BAR' ? 'Display BAR' : 'Net Revenue'}
                            </h2>
                            <button
                                onClick={addRoomType}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-400 p-2 rounded-xl border border-gray-700 transition-all text-xs font-bold"
                            >
                                + Add Room
                            </button>
                        </div>

                        <div className="space-y-4">
                            {roomTypes.map((room, idx) => (
                                <div key={room.id} className="relative bg-gray-950/40 p-5 rounded-2xl border border-gray-800/40 hover:border-blue-500/20 transition-all group">
                                    <button
                                        onClick={() => removeRoomType(room.id)}
                                        className="absolute top-2 right-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        × Remove
                                    </button>
                                    <input
                                        type="text"
                                        value={room.name}
                                        onChange={(e) => {
                                            const next = [...roomTypes];
                                            next[idx].name = e.target.value;
                                            setRoomTypes(next);
                                        }}
                                        className="bg-transparent text-sm font-black border-none outline-none text-gray-400 w-full tracking-tight mb-2 hover:text-white transition-colors"
                                    />
                                    <div className="flex items-center gap-3 bg-gray-900 px-4 py-3 rounded-xl border border-gray-800/50 shadow-inner">
                                        <input
                                            type="number"
                                            value={room.value}
                                            onChange={(e) => {
                                                const next = [...roomTypes];
                                                next[idx].value = Number(e.target.value);
                                                setRoomTypes(next);
                                            }}
                                            className={`bg-transparent text-left font-mono font-black text-2xl outline-none w-full ${calculationGoal === 'BAR' ? 'text-blue-400' : 'text-emerald-400'}`}
                                        />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">VND</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 02. Campaign Management */}
                    <section className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
                                <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm border border-orange-500/20 font-black">
                                    02
                                </span>
                                Stacking Rule Engine
                            </h2>
                            <button
                                onClick={addCampaign}
                                className="bg-gray-800 hover:bg-gray-700 text-orange-400/80 p-2 rounded-xl border border-gray-700 transition-all text-xs font-bold"
                            >
                                + Add Promo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {campaigns.map((camp, idx) => (
                                <div key={camp.id} className="group relative flex items-center gap-3 bg-gray-950/60 border border-gray-800/60 p-4 rounded-2xl hover:bg-gray-900/60 transition-all">
                                    <div className="flex flex-col text-[8px] text-gray-700">
                                        <button onClick={() => moveCampaign(idx, 'up')} className="hover:text-blue-400 transition-all">▲</button>
                                        <button onClick={() => moveCampaign(idx, 'down')} className="hover:text-blue-400 transition-all">▼</button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={camp.name}
                                            onChange={(e) => {
                                                const next = [...campaigns];
                                                next[idx].name = e.target.value;
                                                setCampaigns(next);
                                            }}
                                            className="bg-transparent font-bold text-sm outline-none border-none w-full text-gray-300 hover:text-white transition-colors"
                                        />
                                        <div className="flex gap-2 mt-1">
                                            <select
                                                value={camp.calcType}
                                                onChange={(e) => {
                                                    const next = [...campaigns];
                                                    next[idx].calcType = e.target.value as any;
                                                    setCampaigns(next);
                                                }}
                                                className="bg-transparent text-[8px] font-black uppercase tracking-widest text-gray-600 outline-none cursor-pointer hover:text-gray-400"
                                            >
                                                <option value="PROGRESSIVE">Progressive</option>
                                                <option value="ADDITIVE">Additive</option>
                                            </select>
                                            <button
                                                onClick={() => removeCampaign(camp.id!)}
                                                className="text-[8px] text-red-900/50 hover:text-red-500 font-bold uppercase transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 bg-gray-900 px-3 py-2 rounded-xl border border-gray-800 ring-1 ring-white/5 shadow-inner">
                                        <input
                                            type="number"
                                            value={camp.discountValue}
                                            onChange={(e) => {
                                                const next = [...campaigns];
                                                next[idx].discountValue = Number(e.target.value);
                                                setCampaigns(next);
                                            }}
                                            className="w-10 bg-transparent text-center text-sm font-black border-none outline-none text-blue-400"
                                        />
                                        <span className="text-[10px] text-gray-600 font-bold">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 03. OTA Commissions Settings */}
                    <section className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 backdrop-blur-md">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm border border-purple-500/20 font-black">
                                03
                            </span>
                            OTA Commissions
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {otaChannels.map(ota => (
                                <div key={ota.id} className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60 flex flex-col gap-1 hover:border-purple-500/20 transition-all">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">{ota.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={ota.defaultComm}
                                            onChange={(e) => updateOtaComm(ota.id, Number(e.target.value))}
                                            className="w-full bg-transparent text-lg font-mono font-black text-purple-400/80 outline-none"
                                        />
                                        <span className="text-xs text-gray-700 font-bold">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Results Grid */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {otaChannels.map((ota) => {
                            const otaSpecificCampaigns = campaigns.map(c => ({
                                ...c,
                                calcType: ota.calcType as any
                            }));

                            const results = roomTypes.map(room => {
                                if (calculationGoal === 'NET') {
                                    const bar = calculateNetToBar(room.value, otaSpecificCampaigns, taxConfig);
                                    // We also need to adjust for commission in Net calculation if goal is Net recipient
                                    // DisplayBAR = Net / (1 - Comm) before discounts? 
                                    // Usually, OTA calculation: NetRecieve = DisplayPrice * (1 - Comm) * (1 - Discount)
                                    // Let's refine calculation to include Commission factor
                                    const commFactor = 1 - (ota.defaultComm / 100);
                                    const barWithComm = bar / commFactor;
                                    const breakdown = getPricingBreakdown(barWithComm, otaSpecificCampaigns, taxConfig);
                                    return {
                                        roomName: room.name,
                                        displayPrice: barWithComm,
                                        netRevenue: breakdown.netRevenue * commFactor,
                                        trace: breakdown.trace
                                    };
                                } else {
                                    // If Goal is BAR, we want uniform BAR across channels
                                    const breakdown = getPricingBreakdown(room.value, otaSpecificCampaigns, taxConfig);
                                    const commFactor = 1 - (ota.defaultComm / 100);
                                    return {
                                        roomName: room.name,
                                        displayPrice: room.value,
                                        netRevenue: breakdown.netRevenue * commFactor,
                                        trace: breakdown.trace
                                    };
                                }
                            });

                            return (
                                <div key={ota.id} className="relative group bg-gray-900/30 border border-gray-800/80 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 hover:bg-gray-900/40 transition-all duration-500 shadow-2xl">
                                    {/* Card Header */}
                                    <div className="px-8 py-5 flex justify-between items-center bg-gray-800/20 border-b border-gray-800/50">
                                        <span className="text-xl font-black italic tracking-tighter text-white group-hover:text-blue-400 transition-colors uppercase">{ota.name}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">{ota.calcType} Logic</span>
                                            <span className="text-[10px] font-mono font-black text-purple-400/60 leading-none">COMM: {ota.defaultComm}%</span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 space-y-10">
                                        {results.map((res, i) => (
                                            <div key={i} className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{res.roomName}</span>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-mono font-black leading-none ${calculationGoal === 'NET' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                            {Math.round(res.displayPrice).toLocaleString()}
                                                        </div>
                                                        <div className="text-[10px] text-gray-700 font-black uppercase mt-1 tracking-tighter">Display BAR</div>
                                                    </div>
                                                </div>

                                                {/* Revenue Box */}
                                                <div className="bg-gray-950/80 rounded-3xl p-5 border border-white/5 group-hover:bg-black/80 transition-all shadow-inner">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest">Final Net</span>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-mono font-black text-emerald-500">{Math.round(res.netRevenue).toLocaleString()}</span>
                                                            <span className="text-[8px] font-bold text-gray-700 uppercase tracking-tighter">VND / Room Night</span>
                                                        </div>
                                                    </div>

                                                    {/* Stacking Breakdown */}
                                                    <div className="space-y-1.5 pt-4 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        {res.trace.map((step, sIdx) => (
                                                            <div key={sIdx} className="flex justify-between text-[9px] font-medium font-mono text-gray-400">
                                                                <span className="truncate">{step.stageName} ({campaigns[sIdx]?.discountValue}%)</span>
                                                                <span className="text-red-900/60">-{Math.round(step.discountAmount).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-between text-[9px] font-medium font-mono text-gray-400 pt-1">
                                                            <span>Commission ({ota.defaultComm}%)</span>
                                                            <span className="text-red-900/60">-{Math.round(res.displayPrice * (ota.defaultComm / 100)).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <footer className="fixed bottom-0 left-0 right-0 p-8 bg-gray-950/90 backdrop-blur-3xl border-t border-gray-800/50 flex justify-between items-center z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        Rule Simulation Active
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="bg-gray-900 hover:bg-gray-800 text-gray-400 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-800 transition-all active:scale-95">
                        Clear All Inputs
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                        Sync to All Channels
                    </button>
                </div>
            </footer>
        </div>
    );
}
