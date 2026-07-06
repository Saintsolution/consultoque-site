import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';

import { Home } from './pages/Home';
import { FormIndividual } from './pages/FormIndividual';
import { FormFamiliar } from './pages/FormFamiliar';
import { FormColetivo } from './pages/FormColetivo';

import { SejaAfiliado } from './pages/SejaAfiliado';
import { InscricaoColaborador } from './pages/InscricaoColaborador';
import { AdminAsaas } from './pages/AdminAsaas';
import { ColaboradorDashboard } from './pages/ColaboradorDashboard';
import { EmpresaDashboard } from './pages/EmpresaDashboard';
import { ClienteDashboard } from './pages/ClienteDashboard';
import { Play } from './pages/Play';
import { VideoAfiliados } from './pages/VideoAfiliados';
import { FAQ } from './pages/FAQ';
import { Termos } from './pages/Termos';
import { Privacidade } from './pages/Privacidade';

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    const path = window.location.pathname.substring(1);

    const rotasExistentes = [
      'admin',
      'seja-afiliado',
      'play',
      'faq',
      'termos',
      'privacidade',
      'colaborador',
      'empresa',
      'cliente',
      'form-individual',
      'form-familiar',
      'form-coletivo',
      'inscricao-colaborador',
      'videoafiliados',
    ];

    const isRefPath =
      path && !isNaN(Number(path)) && !rotasExistentes.includes(path);

    const finalRef = refParam || (isRefPath ? path : null);

    if (finalRef) {
      const refFormatado = finalRef.padStart(4, '0');
      localStorage.setItem('referenciador_id', refFormatado);

      if (isRefPath) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/form-individual" element={<FormIndividual />} />
        <Route path="/form-familiar" element={<FormFamiliar />} />
        <Route path="/form-coletivo" element={<FormColetivo />} />

        <Route path="/cliente" element={<ClienteDashboard />} />
        <Route path="/colaborador" element={<ColaboradorDashboard />} />
        <Route path="/empresa" element={<EmpresaDashboard />} />
        <Route path="/admin" element={<AdminAsaas />} />

        <Route path="/seja-afiliado" element={<SejaAfiliado />} />
        <Route path="/inscricao-colaborador" element={<InscricaoColaborador />} />
        <Route path="/play" element={<Play />} />
        <Route path="/videoafiliados" element={<VideoAfiliados />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}