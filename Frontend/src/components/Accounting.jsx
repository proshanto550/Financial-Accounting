import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const Accounting = ({
    accounts,
    newAccount,
    setNewAccount,
    addNewAccount,
    deleteAccount,
    t
}) => {
    useEffect(() => {
        try {
            console.log('Accounting: accounts prop ->', accounts);
        } catch (e) {
            console.error('Accounting logging failed', e);
        }
    }, [accounts]);

    const handleCodeChange = (e) => {
        const value = e.target.value;

        // Auto-suggest logic based on first digit - only suggest when user types first digit
        // and field was empty or just had that digit
        if (value.length === 1 && (newAccount.code === '' || newAccount.code === value[0])) {
            const firstDigit = value[0];
            if (firstDigit === '1') {
                // Asset accounts (1000-1999)
                const assetAccounts = accounts.filter(acc => acc.type === 'asset' && acc.code);
                if (assetAccounts.length > 0) {
                    const assetCodes = assetAccounts
                        .map(acc => parseInt(acc.code))
                        .filter(code => !isNaN(code) && code >= 1000 && code < 2000)
                        .sort((a, b) => b - a);
                    if (assetCodes.length > 0) {
                        const lastCode = assetCodes[0];
                        const suggestedCode = (lastCode + 1).toString();
                        // Auto-fill the suggested code only if user just typed '1'
                        setNewAccount({ ...newAccount, code: suggestedCode });
                        return;
                    }
                }
            } else if (firstDigit === '2') {
                // Liability accounts (2000-2999)
                const liabilityAccounts = accounts.filter(acc => acc.type === 'liability' && acc.code);
                if (liabilityAccounts.length > 0) {
                    const liabilityCodes = liabilityAccounts
                        .map(acc => parseInt(acc.code))
                        .filter(code => !isNaN(code) && code >= 2000 && code < 3000)
                        .sort((a, b) => b - a);
                    if (liabilityCodes.length > 0) {
                        const lastCode = liabilityCodes[0];
                        const suggestedCode = (lastCode + 1).toString();
                        // Auto-fill the suggested code only if user just typed '2'
                        setNewAccount({ ...newAccount, code: suggestedCode });
                        return;
                    }
                }
            }
        }

        // Allow normal editing for all other cases
        setNewAccount({ ...newAccount, code: value });
    };
    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 md:p-10 ${t.border}`}>
            <h2 className={`text-4xl font-bold ${t.secondaryAccent} mb-6`}>ADD NEW ACCOUNT</h2>
            <form onSubmit={addNewAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={`block text-lg font-mono mb-1 ${t.text}`} htmlFor="accCode">Account Code</label>
                        <input id="accCode" type="text" value={newAccount.code} onChange={handleCodeChange} placeholder="1050" className={`w-full px-3 py-2 border rounded-lg ${t.input}`} required />
                    </div>
                    <div>
                        <label className={`block text-lg font-mono mb-1 ${t.text}`} htmlFor="accName">Account Name</label>
                        <input id="accName" type="text" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="Sales" className={`w-full px-3 py-2 border rounded-lg ${t.input}`} required />
                    </div>
                    <div>
                        <label className={`block text-lg font-mono mb-1 ${t.text}`} htmlFor="accType">Account Type</label>
                        <select id="accType" value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${t.input}`}>
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${t.buttonPrimary}`}><Plus size={18} /> Add Account</button>
                </div>
            </form>
            <hr className="my-8 border-neutral-700" />
            <h3 className={`text-3xl font-bold ${t.secondaryAccent} mb-4`}>CHART OF ACCOUNTS</h3>
            <div className={`overflow-auto max-h-96 border ${t.border} rounded-lg`}>
                {accounts && accounts.length > 0 ? (
                    <table className="min-w-full divide-y divide-neutral-700">
                        <thead className={`${t.tableHeader} sticky top-0 z-10`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-lg font-mono uppercase">Code</th>
                                <th className="px-4 py-3 text-left text-lg font-mono uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-lg font-mono uppercase">Type</th>
                                <th className="px-4 py-3 text-right text-lg font-mono uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`${t.cardBg} divide-y divide-neutral-700/50`}>
                            {([...accounts].sort((a, b) => {
                                const A = Number(a.code);
                                const B = Number(b.code);
                                if (isNaN(A) && isNaN(B)) return 0;
                                if (isNaN(A)) return 1; // push non-numeric/missing codes to end
                                if (isNaN(B)) return -1;
                                return A - B;
                            })).map(acc => (
                                <tr key={acc.id} className={t.tableRow}>
                                    <td className={`px-4 py-2 text-lg ${t.text} font-mono`}>{acc.code != null ? String(acc.code) : ''}</td>
                                    <td className={`px-4 py-2 text-lg ${t.text} font-medium`}>{acc.name}</td>
                                    <td className={`px-4 py-2 text-lg ${t.text} capitalize`}>{acc.type}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            onClick={() => deleteAccount(acc.id)}
                                            className={`p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors`}
                                            title="Delete account"
                                        >
                                            <X size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={`p-6 text-center ${t.text}`}>No accounts found. Add an account above to get started.</div>
                )}
            </div>
        </div>
    );
};

export default Accounting;