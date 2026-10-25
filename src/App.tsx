import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { ReferenciaComercial } from './app/ReferenciaComercial';
import { Home } from './pages/Home';
import { SejaAfiliado } from './pages/SejaAfiliado';
import { VideoAfiliados } from './pages/VideoAfiliados';
import { FAQ } from './pages/FAQ';
import { Termos } from './pages/Termos';
import { Privacidade } from './pages/Privacidade';
import ColetivoHome from './coletivo/pages/Home';
import HeaderColetivo from './coletivo/components/Header';
import FooterColetivo from './coletivo/components/Footer';
import FormColetivo from './coletivo/pages/FormColetivo';
import Admin from './coletivo/pages/Admin';
import Associado from './coletivo/pages/Associado';
import AssociadoDashboard from './coletivo/pages/AssociadoDashboard';
import Colaborador from './coletivo/pages/Colaborador';
import ColaboradorDashboard from './coletivo/pages/ColaboradorDashboard';
import SejaColaborador from './coletivo/pages/SejaColaborador';
import CriarSenha from './coletivo/pages/CriarSenha';
import CompletarAdesao from './coletivo/pages/CompletarAdesao';
import MaterialPromocional from './coletivo/pages/MaterialPromocional';
import PanfletosPromocionais from './coletivo/pages/PanfletosPromocionais';
import MontarFolder from './coletivo/pages/MontarFolder';
import { SolicitarImpressos } from './coletivo/pages/SolicitarImpressos';
import Play from './coletivo/pages/Play';

function Operacional({ children }: { children: ReactNode }) {
  return <div className="coletivo-layout">{children}</div>;
}
function Alias({ destino }: { destino: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: destino, search, hash }} replace />;
}
function Rolagem() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' }); }
      catch { /* Hash inválido não impede a navegação. */ }
    } else window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
}
export default function App() {
  return <ReferenciaComercial><Rolagem /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/coletivo" element={<Operacional><HeaderColetivo /><main><ColetivoHome /></main><FooterColetivo /></Operacional>} />
    <Route path="/contratar" element={<Operacional><FormColetivo /></Operacional>} />
    {['/formcoletivo', '/form-coletivo', '/formpessoal', '/form-individual', '/form-familiar'].map(path =>
      <Route key={path} path={path} element={<Alias destino="/contratar" />} />)}
    <Route path="/empresas" element={<Alias destino="/coletivo" />} />
    <Route path="/cliente" element={<Alias destino="/associado" />} />
    <Route path="/entrar" element={<Alias destino="/associado" />} />
    <Route path="/dashboard" element={<Alias destino="/associado/dashboard" />} />
    <Route path="/admin-asaas" element={<Alias destino="/admin" />} />
    <Route path="/inscricao-colaborador" element={<Alias destino="/seja-colaborador" />} />
    <Route path="/admin" element={<Operacional><Admin /></Operacional>} />
    <Route path="/associado" element={<Operacional><Associado /></Operacional>} />
    <Route path="/associado/dashboard" element={<Operacional><AssociadoDashboard /></Operacional>} />
    <Route path="/colaborador" element={<Operacional><Colaborador /></Operacional>} />
    <Route path="/colaborador/dashboard" element={<Operacional><ColaboradorDashboard /></Operacional>} />
    <Route path="/seja-colaborador" element={<Operacional><SejaColaborador /></Operacional>} />
    <Route path="/seja-colaborador/:indicador" element={<Operacional><SejaColaborador /></Operacional>} />
    <Route path="/criar-senha" element={<Operacional><CriarSenha /></Operacional>} />
    <Route path="/completar-adesao" element={<Operacional><CompletarAdesao /></Operacional>} />
    <Route path="/material-promocional" element={<Operacional><MaterialPromocional /></Operacional>} />
    <Route path="/panfletos-promocionais" element={<Operacional><PanfletosPromocionais /></Operacional>} />
    <Route path="/montar-folder" element={<Operacional><MontarFolder /></Operacional>} />
    <Route path="/solicitar-impressos" element={<Operacional><SolicitarImpressos /></Operacional>} />
    {['/play/:video/:ref', '/play/:video', '/play'].map(path => <Route key={path} path={path} element={<Operacional><Play /></Operacional>} />)}
    <Route path="/seja-afiliado" element={<SejaAfiliado />} />
    <Route path="/videoafiliados" element={<VideoAfiliados />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/termos" element={<Termos />} />
    <Route path="/privacidade" element={<Privacidade />} />
    <Route path="*" element={<Home />} />
  </Routes></ReferenciaComercial>;
}
