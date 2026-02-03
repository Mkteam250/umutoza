import Contact from '@/components/Contact';

export const metadata = {
    title: "Contact Umutoza - Support for Rwanda Driving Permit Prep",
    description: "Tuvugishe kuri Umutoza kugira ngo ubone ubufasha ku bijyanye no kwitegura ruhushya rw'agateganyo mu Rwanda. Contact us for driving license preparation support.",
    keywords: "Contact Umutoza, support Rwanda driving test, Rwanda driving license help",
    openGraph: {
        title: "Contact Umutoza - Support",
        description: "Need help with your driving permit preparation? Reach out to us.",
        images: ['/umutoza.png'],
    },
};

export default function ContactPage() {
    return <Contact />;
}
