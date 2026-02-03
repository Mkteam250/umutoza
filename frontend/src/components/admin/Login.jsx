'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
            const response = await axios.post(`${apiUrl}/api/admin/quiz/login`, {
                username,
                password
            });

            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', response.data.username);
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0E6F7] flex items-center justify-center p-6 font-sans">
            <div className="absolute top-10 left-10">
                <button onClick={() => router.push('/')} className="text-indigo-900 font-bold hover:text-indigo-600 flex items-center">
                    <span className="mr-2">←</span> Back Home
                </button>
            </div>

            <div className="glass p-12 rounded-[50px] shadow-2xl w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl">
                        🔒
                    </div>
                    <h1 className="text-3xl font-black text-indigo-900 font-heading">Admin Portal</h1>
                    <p className="text-indigo-700/60 font-medium">Please sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm font-bold">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest ml-1">Username</label>
                        <input
                            required
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-4 rounded-[20px] bg-white border-2 border-transparent focus:border-indigo-400 outline-none transition-all shadow-sm"
                            placeholder="Your username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest ml-1">Password</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-[20px] bg-white border-2 border-transparent focus:border-indigo-400 outline-none transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[25px] font-black text-lg transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
            </div>

            {/* Background Decoration */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-blob"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000"></div>
        </div>
    );
};

export default Login;
