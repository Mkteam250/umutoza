import React, { useState } from 'react';
import Image from 'next/image';

const QuizResult = ({
    questions,
    userResults,
    userData,
    apiUrl
}) => {
    const [reviewingId, setReviewingId] = useState(null);
    const correctCount = userResults.filter(r => r.isCorrect).length;
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F0E6F7] py-12 px-4 font-sans relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="glass rounded-[50px] overflow-hidden shadow-2xl bg-white/80 backdrop-blur-xl border border-white/60">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/confetti.png')] opacity-20 bg-cover"></div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">Ikizamini Kirarangiye!</h1>
                        <p className="text-xl font-medium relative z-10">Bravo {userData.name}, watsinze {percentage}%</p>
                    </div>
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                            <div className="relative">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="#E0E7FF" strokeWidth="12" fill="transparent" />
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * percentage) / 100} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-extrabold text-indigo-900">{percentage}%</span></div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-6 rounded-[30px] border-2 border-green-100 text-center">
                                    <p className="text-green-600 font-bold text-xs uppercase mb-1">Nibyo</p>
                                    <p className="text-4xl font-extrabold text-green-700">{correctCount}</p>
                                </div>
                                <div className="bg-red-50 p-6 rounded-[30px] border-2 border-red-100 text-center">
                                    <p className="text-red-600 font-bold text-xs uppercase mb-1">Sibyo</p>
                                    <p className="text-4xl font-extrabold text-red-700">{questions.length - correctCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black text-indigo-900 uppercase tracking-tighter italic">Subiramo ibisubizo byawe</h2>
                        </div>

                        <div className="space-y-6 mb-12 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {questions.map((q, idx) => {
                                const res = userResults[idx] || {};
                                const isExpanded = reviewingId === q.id;
                                return (
                                    <div key={q.id} className={`bg-white rounded-[30px] border-2 transition-all p-1 ${res.isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                                        <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => setReviewingId(isExpanded ? null : q.id)}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-sm ${res.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</div>
                                                <p className="font-bold text-indigo-900 truncate max-w-[200px] md:max-w-md">{q.questionText}</p>
                                            </div>
                                            <span className="text-indigo-400 font-bold">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-6 pb-6 pt-2 border-t border-indigo-50">
                                                <p className="text-lg font-bold text-indigo-900 mb-6">{q.questionText}</p>
                                                {q.questionImage && (
                                                    <div className="relative w-full h-64 mb-6 shadow-sm bg-slate-50 rounded-2xl overflow-hidden">
                                                        <Image
                                                            src={`${apiUrl}${q.questionImage}`}
                                                            fill
                                                            className="object-contain"
                                                            alt="Q"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-3">
                                                    {q.options.map((opt, oIdx) => {
                                                        const isCorrect = oIdx === q.correctAnswerIndex;
                                                        const isPicked = oIdx === res.userChoice;
                                                        return (
                                                            <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center space-x-3 ${isCorrect ? 'border-green-500 bg-green-50 text-green-700 font-bold' : isPicked ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                                                                <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + oIdx)}</span>
                                                                <span>{opt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {q.explanation && <div className="mt-6 p-4 bg-indigo-50 rounded-2xl text-indigo-700 border-l-4 border-indigo-400 italic text-sm">💡 {q.explanation}</div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={() => typeof window !== 'undefined' && window.location.reload()} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[30px] font-black text-xl shadow-xl active:scale-95 transition-all">GERAGEZA BUSHYA</button>
                    </div>
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }`}</style>
        </div>
    );
};

export default QuizResult;
