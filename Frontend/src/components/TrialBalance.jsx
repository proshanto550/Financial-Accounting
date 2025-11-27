import React from 'react';

const TrialBalance = ({ trialBalanceData, t }) => {
    const { 
        data = [], 
        totalDebits = 0, 
        totalCredits = 0 
    } = trialBalanceData || {};

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border}`}>
            <h2 className={`text-2xl font-bold ${t.secondaryAccent} mb-6`}>TRIAL BALANCE</h2>
            <div className={`overflow-x-auto border ${t.border} rounded-lg`}>
                <table className="min-w-full divide-y divide-neutral-700">
                    <thead className={t.tableHeader}>
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-mono uppercase">Account Name</th>
                            <th className="px-4 py-3 text-center text-sm font-mono uppercase">Debit</th>
                            <th className="px-4 pr-4 py-3 text-right text-sm font-mono uppercase">Credit</th>
                        </tr>
                    </thead>
                    <tbody className={`${t.cardBg} divide-y divide-neutral-700/50`}>
                        {data.map((item, index) => ( 
                            <tr key={item.account?.id || index} className={t.tableRow}>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text} font-medium`}>{item.account?.name || 'Unknown Account'}</td>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text} text-center font-mono text-lime-400`}>${(item.debit || 0).toFixed(2)}</td>
                                <td className={`px-4 pr-4 py-2 whitespace-nowrap text-sm ${t.text} text-right font-mono text-cyan-400`}>${(item.credit || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className={`font-bold ${t.tableHeader}`}>
                        <tr>
                            <td colSpan="1" className={`px-4 py-3 text-right text-sm ${t.text} font-mono`}>TOTALS:</td>
                            <td className={`px-4 py-3 text-center text-sm ${t.secondaryAccent} font-mono`}>${totalDebits.toFixed(2)}</td>
                            <td className={`px-4 pr-4 py-3 text-right text-sm ${t.secondaryAccent} font-mono`}>${totalCredits.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className={`mt-4 p-3 rounded-lg ${isBalanced ? 'bg-lime-900/30 text-lime-400' : 'bg-red-900/30 text-red-400'}`}>
                <p className="text-sm font-mono">
                    {isBalanced ? 'Balance Check: Debits equal Credits (OK)' : `Warning: Debits ($${totalDebits.toFixed(2)}) do not equal Credits ($${totalCredits.toFixed(2)})`}
                </p>
            </div>
        </div>
    );
};

export default TrialBalance;