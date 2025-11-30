import React, { useMemo } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';

const JournalEntryForm = ({
    newEntry,
    setNewEntry,
    accounts = [], // Default empty array for safety
    saveEntry,
    cancelForm,
    isAdjusting,
    isEditing,
    t = {} // Default empty object for theme safety
}) => {
    // Safely destructure newEntry and lines, defaulting to empty object/array
    const currentEntry = useMemo(() => newEntry || {}, [newEntry]);
    const currentLines = useMemo(
        () => currentEntry.lines || [],
        [currentEntry]
    );

    const title = isAdjusting
        ? (isEditing ? "Edit Adjusting Entry" : "New Adjusting Entry")
        : (isEditing ? "Edit Journal Entry" : "New Journal Entry");

    const updateEntry = (updates) => {
        setNewEntry({
            ...currentEntry,
            ...updates
        });
    };

    const updateLines = (lines) => {
        updateEntry({ lines });
    };

    const addLine = () => {
        // Ensure initial lines have the structure needed for the one-field amount logic
        const newLine = {
            accountId: '',
            accountName: '', // Holds the search/display text
            entryType: 'debit', // 'debit' | 'credit'
            debit: '',
            credit: ''
        };

        // Update lines with the new line added
        updateLines([...currentLines, newLine]);
    };

    const removeLine = (index) => {
        if (currentLines.length <= 2) return;
        updateLines(currentLines.filter((_, i) => i !== index));
    };

    // Account search text change
    const handleAccountTextChange = (index, value) => {
        const updatedLines = [...currentLines];
        const line = { ...updatedLines[index] };

        line.accountName = value;
        // while typing, clear selected account id to avoid mismatch
        line.accountId = '';

        updatedLines[index] = line;
        updateLines(updatedLines);
    };

    // When clicking a suggestion
    const handleAccountSelect = (index, account) => {
        const updatedLines = [...currentLines];
        const line = { ...updatedLines[index] };

        line.accountId = account.id;
        line.accountName = account.name;

        updatedLines[index] = line;
        updateLines(updatedLines);
    };

    // Clear account name/selection
    const clearAccountName = (index) => {
        const updatedLines = [...currentLines];
        const line = { ...updatedLines[index] };

        // Reset the account id and account name
        line.accountId = '';
        line.accountName = '';

        updatedLines[index] = line;
        updateLines(updatedLines);
    };

    // Change Debit/Credit type
    const handleEntryTypeChange = (index, value) => {
        const updatedLines = [...currentLines];
        const line = { ...updatedLines[index] };

        // Figure out current amount before switching
        const currentAmount = line.debit || line.credit || '';

        line.entryType = value;
        if (value === 'debit') {
            line.debit = currentAmount;
            line.credit = '';
        } else {
            line.credit = currentAmount;
            line.debit = '';
        }

        updatedLines[index] = line;
        updateLines(updatedLines);
    };

    // Amount input change (one field)
    const handleAmountChange = (index, value) => {
        const updatedLines = [...currentLines];
        const line = { ...updatedLines[index] };

        // Ensure value is a safe string representation of a number or empty
        const amountValue = value === '' ? '' : String(parseFloat(value) || '');

        // Update the corresponding field based on entryType
        if (line.entryType === 'credit') {
            line.credit = amountValue;
            line.debit = '';
        } else {
            line.debit = amountValue;
            line.credit = '';
        }

        updatedLines[index] = line;
        updateLines(updatedLines);
    };

    // Generate suggestions for all lines at once (memoized at top level)
    const linesSuggestions = useMemo(() => {
        return currentLines.map((line) => {
            const selectedAccount = accounts.find((acc) => acc.id === line.accountId);
            const searchText = line.accountName || selectedAccount?.name || '';
            const isAccountSelected = !!line.accountId;

            if (isAccountSelected || !searchText) {
                return [];
            }

            const term = searchText.toLowerCase();
            return accounts
                .filter(acc => acc.name.toLowerCase().includes(term) || String(acc.code).includes(term))
                .slice(0, 5);
        });
    }, [currentLines, accounts]);

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border}`}>
            <h2 className={`text-2xl font-bold ${t.secondaryAccent} mb-6`}>{title}</h2>

            {/* Date + Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-sm font-mono mb-1 ${t.text}`}>Date</label>
                    <input
                        type="date"
                        // FIX: Access safely
                        value={currentEntry.date || ''}
                        onChange={(e) => updateEntry({ date: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${t.input}`}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={`block text-sm font-mono mb-1 ${t.text}`} >
                        Description
                    </label>
                    <input
                        type="text"
                        // FIX: Access safely
                        value={currentEntry.description || ''}
                        onChange={(e) => updateEntry({ description: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${t.input}`}
                        placeholder="Entry description"
                    />
                </div>
            </div>

            {/* Lines */}
            <div className="space-y-4 mb-4">
                {currentLines.map((line, index) => {
                    const selectedAccount = accounts.find((acc) => acc.id === line.accountId);

                    // Prioritize line.accountName (user input/selection name)
                    const searchText = line.accountName || selectedAccount?.name || '';

                    // Determine if an account is successfully selected (ID is set)
                    const isAccountSelected = !!line.accountId;

                    const entryType =
                        line.entryType ||
                        (line.credit && !line.debit ? 'credit' : 'debit') ||
                        'debit';

                    const amount =
                        entryType === 'debit'
                            ? line.debit || ''
                            : line.credit || '';

                    // Use pre-computed suggestions from linesSuggestions
                    const suggestions = linesSuggestions[index] || [];

                    return (
                        <div
                            key={index}
                            className="relative grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                        >
                            {/* Account search with suggestions ABOVE input */}
                            <div className="md:col-span-6 relative">
                                {/* Suggestions container - Positioned ABOVE the input (bottom-full) */}
                                {suggestions.length > 0 && !isAccountSelected && (
                                    <div
                                        // FIX: Use theme variables and position ABOVE the input
                                        className={`absolute bottom-full mb-1 left-0 w-full z-20 rounded-xl ${t.cardBg} ${t.shadow} ${t.border} text-sm max-h-40 overflow-y-auto ring-2 ring-cyan-500/50`}
                                    >
                                        {suggestions.map((acc) => (
                                            <button
                                                key={acc.id}
                                                type="button"
                                                onClick={() =>
                                                    handleAccountSelect(
                                                        index,
                                                        acc
                                                    )
                                                }
                                                // FIX: Use theme text and better hover color
                                                className={`flex justify-between items-center w-full text-left py-2 px-3 ${t.text} hover:bg-cyan-700/30 transition-colors border-b ${t.border}`}
                                            >
                                                <span className="font-medium">{acc.name}</span>
                                                <span className="text-xs font-mono text-slate-400">{acc.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) =>
                                            handleAccountTextChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search account name or code"
                                        // Use extra padding for the icon
                                        className={`w-full px-3 py-2 pl-10 border rounded-lg transition-colors ${t.input} ${isAccountSelected ? 'font-medium text-cyan-400' : ''}`}
                                        // Prevent typing if selected, force use of clear button
                                        readOnly={isAccountSelected}
                                    />
                                    {/* Clear button (red cross) */}
                                    {isAccountSelected && (
                                        <button
                                            type="button"
                                            onClick={() => clearAccountName(index)}
                                            // FIX: Position the clear button correctly
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-red-500 hover:text-red-300 transition-colors p-1"
                                            title="Clear selected account"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Debit/Credit select */}
                            <div className="md:col-span-3">
                                <select
                                    value={entryType}
                                    onChange={(e) =>
                                        handleEntryTypeChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg ${t.input} text-sm`}
                                >
                                    <option value="debit">Debit</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>

                            {/* Amount input (one field) */}
                            <div className="md:col-span-2">
                                <input
                                    type='text'
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) =>
                                        handleAmountChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg ${t.input} text-right font-mono ${entryType === 'debit' ? 'text-lime-400' : 'text-cyan-400'}`}
                                />
                            </div>

                            {/* Remove line */}
                            <div className="md:col-span-1 flex items-end justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeLine(index)}
                                    disabled={currentLines.length <= 2}
                                    className="text-red-500 hover:text-red-300 disabled:text-slate-600 p-2 transition-colors"
                                    title="Remove line"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={addLine}
                    className={`flex items-center gap-2 px-4 py-2 ${t.buttonSecondary} rounded-lg transition-colors text-sm font-medium`}
                >
                    <Plus size={16} /> Add Line
                </button>

                <button
                    type="button"
                    onClick={saveEntry}
                    className={`flex items-center gap-2 px-6 py-2 ${t.buttonPrimary} rounded-lg transition-colors font-medium`}
                >
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                </button>

                <button
                    type="button"
                    onClick={cancelForm}
                    className={`flex items-center gap-2 px-6 py-2 ${t.buttonSecondary} rounded-lg transition-colors font-medium`}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default JournalEntryForm;
