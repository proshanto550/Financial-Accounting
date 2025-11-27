import React, { useState } from 'react';
import { Lock, User, Mail, Sun, Moon, ArrowRight, AlertTriangle } from 'lucide-react';

// Key for local storage (changed to store an array of users)
const USERS_STORAGE_KEY = 'MONEY_APP_USERS';

const AuthPage = ({ onLogin, theme, toggleTheme, t }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Retrieve the array of stored users (or initialize an empty array)
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];

        if (isLoginView) {
            // --- LOGIN LOGIC (Checking against all registered users) ---

            // Find a user matching both email and password
            const foundUser = storedUsers.find(
                user => user.email === formData.email && user.password === formData.password
            );

            if (!foundUser) {
                setErrorMessage('Invalid Email or Password. Please try again.');
                return;
            }

            // Successful login: Use the stored user's full name
            onLogin({ name: foundUser.name });

        } else {
            // --- REGISTRATION LOGIC (Adding a new user to the array) ---

            // Check if email already exists
            const existingUser = storedUsers.find(user => user.email === formData.email);

            if (existingUser) {
                setErrorMessage('This email is already registered. Please log in.');
                return;
            }
            if (!formData.name || !formData.email || !formData.password) {
                setErrorMessage('Please fill in all fields.');
                return;
            }

            // Create new user object
            const newUser = {
                name: formData.name,
                email: formData.email,
                password: formData.password, // Storing plain password for simulation
            };

            // Add new user to the array and update Local Storage
            const updatedUsers = [...storedUsers, newUser];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

            // Show success message and switch to login view
            setSuccessMessage(`Registration successful for ${formData.name}. Please log in now.`);
            setIsLoginView(true);
            setFormData({ name: '', email: formData.email, password: '' });
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${t.bg} transition-colors duration-300`}>
            {/* Theme Toggle in Corner */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full ${t.buttonSecondary} transition-colors`}
                >
                    {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-slate-500" />}
                </button>
            </div>

            <div className={`w-full max-w-md ${t.cardBg} ${t.shadow} rounded-2xl p-8 border ${t.border}`}>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center justify-center gap-2">
                        <span className={theme === 'dark' ? 'text-lime-400' : 'text-blue-600'}>M.O.N.E.Y.</span>
                    </h1>
                    <p className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isLoginView ? 'Sign in to access your dashboard' : 'Create a new account'}
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg font-mono text-sm">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg flex items-center font-mono text-sm">
                        <AlertTriangle size={16} className="mr-2" />
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                        <div>
                            <label className={`block text-xs font-mono mb-1 ${t.text}`}>FULL NAME</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`}
                                    placeholder="Mijanur Rahman Oli"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className={`block text-xs font-mono mb-1 ${t.text}`}>EMAIL ADDRESS</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`}
                                placeholder="name@example.com"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-xs font-mono mb-1 ${t.text}`}>PASSWORD</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`}
                                placeholder="••••••••"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 mt-6 rounded-lg font-bold tracking-wider flex items-center justify-center gap-2 ${t.buttonPrimary}`}
                    >
                        {isLoginView ? 'LOGIN' : 'REGISTER'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLoginView(!isLoginView);
                            setErrorMessage('');
                            setSuccessMessage('');
                        }}
                        className={`text-sm hover:underline ${t.secondaryAccent}`}
                    >
                        {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;