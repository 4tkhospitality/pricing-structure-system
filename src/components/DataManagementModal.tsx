'use client';

import React, { useState, useEffect } from 'react';

interface RoomType {
    id: string;
    name: string;
    description?: string;
}

interface Campaign {
    id: string;
    name: string;
    discountValue: number;
    calcType: 'PROGRESSIVE' | 'ADDITIVE';
    isActive: boolean;
}

export default function DataManagementModal({ isOpen, onClose, onUpdate }: { isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
    const [activeTab, setActiveTab] = useState<'rooms' | 'campaigns'>('rooms');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [newRoom, setNewRoom] = useState({ name: '', description: '' });
    const [newCampaign, setNewCampaign] = useState({ name: '', discountValue: 10, calcType: 'PROGRESSIVE' as 'PROGRESSIVE' | 'ADDITIVE' });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        const [roomsRes, campaignsRes] = await Promise.all([
            fetch('/api/room-types'),
            fetch('/api/campaigns')
        ]);
        const [rooms, camps] = await Promise.all([
            roomsRes.json(),
            campaignsRes.json()
        ]);
        setRoomTypes(rooms);
        setCampaigns(camps);
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/room-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRoom)
        });
        if (res.ok) {
            setNewRoom({ name: '', description: '' });
            fetchData();
            onUpdate();
        }
    };

    const handleDeleteRoom = async (id: string) => {
        if (!confirm('Are you sure you want to delete this room type?')) return;
        const res = await fetch(`/api/room-types/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchData();
            onUpdate();
        }
    };

    const handleAddCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCampaign)
        });
        if (res.ok) {
            setNewCampaign({ name: '', discountValue: 10, calcType: 'PROGRESSIVE' });
            fetchData();
            onUpdate();
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchData();
            onUpdate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white">Master Data Management</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Configure your hospitality core entities</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl font-black">×</button>
                </div>

                <div className="flex border-b border-gray-800 bg-gray-950/30">
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rooms' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        Room Types
                    </button>
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'campaigns' ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        Campaigns
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === 'rooms' ? (
                        <div className="space-y-6">
                            <form onSubmit={handleAddRoom} className="p-6 bg-gray-950 rounded-3xl border border-gray-800 space-y-4">
                                <input
                                    placeholder="Room Name (e.g. Deluxe Ocean View)"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all"
                                    value={newRoom.name}
                                    onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Description"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 focus:border-blue-500 outline-none transition-all"
                                    value={newRoom.description}
                                    onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                                    Add New Room Type
                                </button>
                            </form>

                            <div className="space-y-3">
                                {roomTypes.map(room => (
                                    <div key={room.id} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 group/item">
                                        <div>
                                            <h4 className="text-sm font-black text-white">{room.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">{room.description || 'No description'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRoom(room.id)}
                                            className="text-gray-700 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all text-[10px] font-black uppercase"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={handleAddCampaign} className="p-6 bg-gray-950 rounded-3xl border border-gray-800 space-y-4">
                                <input
                                    placeholder="Campaign Name (e.g. Summer Flash Sale)"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-orange-500 outline-none transition-all"
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Discount %"
                                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-4 pr-10 py-3 text-sm font-black text-white focus:border-orange-500 outline-none transition-all"
                                            value={newCampaign.discountValue}
                                            onChange={e => setNewCampaign({ ...newCampaign, discountValue: Number(e.target.value) })}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">%</span>
                                    </div>
                                    <select
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-orange-500 outline-none transition-all uppercase tracking-widest"
                                        value={newCampaign.calcType}
                                        onChange={e => setNewCampaign({ ...newCampaign, calcType: e.target.value as any })}
                                    >
                                        <option value="PROGRESSIVE">Progressive</option>
                                        <option value="ADDITIVE">Additive</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                                    Add New Campaign
                                </button>
                            </form>

                            <div className="space-y-3">
                                {campaigns.map(camp => (
                                    <div key={camp.id} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 group/item">
                                        <div>
                                            <h4 className="text-sm font-black text-white">{camp.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                                {camp.discountValue}% | {camp.calcType}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCampaign(camp.id)}
                                            className="text-gray-700 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all text-[10px] font-black uppercase"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
