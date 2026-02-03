import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const SessionHeartbeat = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const location = useLocation();

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
            const activity = getActivity(location.pathname);

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
    }, [apiUrl, location.pathname]);

    return null;
};

export default SessionHeartbeat;
