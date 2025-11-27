import React from 'react';

const BalanceSheet = ({ accounts, balances, getTotalAssets, getTotalLiabilities, getTotalEquity, incomeStatement, t }) => {
    const totalAssets = getTotalAssets();
    const totalLiabilities = getTotalLiabilities();
    const totalEquityAndLiabilities = getTotalLiabilities() + getTotalEquity();

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border} max-w-4xl mx-auto`}>
            <h2 className={`text-2xl font-bold ${t.secondaryAccent} mb-6 text-center`}>BALANCE SHEET</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className={`text-xl font-semibold ${t.accent} mb-3 border-b-2 border-cyan-700/50 pb-1`}>ASSETS</h3>
                    <div className="space-y-2">
                        {accounts.filter(a => a.type === 'asset' && balances[a.id] !== 0).map(acc => (
                            <div key={acc.id} className="flex justify-between text-sm">
                                <span className="text-slate-400">{acc.name}</span>
                                <span className={`font-mono ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-3 border-neutral-700" />
                    <div className="flex justify-between font-bold">
                        <span className={`${t.text}`}>Total Assets</span>
                        <span className={`${t.accent} font-mono`}>${totalAssets.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <h3 className={`text-xl font-semibold ${t.accent} mb-3 border-b-2 border-cyan-700/50 pb-1`}>LIABILITIES & EQUITY</h3>
                    <h4 className={`text-lg font-semibold ${t.secondaryAccent} mt-4 mb-2`}>Liabilities</h4>
                    <div className="space-y-2">
                        {accounts.filter(a => a.type === 'liability' && balances[a.id] !== 0).map(acc => (
                            <div key={acc.id} className="flex justify-between text-sm">
                                <span className="text-slate-400">{acc.name}</span>
                                <span className={`font-mono ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-dashed border-neutral-700">
                        <span className={`${t.text}`}>Total Liabilities</span>
                        <span className={`font-mono text-yellow-400`}>${totalLiabilities.toFixed(2)}</span>
                    </div>

                    <h4 className={`text-lg font-semibold ${t.secondaryAccent} mt-4 mb-2`}>Equity</h4>
                    <div className="space-y-2">
                        {accounts.filter(a => a.type === 'equity' && balances[a.id] !== 0).map(acc => (
                            <div key={acc.id} className="flex justify-between text-sm">
                                <span className="text-slate-400">{acc.name}</span>
                                <span className={`font-mono ${t.text}`}>${balances[acc.id].toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Net Income</span>
                            <span className={`font-mono ${t.text}`}>${incomeStatement.netIncome.toFixed(2)}</span>
                        </div>
                    </div>
                    <hr className="my-3 border-neutral-700" />
                    <div className="flex justify-between font-bold">
                        <span className={`${t.text}`}>Total Liabilities & Equity</span>
                        <span className={`${t.accent} font-mono`}>${totalEquityAndLiabilities.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className={`mt-4 p-3 rounded-lg ${Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01 ? 'bg-lime-900/30 text-lime-400' : 'bg-red-900/30 text-red-400'}`}>
                <p className="text-sm font-mono">
                    {Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01 ? 'Equation Check: Assets equal Liabilities + Equity (OK)' : `Warning: Assets ($${totalAssets.toFixed(2)}) do not equal L + E ($${totalEquityAndLiabilities.toFixed(2)})`}
                </p>
            </div>
        </div>
    );
};

export default BalanceSheet;