import React from 'react';
import { TrendingUp, Building, FileText, BookOpen, DollarSign, Zap } from 'lucide-react';
import { StatCard, NetIncomeTrendChart } from './Utils';

const Dashboard = ({
    getTotalAssets,
    getTotalLiabilities,
    getTotalEquity,
    incomeStatement,
    journalEntries,
    accounts,
    t
}) => {
    const totalAssets = getTotalAssets();
    const totalLiabilities = getTotalLiabilities();
    const totalEquity = getTotalEquity();
    const netIncome = incomeStatement.netIncome;

    return (
        <div className="space-y-6">
            <div className={`p-4 rounded-xl ${t.cardBg} ${t.shadow} ${t.border} flex justify-between items-center`}>
                <h2 className={`text-3xl font-bold tracking-widest ${t.secondaryAccent}`}>OVERVIEW</h2>
                <div className="flex items-center text-lg font-mono text-slate-400">
                    <Zap size={16} className="text-lime-400 mr-1" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Assets" value={totalAssets} icon={Building} color="text-cyan-400" t={t} />
                <StatCard title="Total Liabilities" value={totalLiabilities} icon={FileText} color="text-yellow-400" t={t} />
                <StatCard title="Total Equity" value={totalEquity} icon={BookOpen} color="text-pink-400" t={t} />
                <StatCard title="Net Income" value={netIncome} icon={DollarSign} color="text-lime-400" isIncome={true} t={t} />
            </div>
            <div className={`p-6 rounded-xl ${t.cardBg} ${t.shadow} ${t.border}`}>
                <h3 className={`text-2xl font-semibold mb-4 ${t.secondaryAccent}`}>NET INCOME TREND (by Entry)</h3>
                <NetIncomeTrendChart entries={journalEntries} accounts={accounts} />
            </div>
            <div className={`p-6 rounded-xl ${t.cardBg} ${t.shadow} ${t.border}`}>
                <h3 className={`text-2xl font-semibold ${t.secondaryAccent} mb-2`}>ACCOUNTING EQUATION CHECK</h3>
                <p className={`text-3xl font-mono ${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? 'text-lime-400' : 'text-red-500'}`}>
                    ASSETS = LIABILITIES + EQUITY
                </p>
                <p className="text-lg text-slate-400 mt-1">
                    ${totalAssets.toFixed(2)} = ${totalLiabilities.toFixed(2)} + ${totalEquity.toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default Dashboard;