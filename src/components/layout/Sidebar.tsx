"use client";

import React from 'react';
import { Home, Calculator, Percent, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

// Navigation Items
const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'pricing', label: 'Bảng tính giá', icon: Calculator },
    { id: 'rate-parity', label: 'Rate Parity', icon: Percent },
    { id: 'compset', label: 'Compset Analysis', icon: BarChart3 },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeItem: string;
    onSelectItem: (id: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeItem, onSelectItem }: SidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                            OTA Pricing
                        </h1>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelectItem(item.id);
                                        onClose();
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-orange-600/10 text-orange-500'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                            <LogOut className="w-5 h-5" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
