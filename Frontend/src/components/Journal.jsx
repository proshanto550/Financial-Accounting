import React from 'react';
import { PlusCircle } from 'lucide-react';
import JournalEntryForm from './JournalEntryForm';
import JournalList from './JournalList';

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
    const isEditing = !!editingEntry && (editingEntry.isAdjusting === isAdjusting); // Determine if the CURRENT entry being edited is for this tab

    const cancelForm = () => { resetForm(); setShowForm(false); };

    return (
        <div className={`rounded-xl ${t.cardBg} ${t.shadow} p-6 ${t.border}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${t.secondaryAccent}`}>{title}</h2>
                {/* Reset form before showing the new entry form */}
                <button onClick={() => { resetForm(); setShowForm(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${t.buttonPrimary}`}><PlusCircle size={18} /> New Entry</button>
            </div>

            {showForm && (isEditing || !editingEntry) ? ( // Only show form if no conflicting entry is being edited
                <JournalEntryForm
                    newEntry={newEntry}
                    setNewEntry={setNewEntry}
                    accounts={accounts}
                    saveEntry={saveEntry}
                    cancelForm={cancelForm}
                    isAdjusting={isAdjusting}
                    isEditing={isEditing} // <-- PASS isEditing
                    t={t}
                />
            ) : (
                <JournalList
                    entries={entries}
                    accounts={accounts}
                    t={t}
                    editEntry={editEntry}       // <-- PASS HANDLER
                    deleteEntry={deleteEntry}   // <-- PASS HANDLER
                    isAdjusting={isAdjusting}   // <-- PASS CONTEXT
                />
            )}
        </div>
    );
};

export default Journal;