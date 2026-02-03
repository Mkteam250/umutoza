'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import QuestionsManage from './QuestionsManage';
import CampaignManager from './CampaignManager';
import Messages from './Messages';

// --- Sub-Components ---

const TabButton = ({ active, label, icon, onClick, count }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-bold transition-all
      ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}
    `}
    >
        <span>{icon}</span>
        <span>{label}</span>
        {count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {count}
            </span>
        )}
    </button>
);

const UserCard = ({ session, onDelete, currentTime }) => {
    const isCompleted = session.status === 'completed';

    // Check if user has been active in the last 30 seconds
    const lastActive = new Date(session.lastActive);
    const isOnline = (currentTime - lastActive) < 12000; // 12 seconds threshold (2x faster)

    return (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-6 group relative overflow-hidden">
            {/* Online Indicator Line */}
            <div className={`absolute top-0 left-0 w-full h-1 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-200'}`}></div>

            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${isOnline ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {session.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{session.userName || 'Anonymous'}</h3>
                        <div className="flex flex-col space-y-1 mt-1">
                            <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`}></span>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {isOnline ? (
                                        <span className="text-green-600 font-bold">Online</span>
                                    ) : (
                                        <span className="text-slate-400">Offline</span>
                                    )}
                                </p>
                            </div>
                            {isOnline && session.activity && (
                                <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                    📍 {session.activity}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(session.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

const EmptyState = ({ message, sub }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-300">
            ∅
        </div>
        <h3 className="text-slate-900 font-bold text-lg mb-2">{message}</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">{sub}</p>
    </div>
);

// --- Main Dashboard ---

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('live'); // 'live', 'questions'
    const [questions, setQuestions] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    const router = useRouter();
    const isMounted = useRef(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    // Polling Sync
    const performSync = useCallback(async () => {
        if (!token) return;
        try {
            // Parallel Fetch
            const [qRes, sRes] = await Promise.all([
                axios.get(`${apiUrl}/api/admin/quiz`).catch(() => ({ data: [] })),
                axios.get(`${apiUrl}/api/sessions`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ data: [] }))
            ]);

            if (isMounted.current) {
                setQuestions(Array.isArray(qRes.data) ? qRes.data : []);
                setSessions(Array.isArray(sRes.data) ? sRes.data : []);
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        isMounted.current = true;
        if (!token) {
            router.push('/admin/login');
            return;
        }

        const init = async () => {
            await performSync();
        };
        init();
        const interval = setInterval(performSync, 3000); // 3 seconds fast polling for realtime
        const clock = setInterval(() => setTime(new Date()), 1000);

        return () => {
            isMounted.current = false;
            clearInterval(interval);
            clearInterval(clock);
        };
    }, [token, router, performSync]);

    const activeSessions = sessions.filter(s => s.status === 'active');
    const completedSessions = sessions.filter(s => s.status === 'completed');

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this session?")) return;
        try {
            await axios.delete(`${apiUrl}/api/sessions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            performSync();
        } catch (e) { alert("Error deleting"); }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-600 selection:bg-indigo-100 selection:text-indigo-900">

            {/* Sidebar / Navigation Rail */}
            <nav className="fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-100 flex flex-col items-center py-8 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-12 shadow-indigo-200 shadow-lg">
                    U
                </div>

                <div className="flex-1 flex flex-col space-y-8 w-full items-center">
                    <button onClick={() => setActiveTab('live')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'live' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                        <span className="text-xl">⚡</span>
                    </button>
                    <button onClick={() => setActiveTab('questions')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'questions' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                        <span className="text-xl">📚</span>
                    </button>


                    <button onClick={() => setActiveTab('campaigns')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'campaigns' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                        <span className="text-xl">📢</span>
                    </button>

                    <button onClick={() => setActiveTab('messages')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'messages' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                        <span className="text-xl">📩</span>
                    </button>
                </div>

                <button onClick={() => { localStorage.removeItem('adminToken'); router.push('/admin/login'); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 transition-all">
                    <span className="text-xl">↪</span>
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="pl-20 min-h-screen">
                {/* Header */}
                <header className="px-12 py-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-indigo-50/50">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {activeTab === 'live' ? 'Abariho ubu' : activeTab === 'questions' ? 'Ibibazo' : activeTab === 'campaigns' ? 'Kwamamaza' : 'Ubutumwa'}
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {activeTab === 'live' ? 'Gukurikirana abakoresha urubuga' : activeTab === 'questions' ? 'Gucunga ibibazo' : activeTab === 'campaigns' ? 'Gucunga kwamamaza' : 'Ubutumwa bwakiriwe'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                            <span className="block text-sm font-bold text-slate-900">{time.toLocaleTimeString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{time.toLocaleDateString()}</span>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img
                                src={`https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff`}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-12 max-w-7xl mx-auto">
                    {/* Tabs (Secondary) */}
                    <div className="flex space-x-2 mb-10 overflow-x-auto pb-2">
                        {activeTab === 'live' && (
                            <>
                                <TabButton
                                    label="Abari Gukora"
                                    count={activeSessions.length}
                                    active={true}
                                    icon="🟢"
                                    onClick={() => { }}
                                />
                                <div className="w-px h-10 bg-slate-200 mx-4 self-center"></div>
                                <div className="flex items-center space-x-4 pl-4">
                                    <div className="flex -space-x-3">
                                        {activeSessions.slice(0, 5).map((s, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase" title={s.userName}>
                                                {s.userName?.[0]}
                                            </div>
                                        ))}
                                        {activeSessions.length > 5 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                +{activeSessions.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        {activeTab === 'questions' && (
                            <TabButton
                                label="Ibibazo Byose"
                                count={questions.length}
                                active={true}
                                icon="📦"
                                onClick={() => { }}
                            />
                        )}
                    </div>

                    {/* Content Grid */}
                    {activeTab === 'live' && (
                        <div>
                            {activeSessions.length === 0 && completedSessions.length === 0 && (
                                <EmptyState message="No Action Yet" sub="Waiting for users to join the quiz..." />
                            )}

                            {activeSessions.length > 0 && (
                                <div className="mb-16">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                        Abari mu kizamini ubu <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-[10px]">LIVE</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {activeSessions.map(session => (
                                            <UserCard key={session.id} session={session} onDelete={handleDelete} currentTime={time} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {completedSessions.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Abanditse vuba</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                        {completedSessions.map(session => (
                                            <UserCard key={session.id} session={session} onDelete={handleDelete} currentTime={time} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 p-8 min-h-[600px]">
                            <QuestionsManage isEmbedded={true} />
                        </div>
                    )}

                    {activeTab === 'campaigns' && (
                        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 p-2 min-h-[600px]">
                            <CampaignManager />
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 p-2 min-h-[600px]">
                            <Messages />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
