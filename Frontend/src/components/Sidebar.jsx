import React from 'react';
import {
    TrendingUp, Building, FileText, BookOpen, DollarSign, Edit2, Zap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, theme }) => {
    const navItems = [
        { id: 'dashboard', label: 'OVERVIEW', icon: TrendingUp },
        { id: 'accounting', label: 'CHART OF ACCOUNTS', icon: Building },
        { id: 'journal', label: 'JOURNAL ENTRIES', icon: FileText },
        { id: 'ledger', label: 'GENERAL LEDGER', icon: BookOpen },
        { id: 'trial', label: 'TRIAL BALANCE', icon: DollarSign },
        { id: 'income', label: 'INCOME STATEMENT', icon: TrendingUp },
        { id: 'balance', label: 'BALANCE SHEET', icon: FileText },
        { id: 'adjusting', label: 'ADJUSTMENTS', icon: Edit2 },
    ];

    const baseClasses = "flex items-center p-3 rounded-lg w-full text-left transition-colors font-mono tracking-wider";

    return (
        <nav className={`w-64 p-4 space-y-2 flex-shrink-0 ${theme === 'dark' ? 'bg-neutral-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
            <div className="text-xl font-bold mb-6 text-lime-400 border-b border-lime-400/30 pb-2 flex items-center gap-2">
                <Zap size={20} /> M.O.N.E.Y.
            </div>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`${baseClasses} ${activeTab === item.id
                        ? 'bg-cyan-700/50 text-white font-semibold shadow-inner ring-1 ring-cyan-500'
                        : 'hover:bg-neutral-800'
                        }`}
                >
                    <item.icon size={18} className="mr-3" />
                    <span className="text-sm tracking-widest">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default Sidebar;