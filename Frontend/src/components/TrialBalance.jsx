import React from 'react';
import { Download } from 'lucide-react';
import { downloadTrialBalancePDF } from '../pdfUtils'; // Import PDF Utility

const TrialBalance = ({ trialBalanceData, t }) => {
    const {
        data = [],
        totalDebits = 0,
        totalCredits = 0
    } = trialBalanceData || {};

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    const handleDownloadPDF = () => {
        downloadTrialBalancePDF(trialBalanceData);
    };

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 md:p-10 ${t.border}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-4xl font-bold ${t.secondaryAccent}`}>TRIAL BALANCE</h2>
                <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 text-lg rounded-lg font-medium transition-colors ${t.buttonSecondary}`}
                >
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className={`overflow-x-auto border ${t.border} rounded-lg`}>
                <table className="min-w-full divide-y divide-neutral-700">
                    <thead className={t.tableHeader}>
                        <tr>
                            <th className="px-6 py-4 text-left text-xl font-mono uppercase">Account Name</th>
                            <th className="px-6 py-4 text-center text-xl font-mono uppercase">Debit</th>
                            <th className="px-6 pr-6 py-4 text-right text-xl font-mono uppercase">Credit</th>
                        </tr>
                    </thead>
                    <tbody className={`${t.cardBg} divide-y divide-neutral-700/50`}>
                        {data.map((item, index) => (
                            <tr key={item.account?.id || index} className={t.tableRow}>
                                <td className={`px-6 py-3 text-xl ${t.text}`}>{item.account?.name}</td>
                                <td className={`px-6 py-3 whitespace-nowrap text-xl ${t.text} text-center font-mono text-lime-400`}>${(item.debit || 0).toFixed(2)}</td>
                                <td className={`px-6 pr-6 py-3 whitespace-nowrap text-xl ${t.text} text-right font-mono text-cyan-400`}>${(item.credit || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className={`font-bold ${t.tableHeader}`}>
                        <tr>
                            <td colSpan="1" className={`px-6 py-4 text-right text-xl ${t.text} font-mono`}>TOTALS:</td>
                            <td className={`px-6 py-4 text-center text-xl ${t.secondaryAccent} font-mono`}>${totalDebits.toFixed(2)}</td>
                            <td className={`px-6 pr-6 py-4 text-right text-xl ${t.secondaryAccent} font-mono`}>${totalCredits.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className={`mt-4 p-3 rounded-lg ${isBalanced ? 'bg-lime-900/30 text-lime-400' : 'bg-red-900/30 text-red-400'}`}>
                <p className="text-lg font-mono">
                    {isBalanced ? 'Balance Check: Debits equal Credits (OK)' : `Warning: Debits ($${totalDebits.toFixed(2)}) do not equal Credits ($${totalCredits.toFixed(2)})`}
                </p>
            </div>
        </div>
    );
};

export default TrialBalance;