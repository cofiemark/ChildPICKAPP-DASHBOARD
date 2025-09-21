import React, { useState, FormEvent } from 'react';
import { SsoIcon } from './icons';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSSOLogin: (provider: 'google' | 'microsoft') => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSSOLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };
    
    const handleSSOClick = async (provider: 'google' | 'microsoft') => {
        setError(null);
        setIsLoading(true);
        try {
            await onSSOLogin(provider);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div 
          className="min-h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541599725501-82d2741a113f?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="flex items-center justify-center min-h-screen bg-black/60">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-indigo-600">RFID Attend</h1>
                        <p className="mt-2 text-sm text-slate-600">Sign in to access the dashboard</p>
                    </div>
                    
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">{error}</div>}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleSSOClick('google')} disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <SsoIcon className="w-5 h-5 mr-2" />
                            Google
                        </button>
                         <button onClick={() => handleSSOClick('microsoft')} disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <SsoIcon className="w-5 h-5 mr-2" />
                            Microsoft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;