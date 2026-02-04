'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function QuestionsList({ initialQuestions = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState(initialQuestions);

    React.useEffect(() => {
        if (!initialQuestions || initialQuestions.length === 0) {
            const fetchQuestions = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
                    const res = await fetch(`${apiUrl}/api/admin/quiz`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestions(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch client-side questions", error);
                }
            };
            fetchQuestions();
        } else {
            setQuestions(initialQuestions);
        }
    }, [initialQuestions]);

    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) return questions;
        const lowerTerm = searchTerm.toLowerCase();
        return questions.filter(q =>
            q.questionText.toLowerCase().includes(lowerTerm)
        );
    }, [questions, searchTerm]);

    return (
        <>
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-10 border border-slate-100">
                <div className="relative w-full md:flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Shakisha ikibazo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Questions Grid */}
            {filteredQuestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuestions.map((q) => (
                        <Link
                            href={`/amategeko/${q.id}`}
                            key={q.id}
                            className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                        >
                            <h3 className="font-bold text-lg text-slate-800 mb-4 line-clamp-4 leading-snug group-hover:text-indigo-700 transition-colors">
                                {q.questionText}
                            </h3>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">A</div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">B</div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">{q.options?.length > 2 ? '+' : ''}</div>
                                </div>
                                <span className="text-xs font-black text-indigo-500 uppercase flex items-center group-hover:translate-x-1 transition-transform">
                                    Reba Ibisubizo <span className="ml-1 text-lg">→</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold text-slate-400">Nta kibazo kibonetse.</h3>
                    <p className="text-slate-500 mt-2">Gerageza gushaka irindi jambo.</p>
                </div>
            )}
        </>
    );
}
