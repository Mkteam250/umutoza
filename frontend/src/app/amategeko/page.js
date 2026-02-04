// export const runtime = 'edge'; // Removed for static export compatibility
export const dynamic = 'force-static'; // Ensure static generation at build time

import Link from 'next/link';
import QuestionsList from '@/components/QuestionsList';

// Fetch data on the server
async function getQuestions() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    try {
        console.log(`Fetching questions from: ${apiUrl}/api/admin/quiz`);
        const res = await fetch(`${apiUrl}/api/admin/quiz`);
        if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching questions:", error);
        if (error.cause) console.error("Cause:", error.cause);
        return [];
    }
}

export const metadata = {
    title: "Amategeko y'Umuhanda & Ibibazo - Umutoza Question Bank",
    description: "Explore our comprehensive database of Rwanda driving test questions. Study traffic rules, signs, and typical exam questions to prepare efficiently.",
    keywords: "Rwanda driving test questions, ibibazo by'amategeko y'umuhanda, traffic rules Rwanda, study guide, Umutoza database",
    openGraph: {
        title: "Umutoza Question Bank - Amategeko y'Umuhanda",
        description: "Browse hundreds of practice questions for the Rwanda provisional driving license.",
        images: ['/umutoza.png'],
    },
};

export default async function AmategekoPage() {
    const questions = await getQuestions();

    return (
        <div className="min-h-screen bg-[#F0E6F7] text-slate-900 font-sans pb-20">
            {/* Header */}
            <div className="bg-indigo-900 text-white pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-40"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 font-heading tracking-tight">
                        Isomero ry&apos; <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Amategeko</span>
                    </h1>
                    <p className="text-xl text-indigo-200 max-w-2xl mx-auto font-medium">
                        Shakisha, iga, kandi wimenyereze ibibazo byose bishoboka bizaza mu kizamini cyawe.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <QuestionsList initialQuestions={questions} />

                <div className="mt-20 text-center">
                    <Link
                        href="/"
                        className="inline-block px-8 py-4 bg-white text-indigo-900 font-black rounded-full shadow-lg hover:bg-indigo-50 transition-all border border-indigo-100"
                    >
                        ← Subira Ahabanza
                    </Link>
                </div>
            </div>
        </div>
    );
}
