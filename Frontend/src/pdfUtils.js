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
        const doc = initializePDF("Income Statement");
        let finalY = 30;

        const printSection = (title, accountsList, total, color, isExpense = false) => {
            doc.setFontSize(12);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(title, 14, finalY + 5);
            doc.setTextColor(0);
            finalY += 8;

            const bodyData = (accountsList || []).map(acc => [acc.name || '', isExpense ? `(${safeToFixed(balances[acc.id])})` : safeToFixed(balances[acc.id])]);

            autoTable(doc, {
                startY: finalY,
                head: [['Account', 'Amount ($)']],
                body: bodyData,
                theme: 'plain',
                headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: [0, 0, 0] },
                columnStyles: {
                    1: { halign: 'right' }, // Amount
                },
                foot: [['Total ' + title, isExpense ? `(${safeToFixed(total)})` : safeToFixed(total)]],
                footStyles: { fontStyle: 'bold', fillColor: [20, 20, 20], textColor: [255, 255, 255] },
                didDrawPage: (data) => { finalY = data.cursor.y; }
            });
            finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 5 : finalY + 5;
        };

        const revenueAccounts = (accounts || []).filter(acc => acc.type === 'revenue' && safeNum(balances[acc.id]) !== 0);
        printSection('REVENUE', revenueAccounts, revenue, [77, 182, 172]); // Teal-ish

        const expenseAccounts = (accounts || []).filter(acc => acc.type === 'expense' && safeNum(balances[acc.id]) !== 0);
        printSection('EXPENSES', expenseAccounts, expenses, [244, 67, 54], true); // Red-ish

        // Net Income Summary
        doc.setFontSize(14);
        doc.text('NET INCOME', 14, finalY + 5);
        doc.setTextColor(netIncome >= 0 ? 0 : 255, netIncome >= 0 ? 150 : 0, netIncome >= 0 ? 136 : 0); // Green/Red
        doc.text(`$${safeToFixed(netIncome)}`, 190, finalY + 5, null, null, 'right');

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
        const totalLiabilitiesAndEquity = safeNum(totalLiabilities) + safeNum(totalEquity);
        const doc = initializePDF("Balance Sheet");
        let finalY = 30;

        // Build lists like BalanceSheet.jsx
        const assetAccounts = accounts.filter(a => a.type === 'asset' && balances[a.id] !== 0);
        const liabilityAccounts = accounts.filter(a => a.type === 'liability' && balances[a.id] !== 0);
        const equityAccounts = accounts.filter(a => a.type === 'equity' && balances[a.id] !== 0);

        const assetRows = assetAccounts.map(acc => ({
            name: acc.name || '',
            amount: `$${safeToFixed(balances[acc.id])}`,
        }));

        // Right side: Liabilities section + subtotal, then Equity section + Net Income (like BalanceSheet.jsx)
        const rightSideRows = [];

        if (liabilityAccounts.length > 0) {
            rightSideRows.push({ name: 'Liabilities', amount: '', _section: 'header' });
            liabilityAccounts.forEach(acc => {
                rightSideRows.push({
                    name: acc.name || '',
                    amount: `$${safeToFixed(balances[acc.id])}`,
                    _section: 'liability',
                });
            });
            rightSideRows.push({
                name: 'Total Liabilities',
                amount: `$${safeToFixed(totalLiabilities)}`,
                _section: 'subtotalLiabilities',
            });
        }

        if (equityAccounts.length > 0 || safeNum(netIncome) !== 0) {
            rightSideRows.push({ name: 'Equity', amount: '', _section: 'header' });
            equityAccounts.forEach(acc => {
                rightSideRows.push({
                    name: acc.name || '',
                    amount: `$${safeToFixed(balances[acc.id])}`,
                    _section: 'equity',
                });
            });
            rightSideRows.push({
                name: 'Net Income',
                amount: `$${safeToFixed(netIncome)}`,
                _section: 'netIncome',
            });
        }

        const maxRows = Math.max(assetRows.length, rightSideRows.length);
        const bodyData = [];
        for (let i = 0; i < maxRows; i++) {
            const left = assetRows[i] || {};
            const right = rightSideRows[i] || {};
            bodyData.push([
                left.name || '',
                left.amount || '',
                right.name || '',
                right.amount || '',
            ]);
        }

        // 2-column layout table: left = Assets, right = Liabilities & Equity
        autoTable(doc, {
            startY: finalY,
            head: [['ASSETS', 'Amount ($)', 'LIABILITIES & EQUITY', 'Amount ($)']],
            body: bodyData,
            theme: 'plain',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10, textColor: [0, 0, 0] },
            columnStyles: {
                1: { halign: 'right' }, // Left amount
                3: { halign: 'right' }, // Right amount
            },
            bodyStyles: { textColor: [0, 0, 0] },
            didParseCell: (data) => {
                const { section, column, row } = data;
                if (section !== 'body') return;

                const rowMeta = rightSideRows[row.index];
                // Bold for section headers "Liabilities" / "Equity" in right name column
                if (rowMeta && rowMeta._section === 'header' && column.index === 2) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            foot: [[
                'Total Assets',
                `$${safeToFixed(totalAssets)}`,
                'Total Liabilities & Equity',
                `$${safeToFixed(totalLiabilitiesAndEquity)}`,
            ]],
            footStyles: { fontStyle: 'bold', fillColor: [235], textColor: [0] },
            didDrawPage: (data) => { finalY = data.cursor.y; }
        });

        // Draw a vertical separator line between left (Assets) and right (Liabilities & Equity)
        const pageWidth = doc.internal.pageSize.getWidth();
        const midX = pageWidth / 2;
        const lastTable = doc.previousAutoTable;
        if (lastTable) {
            const topY = lastTable.startY;
            const bottomY = lastTable.finalY;
            doc.setDrawColor(148, 163, 184); // slate-400-ish
            doc.setLineWidth(0.3);
            doc.line(midX, topY, midX, bottomY);
        }

        doc.save("Balance_Sheet.pdf");
    } catch (err) {
        console.error('[downloadBalanceSheetPDF] Error generating PDF', err);
        alert('Failed to generate Balance Sheet PDF. See console for details.');
    }
};