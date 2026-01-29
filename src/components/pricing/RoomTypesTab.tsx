"use client";

import React, { useState } from 'react';

interface RoomType {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
}

interface RoomTypesTabProps {
    roomTypes: RoomType[];
    onRoomTypesChange: (roomTypes: RoomType[]) => void;
}

// Format number with thousand separators
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

// Parse formatted string back to number
const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/\D/g, '')) || 0;
};

export default function RoomTypesTab({ roomTypes, onRoomTypesChange }: RoomTypesTabProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPriceStr, setEditPriceStr] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPriceStr, setNewPriceStr] = useState('1.000.000');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        const newPrice = parseFormattedNumber(newPriceStr);
        setError(null);
        setIsSaving(true);

        // Optimistic UI: Add to list immediately if server is slow
        const tempId = `temp-${Date.now()}`;
        const newRoomTemp: RoomType = {
            id: tempId,
            name: newName,
            description: '',
            basePrice: newPrice
        };

        try {
            const res = await fetch('/api/room-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, description: '', basePrice: newPrice })
            });

            if (res.ok) {
                const created = await res.json();
                const newRoomReal: RoomType = {
                    id: created.id,
                    name: created.name,
                    description: created.description,
                    basePrice: newPrice
                };
                onRoomTypesChange([...roomTypes, newRoomReal]);
                setNewName('');
                setNewPriceStr('1.000.000');
                setIsAdding(false);
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(`Lỗi server: ${errData.error || res.statusText}. Đang cập nhật offline...`);
                // Fallback: keep temp item if server fails (but maybe not ideal for DB consistency)
                onRoomTypesChange([...roomTypes, newRoomTemp]);
                setIsAdding(false);
            }
        } catch (error: any) {
            setError("Không thể kết nối server. Đã thêm vào danh sách tạm thời.");
            onRoomTypesChange([...roomTypes, newRoomTemp]);
            setIsAdding(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id.startsWith('temp-')) {
            onRoomTypesChange(roomTypes.filter(r => r.id !== id));
            return;
        }

        try {
            const res = await fetch(`/api/room-types/${id}`, { method: 'DELETE' });
            if (res.ok) {
                onRoomTypesChange(roomTypes.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete room type:', error);
        }
    };

    const startEdit = (room: RoomType) => {
        setEditingId(room.id);
        setEditName(room.name);
        setEditPriceStr(formatNumber(room.basePrice));
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) return;
        const editPrice = parseFormattedNumber(editPriceStr);
        setError(null);

        if (editingId.startsWith('temp-')) {
            onRoomTypesChange(roomTypes.map(r =>
                r.id === editingId ? { ...r, name: editName, basePrice: editPrice } : r
            ));
            setEditingId(null);
            return;
        }

        try {
            const res = await fetch(`/api/room-types/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, basePrice: editPrice })
            });
            if (res.ok) {
                onRoomTypesChange(roomTypes.map(r =>
                    r.id === editingId ? { ...r, name: editName, basePrice: editPrice } : r
                ));
                setEditingId(null);
            } else {
                setError("Không thể cập nhật lên server.");
            }
        } catch (error) {
            setError("Lỗi kết nối khi cập nhật.");
        }
    };

    const handlePriceInput = (value: string, setter: (v: string) => void) => {
        const num = parseFormattedNumber(value);
        if (num >= 0) {
            setter(formatNumber(num));
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Quản lý Hạng Phòng</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <span className="text-lg">+</span> Thêm Hạng Phòng
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Add New Form */}
            {isAdding && (
                <div className="mb-6 p-6 bg-slate-700/50 rounded-xl border border-indigo-500/30 shadow-inner flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Tên hạng phòng</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all"
                            placeholder="VD: Deluxe Ocean View"
                            autoFocus
                        />
                    </div>
                    <div className="w-56">
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Giá nhận về (VND)</label>
                        <input
                            type="text"
                            value={newPriceStr}
                            onChange={(e) => handlePriceInput(e.target.value, setNewPriceStr)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-right font-mono text-lg focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={isSaving}
                            className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu Ngay'}
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Room Types Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-slate-400 text-xs uppercase tracking-widest bg-slate-800/80 border-b border-slate-700">
                            <th className="px-6 py-4 font-bold">Tên Hạng Phòng</th>
                            <th className="px-6 py-4 font-bold text-right">Giá Nhận về (NET)</th>
                            <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {roomTypes.map((room) => (
                            <tr key={room.id} className="hover:bg-slate-700/30 transition-colors group">
                                <td className="px-6 py-4 text-sm">
                                    {editingId === room.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-slate-700 border border-indigo-500 rounded text-white outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">{room.name}</span>
                                            {room.id.startsWith('temp-') && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded border border-amber-500/30">Offline</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === room.id ? (
                                        <input
                                            type="text"
                                            value={editPriceStr}
                                            onChange={(e) => handlePriceInput(e.target.value, setEditPriceStr)}
                                            className="w-40 px-3 py-1.5 bg-slate-700 border border-indigo-500 rounded text-white text-right font-mono outline-none"
                                        />
                                    ) : (
                                        <span className="text-emerald-400 font-mono font-bold">{formatNumber(room.basePrice)} ₫</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === room.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={saveEdit} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">✓ Lưu</button>
                                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-400/10 rounded-lg transition-colors">✕ Hủy</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(room)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors">✎ Sửa</button>
                                            <button onClick={() => handleDelete(room.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">🗑 Xóa</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {roomTypes.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-12 text-center text-slate-500">
                                    <div className="text-3xl mb-2">🛏️</div>
                                    Chưa có hạng phòng nào. Hãy thêm phòng đầu tiên để bắt đầu tính giá!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex items-center gap-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <div className="text-xl">💡</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Hướng dẫn:</strong> Nhập <span className="text-indigo-400 font-bold">Giá nhận về (NET)</span> của khách sạn.
                    Hệ thống sẽ dùng giá này để tính bù trừ các khoản hoa hồng và khuyến mãi trong các tab OTA, đảm bảo bạn luôn thu về đúng số tiền này.
                </p>
            </div>
        </div>
    );
}
