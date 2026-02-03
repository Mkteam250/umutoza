'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const QuestionsManage = ({ isEmbedded = false }) => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState('list'); // 'list', 'create', 'edit'
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        difficulty: 'Medium',
        image: null
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const router = useRouter();

    useEffect(() => {
        if (!token && !isEmbedded) {
            router.push('/admin/login');
            return;
        }
        fetchQuestions();
    }, [token, isEmbedded, router]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/admin/quiz`);
            setQuestions(res.data);
            setError('');
        } catch (err) {
            setError('Failed to load questions from server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            options: ['', '', '', ''],
            correctAnswerIndex: 0,
            difficulty: 'Medium',
            image: null
        });
        setEditingId(null);
    };

    const startEdit = (q) => {
        setEditingId(q.id);
        setFormData({
            questionText: q.questionText,
            options: q.options || ['', '', '', ''],
            correctAnswerIndex: q.correctAnswerIndex || 0,
            difficulty: q.difficulty || 'Medium',
            image: null
        });
        setView('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        const data = new FormData();
        data.append('questionText', formData.questionText);
        formData.options.forEach(opt => data.append('options', opt));
        data.append('correctAnswerIndex', formData.correctAnswerIndex);
        data.append('difficulty', formData.difficulty);
        if (formData.image) data.append('questionImage', formData.image);

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (view === 'edit') {
                await axios.put(`${apiUrl}/api/admin/quiz/${editingId}`, data, config);
            } else {
                await axios.post(`${apiUrl}/api/admin/quiz`, data, config);
            }

            resetForm();
            setView('list');
            fetchQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Database Synchronization Failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This action is permanent.')) return;
        try {
            await axios.delete(`${apiUrl}/api/admin/quiz/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchQuestions();
        } catch (err) {
            setError('Delete action failed.');
        }
    };

    // Shared Styles (Light Theme adapted)
    const containerClass = isEmbedded ? "w-full bg-transparent text-slate-600 font-sans" : "min-h-screen bg-[#F8F9FC] text-slate-600 font-sans";

    return (
        <div className={containerClass}>
            {/* Removed Helmet */}

            {!isEmbedded && (
                <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">U</div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Gucunga Ibibazo</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Home</button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase hover:bg-red-50 hover:text-red-600 transition-all">Logout</button>
                    </div>
                </nav>
            )}

            <div className={isEmbedded ? "" : "max-w-7xl mx-auto p-6 lg:p-10"}>
                {error && (
                    <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-600 font-bold animate-pulse shadow-sm">
                        ⚠️ Error: {error}
                    </div>
                )}

                {view === 'list' ? (
                    <section className="animate-fadeIn">
                        {!isEmbedded && (
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">Ubugenzuzi bw'Ibibazo</h2>
                                    <p className="text-slate-400 text-sm mt-1 font-bold">Hamaze kuboneka ibibazo {questions.length} mu kigega.</p>
                                </div>
                                <button
                                    onClick={() => { resetForm(); setView('create'); }}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                >
                                    + Akandi Kibazo
                                </button>
                            </div>
                        )}

                        {isEmbedded && (
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Ububiko bw'Ibibazo</h2>
                                <button
                                    onClick={() => { resetForm(); setView('create'); }}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                    + Ongeraho
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {questions.map(q => (
                                    <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between group hover:shadow-lg transition-all hover:border-indigo-100">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : q.difficulty === 'Medium' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ID: {q.id}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-snug truncate">{q.questionText}</h3>
                                            <div className="flex mt-3 space-x-2">
                                                {q.options.map((opt, i) => (
                                                    <span key={i} className={`text-[10px] px-2 py-1 rounded font-bold border ${i === q.correctAnswerIndex ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 mt-6 md:mt-0 flex-shrink-0">
                                            {q.questionImage && (
                                                <div className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0 shadow-sm">
                                                    <img src={`${apiUrl}${q.questionImage}`} className="w-full h-full object-cover" alt="Visual" />
                                                </div>
                                            )}
                                            <div className="flex flex-col space-y-2">
                                                <button onClick={() => startEdit(q)} className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-black transition-colors uppercase tracking-widest border border-slate-100 hover:border-indigo-100">Hindura</button>
                                                <button onClick={() => handleDelete(q.id)} className="px-4 py-2 bg-white text-slate-400 hover:text-red-500 rounded-lg text-xs font-black transition-colors uppercase tracking-widest border border-slate-100 hover:border-red-100">Siba</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {questions.length === 0 && !isLoading && <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-[0.3em] bg-slate-50 rounded-3xl border border-dashed border-slate-200">Pool is empty</div>}
                    </section>
                ) : (
                    <section className="max-w-3xl mx-auto animate-zoomIn">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter">
                                {view === 'edit' ? 'Vugurura Ibirimo' : 'Ikibazo Gishya'}
                            </h2>
                            <button onClick={() => setView('list')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 shadow-sm transition-all text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 lg:p-12 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden">
                            <div>
                                <label className="block text-[10px] font-black text-indigo-600 mb-2 uppercase tracking-[0.2em] ml-1">Question Body</label>
                                <textarea
                                    required
                                    name="questionText"
                                    value={formData.questionText}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 resize-none h-32 font-bold placeholder:text-slate-300"
                                    placeholder="Enter the main question content..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.options.map((opt, i) => (
                                    <div key={i}>
                                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Choice {String.fromCharCode(65 + i)}</label>
                                        <input
                                            required
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(i, e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-bold placeholder:text-slate-300"
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Correct Answer</label>
                                    <div className="relative">
                                        <select
                                            name="correctAnswerIndex"
                                            value={formData.correctAnswerIndex}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                                        >
                                            {formData.options.map((_, i) => (
                                                <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Difficulty</label>
                                    <div className="relative">
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-indigo-600 mb-4 uppercase tracking-[0.2em] ml-1">Visualization Asset</label>
                                <div className="flex items-start space-x-6">
                                    {(editingId && !formData.image) && questions.find(q => q.id === editingId)?.questionImage && (
                                        <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-white p-1 shadow-inner relative group">
                                            <img src={`${apiUrl}${questions.find(q => q.id === editingId).questionImage}`} className="w-full h-full object-cover rounded-lg" alt="Sync" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-black text-white p-2 text-center uppercase tracking-tighter">Replace below</div>
                                        </div>
                                    )}
                                    <div className="flex-1 relative group h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50">
                                        <input type="file" onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.image ? 'text-green-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                            {formData.image ? `Selected: ${formData.image.name}` : 'Click to Upload Image'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {isSaving ? 'Saving...' : (view === 'edit' ? 'Update Question' : 'Add to Database')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="w-full mt-4 py-3 bg-transparent text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest transition-colors text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>
    );
};

export default QuestionsManage;
