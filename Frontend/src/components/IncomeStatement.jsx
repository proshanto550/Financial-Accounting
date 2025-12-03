import React from 'react';
import { Download } from 'lucide-react';
import { downloadIncomeStatementPDF } from '../pdfUtils'; // Import PDF Utility

const IncomeStatement = ({ accounts, balances, incomeStatement, t }) => {
    const { revenue, expenses, netIncome } = incomeStatement;

    const revenueAccounts = accounts.filter(acc => acc.type === 'revenue' && balances[acc.id] !== 0);
    const expenseAccounts = accounts.filter(acc => acc.type === 'expense' && balances[acc.id] !== 0);

    const handleDownloadPDF = () => {
        downloadIncomeStatementPDF(accounts, balances, incomeStatement);
    };

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 md:p-10 ${t.border} w-full mx-auto`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-4xl font-bold ${t.secondaryAccent} text-center`}>INCOME STATEMENT</h2>
                <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 text-lg rounded-lg font-medium transition-colors ${t.buttonSecondary}`}
                >
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className="space-y-6">
                {/* Revenue Section */}
                <div>
                    <h3 className={`text-2xl font-bold ${t.accent} mb-3 border-b border-neutral-700 pb-1`}>REVENUE</h3>
                    {revenueAccounts.length === 0 ? <p className="text-slate-500 text-xl italic">No revenue recorded</p> : (
                        <div className="space-y-2">
                            {revenueAccounts.map(acc => (
                                <div key={acc.id} className="flex justify-between text-xl">
                                    <span className={`${t.text} font-medium`}>{acc.name}</span>
                                    <span className="font-mono text-slate-300">${balances[acc.id].toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-neutral-700">
                        <span className={`font-semibold text-xl ${t.accent}`}>Total Revenue</span>
                        <span className={`font-mono text-xl ${t.accent}`}>${revenue.toFixed(2)}</span>
                    </div>
                </div>

                {/* Expenses Section */}
                <div>
                    <h3 className={`text-2xl font-bold text-red-400 mb-3 border-b border-neutral-700 pb-1`}>EXPENSES</h3>
                    {expenseAccounts.length === 0 ? <p className="text-slate-500 text-xl italic">No expenses recorded</p> : (
                        <div className="space-y-2">
                            {expenseAccounts.map(acc => (
                                <div key={acc.id} className="flex justify-between text-xl">
                                    <span className={`${t.text} font-medium`}>{acc.name}</span>
                                    <span className="font-mono text-slate-300">${balances[acc.id].toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-neutral-700">
                        <span className={`font-semibold text-xl text-red-400`}>Total Expenses</span>
                        <span className={`font-mono text-xl text-red-400`}>(${expenses.toFixed(2)})</span>
                    </div>
                </div>

                {/* Net Income */}
                <div className={`flex justify-between items-center pt-5 border-t-2 ${t.border}`}>
                    <span className={`text-2xl font-bold ${t.secondaryAccent}`}>Net Income</span>
                    <span className={`text-2xl font-bold font-mono ${netIncome >= 0 ? 'text-cyan-400' : 'text-red-500'}`}>${netIncome.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;