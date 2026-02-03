import Info from '@/components/Info';

export const metadata = {
    title: "Rwanda Traffic Rules & Road Signs - Umutoza Info Hub",
    description: "Soma amategeko y'umuhanda n'ibisobanuro by'ibyapa mu Rwanda. Complete guide to passing your Rwanda provisional driving test with official road rules and signs.",
    keywords: "Rwanda road signs meanings, Amategeko y'umuhanda mu Rwanda 2024, Ibyapa by'umuhanda, Rwanda traffic regulations, Provisional permit requirements Rwanda",
    openGraph: {
        title: "Rwanda Traffic Rules & Road Signs - Umutoza",
        description: "Everything you need to know about Rwanda road safety and regulations.",
        images: ['/umutoza.png'],
    },
};

export default function InfoPage() {
    return <Info />;
}
