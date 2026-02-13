import { Routes, Route } from 'react-router-dom';

import { ScrollToTop } from './components/ScrollToTop';

import { HeaderVisual } from './components/HeaderVisual';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { Problem } from './components/Problem';
import { Telemedicine } from './components/Telemedicine';
import { Specialties } from './components/Specialties';
import { ClubBenefits } from './components/ClubBenefits';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AffiliateCall } from './components/AffiliateCall';

import { SejaAfiliado } from './pages/SejaAfiliado';
import { Play } from './pages/Play';

function Home() {
  return (
    <>
      <HeaderVisual />
      <Hero />
      <Benefits />
      <Problem />
      <Telemedicine />
      <Specialties />
      <AffiliateCall />
      <ClubBenefits />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      {/* 🔒 FORÇA SCROLL NO TOPO EM TODA TROCA DE ROTA */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/seja-afiliado" element={<SejaAfiliado />} />
        <Route path="/play" element={<Play />} />
      </Routes>
    </>
  );
}
