import React from 'react';
import { Edit2, Trash2, Download } from 'lucide-react';

// Accepts editEntry, deleteEntry, isAdjusting, and a new prop: downloadPDF
const JournalList = ({ entries, accounts, t, editEntry, deleteEntry, isAdjusting, downloadPDF }) => {
    return (
        <div className="space-y-4 mt-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={downloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${t.buttonSecondary}`}
                >
                    <Download size={16} /> Download List
                </button>
            </div>

            {entries.length === 0 ? <p className="text-slate-400">No entries found.</p> : entries.map(entry => (
                // Added relative and group classes for the hover effect
                <div key={entry.id} className={`border ${t.border} rounded-lg relative group`}>
                    {/* Edit/Delete Buttons: visible on hover (group-hover:opacity-100) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                        <button
                            onClick={() => editEntry(entry, isAdjusting)}
                            className="p-1.5 bg-cyan-700/80 hover:bg-cyan-600 text-white rounded-md"
                            title="Edit Entry"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1.5 bg-red-700/80 hover:bg-red-600 text-white rounded-md"
                            title="Delete Entry"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className={`p-4 border-b ${t.border} flex justify-between items-center`}>
                        <h4 className={`text-md font-semibold ${t.accent}`}>{entry.date}</h4>
                        <p className={`text-sm text-slate-400 font-mono`}>ID: {entry.id}</p>
                    </div>
                    {/* Description is shown in the table rows; do not duplicate under the date */}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-700">
                            <thead className={`${t.tableHeader}`}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-base font-mono uppercase">Account</th>
                                    <th className="px-6 py-4 text-left text-base font-mono uppercase">Description</th>
                                    <th className="px-6 py-4 text-right text-base font-mono uppercase">Debit</th>
                                    <th className="px-6 pr-6 py-4 text-right text-base font-mono uppercase">Credit</th>
                                </tr>
                            </thead>

                            <tbody className={`divide-y divide-neutral-700/50 ${t.cardBg}`}>
                                {entry.lines.map((line, index) => {
                                    const account = accounts.find(a => a.id === parseInt(line.accountId || line.account_id)); // Use OR for compatibility
                                    return (
                                        <tr key={index} className={`${t.tableRow}`}>
                                            <td className={`px-6 py-3 text-base ${t.text}`}>{account ? account.name : 'Unknown Account'}</td>
                                            <td className={`px-6 py-3 text-base ${t.text} text-left font-mono text-slate-400`}>{entry.description}</td>
                                            <td className={`px-6 py-3 text-base ${t.text} text-right font-mono ${line.debit ? 'text-lime-400' : 'text-slate-500'}`}>{line.debit ? `$${parseFloat(line.debit).toFixed(2)}` : ''}</td>
                                            <td className={`px-6 pr-6 py-3 text-base ${t.text} text-right font-mono ${line.credit ? 'text-cyan-400' : 'text-slate-500'}`}>{line.credit ? `$${parseFloat(line.credit).toFixed(2)}` : ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default JournalList;