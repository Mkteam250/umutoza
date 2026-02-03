const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';

async function getQuestions() {
    try {
        const res = await fetch(`${EXTERNAL_DATA_URL}/api/admin/quiz`);
        if (!res.ok) {
            console.error("Failed to fetch questions for sitemap");
            return [];
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching questions for sitemap:", error);
        return [];
    }
}

export default async function sitemap() {
    const baseUrl = 'https://umutoza.rw'; // Or the production URL

    const questions = await getQuestions();

    const questionUrls = questions.map((q) => ({
        url: `${baseUrl}/amategeko/${q.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const routes = [
        '',
        '/amategeko',
        '/test',
        '/info',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.9,
    }));

    return [...routes, ...questionUrls];
}
