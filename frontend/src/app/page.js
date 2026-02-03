import Landingpage from '@/components/landingpage';

export const metadata = {
  title: "Amategeko y'umuhanda",
  description: "Umutoza ni urubuga rwa mbere mu Rwanda rugufasha kwitegura neza ikizamini cy'uruhushya rw'agateganyo. Gutsinda k'ubuntu kandi mu buryo bworoshye.",
  keywords: "Umutoza, Rwanda provisional test, amategeko y'umuhanda, Rwanda driving license, ikizamini cy'agateganyo, road rules Rwanda",
  openGraph: {
    title: "Umutoza - Pass Your Rwanda Provisional Driving Test",
    description: "Itegure neza uburyo bwo kubona uruhushya rw'agateganyo mu Rwanda.",
    images: ['/umutoza.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Umutoza - Rwanda Provisional Driving Test Prep",
    description: "Pass your driving test on the first try with Umutoza.",
    images: ['/umutoza.png'],
  },
};

export default function Home() {
  return <Landingpage />;
}
