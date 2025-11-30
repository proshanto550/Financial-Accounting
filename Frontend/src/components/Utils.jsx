import React, { useMemo } from 'react';
import {
    Building, FileText, BookOpen, DollarSign, Zap, BarChart3
} from 'lucide-react';

// --- Stat Card for Dashboard ---
export const StatCard = ({ title, value, icon, color, isIncome = false, t }) => (
    <div className={`p-5 rounded-xl ${t.cardBg} ${t.shadow} ${t.border}`}>
        <div className="flex justify-between items-start">
            <h3 className={`text-sm font-semibold uppercase tracking-wider text-slate-400`}>{title}</h3>
            {icon ? React.createElement(icon, { size: 24, className: color }) : null}
        </div>
        <p className={`text-3xl font-mono mt-2 ${isIncome ? (value >= 0 ? 'text-lime-400' : 'text-red-500') : t.text}`}>
            ${value.toFixed(2)}
        </p>
    </div>
);

// --- Chart Component ---
export const NetIncomeTrendChart = ({ entries, accounts }) => {
    const historicalData = useMemo(() => {
        let runningNetIncome = 0;
        const dataPoints = [{ period: 'Initial', netIncome: 0 }];
        const balancesAtPoint = {};

        accounts.forEach(acc => balancesAtPoint[acc.id] = 0);

        entries.forEach((entry, index) => {
            entry.lines.forEach(line => {
                const accountId = parseInt(line.accountId || line.account_id);
                const account = accounts.find(a => a.id === accountId);
                if (!account) return;

                const debit = parseFloat(line.debit || line.debit_amount || 0) || 0;
                const credit = parseFloat(line.credit || line.credit_amount || 0) || 0;

                let change = 0;
                if (account.type === 'asset' || account.type === 'expense') {
                    change = debit - credit;
                } else {
                    change = credit - debit;
                }
                balancesAtPoint[account.id] += change;
            });

            let totalRevenue = 0;
            let totalExpenses = 0;
            accounts.forEach(account => {
                if (account.type === 'revenue') {
                    totalRevenue += balancesAtPoint[account.id] || 0;
                } else if (account.type === 'expense') {
                    totalExpenses += balancesAtPoint[account.id] || 0;
                }
            });
            runningNetIncome = totalRevenue - totalExpenses;

            dataPoints.push({
                period: `E${index + 1} (${entry.date})`,
                netIncome: runningNetIncome,
            });
        });

        return dataPoints;
    }, [entries, accounts]);

    if (historicalData.length <= 1) {
        return (
            <div className="text-center py-10 text-slate-400">
                <BarChart3 size={32} className="mx-auto mb-2" />
                <p>No entries yet. Start posting to see the Net Income trend.</p>
            </div>
        );
    }

    const values = historicalData.map(d => d.netIncome);
    const maxVal = Math.max(...values, 0) * 1.1;
    const minVal = Math.min(...values, 0) * 1.1;
    let range = maxVal - minVal;
    if (Math.abs(range) < 1e-9) range = 1;

    const height = 200;
    const width = 600;
    const padding = 30;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const getX = (index) => padding + (index / (historicalData.length - 1)) * chartWidth;
    const getY = (value) => padding + chartHeight - ((value - minVal) / range) * chartHeight;

    const zeroLineY = getY(0);
    const points = historicalData.map((d, i) => `${getX(i)},${getY(d.netIncome)}`).join(' ');

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2D3748" />
                <line x1={padding} y1={zeroLineY} x2={width - padding} y2={zeroLineY} stroke="#A0AEC0" strokeDasharray="4 4" />
                <text x={padding - 5} y={getY(maxVal / 1.1)} fontSize="10" fill="#CBD5E0" textAnchor="end">{`$${(maxVal / 1.1).toFixed(0)}`}</text>
                <text x={padding - 5} y={zeroLineY} fontSize="10" fill="#CBD5E0" textAnchor="end">0</text>
                <text x={padding - 5} y={getY(minVal / 1.1)} fontSize="10" fill="#CBD5E0" textAnchor="end">{`$${(minVal / 1.1).toFixed(0)}`}</text>
                <polyline fill="none" stroke="#4FC3F7" strokeWidth="3" points={points} />
                {historicalData.slice(1).map((d, i) => {
                    const x1 = getX(i);
                    const x2 = getX(i + 1);
                    const y1 = getY(historicalData[i].netIncome);
                    const y2 = getY(d.netIncome);
                    const color = d.netIncome >= 0 ? 'rgba(79, 195, 247, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                    return (
                        <path key={i} d={`M ${x1} ${zeroLineY} L ${x1} ${y1} L ${x2} ${y2} L ${x2} ${zeroLineY} Z`} fill={color} stroke="none" />
                    );
                })}
                {historicalData.map((d, i) => {
                    const x = getX(i);
                    const isLast = i === historicalData.length - 1;
                    const isFirst = i === 0;
                    return (
                        <g key={i}>
                            <circle cx={x} cy={getY(d.netIncome)} r="3" fill="#4FC3F7" />
                            {(isFirst || isLast || i % Math.ceil(historicalData.length / 5) === 0) && (
                                <text x={x} y={height - padding + 15} fontSize="9" fill="#CBD5E0" textAnchor="middle" transform={`rotate(10 ${x},${height - padding + 15})`}>
                                    {d.period.split(' ')[0]}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};