import React from 'react';
import { PlusCircle } from 'lucide-react';
import JournalEntryForm from './JournalEntryForm';
import JournalList from './JournalList';
import { downloadJournalPDF } from '../pdfUtils';

const Journal = ({
    isAdjusting,
    entries,
    showForm,
    setShowForm,
    newEntry,
    setNewEntry,
    accounts,
    saveJournalEntry,
    saveAdjustingEntry,
    resetForm,
    editEntry,
    deleteEntry,
    editingEntry,
    t
}) => {
    const title = isAdjusting ? "ADJUSTING ENTRIES" : "JOURNAL ENTRIES";
    const saveEntry = isAdjusting ? saveAdjustingEntry : saveJournalEntry;
    const isEditing = !!editingEntry && (editingEntry.isAdjusting === isAdjusting);

    const cancelForm = () => { resetForm(); setShowForm(false); };

    // Function to pass to JournalList
    const handleDownloadPDF = () => {
        downloadJournalPDF(entries, accounts, isAdjusting);
    };

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${t.secondaryAccent}`}>{title}</h2>
                {/* Reset form before showing the new entry form */}
                <button onClick={() => { resetForm(); setShowForm(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${t.buttonPrimary}`}><PlusCircle size={18} /> New Entry</button>
            </div>

            {showForm ? (
                <JournalEntryForm
                    newEntry={newEntry}
                    setNewEntry={setNewEntry}
                    accounts={accounts}
                    saveEntry={saveEntry}
                    cancelForm={cancelForm}
                    isAdjusting={isAdjusting}
                    isEditing={isEditing}
                    t={t}
                />
            ) : (
                <JournalList
                    entries={entries}
                    accounts={accounts}
                    t={t}
                    editEntry={editEntry}
                    deleteEntry={deleteEntry}
                    isAdjusting={isAdjusting}
                    downloadPDF={handleDownloadPDF} // Pass the download handler
                />
            )}
        </div>
    );
};

export default Journal;