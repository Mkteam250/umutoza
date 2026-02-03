import React from 'react';
import { Helmet } from 'react-helmet-async';

const QuizLanding = ({
    userData,
    setUserData,
    imagePreview,
    setImagePreview,
    handleStartQuiz,
    isLoading,
    quizState,
    setQuizState,
    apiUrl
}) => {
    const isWelcomeBack = localStorage.getItem('umutoza_user_name') && quizState === 'landing';

    return (
        <div className="min-h-screen bg-[#F0E6F7] flex items-center justify-center p-6 font-sans">
            <Helmet>
                <title>Start Your Rwanda Provisional Test - Umutoza</title>
                <meta name="description" content="Iyandikishe kugira ngo utangire imyitozo y'ikizamini cy'agateganyo. Register to start your free Rwanda provisional driving mock exam." />
            </Helmet>
            <div className="glass max-w-lg w-full rounded-[50px] overflow-hidden shadow-2xl p-10 lg:p-16 animate-zoomIn bg-white/80 backdrop-blur-xl border border-white/50">
                {isWelcomeBack ? (
                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="w-full h-full rounded-[45px] border-4 border-white shadow-2xl overflow-hidden bg-indigo-600 flex items-center justify-center">
                                <span className="text-white text-5xl font-black uppercase">{userData.name[0]}</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-indigo-900 mb-2">Muraho, {userData.name}!</h1>
                        <p className="text-indigo-700/50 font-medium mb-12 italic">Witeguye gutangira ikizamini?</p>
                        <div className="space-y-4">
                            <button
                                onClick={(e) => handleStartQuiz(e)}
                                disabled={isLoading}
                                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[30px] font-black text-xl shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                            >
                                {isLoading ? 'Irategura...' : 'TANGIRA UBU'}
                            </button>
                            <button onClick={() => setQuizState('editing')} className="w-full py-4 bg-white/50 text-indigo-600 rounded-[25px] font-bold hover:bg-white transition-all">
                                Hindura Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="text-center mb-10"><h1 className="text-3xl font-black text-indigo-900 mb-2">Iyandikishe</h1></div>
                        <form onSubmit={handleStartQuiz} className="space-y-8">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-[40px] border-4 border-white shadow-lg overflow-hidden bg-indigo-600 flex items-center justify-center transition-all">
                                        {userData.name ? (
                                            <span className="text-white text-5xl font-black uppercase">{userData.name[0]}</span>
                                        ) : (
                                            <span className="text-4xl text-white/50">�</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Profile yawe</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Izina ryawe</label>
                                <input
                                    required
                                    type="text"
                                    value={userData.name}
                                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-2xl bg-white border border-indigo-100 text-indigo-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-lg placeholder:text-indigo-200 shadow-sm"
                                    placeholder="Andika izina ryawe..."
                                />
                            </div>

                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[30px] font-black text-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                            >
                                {isLoading ? 'BIRATEGURWA...' : 'EMEZA & TANGIRA'}
                            </button>

                            {quizState === 'editing' && (
                                <button type="button" onClick={() => setQuizState('landing')} className="w-full py-2 text-indigo-400 font-bold text-sm hover:text-indigo-600 transition-colors">
                                    Subira Inyuma
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizLanding;
