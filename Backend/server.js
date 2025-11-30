// Backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = "my_super_secret_key_change_this_later";

app.use(cors());
app.use(express.json());

// --- Database Setup ---
const db = new sqlite3.Database('./finance.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Create Tables
db.serialize(() => {
    // Users Table (without username for backward compatibility)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // Add username column if it doesn't exist (for existing databases)
    // SQLite doesn't support adding UNIQUE constraint in ALTER TABLE, so we add it without UNIQUE
    // and create a unique index separately
    db.run(`ALTER TABLE users ADD COLUMN username TEXT`, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
            // Column might already exist, try to create index anyway
        }
        // Create unique index on username (works whether column was just added or already existed)
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL`, (idxErr) => {
            if (idxErr) {
                console.error('Error creating username index:', idxErr.message);
            }
        });
    });

    // Accounts Table (Linked to User)
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        name TEXT,
        type TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Entries Table (Journal & Adjusting)
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT,
        description TEXT,
        is_adjusting INTEGER, 
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Entry Lines Table
    db.run(`CREATE TABLE IF NOT EXISTS entry_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER,
        account_id INTEGER,
        debit REAL,
        credit REAL,
        type TEXT,
        FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
    )`);
});

// --- Middleware for Auth ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Default Accounts List ---
const defaultAccounts = [
    { code: '1000', name: 'Cash', type: 'asset' },
    { code: '1001', name: 'Accounts Receivable', type: 'asset' },
    { code: '1002', name: 'Inventory', type: 'asset' },
    { code: '1003', name: 'Bank', type: 'asset' },
    { code: '1004', name: 'Furniture', type: 'asset' },
    { code: '1005', name: 'Equipment', type: 'asset' },
    { code: '1006', name: 'Land', type: 'asset' },
    { code: '1007', name: 'Investments', type: 'asset' },
    { code: '1008', name: 'Prepaid Expense', type: 'asset' },
    { code: '1009', name: 'Supplies', type: 'asset' },
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '2001', name: 'Bank Loan', type: 'liability' },
    { code: '2002', name: 'Unearned Revenue', type: 'liability' },
    { code: '2003', name: 'Debt Payable', type: 'liability' },
    { code: '2004', name: 'Sales Tax', type: 'liability' },
    { code: '2005', name: 'Income Tax', type: 'liability' },
    { code: '2006', name: 'Income Tax Payable', type: 'liability' },
    { code: '2007', name: 'Accrued Expense', type: 'liability' },
    { code: '2008', name: 'Interest Payable', type: 'liability' },
    { code: '2009', name: 'Notes Payable', type: 'liability' },
    { code: '2010', name: 'Wages Payable', type: 'liability' },
    { code: '3000', name: 'Capital', type: 'equity' },
    { code: '4000', name: 'Sales Revenue', type: 'revenue' },
    { code: '4001', name: 'Interest Revenue', type: 'revenue' },
    { code: '4002', name: 'Rent Revenue', type: 'revenue' },
    { code: '4003', name: 'Service Revenue', type: 'revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { code: '5001', name: 'Rent Expense', type: 'expense' },
    { code: '5002', name: 'Utilities Expense', type: 'expense' },
    { code: '5003', name: 'Advertising', type: 'expense' },
    { code: '5004', name: 'Depreciation Expense', type: 'expense' },
    { code: '5005', name: 'Insurance', type: 'expense' },
    { code: '5006', name: 'Taxes', type: 'expense' },
    { code: '5007', name: 'Office Supplies', type: 'expense' },
    { code: '5008', name: 'Wages Expense', type: 'expense' },
    { code: '5009', name: 'Bad Debt Expense', type: 'expense' },
    { code: '5010', name: 'Salary Expense', type: 'expense' },
];

// --- Routes ---

// 1. REGISTER
app.post('/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlUser = "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)";
    db.run(sqlUser, [name, username, email, hashedPassword], function (err) {
        if (err) {
            console.error('[POST /register] DB error:', err.message);
            if (err.message.includes('UNIQUE constraint failed: users.username')) {
                return res.status(400).json({ error: "Username already exists." });
            }
            return res.status(400).json({ error: "Email already exists." });
        }

        const userId = this.lastID;
        // Create Default Accounts for new User
        const sqlAcc = "INSERT INTO accounts (user_id, code, name, type) VALUES (?, ?, ?, ?)";
        defaultAccounts.forEach(acc => {
            db.run(sqlAcc, [userId, acc.code, acc.name, acc.type]);
        });

        console.log(`[POST /register] Created user ${userId} (${email}), inserted ${defaultAccounts.length} default accounts`);

        res.json({ message: "User registered successfully" });
    });
});

// 2. LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "User not found" });

        if (await bcrypt.compare(password, user.password)) {
            // Check if user has username
            if (!user.username) {
                return res.status(400).json({
                    error: "This account does not have a username. Please register a new account with a username."
                });
            }

            const token = jwt.sign({ id: user.id, name: user.name, username: user.username }, SECRET_KEY);
            res.json({ token, user: { name: user.name, username: user.username, email: user.email } });
        } else {
            res.status(400).json({ error: "Invalid password" });
        }
    });
});

// 3. GET DATA (Accounts & Entries)
app.get('/data', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`[GET /data] Request by userId=${userId}`);
    const responseData = { accounts: [], entries: [] };

    // Fetch Accounts
    db.all("SELECT * FROM accounts WHERE user_id = ?", [userId], (err, accounts) => {
        if (err) {
            console.error('[GET /data] Error fetching accounts:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[GET /data] Found ${accounts.length} accounts for user ${userId}`);
        responseData.accounts = accounts;

        // Fetch Entries
        db.all("SELECT * FROM entries WHERE user_id = ?", [userId], (err, entries) => {
            if (err) return res.status(500).json({ error: err.message });

            // Need to fetch lines for each entry. This is a bit tricky in async.
            // Using Promise.all to handle multiple queries
            const promises = entries.map(entry => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * FROM entry_lines WHERE entry_id = ?", [entry.id], (err, lines) => {
                        if (err) reject(err);
                        resolve({ ...entry, lines });
                    });
                });
            });

            Promise.all(promises).then(fullEntries => {
                responseData.entries = fullEntries;
                console.log(`[GET /data] Returning ${fullEntries.length} entries for user ${userId}`);
                res.json(responseData);
            }).catch(error => res.status(500).json({ error: error.message }));
        });
    });
});

// 4. ADD ACCOUNT
app.post('/accounts', authenticateToken, (req, res) => {
    const { code, name, type } = req.body;
    const sql = "INSERT INTO accounts (user_id, code, name, type) VALUES (?, ?, ?, ?)";
    db.run(sql, [req.user.id, code, name, type], function (err) {
        if (err) {
            console.error('[POST /accounts] DB error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[POST /accounts] User ${req.user.id} added account ${code} - ${name}`);
        res.json({ id: this.lastID, code, name, type });
    });
});

// 5. SAVE ENTRY (Create or Update)
app.post('/entries', authenticateToken, (req, res) => {
    const { id, date, description, is_adjusting, lines } = req.body;
    const userId = req.user.id;

    // Validate that all account IDs belong to this user
    if (!lines || lines.length === 0) {
        return res.status(400).json({ error: "Entry must have at least one line" });
    }

    // Get all account IDs from the lines
    const accountIds = lines.map(line => line.accountId).filter(accId => accId);
    if (accountIds.length === 0) {
        return res.status(400).json({ error: "Entry must have valid account IDs" });
    }

    // Helper function to save entry lines
    const saveLines = (entryId) => {
        const sqlLine = "INSERT INTO entry_lines (entry_id, account_id, debit, credit, type) VALUES (?, ?, ?, ?, ?)";
        lines.forEach(line => {
            // Determine type logic if needed, or store what frontend sends
            const entryType = line.debit ? 'debit' : 'credit';
            db.run(sqlLine, [entryId, line.accountId, line.debit || 0, line.credit || 0, entryType], (err) => {
                if (err) {
                    console.error(`[POST /entries] Error saving line for entry ${entryId}:`, err.message);
                }
            });
        });
    };

    // Check if all accounts belong to this user
    const placeholders = accountIds.map(() => '?').join(',');
    const checkAccountsSql = `SELECT id FROM accounts WHERE id IN (${placeholders}) AND user_id = ?`;

    db.all(checkAccountsSql, [...accountIds, userId], (err, validAccounts) => {
        if (err) {
            console.error('[POST /entries] Error checking account ownership:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (validAccounts.length !== accountIds.length) {
            console.error(`[POST /entries] User ${userId} tried to use accounts that don't belong to them. Requested: ${accountIds.join(',')}, Valid: ${validAccounts.map(a => a.id).join(',')}`);
            return res.status(403).json({ error: "One or more accounts do not belong to you" });
        }

        // If updating, verify the entry belongs to this user
        if (id) {
            db.get("SELECT id FROM entries WHERE id = ? AND user_id = ?", [id, userId], (err, entry) => {
                if (err) {
                    console.error('[POST /entries] Error checking entry ownership:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                if (!entry) {
                    return res.status(403).json({ error: "Entry not found or does not belong to you" });
                }

                // UPDATE Existing
                db.run("UPDATE entries SET date = ?, description = ? WHERE id = ? AND user_id = ?",
                    [date, description || "", id, userId], function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        // Delete old lines
                        db.run("DELETE FROM entry_lines WHERE entry_id = ?", [id], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            saveLines(id);
                            res.json({ success: true, id });
                        });
                    });
            });
        } else {
            // CREATE New
            const sql = "INSERT INTO entries (user_id, date, description, is_adjusting) VALUES (?, ?, ?, ?)";
            db.run(sql, [userId, date, description || "", is_adjusting ? 1 : 0], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const newId = this.lastID;
                saveLines(newId);
                res.json({ success: true, id: newId });
            });
        }
    });
});

// 6. DELETE ENTRY
app.delete('/entries/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM entries WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        // Cascade delete will handle lines if configured, else manually delete lines
        db.run("DELETE FROM entry_lines WHERE entry_id = ?", [req.params.id]);
        res.json({ success: true });
    });
});

// Admin endpoint to trigger backfill of missing account codes without restarting the server
app.post('/admin/backfill-codes', (req, res) => {
    const updateSql = "UPDATE accounts SET code = ? WHERE (code IS NULL OR code = '') AND name = ?";
    let changed = 0;
    const tasks = defaultAccounts.map(acc => {
        return new Promise((resolve) => {
            db.run(updateSql, [acc.code, acc.name], function (err) {
                if (err) console.error('[admin/backfill] error', acc.name, err.message);
                else if (this.changes && this.changes > 0) {
                    changed += this.changes;
                    console.log(`[admin/backfill] updated ${this.changes} rows for ${acc.name}`);
                }
                resolve();
            });
        });
    });

    Promise.all(tasks).then(() => res.json({ status: 'ok', updated: changed }));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// --- Startup migration: ensure all users have the full default chart of accounts ---
db.serialize(() => {
    console.log('[startup] Running account migrations...');

    // 1) Backfill missing account codes based on name (for older data where code was empty)
    console.log('[startup] Step 1: Backfilling missing account codes for existing accounts...');
    const updateSql = "UPDATE accounts SET code = ? WHERE (code IS NULL OR code = '') AND name = ?";
    defaultAccounts.forEach(acc => {
        db.run(updateSql, [acc.code, acc.name], function (err) {
            if (err) {
                console.error('[startup] Error updating account code for', acc.name, err.message);
            } else if (this.changes && this.changes > 0) {
                console.log(`[startup] Backfilled code ${acc.code} for ${this.changes} account(s) named '${acc.name}'`);
            }
        });
    });

    // 2) Ensure every user has all 37 default accounts
    console.log('[startup] Step 2: Ensuring every user has the complete default chart of accounts (37 accounts)...');
    db.all("SELECT id FROM users", [], (err, users) => {
        if (err) {
            console.error('[startup] Error fetching users for default account backfill:', err.message);
            return;
        }
        if (!users || users.length === 0) {
            console.log('[startup] No users found, skipping default account backfill.');
            return;
        }

        users.forEach(user => {
            const userId = user.id;
            db.all("SELECT code, name FROM accounts WHERE user_id = ?", [userId], (errAcc, rows) => {
                if (errAcc) {
                    console.error(`[startup] Error fetching accounts for user ${userId}:`, errAcc.message);
                    return;
                }

                const existingByCode = new Set();
                const existingByName = new Set();
                rows.forEach(r => {
                    if (r.code) existingByCode.add(String(r.code));
                    if (r.name) existingByName.add(r.name);
                });

                const insertSql = "INSERT INTO accounts (user_id, code, name, type) VALUES (?, ?, ?, ?)";
                let insertedCount = 0;

                defaultAccounts.forEach(acc => {
                    const hasByCode = existingByCode.has(String(acc.code));
                    const hasByName = existingByName.has(acc.name);
                    if (!hasByCode && !hasByName) {
                        db.run(insertSql, [userId, acc.code, acc.name, acc.type], function (insertErr) {
                            if (insertErr) {
                                console.error(`[startup] Failed to insert default account '${acc.name}' for user ${userId}:`, insertErr.message);
                            } else {
                                insertedCount += 1;
                            }
                        });
                    }
                });

                if (insertedCount > 0) {
                    console.log(`[startup] User ${userId}: inserted ${insertedCount} missing default accounts.`);
                } else {
                    console.log(`[startup] User ${userId}: already has all default accounts.`);
                }
            });
        });
    });
});