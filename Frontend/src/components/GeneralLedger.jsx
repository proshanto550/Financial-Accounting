import React from 'react';
import { Download } from 'lucide-react';
import { downloadLedgerPDF } from '../pdfUtils'; // Import PDF Utility

const GeneralLedger = ({ accounts, journalEntries, adjustingEntries, balances, t }) => {
    const allEntries = [...journalEntries, ...adjustingEntries];

    const handleDownloadPDF = () => {
        downloadLedgerPDF(accounts, allEntries, balances);
    };

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 md:p-10 ${t.border}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-4xl font-bold ${t.secondaryAccent}`}>GENERAL LEDGER</h2>
                <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 text-lg rounded-lg font-medium transition-colors ${t.buttonSecondary}`}
                >
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className="space-y-6">
                {accounts.map(account => {
                    const relevantEntries = allEntries
                        .flatMap(entry =>
                            entry.lines
                                .filter(line => parseInt(line.accountId || line.account_id) === account.id)
                                .map(line => ({ ...line, date: entry.date, description: entry.description }))
                        )
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    if (relevantEntries.length === 0 && balances[account.id] === 0) return null;
                    return (
                        <div key={account.id} className={`border ${t.border} rounded-lg overflow-hidden`}>
                            <h3 className={`text-2xl font-semibold  ${t.accent} px-4 py-2`}>
                                {account.name} ({account.type.toUpperCase()})
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-700">
                                    <thead className={`${t.tableHeader}`}>
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xl font-mono uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xl font-mono uppercase">Description</th>
                                            <th className="px-6 py-4 text-right text-xl font-mono uppercase">Debit</th>
                                            <th className="px-6 py-4 text-right text-xl font-mono uppercase">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${t.cardBg} divide-y divide-neutral-700/50`}>
                                        {relevantEntries.map((line, index) => (
                                            <tr key={index} className={t.tableRow}>
                                                <td className={`px-6 py-3 whitespace-nowrap text-xl text-slate-400`}>{line.date}</td>
                                                <td className={`px-6 py-3 whitespace-nowrap text-xl ${t.text}`}>{line.description || '-'}</td>
                                                <td className={`px-6 py-3 whitespace-nowrap text-xl ${t.text} text-right font-mono`}>{parseFloat(line.debit || 0).toFixed(2)}</td>
                                                <td className={`px-6 py-3 whitespace-nowrap text-xl ${t.text} text-right font-mono`}>{parseFloat(line.credit || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className={`font-bold ${t.tableHeader}`}>
                                        <tr>
                                            <td colSpan="2" className={`px-6 py-3 text-right text-xl ${t.text} font-mono`}>Total Balance:</td>
                                            <td colSpan="2" className={`px-6 py-3 text-right text-xl ${t.secondaryAccent} font-mono`}>
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