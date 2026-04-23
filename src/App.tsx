import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';

// Componentes da Home
import { HeaderVisual } from './components/HeaderVisual';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { Problem } from './components/Problem';
import { Telemedicine } from './components/Telemedicine';
import { Specialties } from './components/Specialties';
import { ClubBenefits } from './components/ClubBenefits';
import { Extra } from './components/Extra'; 
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AffiliateCall } from './components/AffiliateCall';

// Páginas
import { SejaAfiliado } from './pages/SejaAfiliado';
import { Play } from './pages/Play';
import { VideoAfiliados } from './pages/VideoAfiliados'; 
import { FAQ } from './pages/FAQ';
import { Termos } from './pages/Termos';
import { Privacidade } from './pages/Privacidade';

// IMPORTAÇÃO DA NOVA LANDING PAGE DE VENDAS
import { Vendas } from './pages/Vendas';

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
        
        {/* 🚀 NOVA ROTA DE VENDAS (ESCONDIDA) */}
        <Route path="/vendas" element={<Vendas />} />

        <Route path="/seja-afiliado" element={<SejaAfiliado />} />
        <Route path="/play" element={<Play />} />
        <Route path="/videoafiliados" element={<VideoAfiliados />} />
        
        {/* Rotas de conformidade e FAQ */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Routes>
    </>
  );
}