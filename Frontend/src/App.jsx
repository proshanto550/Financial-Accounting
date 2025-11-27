import React, { useState, useMemo } from 'react';
import './App.css';
import { Sun, Moon, Zap, LogOut } from 'lucide-react';
import Footer from './components/Footer';

// Import Components
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Accounting from './components/Accounting';
import Journal from './components/Journal';
import GeneralLedger from './components/GeneralLedger';
import TrialBalance from './components/TrialBalance';
import IncomeStatement from './components/IncomeStatement';
import BalanceSheet from './components/BalanceSheet';
// import { Footer } from './components/Utils';

// Main Component
const SmartAccountingManager = () => {
  // Theme State
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [journalEntries, setJournalEntries] = useState([]);
  const [adjustingEntries, setAdjustingEntries] = useState([]);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showAdjustingForm, setShowAdjustingForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // <-- NEW: State for the entry being edited
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [accounts, setAccounts] = useState([
    { id: 1, code: '1000', name: 'Cash', type: 'asset', balance: 0 },
    { id: 2, code: '1001', name: 'Accounts Receivable', type: 'asset', balance: 0 },
    { id: 3, code: '1002', name: 'Inventory', type: 'asset', balance: 0 },
    { id: 4, code: '1003', name: 'Bank', type: 'asset', balance: 0 },
    { id: 5, code: '1004', name: 'Furniture', type: 'asset', balance: 0 },
    { id: 6, code: '1005', name: 'Equipment', type: 'asset', balance: 0 },
    { id: 7, code: '1006', name: 'Land', type: 'asset', balance: 0 },
    { id: 8, code: '1007', name: 'Investments', type: 'asset', balance: 0 },
    { id: 9, code: '1008', name: 'Prepaid Expense', type: 'asset', balance: 0 },
    { id: 10, code: '1009', name: 'Supplies', type: 'asset', balance: 0 },
    { id: 11, code: '2000', name: 'Accounts Payable', type: 'liability', balance: 0 },
    { id: 12, code: '2001', name: 'Bank Loan', type: 'liability', balance: 0 },
    { id: 13, code: '2002', name: 'Unearned Revenue', type: 'liability', balance: 0 },
    { id: 14, code: '2003', name: 'Debt Payable', type: 'liability', balance: 0 },
    { id: 15, code: '2004', name: 'Sales Tax', type: 'liability', balance: 0 },
    { id: 16, code: '2005', name: 'Income Tax', type: 'liability', balance: 0 },
    { id: 17, code: '2006', name: 'Income Tax Payable', type: 'liability', balance: 0 },
    { id: 18, code: '2007', name: 'Accrued Expense', type: 'liability', balance: 0 },
    { id: 19, code: '2008', name: 'Interest Payable', type: 'liability', balance: 0 },
    { id: 20, code: '2009', name: 'Notes Payable', type: 'liability', balance: 0 },
    { id: 21, code: '2010', name: 'Wages Payable', type: 'liability', balance: 0 },
    { id: 22, code: '3000', name: 'Capital', type: 'equity', balance: 0 },
    { id: 23, code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 0 },
    { id: 24, code: '4001', name: 'Interest Revenue', type: 'revenue', balance: 0 },
    { id: 25, code: '4002', name: 'Rent Revenue', type: 'revenue', balance: 0 },
    { id: 26, code: '4003', name: 'Service Revenue', type: 'revenue', balance: 0 },
    { id: 27, code: '5000', name: 'Cost of Goods Sold', type: 'expense', balance: 0 },
    { id: 28, code: '5001', name: 'Rent Expense', type: 'expense', balance: 0 },
    { id: 29, code: '5002', name: 'Utilities Expense', type: 'expense', balance: 0 },
    { id: 30, code: '5003', name: 'Advertising', type: 'expense', balance: 0 },
    { id: 31, code: '5004', name: 'Depreciation Expense', type: 'expense', balance: 0 },
    { id: 32, code: '5005', name: 'Insurance', type: 'expense', balance: 0 },
    { id: 33, code: '5006', name: 'Taxes', type: 'expense', balance: 0 },
    { id: 34, code: '5007', name: 'Office Supplies', type: 'expense', balance: 0 },
    { id: 35, code: '5008', name: 'Wages Expense', type: 'expense', balance: 0 },
    { id: 36, code: '5009', name: 'Bad Debt Expense', type: 'expense', balance: 0 },
    { id: 37, code: '5010', name: 'Salary Expense', type: 'expense', balance: 0 },
  ]);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { accountId: '', debit: '', credit: '' },
      { accountId: '', debit: '', credit: '' }
    ]
  });

  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'asset',
  });

  // --- Styling Definitions ---
  const themeClasses = {
    dark: {
      bg: 'bg-neutral-900',
      text: 'text-slate-100',
      cardBg: 'bg-neutral-800',
      border: 'border-cyan-700/50',
      accent: 'text-lime-400',
      secondaryAccent: 'text-cyan-400',
      shadow: 'shadow-lg shadow-black/50',
      input: 'bg-neutral-700 border-neutral-600 text-white focus:ring-cyan-500 focus:border-cyan-500',
      tableHeader: 'bg-neutral-700 text-slate-300',
      tableRow: 'even:bg-neutral-800/80 hover:bg-neutral-700/70',
      buttonPrimary: 'bg-lime-600 text-white hover:bg-lime-500 shadow-lg shadow-lime-900/20',
      buttonSecondary: 'bg-neutral-700 text-slate-300 hover:bg-neutral-600',
    },
    light: {
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      cardBg: 'bg-white',
      border: 'border-blue-100',
      accent: 'text-blue-600',
      secondaryAccent: 'text-cyan-600',
      shadow: 'shadow-xl shadow-blue-200/50',
      input: 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 focus:border-blue-500',
      tableHeader: 'bg-blue-50 text-slate-700',
      tableRow: 'even:bg-slate-100 hover:bg-blue-50',
      buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50',
      buttonSecondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    }
  };
  const t = themeClasses[theme];

  // --- Auth & Account Logic ---
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const resetForm = () => {
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      lines: [{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }]
    });
    setEditingEntry(null); // <-- UPDATED: Reset editing state
    setShowJournalForm(false);
    setShowAdjustingForm(false);
  };

  const validateEntry = (entry) => {
    // Check if description exists
    if (!entry.description || !entry.date) return false;

    // Check if Debits equals Credits and lines are valid
    let totalDebits = 0, totalCredits = 0;
    let validLineCount = 0;

    entry.lines.forEach(line => {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      totalDebits += debit;
      totalCredits += credit;

      if (line.accountId && (debit > 0 || credit > 0)) {
        validLineCount++;
      }
    });

    // Must have at least two valid lines and balance must equal zero
    return Math.abs(totalDebits - totalCredits) < 0.01 && validLineCount >= 2;
  };

  // --- NEW: Unified Save/Update Logic ---
  const saveEntryHandler = (isAdjusting) => {
    const setEntries = isAdjusting ? setAdjustingEntries : setJournalEntries;
    const entries = isAdjusting ? adjustingEntries : journalEntries;

    if (!validateEntry(newEntry)) {
      alert("Validation Error: Please ensure Debits equal Credits, you have at least 2 lines, and all required fields are filled.");
      return;
    }

    if (editingEntry) {
      // EDIT LOGIC: Find the old entry and replace it
      setEntries(entries.map(e => e.id === editingEntry.id ? { ...newEntry, id: editingEntry.id } : e));
    } else {
      // NEW ENTRY LOGIC: Add a new entry
      setEntries([...entries, { ...newEntry, id: Date.now() }]);
    }

    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
    resetForm();
  };

  const saveJournalEntry = () => saveEntryHandler(false);
  const saveAdjustingEntry = () => saveEntryHandler(true);

  // --- NEW: Edit Handler ---
  const editEntry = (entry, isAdjusting) => {
    // 1. Load the entry data into the form state
    setNewEntry({
      date: entry.date,
      description: entry.description,
      // Deep copy the lines to avoid modifying state directly
      lines: entry.lines.map(line => ({ ...line }))
    });

    // 2. Store the entry object ID to know which one to update later
    setEditingEntry({ id: entry.id, isAdjusting });

    // 3. Open the correct form and switch tab if necessary
    if (isAdjusting) {
      setShowAdjustingForm(true);
      setActiveTab('adjusting');
    } else {
      setShowJournalForm(true);
      setActiveTab('journal');
    }
  };

  // --- NEW: Delete Handler ---
  const deleteEntry = (id, isAdjusting) => {

    const setEntries = isAdjusting ? setAdjustingEntries : setJournalEntries;
    const entries = isAdjusting ? adjustingEntries : journalEntries;

    // Filter out the entry with the given id
    setEntries(entries.filter(e => e.id !== id));

    // If the deleted entry was the one being edited, reset the form
    if (editingEntry && editingEntry.id === id) {
      resetForm();
    }
    setShowDeleteAlert(true);
    setTimeout(() => setShowDeleteAlert(false), 3000);
  };

  const addNewAccount = (e) => {
    e.preventDefault();
    if (!newAccount.code || !newAccount.name) return;
    setAccounts([...accounts, { ...newAccount, id: Date.now(), balance: 0 }]);
    setNewAccount({ code: '', name: '', type: 'asset' });
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  // --- Core Accounting Calculations (Memoized) ---
  const { balances, getTotalAssets, getTotalLiabilities, getTotalEquity, incomeStatement, trialBalanceData } = useMemo(() => {
    const calculateBalances = () => {
      const balances = {};
      accounts.forEach(acc => { balances[acc.id] = 0; });
      [...journalEntries, ...adjustingEntries].forEach(entry => {
        entry.lines.forEach(line => {
          const account = accounts.find(a => a.id === parseInt(line.accountId));
          if (!account) return;
          const debit = parseFloat(line.debit) || 0;
          const credit = parseFloat(line.credit) || 0;
          if (account.type === 'asset' || account.type === 'expense') {
            balances[account.id] += debit - credit;
          } else {
            balances[account.id] += credit - debit;
          }
        });
      });
      return balances;
    };

    const currentBalances = calculateBalances();

    const getTotalAssets = () => accounts.filter(acc => acc.type === 'asset').reduce((sum, acc) => sum + (currentBalances[acc.id] || 0), 0);
    const getTotalLiabilities = () => accounts.filter(acc => acc.type === 'liability').reduce((sum, acc) => sum + (currentBalances[acc.id] || 0), 0);

    const getIncomeStatement = () => {
      let totalRevenue = 0, totalExpenses = 0;
      accounts.forEach(account => {
        const balance = currentBalances[account.id] || 0;
        if (account.type === 'revenue') totalRevenue += balance;
        else if (account.type === 'expense') totalExpenses += balance;
      });
      return { revenue: totalRevenue, expenses: totalExpenses, netIncome: totalRevenue - totalExpenses };
    };
    const currentIncomeStatement = getIncomeStatement();

    const getTotalEquity = () => {
      const equityAccounts = accounts.filter(acc => acc.type === 'equity').reduce((sum, acc) => sum + (currentBalances[acc.id] || 0), 0);
      return equityAccounts + (currentIncomeStatement.netIncome || 0);
    };

    const getTrialBalance = () => {
      let totalDebits = 0;
      let totalCredits = 0;
      const trialBalanceData = [];
      const allEntries = [...journalEntries, ...adjustingEntries];
      const accountsWithActivity = new Set(allEntries.flatMap(entry => entry.lines.map(line => parseInt(line.accountId))));

      accounts.forEach(account => {
        const balance = currentBalances[account.id] || 0;
        let debitBalance = 0;
        let creditBalance = 0;
        const hasActivity = accountsWithActivity.has(account.id);
        const hasNonZeroBalance = Math.abs(balance) > 0.01;

        if (!hasActivity && !hasNonZeroBalance) return;

        if (balance > 0) {
          if (account.type === 'asset' || account.type === 'expense') debitBalance = balance;
          else creditBalance = balance;
        } else if (balance < 0) {
          if (account.type === 'asset' || account.type === 'expense') creditBalance = Math.abs(balance);
          else debitBalance = Math.abs(balance);
        }

        if (debitBalance !== 0 || creditBalance !== 0 || hasActivity) {
          trialBalanceData.push({ account, debit: debitBalance, credit: creditBalance });
          totalDebits += debitBalance;
          totalCredits += creditBalance;
        }
      });
      return { data: trialBalanceData, totalDebits, totalCredits };
    };

    return {
      balances: currentBalances,
      getTotalAssets,
      getTotalLiabilities,
      getTotalEquity,
      incomeStatement: currentIncomeStatement,
      trialBalanceData: getTrialBalance()
    };
  }, [accounts, journalEntries, adjustingEntries]);


  // --- Main Render Decision ---

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} t={t} />;
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-900' : 'bg-slate-100'} min-h-screen font-sans`}>
      <div className={`flex flex-col md:flex-row max-w-full mx-auto`}>

        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen flex flex-col">

          {/* Header */}
          <header className={`flex justify-between items-center p-4 ${t.cardBg} ${t.text} border-b ${t.border}`}>
            <div className="text-xl font-bold text-cyan-400 hidden sm:block">{activeTab.toUpperCase().replace('_', ' ')}</div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-sm font-mono text-slate-400 hidden sm:inline mr-4">{new Date().toDateString()}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-neutral-700 text-lime-400' : 'bg-blue-100 text-blue-600'}`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline font-medium">{user?.name}</span>
              </div>

              <div className={`h-6 w-px ${theme === 'dark' ? 'bg-neutral-700' : 'bg-slate-300'}`}></div>

              <button onClick={toggleTheme} className={`p-2 rounded-full ${t.buttonSecondary} transition-colors`} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-slate-500" />}
              </button>

              <button onClick={handleLogout} className={`p-2 rounded-full ${t.buttonSecondary} text-red-400 hover:bg-red-900/20 hover:text-red-400 transition-colors`} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {showSuccessAlert && (
              <div className="mb-4 p-4 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg flex items-center justify-between font-mono">
                <span>Entry saved successfully!</span>
                <button onClick={() => setShowSuccessAlert(false)} className="font-bold">X</button>
              </div>
            )}

            {showDeleteAlert && (
              <div className="mb-4 p-4 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg flex items-center justify-between font-mono">
                <span>Delete successfully!</span>
                <button onClick={() => setShowDeleteAlert(false)} className="font-bold">X</button>
              </div>
            )}

            {/* Render Component based on activeTab */}
            {activeTab === 'dashboard' && (
              <Dashboard
                getTotalAssets={getTotalAssets}
                getTotalLiabilities={getTotalLiabilities}
                getTotalEquity={getTotalEquity}
                incomeStatement={incomeStatement}
                journalEntries={journalEntries}
                accounts={accounts}
                t={t}
              />
            )}

            {activeTab === 'accounting' && (
              <Accounting
                accounts={accounts}
                newAccount={newAccount}
                setNewAccount={setNewAccount}
                addNewAccount={addNewAccount}
                t={t}
              />
            )}

            {activeTab === 'journal' && (
              <Journal
                isAdjusting={false}
                entries={journalEntries}
                showForm={showJournalForm}
                setShowForm={setShowJournalForm}
                newEntry={newEntry}
                setNewEntry={setNewEntry}
                accounts={accounts}
                saveJournalEntry={saveJournalEntry}
                saveAdjustingEntry={saveAdjustingEntry}
                resetForm={resetForm}
                editEntry={editEntry}       
                deleteEntry={deleteEntry}   
                editingEntry={editingEntry} 
                t={t}
              />
            )}

            {activeTab === 'adjusting' && (
              <Journal
                isAdjusting={true}
                entries={adjustingEntries}
                showForm={showAdjustingForm}
                setShowForm={setShowAdjustingForm}
                newEntry={newEntry}
                setNewEntry={setNewEntry}
                accounts={accounts}
                saveJournalEntry={saveJournalEntry}
                saveAdjustingEntry={saveAdjustingEntry}
                resetForm={resetForm}
                editEntry={editEntry}       
                deleteEntry={deleteEntry}   
                editingEntry={editingEntry} 
                t={t}
              />
            )}

            {activeTab === 'ledger' && (
              <GeneralLedger
                accounts={accounts}
                journalEntries={journalEntries}
                adjustingEntries={adjustingEntries}
                balances={balances}
                t={t}
              />
            )}

            {activeTab === 'trial' && (
              <TrialBalance
                trialBalanceData={trialBalanceData}
                t={t}
              />
            )}

            {activeTab === 'income' && (
              <IncomeStatement
                accounts={accounts}
                balances={balances}
                incomeStatement={incomeStatement}
                t={t}
              />
            )}

            {activeTab === 'balance' && (
              <BalanceSheet
                accounts={accounts}
                balances={balances}
                getTotalAssets={getTotalAssets}
                getTotalLiabilities={getTotalLiabilities}
                getTotalEquity={getTotalEquity}
                incomeStatement={incomeStatement}
                t={t}
              />
            )}
          </main>

          <Footer theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default SmartAccountingManager;