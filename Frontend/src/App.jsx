import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { Sun, Moon, Zap, LogOut } from 'lucide-react';
import Footer from './components/Footer';
import api from './api'; // Import API

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

const SmartAccountingManager = () => {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [journalEntries, setJournalEntries] = useState([]);
  const [adjustingEntries, setAdjustingEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showAdjustingForm, setShowAdjustingForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Logout handler (defined early for use in fetchData)
  const handleLogout = React.useCallback(() => {
    sessionStorage.removeItem('token');
    // sessionStorage is tab-specific, so logout only affects current tab
    setIsAuthenticated(false);
    setUser(null);
    setJournalEntries([]);
    setAdjustingEntries([]);
    setActiveTab('dashboard');
    navigate('/', { replace: true });
  }, [navigate]);

  // Fetch user info from server (defined early for use in useEffect)
  const fetchUserInfo = React.useCallback(async () => {
    try {
      const response = await api.get('/me');
      const userData = response.data;
      console.log('[fetchUserInfo] User data from server:', userData);

      // Check if username exists
      if (!userData || !userData.username) {
        console.error('[fetchUserInfo] Username is missing!');
        alert('This account does not have a username. Please register a new account with a username to use this feature.');
        handleLogout();
        return null;
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('[fetchUserInfo] Error fetching user info:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
      }
      return null;
    }
  }, [handleLogout]);

  // Initial Data Fetching Logic
  const fetchData = React.useCallback(async () => {
    try {
      const res = await api.get('/data');
      console.log('[fetchData] /data response:', res?.data);
      setAccounts(res.data.accounts);

      // Split entries into Journal and Adjusting
      const allEntries = res.data.entries;
      setJournalEntries(allEntries.filter(e => !e.is_adjusting));
      setAdjustingEntries(allEntries.filter(e => e.is_adjusting));
    } catch (err) {
      console.error("Failed to fetch data", err);
      // If 401/403, logout
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  // Effect to handle initial load and URL-based routing
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('[App] init token ->', !!token);

    if (token) {
      // Token exists, fetch user info from server
      setIsAuthenticated(true);
      fetchUserInfo().then((userData) => {
        if (userData) {
          fetchData(); // Fetch DB Data

          // If user is logged in but URL doesn't have username, redirect to /username
          if (userData.username && !urlUsername) {
            console.log('[App] Redirecting to username path:', `/${userData.username}`);
            navigate(`/${userData.username}`, { replace: true });
          }
          // If URL has username but it doesn't match logged-in user, redirect to correct username
          else if (userData.username && urlUsername && urlUsername !== userData.username) {
            console.log('[App] Username mismatch, redirecting to:', `/${userData.username}`);
            navigate(`/${userData.username}`, { replace: true });
          }
        }
      });
    } else if (urlUsername) {
      // If URL has username but user is not logged in, redirect to home
      console.log('[App] User not logged in but URL has username, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [urlUsername, navigate, fetchUserInfo, fetchData]);

  // Effect to handle navigation after user info is fetched
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.username) {
        console.error('[App] User authenticated but no username found. Logging out.');
        handleLogout();
        alert('This account does not have a username. Please register a new account with a username.');
        return;
      }

      if (!urlUsername) {
        console.log('[App] User authenticated, navigating to username path:', `/${user.username}`);
        navigate(`/${user.username}`, { replace: true });
      } else if (urlUsername !== user.username) {
        console.log('[App] Username mismatch after login, redirecting to:', `/${user.username}`);
        navigate(`/${user.username}`, { replace: true });
      }
    }
  }, [isAuthenticated, user, urlUsername, navigate, handleLogout]);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { accountId: '', debit: '', credit: '' },
      { accountId: '', debit: '', credit: '' }
    ]
  });

  const [newAccount, setNewAccount] = useState({ code: '', name: '', type: 'asset' });

  // --- Theme Classes (Same as before) ---
  const themeClasses = {
    dark: {
      bg: 'bg-neutral-900', text: 'text-slate-100', cardBg: 'bg-neutral-800', border: 'border-cyan-700/50',
      accent: 'text-lime-400', secondaryAccent: 'text-cyan-400', shadow: 'shadow-lg shadow-black/50',
      input: 'bg-neutral-700 border-neutral-600 text-white focus:ring-cyan-500 focus:border-cyan-500',
      tableHeader: 'bg-neutral-700 text-slate-300', tableRow: 'even:bg-neutral-800/80 hover:bg-neutral-700/70',
      buttonPrimary: 'bg-lime-600 text-white hover:bg-lime-500 shadow-lg shadow-lime-900/20',
      buttonSecondary: 'bg-neutral-700 text-slate-300 hover:bg-neutral-600',
    },
    light: {
      bg: 'bg-slate-50', text: 'text-slate-900', cardBg: 'bg-white', border: 'border-blue-100',
      accent: 'text-blue-600', secondaryAccent: 'text-cyan-600', shadow: 'shadow-xl shadow-blue-200/50',
      input: 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 focus:border-blue-500',
      tableHeader: 'bg-blue-50 text-slate-700', tableRow: 'even:bg-slate-100 hover:bg-blue-50',
      buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50',
      buttonSecondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    }
  };
  const t = themeClasses[theme];

  const handleLogin = async () => {
    console.log('[handleLogin] Fetching user info from server...');
    setIsAuthenticated(true); // Set authenticated first so API calls work

    const userData = await fetchUserInfo();
    if (!userData) {
      setIsAuthenticated(false);
      return;
    }

    fetchData(); // Load data on login
    // Navigate to /username after login
    console.log('[handleLogin] Navigating to:', `/${userData.username}`);
    navigate(`/${userData.username}`, { replace: true });
  };

  const resetForm = () => {
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      lines: [{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }]
    });
    setEditingEntry(null);
    setShowJournalForm(false);
    setShowAdjustingForm(false);
  };

  // --- UPDATED VALIDATION (Description Optional) ---
  const validateEntry = (entry) => {
    // Description check removed. Only Date required.
    if (!entry.date) return false;

    let totalDebits = 0, totalCredits = 0, validLineCount = 0;
    entry.lines.forEach(line => {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      totalDebits += debit;
      totalCredits += credit;
      if (line.accountId && (debit > 0 || credit > 0)) validLineCount++;
    });

    return Math.abs(totalDebits - totalCredits) < 0.01 && validLineCount >= 2;
  };

  // --- SAVE LOGIC with API ---
  const saveEntryHandler = async (isAdjusting) => {
    if (!validateEntry(newEntry)) {
      alert("Validation Error: Debits must equal Credits, and you need at least 2 lines.");
      return;
    }

    try {
      const entryData = { ...newEntry, is_adjusting: isAdjusting };
      if (editingEntry) { entryData.id = editingEntry.id; }

      console.log('[saveEntryHandler] Sending entry data:', JSON.stringify(entryData, null, 2));
      await api.post('/entries', entryData);

      await fetchData(); // Refresh data from server
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      resetForm();
    } catch (error) {
      console.error("Save failed", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to save entry. Please check your connection.";
      alert(errorMessage);
    }
  };

  const saveJournalEntry = () => saveEntryHandler(false);
  const saveAdjustingEntry = () => saveEntryHandler(true);

  const editEntry = (entry, isAdjusting) => {
    // Normalize lines so the JournalEntryForm can pre-fill account search, type, and amounts correctly
    const normalizedLines = (entry.lines || []).map((line) => {
      const accountId = line.accountId || line.account_id || '';
      const account = accounts.find(a => a.id === Number(accountId));

      const entryType =
        line.entryType ||
        line.type ||
        (line.credit && !line.debit ? 'credit' : 'debit');

      return {
        // ID used by form & save logic
        accountId,
        // Text shown in the searchable account input
        accountName: line.accountName || account?.name || '',
        // Ensure entryType is set so debit/credit toggle is correct
        entryType,
        // Preserve amounts as strings for the inputs
        debit: line.debit != null ? String(line.debit) : '',
        credit: line.credit != null ? String(line.credit) : '',
      };
    });

    // Ensure at least two lines exist in the form (UI expects 2+)
    while (normalizedLines.length < 2) {
      normalizedLines.push({
        accountId: '',
        accountName: '',
        entryType: 'debit',
        debit: '',
        credit: '',
      });
    }

    setNewEntry({
      date: entry.date,
      description: entry.description || '',
      lines: normalizedLines,
    });
    setEditingEntry({ id: entry.id, isAdjusting });
    if (isAdjusting) { setShowAdjustingForm(true); setActiveTab('adjusting'); }
    else { setShowJournalForm(true); setActiveTab('journal'); }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      await fetchData(); // Refresh
      if (editingEntry && editingEntry.id === id) resetForm();
      setShowDeleteAlert(true);
      setTimeout(() => setShowDeleteAlert(false), 3000);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const addNewAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.code || !newAccount.name) return;
    try {
      await api.post('/accounts', newAccount);
      await fetchData();
      setNewAccount({ code: '', name: '', type: 'asset' });
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error("Add Account failed", error);
    }
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone if the account is not used in any entries.')) {
      return;
    }
    try {
      await api.delete(`/accounts/${id}`);
      await fetchData();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error("Delete Account failed", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete account.";
      alert(errorMessage);
    }
  };

  // --- Calculations (Memoized) - Unchanged ---
  const { balances, getTotalAssets, getTotalLiabilities, getTotalEquity, incomeStatement, trialBalanceData } = useMemo(() => {
    const calculateBalances = () => {
      const balances = {};
      accounts.forEach(acc => { balances[acc.id] = 0; });
      [...journalEntries, ...adjustingEntries].forEach(entry => {
        // Validation check for entry.lines in case of data error
        if (entry.lines && Array.isArray(entry.lines)) {
          entry.lines.forEach(line => {
            const account = accounts.find(a => a.id === parseInt(line.accountId || line.account_id)); // Check both camel and snake case
            if (!account) return;
            const debit = parseFloat(line.debit) || 0;
            const credit = parseFloat(line.credit) || 0;
            if (account.type === 'asset' || account.type === 'expense') {
              balances[account.id] += debit - credit;
            } else {
              balances[account.id] += credit - debit;
            }
          });
        }
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
      let totalDebits = 0, totalCredits = 0;
      const trialBalanceData = [];
      const allEntries = [...journalEntries, ...adjustingEntries];
      // Collect IDs of accounts with activity
      const accountsWithActivity = new Set();
      allEntries.forEach(entry => {
        if (entry.lines) entry.lines.forEach(line => accountsWithActivity.add(parseInt(line.accountId || line.account_id)));
      });

      accounts.forEach(account => {
        const balance = currentBalances[account.id] || 0;
        let debitBalance = 0, creditBalance = 0;
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

  if (!isAuthenticated) return <AuthPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} t={t} />;

  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-900' : 'bg-slate-100'} min-h-screen font-sans`}>
      <div className={`flex flex-col md:flex-row max-w-full mx-auto`}>
        <div className="fixed left-0 top-0 h-full z-30">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </div>
        <div className="flex-1 min-h-screen flex flex-col md:ml-72">
          <header className={`fixed top-0 right-0 left-0 md:left-72 z-20 h-16 flex justify-between items-center p-4 ${t.cardBg} ${t.text} border-b ${t.border}`}>
            <div className="text-3xl font-bold text-cyan-400 hidden sm:block">{activeTab.toUpperCase().replace('_', ' ')}</div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-lg">
                <span className="text-lg font-mono text-slate-400 hidden sm:inline mr-4">{new Date().toDateString()}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-neutral-700 text-lime-400' : 'bg-blue-100 text-blue-600'}`}>{user?.name?.charAt(0)}</div>
                <span className="hidden sm:inline font-medium">{user?.name}</span>
              </div>
              <button onClick={toggleTheme} className={`p-2 rounded-full ${t.buttonSecondary}`}><Sun size={20} /></button>
              <button onClick={handleLogout} className={`p-2 rounded-full ${t.buttonSecondary} text-red-400 hover:bg-red-900/20`}><LogOut size={20} /></button>
            </div>
          </header>
          {/* Dev debug overlay removed */}

          <div className="flex-1 overflow-y-auto pt-16">
            <main className="p-4 md:p-8">
              {showSuccessAlert && <div className="mb-4 p-4 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg">Entry saved successfully!</div>}
              {showDeleteAlert && <div className="mb-4 p-4 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg">Deleted successfully!</div>}

              {activeTab === 'dashboard' && <Dashboard getTotalAssets={getTotalAssets} getTotalLiabilities={getTotalLiabilities} getTotalEquity={getTotalEquity} incomeStatement={incomeStatement} journalEntries={journalEntries} accounts={accounts} t={t} />}
              {activeTab === 'accounting' && <Accounting accounts={accounts} newAccount={newAccount} setNewAccount={setNewAccount} addNewAccount={addNewAccount} deleteAccount={deleteAccount} t={t} />}
              {activeTab === 'journal' && <Journal isAdjusting={false} entries={journalEntries} showForm={showJournalForm} setShowForm={setShowJournalForm} newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} saveJournalEntry={saveJournalEntry} saveAdjustingEntry={saveAdjustingEntry} resetForm={resetForm} editEntry={editEntry} deleteEntry={deleteEntry} editingEntry={editingEntry} t={t} />}
              {activeTab === 'adjusting' && <Journal isAdjusting={true} entries={adjustingEntries} showForm={showAdjustingForm} setShowForm={setShowAdjustingForm} newEntry={newEntry} setNewEntry={setNewEntry} accounts={accounts} saveJournalEntry={saveJournalEntry} saveAdjustingEntry={saveAdjustingEntry} resetForm={resetForm} editEntry={editEntry} deleteEntry={deleteEntry} editingEntry={editingEntry} t={t} />}
              {activeTab === 'ledger' && <GeneralLedger accounts={accounts} journalEntries={journalEntries} adjustingEntries={adjustingEntries} balances={balances} t={t} />}
              {activeTab === 'trial' && <TrialBalance trialBalanceData={trialBalanceData} t={t} />}
              {activeTab === 'income' && <IncomeStatement accounts={accounts} balances={balances} incomeStatement={incomeStatement} t={t} />}
              {activeTab === 'balance' && <BalanceSheet accounts={accounts} balances={balances} getTotalAssets={getTotalAssets} getTotalLiabilities={getTotalLiabilities} getTotalEquity={getTotalEquity} incomeStatement={incomeStatement} t={t} />}
            </main>
            <Footer theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAccountingManager;