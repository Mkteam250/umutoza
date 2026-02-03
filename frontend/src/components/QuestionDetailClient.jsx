'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const QuestionDetailClient = ({ question, nextQuestionId }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <div className="min-h-screen bg-[#F0E6F7] font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 lg:p-12">

            <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 md:gap-10">
                {/* Top Navigation */}
                <div className="flex justify-between items-center">
                    <Link
                        href="/amategeko"
                        className="flex items-center text-indigo-900 font-bold opacity-70 hover:opacity-100 transition-all group"
                    >
                        <span className="mr-2 text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-sm sm:text-base">Subira Inyuma</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="glass bg-white rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden border border-white/60 relative h-full">
                            {/* Accent Line */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

                            <div className="p-6 sm:p-8 md:p-12 flex flex-col h-full">
                                {/* Question Header */}
                                <div className="mb-8 md:mb-10">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-[1.3] md:leading-tight">
                                        {question.questionText}
                                    </h1>
                                </div>

                                {/* Media Section (Optional Image) */}
                                {question.questionImage && (
                                    <div className="mb-8 md:mb-10 rounded-[24px] overflow-hidden bg-slate-50 border-2 border-slate-100/50 shadow-inner group">
                                        <div className="relative aspect-video flex items-center justify-center p-4">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${question.questionImage}`}
                                                alt="Ibisobanuro mu mashusho"
                                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Options Grid */}
                                <div className="space-y-4 mb-8">
                                    {question.options.map((option, idx) => {
                                        const isCorrect = idx === question.correctAnswerIndex;
                                        const revealClass = showAnswer
                                            ? (isCorrect
                                                ? 'bg-green-500 text-white border-green-500 shadow-xl shadow-green-200 scale-[1.01]'
                                                : 'bg-white opacity-40 grayscale border-slate-100')
                                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-lg';

                                        return (
                                            <div
                                                key={idx}
                                                className={`w-full p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-[24px] border-2 transition-all duration-300 flex items-start sm:items-center gap-4 md:gap-6 cursor-default ${revealClass}`}
                                            >
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-sm md:text-lg transition-colors ${showAnswer && isCorrect ? 'bg-white text-green-600' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-bold text-base sm:text-lg md:text-xl leading-snug flex-1 pt-0.5 sm:pt-0">
                                                    {option}
                                                </span>
                                                {showAnswer && isCorrect && (
                                                    <span className="text-xl md:text-2xl animate-bounce">✅</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Main Action */}
                                <div className="mt-auto pt-6 border-t border-slate-100/60">
                                    <button
                                        onClick={() => setShowAnswer(!showAnswer)}
                                        className="w-full py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] md:rounded-[28px] font-black text-lg md:text-xl shadow-xl shadow-indigo-200 active:scale-95 transition-all text-center flex items-center justify-center gap-3"
                                    >
                                        <span>{showAnswer ? 'Hisha Igisubizo' : 'Reba Igisubizo Nyacyo'}</span>
                                        <span className="text-2xl">{showAnswer ? '👁️‍🗨️' : '💡'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        {/* Explanation Context */}
                        <div className={`transition-all duration-700 ease-out transform ${showAnswer ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none absolute'}`}>
                            <div className="bg-yellow-50 border-2 border-yellow-100 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-yellow-200/40 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-7xl opacity-5 rotate-12 transition-transform group-hover:scale-110">💡</div>
                                <h3 className="font-black text-yellow-800 text-lg md:text-xl mb-3 relative z-10 flex items-center gap-2">
                                    Ubusobanuro nyabwo
                                </h3>
                                <p className="text-yellow-900/80 font-medium text-base md:text-lg leading-relaxed relative z-10">
                                    {question.explanation || `Igisubizo nyacyo kiboneka ku nyuguti ya ${String.fromCharCode(65 + question.correctAnswerIndex)}. Ibi bishingiye ku mategeko y'izina kwayo y'umuhanda mu Rwanda.`}
                                </p>
                            </div>
                        </div>

                        {/* CTA / Quick Links */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden overflow-visible">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h3 className="font-black text-xl md:text-2xl mb-3 relative z-10 italic">Witeguye Ikizamini?</h3>
                            <p className="text-indigo-200/80 mb-6 font-medium text-sm md:text-base relative z-10">
                                Gerageza ikizamini cyuzuye gifite ibibazo 20 nk'ibyo mu kigo cy'igihugu cy'igipolisi.
                            </p>
                            <Link
                                href="/test"
                                className="block w-full py-4 bg-white text-indigo-900 text-center rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 relative z-10"
                            >
                                Tangira Imyitozo →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Next Question) */}
            {nextQuestionId && (
                <div className="fixed bottom-6 right-6 z-[100] md:bottom-10 md:right-10 pointer-events-none">
                    <Link
                        href={`/amategeko/${nextQuestionId}`}
                        onClick={() => setShowAnswer(false)}
                        className="pointer-events-auto flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 bg-slate-900 text-white rounded-full font-black shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all group ring-4 ring-white shadow-indigo-500/20"
                    >
                        <span className="text-sm md:text-lg uppercase tracking-wider">Ikikurikiyeho</span>
                        <span className="text-xl md:text-3xl transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            )}

            {/* Background Blob Decorations (Fixed) */}
            <div className="fixed -top-20 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        </div>
    );
};

export default QuestionDetailClient;
