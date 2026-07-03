import { HeaderVisual } from '../components/HeaderVisual';
import { Hero } from '../components/Hero';
import { Problem } from '../components/Problem';
import { Telemedicine } from '../components/Telemedicine';
import { PlanGrid } from '../components/PlanGrid';
import { Benefits } from '../components/Benefits';
import { ClubBenefits } from '../components/ClubBenefits';
import { LegalCompliance } from '../components/LegalCompliance';
import { AffiliateCall } from '../components/AffiliateCall';
import { Footer } from '../components/Footer';

export function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <HeaderVisual />
      <Hero />

      <Problem />
      <Telemedicine />

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section id="precos">
          <PlanGrid />
        </section>

        <Benefits />
        <ClubBenefits />
        <PlanGrid />
        <LegalCompliance />
        <AffiliateCall />
      </main>

      <Footer />
    </div>
  );
}