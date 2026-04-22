import { Routes, Route } from 'react-router-dom';

import { ScrollToTop } from './components/ScrollToTop';

import { HeaderVisual } from './components/HeaderVisual';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { Problem } from './components/Problem';
import { Telemedicine } from './components/Telemedicine';
import { Specialties } from './components/Specialties';
import { ClubBenefits } from './components/ClubBenefits';
import { Extra } from './components/Extra'; // <--- Importação da nova seção de legalização
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AffiliateCall } from './components/AffiliateCall';

import { SejaAfiliado } from './pages/SejaAfiliado';
import { Play } from './pages/Play';
import { VideoAfiliados } from './pages/VideoAfiliados'; 

// Importação das novas páginas que criamos
import { FAQ } from './pages/FAQ';
import { Termos } from './pages/Termos';
import { Privacidade } from './pages/Privacidade';

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
      
      {/* 🛡️ SEÇÃO DE LEGALIZAÇÃO: Inserida estrategicamente antes dos testemunhos */}
      <Extra /> 
      
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
        {/* Rota para o vídeo de captação de afiliados */}
        <Route path="/videoafiliados" element={<VideoAfiliados />} />
        
        {/* Rotas para conformidade do Google Ads e FAQ */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Routes>
    </>
  );
}