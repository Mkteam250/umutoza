'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

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

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/admin/quiz`);
            setQuestions(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError('Ntitubashije kubona ibibazo.');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (!token && !isEmbedded) {
            router.push('/admin/login');
            return;
        }
        const init = async () => {
            await fetchQuestions();
        };
        init();
    }, [token, isEmbedded, router, fetchQuestions]);

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

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
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
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        const data = new FormData();
        data.append('questionText', formData.questionText);
        data.append('options', JSON.stringify(formData.options));
        data.append('correctAnswerIndex', formData.correctAnswerIndex);
        data.append('difficulty', formData.difficulty);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const url = editingId ? `${apiUrl}/api/admin/quiz/${editingId}` : `${apiUrl}/api/admin/quiz`;
            const method = editingId ? 'put' : 'post';

            await axios({
                method,
                url,
                data,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });

            resetForm();
            setView('list');
            fetchQuestions();
        } catch (err) {
            console.error('Error saving question:', err);
            setError('Ntitubashije kubika ikibazo. Ongera ugerageze.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (q) => {
        setFormData({
            questionText: q.questionText,
            options: q.options || ['', '', '', ''],
            correctAnswerIndex: q.correctAnswerIndex,
            difficulty: q.difficulty,
            image: null
        });
        setEditingId(q.id);
        setView('edit');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ese wizeye ko ushaka gusiba iki kibazo?')) return;
        try {
            await axios.delete(`${apiUrl}/api/admin/quiz/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchQuestions();
        } catch (err) {
            console.error('Error deleting question:', err);
            setError('Ntitubashije gusiba ikibazo.');
        }
    };

    if (isLoading && view === 'list') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black">Gucunga Ibibazo</h1>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Imyitozo y&apos;Amategeko y&apos;Umuhanda</p>
                    </div>
                    {!isEmbedded && (
                        <button onClick={handleLogout} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm">Gusohoka</button>
                    )}
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold rounded-r-xl">
                            {error}
                        </div>
                    )}

                    {view === 'list' ? (
                        <>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">Ubugenzuzi bw&apos;Ibibazo</h2>
                                    <p className="text-slate-400 text-sm mt-1 font-bold">Hamaze kuboneka ibibazo {questions.length} mu kigega.</p>
                                </div>
                                <button
                                    onClick={() => { resetForm(); setView('create'); }}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                >
                                    + Akandi Kibazo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {questions.map((q) => (
                                    <div key={q.id} className="group bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                        </div>

                                        <h3 className="text-slate-800 font-bold text-lg mb-6 line-clamp-3 leading-snug">
                                            {q.questionText}
                                        </h3>

                                        {q.imageUrl && (
                                            <div className="mb-6 rounded-2xl overflow-hidden aspect-video relative">
                                                <Image
                                                    src={`${apiUrl}${q.imageUrl}`}
                                                    alt="Question"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}

                                        <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between gap-3">
                                            <button
                                                onClick={() => handleEdit(q)}
                                                className="flex-1 py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                            >
                                                Guhindura
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="px-4 py-3 bg-white text-red-500 border-2 border-red-50 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-slate-900">
                                    {editingId ? 'Hindura Ikibazo' : 'Ongeramo Ikibazo'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                >
                                    Funga
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-3">
                                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Imyandiko y&apos;ikibazo</label>
                                    <textarea
                                        name="questionText"
                                        value={formData.questionText}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                                        placeholder="Andika ikibazo hano..."
                                        required
                                    />
                                </section>

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Urwego (Difficulty)</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Ifoto (Optional)</label>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            accept="image/*"
                                        />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Ibisubizo bishoboka</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.options.map((option, index) => (
                                            <div key={index} className={`relative group transition-all`}>
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all ${formData.correctAnswerIndex === index ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                                                    }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    className={`w-full pl-16 pr-12 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-700 outline-none transition-all ${formData.correctAnswerIndex === index ? 'border-indigo-500 bg-white shadow-lg' : 'border-slate-100 focus:border-slate-300'
                                                        }`}
                                                    placeholder={`Igisubizo ${String.fromCharCode(65 + index)}`}
                                                    required={index < 2}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, correctAnswerIndex: index }))}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-all ${formData.correctAnswerIndex === index ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200'
                                                        }`}
                                                >
                                                    {formData.correctAnswerIndex === index && <span className="text-white text-[10px]">✓</span>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold italic">Kanda kuri kariya gakomane k&apos;iburyo kugira ngo ugaragaze igisubizo cy&apos;ukuri.</p>
                                </section>

                                <div className="pt-10 flex flex-col md:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-[25px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Bikaba bikwa...' : editingId ? 'Bika impinduka' : 'Launch Question'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView('list')}
                                        className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[25px] font-black text-lg uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Reka
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionsManage;
