import React from 'react';

const IncomeStatement = ({ accounts, balances, incomeStatement, t }) => {
    const { revenue, expenses, netIncome } = incomeStatement;

    const revenueAccounts = accounts.filter(acc => acc.type === 'revenue' && balances[acc.id] !== 0);
    const expenseAccounts = accounts.filter(acc => acc.type === 'expense' && balances[acc.id] !== 0);

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border} max-w-3xl mx-auto`}>
            <h2 className={`text-2xl font-bold ${t.secondaryAccent} mb-6 text-center`}>INCOME STATEMENT</h2>

            <div className="space-y-6">
                {/* Revenue Section */}
                <div>
                    <h3 className={`text-lg font-bold ${t.accent} mb-2 border-b border-neutral-700 pb-1`}>REVENUE</h3>
                    {revenueAccounts.length === 0 ? <p className="text-slate-500 text-sm italic">No revenue recorded</p> : (
                        <div className="space-y-1">
                            {revenueAccounts.map(acc => (
                                <div key={acc.id} className="flex justify-between text-sm">
                                    <span className={t.text}>{acc.name}</span>
                                    <span className="font-mono text-slate-400">${balances[acc.id].toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-neutral-700">
                        <span className={`font-semibold ${t.text}`}>Total Revenue</span>
                        <span className={`font-mono text-lime-400`}>${revenue.toFixed(2)}</span>
                    </div>
                </div>

                {/* Expenses Section */}
                <div>
                    <h3 className={`text-lg font-bold ${t.accent} mb-2 border-b border-neutral-700 pb-1`}>EXPENSES</h3>
                    {expenseAccounts.length === 0 ? <p className="text-slate-500 text-sm italic">No expenses recorded</p> : (
                        <div className="space-y-1">
                            {expenseAccounts.map(acc => (
                                <div key={acc.id} className="flex justify-between text-sm">
                                    <span className={t.text}>{acc.name}</span>
                                    <span className="font-mono text-slate-400">${balances[acc.id].toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-neutral-700">
                        <span className={`font-semibold ${t.text}`}>Total Expenses</span>
                        <span className={`font-mono text-red-400`}>(${expenses.toFixed(2)})</span>
                    </div>
                </div>

                {/* Net Income */}
                <div className={`flex justify-between items-center pt-4 border-t-2 ${t.border}`}>
                    <span className={`text-xl font-bold ${t.secondaryAccent}`}>Net Income</span>
                    <span className={`text-xl font-bold font-mono ${netIncome >= 0 ? 'text-lime-400' : 'text-red-500'}`}>${netIncome.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;