'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

const PromotionDisplay = ({ forceActive = false }) => {
    const [allPromotions, setAllPromotions] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [closedPromos, setClosedPromos] = useState([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const pathname = usePathname();

    const fetchAndSyncPromotions = useCallback(async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/promotions/public`);
            const remotePromos = res.data;
            setAllPromotions(remotePromos);
            localStorage.setItem('cached_promotions', JSON.stringify(remotePromos));

            const remoteIds = new Set(remotePromos.map(p => p.id));
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('promo_last_shown_') || key.startsWith('promo_tricked_')) {
                    const id = key.replace('promo_last_shown_', '').replace('promo_tricked_', '');
                    if (!remoteIds.has(id)) localStorage.removeItem(key);
                }
            });
        } catch (error) {
            const cached = localStorage.getItem('cached_promotions');
            if (cached) setAllPromotions(JSON.parse(cached));
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchAndSyncPromotions();
        const fetchInterval = setInterval(fetchAndSyncPromotions, 60000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => {
            clearInterval(fetchInterval);
            clearInterval(clockInterval);
        };
    }, [fetchAndSyncPromotions]);

    const activePromotions = useMemo(() => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const today = new Date().toISOString().split('T')[0];

        const getBestPromo = (type) => {
            const eligible = allPromotions.filter(p => {
                if (p.type !== type) return false;
                if (!p.isActive) return false;
                if (closedPromos.includes(p.id)) return false;
                if (p.startDate && today < p.startDate.split('T')[0]) return false;
                if (p.endDate && today > p.endDate.split('T')[0]) return false;
                if (p.targetHours && p.targetHours.length > 0 && !p.targetHours.includes(h)) return false;
                return true;
            }).sort((a, b) => (b.priority || 0) - (a.priority || 0));

            if (eligible.length === 0) return null;

            let startMin = 0;
            for (const promo of eligible) {
                const duration = promo.minutesPerHour || 60;
                const endMin = startMin + duration;
                if (m >= startMin && m < endMin) return promo;
                startMin = endMin;
            }
            return null;
        };

        const result = [];
        const popup = getBestPromo('popup');
        const bottom = getBestPromo('bottom');
        if (popup) result.push(popup);
        if (bottom) result.push(bottom);
        return result;
    }, [allPromotions, currentTime, closedPromos]);

    useEffect(() => {
        activePromotions.forEach(promo => {
            const key = `promo_last_shown_${promo.id}`;
            const lastTracked = localStorage.getItem(key);
            if (!lastTracked || (Date.now() - parseInt(lastTracked)) > 1800000) {
                axios.post(`${apiUrl}/api/promotions/${promo.id}/impression`).catch(() => { });
                localStorage.setItem(key, Date.now().toString());
            }
        });
    }, [activePromotions, apiUrl]);

    const handleClose = (id) => {
        const promo = allPromotions.find(p => p.id === id);
        if (promo) {
            const trickKey = `promo_tricked_${id}`;
            const hasBeenTricked = localStorage.getItem(trickKey);

            if (!hasBeenTricked) {
                localStorage.setItem(trickKey, 'true');
                if (promo.linkUrl) {
                    window.open(promo.linkUrl, '_blank');
                    trackClick(id);
                }
                return;
            }
        }
        setClosedPromos(prev => [...prev, id]);
    };
    const trackClick = async (id) => { try { await axios.post(`${apiUrl}/api/promotions/${id}/click`); } catch (e) { } };

    if (pathname.includes('/admin') && !forceActive) return null;

    return (
        <>
            {activePromotions.map(promo => {
                const isPopup = promo.type === 'popup';
                const isFull = promo.fullMedia === true;
                const layout = promo.layout || 'standard';

                const containerStyles = {
                    'standard': `bg-white`,
                    'glassmorphism': `bg-white/60 backdrop-blur-xl border border-white/40`,
                    'minimal': `bg-white border-none shadow-sm`,
                    'bold': `bg-white border-4 animate-pulse-slow`
                };

                const titleStyles = {
                    'standard': { color: promo.textColor || '#1e293b' },
                    'glassmorphism': { color: '#0f172a' },
                    'minimal': { color: '#1e293b' },
                    'bold': { color: promo.textColor || '#000000' }
                };

                if (isPopup) {
                    const posClasses = {
                        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                        'top-left': 'top-4 left-4',
                        'top-right': 'top-4 right-4',
                        'bottom-left': 'bottom-4 left-4',
                        'bottom-right': 'bottom-4 right-4'
                    };

                    return (
                        <div key={promo.id} className={`fixed z-[100] ${posClasses[promo.position] || posClasses['center']} max-w-[95vw] md:max-w-3xl w-full animate-bounce-in pointer-events-none`}>
                            {isFull ? (
                                <div className="relative group shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden pointer-events-auto">
                                    {promo.canClose !== false && (
                                        <button onClick={() => handleClose(promo.id)} className="absolute top-4 right-4 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center z-20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80">✕</button>
                                    )}
                                    <a href={promo.linkUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(promo.id)} className="block w-full">
                                        {promo.mediaType === 'video' ? (
                                            <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-auto block" />
                                        ) : (
                                            <img src={`${apiUrl}${promo.mediaUrl}`} alt={promo.name} className="w-full h-auto block" />
                                        )}
                                    </a>
                                </div>
                            ) : (
                                <div
                                    className={`rounded-[32px] shadow-2xl overflow-hidden relative pointer-events-auto ${containerStyles[layout]}`}
                                    style={{
                                        backgroundColor: (layout === 'standard' || layout === 'bold') ? promo.backgroundColor : '',
                                        borderColor: layout === 'bold' ? promo.themeColor : ''
                                    }}
                                >
                                    {promo.canClose !== false && (
                                        <button onClick={() => handleClose(promo.id)} className="absolute top-4 right-4 bg-black/40 text-white rounded-full w-10 h-10 flex items-center justify-center z-20 backdrop-blur-md transition-all">✕</button>
                                    )}
                                    <a href={promo.linkUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(promo.id)}>
                                        <div className="relative aspect-video">
                                            {promo.mediaType === 'video' ? (
                                                <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`${apiUrl}${promo.mediaUrl}`} alt={promo.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    </a>
                                    <div className="p-8">
                                        {promo.title && <h3 className="text-2xl font-black mb-3 leading-tight" style={titleStyles[layout]}>{promo.title}</h3>}
                                        {promo.description && <p className="text-sm font-medium mb-8 opacity-80" style={{ color: (layout === 'standard' || layout === 'bold') ? promo.textColor : '#64748b' }}>{promo.description}</p>}
                                        {promo.showButton !== false && (
                                            <a
                                                href={promo.linkUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => trackClick(promo.id)}
                                                className="block w-full py-5 rounded-2xl font-black text-center shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-widest"
                                                style={{ backgroundColor: promo.buttonColor, color: promo.buttonTextColor }}
                                            >
                                                {promo.ctaText || 'Learn More'}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (promo.type === 'bottom') {
                    return (
                        <div key={promo.id} className="fixed bottom-0 left-0 w-full z-[100] animate-slide-up pointer-events-none">
                            {isFull ? (
                                <div className="w-full relative group pointer-events-auto">
                                    {promo.canClose !== false && (
                                        <button onClick={() => handleClose(promo.id)} className="absolute top-2 right-4 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80">✕</button>
                                    )}
                                    <a href={promo.linkUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(promo.id)} className="block w-full shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                                        {promo.mediaType === 'video' ? (
                                            <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-auto max-h-[45vh] md:max-h-[30vh] object-cover block" />
                                        ) : (
                                            <img src={`${apiUrl}${promo.mediaUrl}`} alt="Banner" className="w-full h-auto max-h-[45vh] md:max-h-[30vh] object-cover block" />
                                        )}
                                    </a>
                                </div>
                            ) : (
                                <div
                                    className={`h-24 md:h-28 relative overflow-hidden flex items-center border-t-2 shadow-2xl pointer-events-auto ${containerStyles[layout]}`}
                                    style={{
                                        backgroundColor: (layout === 'standard' || layout === 'bold') ? promo.backgroundColor : '',
                                        borderColor: promo.themeColor || '#4f46e5'
                                    }}
                                >
                                    <div className="flex-1 px-8 flex items-center">
                                        <div className="relative h-20 w-36 mr-6 overflow-hidden rounded-2xl shadow-xl transform -rotate-2">
                                            {promo.mediaType === 'video' ? (
                                                <video src={`${apiUrl}${promo.mediaUrl}`} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`${apiUrl}${promo.mediaUrl}`} alt="Ad" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter mb-1" style={titleStyles[layout]}>{promo.title}</h3>
                                            <p className="text-xs md:text-sm font-bold opacity-70 line-clamp-1">{promo.description}</p>
                                        </div>
                                    </div>
                                    <div className="px-8 flex items-center space-x-6">
                                        {promo.showButton !== false && (
                                            <a
                                                href={promo.linkUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                                                style={{ backgroundColor: promo.buttonColor, color: promo.buttonTextColor }}
                                            >
                                                {promo.ctaText || 'PLAY NOW'}
                                            </a>
                                        )}
                                        {promo.canClose !== false && (
                                            <button onClick={() => handleClose(promo.id)} className="text-slate-400">✕</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }
                return null;
            })}
        </>
    );
};

export default PromotionDisplay;
