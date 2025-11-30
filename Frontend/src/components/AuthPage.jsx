import React, { useState } from 'react';
import { Lock, User, Mail, Sun, Moon, ArrowRight, AlertTriangle, Eye, EyeOff, User2Icon } from 'lucide-react';
import api from '../api'; // Import axios instance

const AuthPage = ({ onLogin, theme, toggleTheme, t }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isLoginView) {
                // Login API Call
                const response = await api.post('/login', {
                    email: formData.email,
                    password: formData.password
                });

                // Save only token in sessionStorage (tab-specific, user info will be fetched from server)
                console.log('[AuthPage] Login response - token received');
                sessionStorage.setItem('token', response.data.token);
                // Don't store user info - fetch from server instead
                // sessionStorage is tab-specific, so each tab can have different users

                // Call onLogin - it will fetch user info from server
                onLogin();
            } else {
                // Register API Call
                await api.post('/register', {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });

                setSuccessMessage('Registration successful! Please log in.');
                setIsLoginView(true);
                setFormData({ name: '', username: '', email: formData.email, password: '' });
            }
        } catch (error) {
            const msg = error.response?.data?.error || "Something went wrong. Check connection.";
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${t.bg} transition-colors duration-300`}>
            <div className="absolute top-4 right-4">
                <button onClick={toggleTheme} className={`p-2 rounded-full ${t.buttonSecondary}`}>
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

                {successMessage && <div className="mb-4 p-3 bg-lime-900/50 border border-lime-500 text-lime-300 rounded-lg font-mono text-sm">{successMessage}</div>}
                {errorMessage && <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg flex items-center font-mono text-sm"><AlertTriangle size={16} className="mr-2" />{errorMessage}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                        <>
                            <div>
                                <label className={`block text-xs font-mono mb-1 ${t.text}`}>FULL NAME</label>
                                <div className="relative">
                                    <User2Icon size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input type="text" placeholder="Mijanur Rahman Oli" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`} />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-mono mb-1 ${t.text}`}>USERNAME</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input type="text" placeholder="username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`} />
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <label className={`block text-xs font-mono mb-1 ${t.text}`}>EMAIL ADDRESS</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input type="email" placeholder="name@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${t.input}`} />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-xs font-mono mb-1 ${t.text}`}>PASSWORD</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`w-full pl-10 pr-10 py-2 border rounded-lg ${t.input}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className={`w-full py-3 mt-6 rounded-lg font-bold tracking-wider flex items-center justify-center gap-2 ${t.buttonPrimary} ${loading ? 'opacity-50' : ''}`}>
                        {loading ? 'PROCESSING...' : (isLoginView ? 'LOGIN' : 'REGISTER')} <ArrowRight size={18} />
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => { setIsLoginView(!isLoginView); setErrorMessage(''); }} className={`text-md font-mono hover:underline ${t.secondaryAccent}`}>
                        {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;