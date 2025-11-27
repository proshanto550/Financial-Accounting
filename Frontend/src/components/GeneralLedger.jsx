import React from 'react';

const GeneralLedger = ({ accounts, journalEntries, adjustingEntries, balances, t }) => {
    const allEntries = [...journalEntries, ...adjustingEntries];

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border}`}>
            <h2 className={`text-2xl font-bold ${t.secondaryAccent} mb-6`}>GENERAL LEDGER</h2>
            <div className="space-y-6">
                {accounts.map(account => {
                    const relevantEntries = allEntries
                        .flatMap(entry =>
                            entry.lines
                                .filter(line => parseInt(line.accountId) === account.id)
                                .map(line => ({ ...line, date: entry.date, description: entry.description }))
                        );
                    if (relevantEntries.length === 0 && balances[account.id] === 0) return null;
                    return (
                        <div key={account.id} className={`border ${t.border} rounded-lg overflow-hidden`}>
                            <h3 className={`text-lg font-semibold ${t.text} ${t.tableHeader} px-4 py-2 text-cyan-300`}>
                                {account.name}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-700">
                                    <thead className={`${t.tableHeader}`}>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-mono uppercase">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-mono uppercase">Description</th>
                                            <th className="px-4 py-2 text-right text-xs font-mono uppercase">Debit</th>
                                            <th className="px-4 py-2 text-right text-xs font-mono uppercase">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${t.cardBg} divide-y divide-neutral-700/50`}>
                                        {relevantEntries.map((line, index) => (
                                            <tr key={index} className={t.tableRow}>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text}`}>{line.date}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text}`}>{line.description}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text} text-right font-mono`}>{parseFloat(line.debit || 0).toFixed(2)}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm ${t.text} text-right font-mono`}>{parseFloat(line.credit || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className={`font-bold ${t.tableHeader}`}>
                                        <tr>
                                            <td colSpan="2" className={`px-4 py-2 text-right text-sm ${t.text} font-mono`}>Total Balance:</td>
                                            <td colSpan="2" className={`px-4 py-2 text-right text-sm ${t.secondaryAccent} font-mono`}>
                                                ${balances[account.id] ? balances[account.id].toFixed(2) : '0.00'}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GeneralLedger;