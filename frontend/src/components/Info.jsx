'use client';

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useRouter } from 'next/navigation';

const Info = () => {
    const router = useRouter();

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const resources = [
        { title: "Amategeko y'Umuhanda", desc: "Amategeko agenga imikoreshereze y'imihanda mu Rwanda.", icon: "shield" },
        { title: "Ibyapa by'Umuhanda", desc: "Sobanukirwa ibyapa byose n'icyo bisobanura.", icon: "info" },
        { title: "Amakosa Akunze Gukorwa", desc: "Ikirinde amakosa akuramo abantu mu kizamini.", icon: "alert-triangle" },
        { title: "Ibisabwa ku Ruhushya", desc: "Inyandiko n'ibindi ukeneye kugira ngo usabe uruhushya.", icon: "file-text" }
    ];

    return (
        <div className="min-h-screen bg-[#F0E6F7] text-slate-800 font-sans relative overflow-hidden">
            {/* Removed Helmet */}

            {/* Hero */}
            <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24 container mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-900 mb-6 font-heading" data-aos="fade-up">
                    Ihuriro ry&apos; <span className="text-indigo-600">Amakuru</span>
                </h1>
                <p className="text-xl text-indigo-800/60 max-w-3xl mb-16 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
                    Ibyo ukeneye kumenya byose ku bijyanye n&apos;uruhushya rw&apos;agateganyo mu Rwanda n&apos;amategeko y&apos;umuhanda mu mwanya umwe.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
                    {resources.map((res, i) => (
                        <div key={i} className="glass p-10 rounded-[40px] hover:-translate-y-2 transition-all group flex items-start space-x-6 shadow-lg" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner uppercase font-black">
                                {res.icon.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-indigo-900 mb-2">{res.title}</h3>
                                <p className="text-indigo-800/50 font-medium leading-relaxed">{res.desc}</p>
                                <button className="mt-4 text-indigo-600 font-bold hover:underline flex items-center">
                                    Soma Birambuye <span className="ml-2 text-xl">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass rounded-[50px] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden" data-aos="zoom-in">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

                    <h2 className="text-3xl md:text-4xl font-black text-indigo-900 mb-8 relative z-10 font-heading">Witeguye kugerageza ubumenyi bwawe?</h2>
                    <p className="text-lg text-indigo-800/60 mb-10 max-w-xl mx-auto relative z-10 font-medium">
                        Gusoma ni byiza, ariko kwitoza ni byo byiza kurushaho. Imyitozo yacu ihura neza n&apos;ikizamini nyir&apos;izina.
                    </p>
                    <button onClick={() => router.push('/test')} className="px-10 py-5 bg-indigo-600 text-white rounded-[25px] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 relative z-10">Tangira Imyitozo</button>
                </div>
            </div>

            <footer className="px-6 py-12 border-t border-indigo-100 flex justify-between items-center text-indigo-800/50 text-sm mt-20">
                <p>&copy; {new Date().getFullYear()} Umutoza. Uburenganzira bwose rurariwe.</p>
                <button onClick={() => router.push('/')} className="hover:text-indigo-600 font-bold">Subira ku Ntangiriro</button>
            </footer>
        </div>
    );
};

export default Info;
