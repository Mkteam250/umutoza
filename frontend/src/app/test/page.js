import QuizTestPage from '@/components/test';

export const metadata = {
    title: "Kora Ikizamini cy'Agateganyo - Umutoza Practice Test",
    description: "Tangira imyitozo y'ikizamini cy'agateganyo mu Rwanda ubu. Practice the official Rwanda provisional driving test for free.",
    keywords: "practice driving test Rwanda, Rwanda provisional mock exam, kora ikizamini cy'agateganyo, Rwanda road signs quiz",
    openGraph: {
        title: "Start Your Rwanda Provisional Test - Umutoza",
        description: "Are you ready for your driving test? Take our free mock exam today.",
        images: ['/umutoza.png'],
    },
};

export default function TestPage() {
    return <QuizTestPage />;
}
