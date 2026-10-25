import Hero from '@/coletivo/components/home/Hero';
import Benefits from '@/coletivo/components/home/Benefits';
import Pricing from '@/coletivo/components/home/Pricing';
import VideoSection from '@/coletivo/components/home/VideoSection';
import SejaColaboradorCTA from '@/coletivo/components/home/SejaColaboradorCTA';
import { LegalCompliance } from '@/coletivo/components/home/LegalCompliance';

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Pricing />
      <VideoSection />
      <SejaColaboradorCTA />
      <LegalCompliance />
    </>
  );
}