// Frontend/src/pdfUtils.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Reusable function to set common PDF styles
const initializePDF = (title) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20); // Title
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.setTextColor(0); // Reset text color
    return doc;
};

// Safe number helpers
const safeNum = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
};

const safeToFixed = (val, dp = 2) => {
    return safeNum(val).toFixed(dp);
};

// --- 1. JOURNAL LIST PDF GENERATOR ---
export const downloadJournalPDF = (entries, accounts, isAdjusting) => {
    try {
        const title = isAdjusting ? "Adjusting Journal Entries" : "General Journal Entries";
        const doc = initializePDF(title);
        let finalY = 30; // Starting Y position for the first table

        (entries || []).forEach((entry) => {
            const bodyData = (entry.lines || []).map(line => {
                const account = (accounts || []).find(a => a.id === parseInt(line.accountId || line.account_id));
                return [
                    account ? account.name : 'Unknown',
                    line.description || entry.description || '-',
                    line.debit ? safeToFixed(line.debit) : '',
                    line.credit ? safeToFixed(line.credit) : ''
                ];
            });

            doc.setFontSize(12);
            doc.text(`Date: ${entry.date} (Entry ID: ${entry.id})`, 14, finalY + 5);
            finalY += 8;

            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Description', 'Debit ($)', 'Credit ($)']],
                body: bodyData,
                theme: 'striped',
                headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: [0, 0, 0] },
                columnStyles: {
                    2: { halign: 'right' }, // Debit
                    3: { halign: 'right' }, // Credit
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });

            // Add some space after the entry
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 5 : finalY + 5;
        });

        doc.save(`${title.replace(/ /g, '_')}.pdf`);
    } catch (err) {
        console.error('[downloadJournalPDF] Error generating PDF', err);
        alert('Failed to generate Journal PDF. See console for details.');
    }
};


// --- 2. LEDGER PDF GENERATOR (Complex) ---
export const downloadLedgerPDF = (accounts, allEntries, balances) => {
    try {
        const doc = initializePDF("General Ledger");
        let finalY = 30;

        (accounts || []).forEach(account => {
            const relevantEntries = (allEntries || [])
                .flatMap(entry =>
                    (entry.lines || [])
                        .filter(line => parseInt(line.accountId || line.account_id) === account.id)
                        .map(line => ({
                            ...line,
                            date: entry.date,
                            description: entry.description,
                        }))
                )
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (relevantEntries.length === 0 && safeNum(balances?.[account.id]) === 0) return;

            const bodyData = relevantEntries.map(line => [
                line.date,
                line.description || '-',
                safeToFixed(line.debit || 0),
                safeToFixed(line.credit || 0),
            ]);

            const totalBalance = safeNum(balances?.[account.id]);

            // Print Account Name (hide account code)
            doc.setFontSize(14);
            doc.text(`${account.name || ''} (${(account.type || '').toUpperCase()})`, 14, finalY + 5);
            finalY += 8;

            autoTable(doc, {
                startY: finalY,
                head: [['Date', 'Description', 'Debit ($)', 'Credit ($)']],
                body: bodyData,
                theme: 'grid',
                headStyles: { fillColor: [2, 132, 199], fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: [0, 0, 0] },
                columnStyles: {
                    2: { halign: 'right' }, // Debit
                    3: { halign: 'right' }, // Credit / Closing balance
                },
                foot: [['', 'Closing Balance:', '', safeToFixed(totalBalance)]],
                footStyles: { fontStyle: 'bold' },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : finalY + 10;
            // Check if a new page is needed
            if (finalY > 280) { // Standard page height check
                doc.addPage();
                finalY = 20;
            }
        });

        doc.save("General_Ledger.pdf");
    } catch (err) {
        console.error('[downloadLedgerPDF] Error generating PDF', err);
        alert('Failed to generate Ledger PDF. See console for details.');
    }
};


// --- 3. TRIAL BALANCE PDF GENERATOR ---
export const downloadTrialBalancePDF = (trialBalanceData) => {
    try {
        const { data, totalDebits, totalCredits } = trialBalanceData || { data: [], totalDebits: 0, totalCredits: 0 };
        const doc = initializePDF("Trial Balance");

        const bodyData = (data || []).map(item => [
            `${item.account?.name || ''}`,
            safeToFixed(item.debit || 0),
            safeToFixed(item.credit || 0)
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Account Name', 'Debit ($)', 'Credit ($)']],
            body: bodyData,
            foot: [['TOTALS:', safeToFixed(totalDebits), safeToFixed(totalCredits)]],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            footStyles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] },
            styles: { fontSize: 10, textColor: [0, 0, 0] },
            columnStyles: {
                1: { halign: 'right' }, // Debit
                2: { halign: 'right' }, // Credit
            },
        });

        doc.save("Trial_Balance.pdf");
    } catch (err) {
        console.error('[downloadTrialBalancePDF] Error generating PDF', err);
        alert('Failed to generate Trial Balance PDF. See console for details.');
    }
};


// --- 4. INCOME STATEMENT PDF GENERATOR ---
export const downloadIncomeStatementPDF = (accounts, balances, incomeStatement) => {
    try {
        const { revenue = 0, expenses = 0, netIncome = 0 } = incomeStatement || {};
        const doc = new jsPDF();

        // Set white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

        // Title - matching web structure
        doc.setFontSize(24);
        doc.setTextColor(6, 182, 212); // cyan-400
        doc.setFont(undefined, 'bold');
        doc.text('INCOME STATEMENT', 105, 20, { align: 'center' });

        // Date
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // black
        doc.setFont(undefined, 'normal');
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        let finalY = 40;

        // Revenue Section - matching web structure
        doc.setFontSize(18);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.setFont(undefined, 'bold');
        doc.text('REVENUE', 14, finalY);
        finalY += 8;

        const revenueAccounts = (accounts || []).filter(acc => acc.type === 'revenue' && safeNum(balances[acc.id]) !== 0);

        if (revenueAccounts.length === 0) {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'italic');
            doc.text('No revenue recorded', 14, finalY);
            finalY += 6;
        } else {
            const revenueData = revenueAccounts.map(acc => [
                acc.name || '',
                `$${safeToFixed(balances[acc.id])}`
            ]);

            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: revenueData,
                theme: 'plain',
                headStyles: {
                    fillColor: [230, 230, 230], // light gray
                    textColor: [0, 0, 0], // black text
                    fontStyle: 'bold',
                    fontSize: 11
                },
                styles: {
                    fontSize: 10,
                    textColor: [0, 0, 0], // black text
                    cellPadding: 3
                },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 3 : finalY + 3;
        }

        // Total Revenue
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Total Revenue', 14, finalY + 5);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.text(`$${safeToFixed(revenue)}`, 190, finalY + 5, { align: 'right' });
        finalY += 20;

        // Expenses Section - matching web structure
        doc.setFontSize(18);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.setFont(undefined, 'bold');
        doc.text('EXPENSES', 14, finalY);
        finalY += 8;

        const expenseAccounts = (accounts || []).filter(acc => acc.type === 'expense' && safeNum(balances[acc.id]) !== 0);

        if (expenseAccounts.length === 0) {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'italic');
            doc.text('No expenses recorded', 14, finalY);
            finalY += 6;
        } else {
            const expenseData = expenseAccounts.map(acc => [
                acc.name || '',
                `($${safeToFixed(balances[acc.id])})`
            ]);

            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: expenseData,
                theme: 'plain',
                headStyles: {
                    fillColor: [230, 230, 230], // light gray
                    textColor: [0, 0, 0], // black text
                    fontStyle: 'bold',
                    fontSize: 11
                },
                styles: {
                    fontSize: 10,
                    textColor: [0, 0, 0], // black text
                    cellPadding: 3
                },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 3 : finalY + 3;
        }

        // Total Expenses
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Total Expenses', 14, finalY + 5);
        doc.setTextColor(248, 113, 113); // red-400
        doc.text(`($${safeToFixed(expenses)})`, 190, finalY + 5, { align: 'right' });
        finalY += 15;

        // Net Income - matching web structure
        doc.setFontSize(18);
        doc.setTextColor(6, 182, 212); // cyan-400
        doc.setFont(undefined, 'bold');
        doc.text('Net Income', 14, finalY);
        doc.setTextColor(netIncome >= 0 ? 163 : 248, netIncome >= 0 ? 230 : 113, netIncome >= 0 ? 53 : 113); // lime-400 or red-400
        doc.text(`$${safeToFixed(netIncome)}`, 190, finalY, { align: 'right' });

        doc.save("Income_Statement.pdf");
    } catch (err) {
        console.error('[downloadIncomeStatementPDF] Error generating PDF', err);
        alert('Failed to generate Income Statement PDF. See console for details.');
    }
};


// --- 5. BALANCE SHEET PDF GENERATOR ---
export const downloadBalanceSheetPDF = (accounts, balances, totals, incomeStatement) => {
    try {
        const { totalAssets = 0, totalLiabilities = 0, totalEquity = 0 } = totals || {};
        const netIncome = safeNum(incomeStatement?.netIncome);
        const totalEquityAndLiabilities = safeNum(totalLiabilities) + safeNum(totalEquity);
        const doc = new jsPDF();

        // Set white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

        // Title - matching web structure
        doc.setFontSize(24);
        doc.setTextColor(6, 182, 212); // cyan-400
        doc.setFont(undefined, 'bold');
        doc.text('BALANCE SHEET', 105, 20, { align: 'center' });

        // Date
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // black
        doc.setFont(undefined, 'normal');
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        let finalY = 40;

        // Build lists like BalanceSheet.jsx
        const assetAccounts = (accounts || []).filter(a => a.type === 'asset' && safeNum(balances[a.id]) !== 0);
        const liabilityAccounts = (accounts || []).filter(a => a.type === 'liability' && safeNum(balances[a.id]) !== 0);
        const equityAccounts = (accounts || []).filter(a => a.type === 'equity' && safeNum(balances[a.id]) !== 0);

        // ASSETS Section - matching web structure
        doc.setFontSize(18);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.setFont(undefined, 'bold');
        doc.text('ASSETS', 14, finalY);
        finalY += 8;

        const assetData = assetAccounts.map(acc => [
            acc.name || '',
            `$${safeToFixed(balances[acc.id])}`
        ]);

        if (assetData.length > 0) {
            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: assetData,
                theme: 'plain',
                headStyles: {
                    fillColor: [230, 230, 230], // light gray
                    textColor: [0, 0, 0], // black text
                    fontStyle: 'bold',
                    fontSize: 11
                },
                styles: {
                    fontSize: 10,
                    textColor: [0, 0, 0], // black text
                    cellPadding: 3
                },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 3 : finalY + 3;
        }

        // Total Assets
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Total Assets', 14, finalY + 5);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.text(`$${safeToFixed(totalAssets)}`, 190, finalY + 5, { align: 'right' });
        finalY += 15;

        // LIABILITIES & EQUITY Section - matching web structure
        doc.setFontSize(18);
        doc.setTextColor(6, 182, 212); // cyan-400
        doc.setFont(undefined, 'bold');
        doc.text('LIABILITIES & EQUITY', 14, finalY);
        finalY += 8;

        // Liabilities subsection
        doc.setFontSize(14);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.setFont(undefined, 'bold');
        doc.text('Liabilities', 14, finalY);
        finalY += 6;

        const liabilityData = liabilityAccounts.map(acc => [
            acc.name || '',
            `$${safeToFixed(balances[acc.id])}`
        ]);

        if (liabilityData.length > 0) {
            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: liabilityData,
                theme: 'plain',
                headStyles: {
                    fillColor: [230, 230, 230], // light gray
                    textColor: [0, 0, 0], // black text
                    fontStyle: 'bold',
                    fontSize: 11
                },
                styles: {
                    fontSize: 10,
                    textColor: [0, 0, 0], // black text
                    cellPadding: 3
                },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 3 : finalY + 3;
        }

        // Total Liabilities
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Total Liabilities', 14, finalY + 5);
        doc.text(`$${safeToFixed(totalLiabilities)}`, 190, finalY + 5, { align: 'right' });
        finalY += 12;

        // Equity subsection
        doc.setFontSize(14);
        doc.setTextColor(163, 230, 53); // lime-400
        doc.setFont(undefined, 'bold');
        doc.text('Equity', 14, finalY);
        finalY += 6;

        const equityData = equityAccounts.map(acc => [
            acc.name || '',
            `$${safeToFixed(balances[acc.id])}`
        ]);

        // Add Net Income to equity data
        equityData.push(['Net Income', `$${safeToFixed(netIncome)}`]);

        if (equityData.length > 0) {
            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: equityData,
                theme: 'plain',
                headStyles: {
                    fillColor: [230, 230, 230], // light gray
                    textColor: [0, 0, 0], // black text
                    fontStyle: 'bold',
                    fontSize: 11
                },
                styles: {
                    fontSize: 10,
                    textColor: [0, 0, 0], // black text
                    cellPadding: 3
                },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 3 : finalY + 3;
        }

        // Total Liabilities & Equity
        doc.setFontSize(14);
        doc.setTextColor(6, 182, 212); // cyan-400
        doc.setFont(undefined, 'bold');
        doc.text('Total Liabilities & Equity', 14, finalY + 5);
        doc.text(`$${safeToFixed(totalEquityAndLiabilities)}`, 190, finalY + 5, { align: 'right' });
        finalY += 12;

        // Equation Check - matching web structure
        const isBalanced = Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (isBalanced) {
            doc.setTextColor(163, 230, 53); // lime-400
            doc.text('Equation Check: Assets = Liabilities + Equity (OK)', 14, finalY + 5);
        } else {
            doc.setTextColor(248, 113, 113); // red-400
            doc.text(`Warning: Assets ($${safeToFixed(totalAssets)}) do not equal L + E ($${safeToFixed(totalEquityAndLiabilities)})`, 14, finalY + 5);
        }

        doc.save("Balance_Sheet.pdf");
    } catch (err) {
        console.error('[downloadBalanceSheetPDF] Error generating PDF', err);
        alert('Failed to generate Balance Sheet PDF. See console for details.');
    }
};