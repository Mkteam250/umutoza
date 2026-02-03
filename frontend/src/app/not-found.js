'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F0E6F7] flex items-center justify-center font-sans">
            <div className="text-center">
                <h1 className="text-4xl font-black text-indigo-900 mb-4">404</h1>
                <p className="text-indigo-700/60 font-medium">Turatunganya page...</p>
            </div>
        </div>
    );
}
