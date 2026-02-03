'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

const PromotionDisplay = ({ forceActive = false }) => {
    const [activePromotions, setActivePromotions] = useState([]); // Store multiple active promos
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const pathname = usePathname();

    const trackImpression = useCallback(async (id) => {
        try {
            await axios.post(`${apiUrl}/api/promotions/${id}/impression`);
        } catch (e) { /* ignore */ }
    }, [apiUrl]);

    const handleClose = useCallback((id) => {
        setActivePromotions(prev => prev.filter(p => p.id !== id));
    }, []);

    const selectPromotionsToDisplay = useCallback((currentPromotions, nowValue) => {
        const isoNow = new Date(nowValue).toISOString().split('T')[0];

        // Filter by eligibility
        const checkEligibility = (promo) => {
            if (forceActive) return true;

            // Scheduling Check
            if (promo.startDate && isoNow < promo.startDate) return false;
            if (promo.endDate && isoNow > promo.endDate) return false;

            // Frequency Capping Check
            const lastShown = localStorage.getItem(`promo_last_shown_${promo.id}`);
            if (lastShown) {
                const lastShownTime = parseInt(lastShown);
                const frequencyMs = promo.frequency * (promo.frequencyUnit === 'hours' ? 3600000 : (promo.frequencyUnit === 'days' ? 86400000 : 60000));
                if ((nowValue - lastShownTime) < frequencyMs) return false;
            }

            return true;
        };

        const eligible = currentPromotions.filter(checkEligibility);
        const eligiblePopups = eligible.filter(p => p.type === 'popup');
        const eligibleBottoms = eligible.filter(p => p.type === 'bottom');

        const newStates = [];

        const bestPopup = eligiblePopups[0]; // Already sorted by priority
        const bestBottom = eligibleBottoms[0];

        if (bestPopup) newStates.push(bestPopup);
        if (bestBottom) newStates.push(bestBottom);

        // Update state and track if it's a NEW promotion
        newStates.forEach(promo => {
            const isAlreadyShowing = activePromotions.some(ap => ap.id === promo.id);
            if (!isAlreadyShowing) {
                trackImpression(promo.id);
                localStorage.setItem(`promo_last_shown_${promo.id}`, nowValue.toString());

                // Auto-hide logic for popups
                if (promo.type === 'popup' && promo.displayDuration > 0) {
                    setTimeout(() => {
                        handleClose(promo.id);
                    }, promo.displayDuration * 1000);
                }
            }
        });

        const currentIds = activePromotions.map(p => p.id).sort().join(',');
        const nextIds = newStates.map(p => p.id).sort().join(',');

        if (currentIds !== nextIds) {
            setActivePromotions(newStates);
        }
    }, [activePromotions, forceActive, handleClose, trackImpression]);

    const fetchPromotions = useCallback(async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/promotions/public`);
            let allPromotions = res.data;

            if (allPromotions.length > 0) {
                allPromotions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
                // Get time here, outside of logic blocks to satisfy purity checks
                const now = Date.now();
                selectPromotionsToDisplay(allPromotions, now);
            }
        } catch (error) {
            console.error('Error fetching promotions');
        }
    }, [apiUrl, selectPromotionsToDisplay]);

    useEffect(() => {
        const init = async () => {
            await fetchPromotions();
        };
        init();
        const interval = setInterval(fetchPromotions, 30000);
        return () => clearInterval(interval);
    }, [fetchPromotions]);

    useEffect(() => {
        if (activePromotions.some(p => p.type === 'bottom')) {
            document.body.style.paddingBottom = '100px';
        } else {
            document.body.style.paddingBottom = '0px';
        }
    }, [activePromotions]);

    const trackClick = async (id) => {
        try {
            await axios.post(`${apiUrl}/api/promotions/${id}/click`);
        } catch (e) { /* ignore */ }
    };

    const isHiddenPath = pathname.includes('/admin');
    if (isHiddenPath && !forceActive) return null;

    return (
        <>
            {activePromotions.map(promo => {
                if (promo.type === 'popup') {
                    const positionClasses = {
                        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                        'top-left': 'top-4 left-4',
                        'top-right': 'top-4 right-4',
                        'bottom-left': 'bottom-4 left-4',
                        'bottom-right': 'bottom-4 right-4'
                    };

                    return (
                        <div key={promo.id} className={`fixed z-[100] ${positionClasses[promo.position] || positionClasses['center']} max-w-[90vw] w-full md:w-auto group touch-none`}>
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-bounce-in md:max-w-md w-full mx-auto outline outline-4 outline-indigo-500/20 transition-all duration-500 group-hover:md:max-w-2xl group-active:md:max-w-2xl group-hover:z-[110] group-active:z-[110]">
                                {promo.canClose !== false && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleClose(promo.id); }}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                                    >
                                        ✕
                                    </button>
                                )}

                                <a
                                    href={promo.linkUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackClick(promo.id)}
                                    className="block"
                                >
                                    {promo.mediaType === 'video' ? (
                                        <video
                                            src={`${apiUrl}${promo.mediaUrl}`}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full max-h-[60vh] md:max-h-[400px] object-cover transition-all duration-500 group-hover:max-h-[80vh] group-hover:object-contain bg-black"
                                        />
                                    ) : (
                                        <Image
                                            src={`${apiUrl}${promo.mediaUrl}`}
                                            alt={promo.name}
                                            width={800}
                                            height={450}
                                            className="w-full max-h-[60vh] md:max-h-[400px] object-cover transition-all duration-500 group-hover:max-h-[80vh] group-hover:object-contain bg-gray-100"
                                            unoptimized
                                        />
                                    )}
                                </a>

                                {promo.showButton !== false && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                                        <a
                                            href={promo.linkUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-bold transition-all shadow-md group"
                                        >
                                            <span className="group-hover:mr-2 transition-all">{promo.ctaText || 'Learn More'}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-all">→</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                if (promo.type === 'bottom') {
                    return (
                        <div key={promo.id} className={`fixed bottom-0 left-0 w-full z-[100] animate-slide-up ${forceActive ? 'z-[120]' : 'z-[100]'} group`}>
                            <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t-2 border-indigo-500 shadow-[0_-10px_40px_rgba(79,70,229,0.3)] transition-all duration-500 h-20 md:h-24 group-hover:h-72 md:group-hover:h-96 group-active:h-72 md:group-active:h-96">
                                <div className={`max-w-screen-2xl mx-auto flex items-center justify-between h-full relative overflow-hidden transition-all duration-500`}>

                                    {promo.fullMedia ? (
                                        <a
                                            href={promo.linkUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => trackClick(promo.id)}
                                            className="absolute inset-0 w-full h-full block group"
                                        >
                                            {promo.mediaType === 'video' ? (
                                                <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:object-contain group-active:object-contain bg-black" />
                                            ) : (
                                                <Image
                                                    src={`${apiUrl}${promo.mediaUrl}`}
                                                    alt="Promo"
                                                    fill
                                                    className="object-cover group-hover:object-contain group-active:object-contain transition-all duration-500 bg-black/40"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
                                        </a>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                                            <div className="absolute top-0 left-1/4 w-32 h-full bg-white/5 skew-x-[-20deg] blur-xl animate-pulse"></div>

                                            <a
                                                href={promo.linkUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => trackClick(promo.id)}
                                                className="flex items-center h-full flex-1 group pl-2 md:pl-0"
                                            >
                                                <div className="relative h-full aspect-[16/9] md:aspect-[3/1] shrink-0 mr-4 md:mr-6 overflow-hidden md:-skew-x-12 md:-ml-4 border-r-2 border-indigo-500/50 transition-all duration-500 group-hover:skew-x-0 group-hover:ml-0 group-hover:aspect-video group-hover:h-full group-hover:border-r-0 group-active:skew-x-0 group-active:ml-0 group-active:aspect-video group-active:h-full group-active:border-r-0">
                                                    {promo.mediaType === 'video' ? (
                                                        <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-full object-cover md:skew-x-12 md:scale-110 group-hover:skew-x-0 group-hover:scale-100 group-hover:object-contain group-active:skew-x-0 group-active:scale-100 group-active:object-contain bg-black" />
                                                    ) : (
                                                        <Image
                                                            src={`${apiUrl}${promo.mediaUrl}`}
                                                            alt="Promo"
                                                            fill
                                                            className="object-cover md:skew-x-12 md:scale-110 group-hover:skew-x-0 group-hover:scale-100 group-hover:object-contain group-active:skew-x-0 group-active:scale-100 group-active:object-contain transition-all duration-700 bg-black/40"
                                                            unoptimized
                                                        />
                                                    )}
                                                </div>
                                                <div className="z-10 py-2 pr-2">
                                                    <h3 className="font-black text-white text-base md:text-2xl italic tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">{promo.name}</span>
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-indigo-200 font-bold tracking-wide line-clamp-1 uppercase">Limited Time Offer • Don&apos;t Miss Out!</p>
                                                </div>
                                            </a>

                                            <div className="flex items-center h-full pr-4 md:pr-8 space-x-4 z-20">
                                                {promo.showButton !== false && (
                                                    <a
                                                        href={promo.linkUrl || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => trackClick(promo.id)}
                                                        className="hidden md:flex items-center justify-center px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-black text-lg uppercase italic tracking-widest -skew-x-12 border-2 border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.6)] transform hover:scale-105 transition-all outline outline-1 outline-yellow-200"
                                                    >
                                                        <span className="skew-x-12">{promo.ctaText || 'PLAY NOW'}</span>
                                                    </a>
                                                )}

                                                {promo.showButton !== false && (
                                                    <a
                                                        href={promo.linkUrl || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => trackClick(promo.id)}
                                                        className="md:hidden flex px-4 py-2 bg-yellow-500 text-slate-900 font-black text-xs uppercase rounded hover:bg-yellow-400 shadow-lg"
                                                    >
                                                        {promo.ctaText ? (promo.ctaText.length > 5 ? 'GET' : promo.ctaText) : 'GET'}
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Close Button - Always on top and separate for Full Image mode */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[40]">
                                        {promo.canClose !== false && (
                                            <button
                                                onClick={() => handleClose(promo.id)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all backdrop-blur-sm shadow-lg ${promo.fullMedia ? 'bg-black/40 text-white hover:bg-red-600/80 border border-white/20' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 hover:border-red-500'}`}
                                            >
                                                <span className="text-xl font-bold leading-none mb-1">×</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </>
    );
};

export default PromotionDisplay;
