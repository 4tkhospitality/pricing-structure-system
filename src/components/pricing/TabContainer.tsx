"use client";

import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    color?: string;
}

interface TabContainerProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
}

export default function TabContainer({ tabs, activeTab, onTabChange, children }: TabContainerProps) {
    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                            ${activeTab === tab.id
                                ? 'border-b-2 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        style={{
                            borderColor: activeTab === tab.id ? (tab.color || '#6366f1') : 'transparent'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {children}
            </div>
        </div>
    );
}
