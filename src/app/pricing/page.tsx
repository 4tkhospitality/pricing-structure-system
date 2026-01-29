"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { TaxConfig } from '@/lib/calc-engine';
import TabContainer from '@/components/pricing/TabContainer';
import RoomTypesTab from '@/components/pricing/RoomTypesTab';
import OTAConfigTab from '@/components/pricing/OTAConfigTab';
import OverviewTab from '@/components/pricing/OverviewTab';

// OTA Brand Colors
const OTA_BRANDS = [
    { id: 'agoda', name: 'Agoda', color: '#EF5222' },
    { id: 'booking', name: 'Booking.com', color: '#003580' },
    { id: 'traveloka', name: 'Traveloka', color: '#0194F3' },
    { id: 'expedia', name: 'Expedia', color: '#FFCC00' },
    { id: 'ctrip', name: 'Ctrip', color: '#0086F6' },
];

const DEFAULT_TAX: TaxConfig = {
    vatPercent: 10,
    serviceChargePercent: 5
};

interface RoomType {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
}

interface Promotion {
    id: string;
    name: string;
    discountValue: number;
    calcType: string;
    isActive: boolean;
}

interface OTAConfig {
    id: string;
    name: string;
    calcType: string;
    defaultComm: number;
    promotions: Promotion[];
}

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('room-types');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [otaConfigs, setOtaConfigs] = useState<OTAConfig[]>(
        OTA_BRANDS.map(ota => ({
            id: ota.id,
            name: ota.name,
            calcType: ota.id === 'agoda' ? 'ADDITIVE' : 'PROGRESSIVE',
            defaultComm: ota.id === 'agoda' ? 17 : ota.id === 'expedia' ? 18 : 15,
            promotions: []
        }))
    );
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [taxConfig] = useState(DEFAULT_TAX);

    // Define tabs
    const tabs = [
        { id: 'room-types', label: 'Hạng Phòng', color: '#6366f1' },
        ...OTA_BRANDS.map(ota => ({ id: ota.id, label: ota.name, color: ota.color })),
        { id: 'overview', label: 'Tổng Quan', color: '#10b981' }
    ];

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, otaRes] = await Promise.all([
                    fetch('/api/room-types'),
                    fetch('/api/ota-channels')
                ]);

                if (roomsRes.ok) {
                    const roomsData = await roomsRes.json();
                    setRoomTypes(roomsData.map((r: any) => ({
                        ...r,
                        basePrice: r.basePrice || 1000000
                    })));
                }

                if (otaRes.ok) {
                    const otaData = await otaRes.json();
                    if (otaData.length > 0) {
                        // Merge with existing configs
                        setOtaConfigs(prev => prev.map(config => {
                            const dbOta = otaData.find((o: any) => o.name === config.name);
                            if (dbOta) {
                                return {
                                    ...config,
                                    id: dbOta.id,
                                    calcType: dbOta.calcType || config.calcType,
                                    defaultComm: dbOta.defaultComm || config.defaultComm
                                };
                            }
                            return config;
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    // OTA Config Handlers (Auto-save)
    const handleCommissionChange = useCallback((otaId: string, value: number) => {
        setOtaConfigs(prev => prev.map(ota =>
            ota.id === otaId ? { ...ota, defaultComm: value } : ota
        ));
        // Auto-save to API
        fetch(`/api/ota-channels/${otaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ defaultComm: value })
        }).catch(console.error);
    }, []);

    const handleCalcTypeChange = useCallback((otaId: string, value: string) => {
        setOtaConfigs(prev => prev.map(ota =>
            ota.id === otaId ? { ...ota, calcType: value } : ota
        ));
        // Auto-save to API
        fetch(`/api/ota-channels/${otaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ calcType: value })
        }).catch(console.error);
    }, []);

    const handlePromotionToggle = useCallback((otaId: string, promoId: string, isActive: boolean) => {
        setOtaConfigs(prev => prev.map(ota =>
            ota.id === otaId
                ? {
                    ...ota,
                    promotions: ota.promotions.map(p =>
                        p.id === promoId ? { ...p, isActive } : p
                    )
                }
                : ota
        ));
    }, []);

    const handleAddPromotion = useCallback((otaId: string, name: string, discountValue: number) => {
        const newPromo: Promotion = {
            id: `promo-${Date.now()}`,
            name,
            discountValue,
            calcType: 'PROGRESSIVE',
            isActive: true
        };
        setOtaConfigs(prev => prev.map(ota =>
            ota.id === otaId
                ? { ...ota, promotions: [...ota.promotions, newPromo] }
                : ota
        ));
    }, []);

    const handleDeletePromotion = useCallback((otaId: string, promoId: string) => {
        setOtaConfigs(prev => prev.map(ota =>
            ota.id === otaId
                ? { ...ota, promotions: ota.promotions.filter(p => p.id !== promoId) }
                : ota
        ));
    }, []);

    // Render active tab content
    const renderTabContent = () => {
        if (activeTab === 'room-types') {
            return (
                <RoomTypesTab
                    roomTypes={roomTypes}
                    onRoomTypesChange={setRoomTypes}
                />
            );
        }

        if (activeTab === 'overview') {
            return (
                <OverviewTab
                    roomTypes={roomTypes}
                    selectedRoomIds={selectedRoomIds}
                    onSelectionChange={setSelectedRoomIds}
                    otaChannels={otaConfigs}
                />
            );
        }

        // OTA Config Tabs
        const otaConfig = otaConfigs.find(o => o.id === activeTab);
        const otaBrand = OTA_BRANDS.find(o => o.id === activeTab);
        if (otaConfig && otaBrand) {
            return (
                <OTAConfigTab
                    otaId={otaConfig.id}
                    otaName={otaConfig.name}
                    brandColor={otaBrand.color}
                    commission={otaConfig.defaultComm}
                    calcType={otaConfig.calcType}
                    promotions={otaConfig.promotions}
                    roomTypes={roomTypes}
                    onCommissionChange={(v) => handleCommissionChange(otaConfig.id, v)}
                    onCalcTypeChange={(v) => handleCalcTypeChange(otaConfig.id, v)}
                    onPromotionToggle={(pId, isActive) => handlePromotionToggle(otaConfig.id, pId, isActive)}
                    onAddPromotion={(n, d) => handleAddPromotion(otaConfig.id, n, d)}
                    onDeletePromotion={(pId) => handleDeletePromotion(otaConfig.id, pId)}
                />
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold">Pricing Calculator</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Cấu hình giá từng bước: Hạng phòng → OTA Channels → Tổng quan
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <TabContainer
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                >
                    {renderTabContent()}
                </TabContainer>
            </main>
        </div>
    );
}
