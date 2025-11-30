import React from 'react';
import { Download } from 'lucide-react';
import { downloadBalanceSheetPDF } from '../pdfUtils'; // Import PDF Utility

const BalanceSheet = ({ accounts, balances, getTotalAssets, getTotalLiabilities, getTotalEquity, incomeStatement, t }) => {
    const totalAssets = getTotalAssets();
    const totalLiabilities = getTotalLiabilities();
    const totalEquityAndLiabilities = getTotalLiabilities() + getTotalEquity();

    const handleDownloadPDF = () => {
        const totals = { totalAssets, totalLiabilities, totalEquity: getTotalEquity() };
        downloadBalanceSheetPDF(accounts, balances, totals, incomeStatement);
    };

    const assetAccounts = accounts.filter(a => a.type === 'asset' && balances[a.id] !== 0);
    const liabilityAccounts = accounts.filter(a => a.type === 'liability' && balances[a.id] !== 0);
    const equityAccounts = accounts.filter(a => a.type === 'equity' && balances[a.id] !== 0);

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 md:p-8 ${t.border} max-w-full mx-auto`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-bold ${t.secondaryAccent} text-center`}>BALANCE SHEET</h2>
                <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${t.buttonSecondary}`}
                >
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                <div>
                    <h3 className={`text-2xl font-semibold ${t.accent} mb-5 border-b-2 border-cyan-700/50 pb-2`}>ASSETS</h3>
                    <div className="space-y-3">
                        {assetAccounts.map(acc => (
                            <div key={acc.id} className="flex justify-between text-lg py-1">
                                <span className="text-slate-300">{acc.name}</span>
                                <span className={`font-mono text-xl ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-4 border-neutral-700" />
                    <div className="flex justify-between font-bold text-xl py-2">
                        <span className={`${t.accent}`}>Total Assets</span>
                        <span className={`${t.accent} font-mono text-2xl`}>${totalAssets.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <h3 className={`text-2xl font-semibold ${t.secondaryAccent} mb-5 border-b-2 border-lime-700/50 pb-2`}>LIABILITIES & EQUITY</h3>

                    {/* Liabilities */}
                    <h4 className={`text-xl font-semibold ${t.text} mb-3`}>Liabilities</h4>
                    <div className="space-y-3">
                        {liabilityAccounts.map(acc => (
                            <div key={acc.id} className="flex justify-between text-lg py-1">
                                <span className="text-slate-300">{acc.name}</span>
                                <span className={`font-mono text-xl ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-semibold mt-4 pt-3 border-t border-dashed border-neutral-700 text-xl py-2">
                        <span className={`text-slate-300`}>Total Liabilities</span>
                        <span className={`font-mono text-2xl ${t.text}`}>${totalLiabilities.toFixed(2)}</span>
                    </div>

                    {/* Equity */}
                    <h4 className={`text-xl font-semibold ${t.text} my-4 pt-5 border-t border-neutral-700`}>Equity</h4>
                    <div className="space-y-3">
                        {equityAccounts.map(acc => (
                            <div key={acc.id} className="flex justify-between text-lg py-1">
                                <span className="text-slate-300">{acc.name}</span>
                                <span className={`font-mono text-xl ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-lg py-1">
                            <span className="text-slate-300">Net Income</span>
                            <span className={`font-mono text-xl ${t.text}`}>${incomeStatement.netIncome.toFixed(2)}</span>
                        </div>
                    </div>
                    <hr className="my-4 border-neutral-700" />
                    <div className="flex justify-between font-bold text-xl py-2">
                        <span className={`${t.secondaryAccent}`}>Total Liabilities & Equity</span>
                        <span className={`${t.secondaryAccent} font-mono text-2xl`}>${totalEquityAndLiabilities.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className={`mt-6 p-4 rounded-lg text-base ${Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01 ? `bg-lime-900/30 ${t.accent}` : 'bg-red-900/30 text-red-400'}`}>
                <p className="font-mono">
                    {Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01 ? 'Equation Check: Assets = Liabilities + Equity (OK)' : `Warning: Assets ($${totalAssets.toFixed(2)}) do not equal L + E ($${totalEquityAndLiabilities.toFixed(2)})`}
                </p>
            </div>
        </div>
    );
};

export default BalanceSheet;