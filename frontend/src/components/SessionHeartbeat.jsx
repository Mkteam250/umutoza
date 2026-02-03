'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

const SessionHeartbeat = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const pathname = usePathname();

    const getActivity = (path) => {
        if (path === '/') return 'Muri Home';
        if (path === '/test') return 'Ari mu Kizamini';
        if (path === '/contact') return 'Ari mu Kwandika ubutumwa';
        if (path === '/info') return 'Ari gusoma amakuru';
        return 'Ku yindi page';
    };

    useEffect(() => {
        const ping = (isLeaving = false) => {
            const sessionId = localStorage.getItem('umutoza_session_id');
            if (!sessionId) return;

            const url = `${apiUrl}/api/sessions/${sessionId}`;
            const activity = getActivity(pathname);

            if (isLeaving) {
                const blob = new Blob([JSON.stringify({ isLeaving: true, activity: 'Yasohotse' })], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                axios.put(url, { activity }).catch(e => { });
            }
        };

        const handleUnload = () => ping(true);
        window.addEventListener('beforeunload', handleUnload);

        ping();
        const interval = setInterval(() => ping(), 5000);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            clearInterval(interval);
        };
    }, [apiUrl, pathname]);

    return null;
};

export default SessionHeartbeat;
