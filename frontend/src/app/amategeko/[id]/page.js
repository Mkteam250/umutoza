// export const runtime = 'edge'; // Removed for static export compatibility
import React from 'react';
import Link from 'next/link';
import QuestionDetailClient from '@/components/QuestionDetailClient';

// Fetch specific question and determine next ID
async function getData(id) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    try {
        console.log(`Fetching specific question ${id} from: ${apiUrl}/api/admin/quiz`);
        const res = await fetch(`${apiUrl}/api/admin/quiz`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const questions = await res.json();
        const currentIndex = questions.findIndex(q => q.id.toString() === id);

        if (currentIndex === -1) {
            console.warn(`Question ${id} not found in list of ${questions.length}`);
            return { question: null, nextId: null };
        }

        const question = questions[currentIndex];

        // Circular next: if last, go to first? Or just stop. User said "go to next question".
        // Let's do circular for endless learning.
        const nextIndex = (currentIndex + 1) % questions.length;
        const nextId = questions[nextIndex]?.id.toString();

        return { question, nextId };

    } catch (error) {
        console.error(`Error fetching question ${id}:`, error);
        return { question: null, nextId: null };
    }
}

// Generate static paths for export
export async function generateStaticParams() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    try {
        console.log(`Fetching paths from: ${apiUrl}/api/admin/quiz`);
        const res = await fetch(`${apiUrl}/api/admin/quiz`);
        const questions = await res.json();
        return questions.map((q) => ({
            id: q.id.toString(),
        }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

// Dynamic Metadata
export async function generateMetadata({ params }) {
    const { id } = await params;
    const { question } = await getData(id);

    if (!question) {
        return {
            title: 'Question Not Found - Umutoza',
        };
    }

    const cleanText = question.questionText.substring(0, 80).replace(/["\n]/g, '');

    return {
        // User requested: "do not start with ikibazo on the header" - assuming meaning page title too? 
        // Or just the visual header. I'll make the page title focused on the content.
        title: `${cleanText}... - Amategeko`,
        description: `Igisubizo nyacyo cy'ikibazo: "${question.questionText}". Iga amategeko y'umuhanda na Umutoza.`,
        openGraph: {
            title: `${cleanText}`,
            description: question.questionText,
        },
    };
}

export default async function QuestionPage({ params }) {
    const { id } = await params;
    const { question, nextId } = await getData(id);

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0E6F7]">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-400">Ikibazo ntikibonetse.</h2>
                    <Link href="/amategeko" className="text-indigo-600 font-bold underline mt-4 block">Subira inyuma</Link>
                </div>
            </div>
        );
    }

    return <QuestionDetailClient question={question} nextQuestionId={nextId} />;
}
