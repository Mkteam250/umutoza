import React from 'react';
import { Helmet } from 'react-helmet-async';

const QuizActive = ({
    questions,
    currentQuestion,
    timeLeft,
    formatTime,
    userData,
    apiUrl,
    selectedAnswerIndex,
    handleAnswerSelect
}) => {
    const currentQ = questions[currentQuestion];
    const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

    return (
        <div className="min-h-screen bg-[#F0E6F7] py-6 px-4 font-sans relative">
            <Helmet><title>Quiz - Umutoza</title></Helmet>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-[30px] border border-white/50 shadow-md">
                    <div className="flex items-center space-x-3 ml-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-white font-black uppercase text-xs">{userData.name[0]}</span>
                        </div>
                        <span className="font-black text-indigo-900 text-sm tracking-tight">{userData.name}</span>
                    </div>
                    <div className="bg-indigo-900 text-white px-6 py-2 rounded-2xl font-black text-xl flex items-center mr-4">
                        <span className="text-cyan-400 mr-2">🕒</span> {formatTime(timeLeft)}
                    </div>
                </header>

                <div className="mb-8 px-4">
                    <div className="flex justify-between text-indigo-900/40 font-bold text-[10px] uppercase tracking-widest mb-2">
                        <span>Ikibazo {currentQuestion + 1} / {questions.length}</span>
                        <span>{progress}% Byakozwe</span>
                    </div>
                    <div className="h-4 bg-white/50 rounded-full overflow-hidden p-1 border border-white shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="glass rounded-[50px] overflow-hidden shadow-2xl relative p-8 md:p-16 bg-white/60 backdrop-blur-xl border border-white/60">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-900 mb-10 leading-tight">{currentQ.questionText}</h2>

                    {currentQ.questionImage && (
                        <div className="mb-12 flex justify-center bg-white/50 p-6 rounded-[40px] border border-white/50 backdrop-blur-sm shadow-inner overflow-hidden">
                            <img src={`${apiUrl}${currentQ.questionImage}`} alt="Quiz" className="max-w-full max-h-80 object-contain rounded-2xl transition-transform duration-500 hover:scale-105" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentQ.options.map((opt, idx) => {
                            let stateClass = "border-white/50 bg-white/40 hover:bg-white/80 hover:border-indigo-200 hover:-translate-y-1 shadow-sm";
                            if (selectedAnswerIndex !== null) {
                                const isCorrect = idx === currentQ.correctAnswerIndex;
                                const isPicked = idx === selectedAnswerIndex;
                                if (isCorrect) stateClass = "border-green-500 bg-green-50 text-green-900 shadow-xl shadow-green-100 scale-[1.02]";
                                else if (isPicked) stateClass = "border-red-500 bg-red-50 text-red-900 shadow-xl shadow-red-100 scale-[0.98]";
                                else stateClass = "opacity-40 grayscale pointer-events-none";
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    disabled={selectedAnswerIndex !== null}
                                    className={`w-full text-left p-6 rounded-[30px] border-2 transition-all duration-300 flex items-center space-x-5 ${stateClass}`}
                                >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm bg-indigo-100 text-indigo-700 ${selectedAnswerIndex !== null && idx === currentQ.correctAnswerIndex ? 'bg-green-200 text-green-800' : ''}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="font-bold text-lg leading-snug">{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizActive;
