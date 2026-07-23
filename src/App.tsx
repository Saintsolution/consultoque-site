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
import { MaterialPromocional } from './pages/MaterialPromocional';
import { PanfletosPromocionais } from './pages/PanfletosPromocionais';
import { MontarFolder } from './pages/MontarFolder';
import { SolicitarImpressos } from './pages/SolicitarImpressos';
import { EmpresaDashboard } from './pages/EmpresaDashboard';
import { ClienteDashboard } from './pages/ClienteDashboard';
import { Play } from './pages/Play';
import { VideoAfiliados } from './pages/VideoAfiliados';
import { FAQ } from './pages/FAQ';
import { Termos } from './pages/Termos';
import { Privacidade } from './pages/Privacidade';

export default function App() {
  useEffect(() => {
    /*
     * Aceita indicação nestes formatos:
     *
     * consultoque.com.br/0002
     * consultoque.com.br/?ref=0002
     */
    const params = new URLSearchParams(
      window.location.search
    );

    const refParam = params.get('ref');

    const caminhoCompleto =
      window.location.pathname.substring(1);

    /*
     * Só considera referência pelo caminho quando existe
     * apenas um número na raiz.
     *
     * Exemplos válidos:
     * /2
     * /0002
     *
     * Exemplos ignorados:
     * /play/crianca-noite/0002
     * /colaborador
     * /cliente
     */
    const isRefPath =
      caminhoCompleto !== '' &&
      /^\d{1,4}$/.test(caminhoCompleto);

    const referenciaEncontrada =
      refParam ||
      (isRefPath ? caminhoCompleto : null);

    if (!referenciaEncontrada) {
      return;
    }

    const somenteNumeros = String(
      referenciaEncontrada
    ).replace(/\D/g, '');

    /*
     * Impede gravar referências vazias ou maiores
     * que quatro dígitos.
     */
    if (
      !somenteNumeros ||
      somenteNumeros.length > 4
    ) {
      return;
    }

    const refFormatado =
      somenteNumeros.padStart(4, '0');

    /*
     * Salva no localStorage.
     */
    localStorage.setItem(
      'referenciador_id',
      refFormatado
    );

    /*
     * Salva também como cookie por 30 dias.
     */
    document.cookie = [
      `referenciador_id=${refFormatado}`,
      'path=/',
      `max-age=${60 * 60 * 24 * 30}`,
      'SameSite=Lax',
    ].join('; ');

    /*
     * Quando o visitante entra por /0002,
     * limpa visualmente o endereço sem recarregar.
     */
    if (isRefPath) {
      window.history.replaceState(
        {},
        '',
        '/'
      );
    }
  }, []);

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/form-individual"
          element={<FormIndividual />}
        />

        <Route
          path="/form-familiar"
          element={<FormFamiliar />}
        />

        <Route
          path="/form-coletivo"
          element={<FormColetivo />}
        />

        <Route
          path="/cliente"
          element={<ClienteDashboard />}
        />

        <Route
          path="/colaborador"
          element={<ColaboradorDashboard />}
        />

        <Route
          path="/material-promocional"
          element={<MaterialPromocional />}
        />

        <Route
          path="/panfletos-promocionais"
          element={<PanfletosPromocionais />}
        />

        <Route
          path="/montar-folder"
          element={<MontarFolder />}
        />

        <Route
          path="/solicitar-impressos"
          element={<SolicitarImpressos />}
        />

        {/*
         * Novo dashboard administrativo.
         * Possui login protegido por token.
         */}
        <Route
          path="/admin"
          element={<EmpresaDashboard />}
        />

        {/*
         * Painel administrativo antigo.
         * Mantido temporariamente para conferência.
         */}
        <Route
          path="/admin-asaas"
          element={<AdminAsaas />}
        />

        <Route
          path="/seja-afiliado"
          element={<SejaAfiliado />}
        />

        <Route
          path="/inscricao-colaborador"
          element={<InscricaoColaborador />}
        />

        {/*
         * Página universal dos vídeos promocionais.
         *
         * Exemplo:
         * /play/crianca-noite/0002
         */}
        <Route
          path="/play/:video/:ref"
          element={<Play />}
        />

        {/*
         * Permite testar sem informar colaborador.
         * O Play utilizará 0001.
         *
         * Exemplo:
         * /play/crianca-noite
         */}
        <Route
          path="/play/:video"
          element={<Play />}
        />

        {/*
         * Mantida como segurança.
         * Sem nome de vídeo, o Play mostrará
         * "Vídeo não encontrado".
         */}
        <Route
          path="/play"
          element={<Play />}
        />

        <Route
          path="/videoafiliados"
          element={<VideoAfiliados />}
        />

        <Route
          path="/faq"
          element={<FAQ />}
        />

        <Route
          path="/termos"
          element={<Termos />}
        />

        <Route
          path="/privacidade"
          element={<Privacidade />}
        />

        {/*
         * Também permite que /0001 seja inicialmente
         * renderizado como Home. O useEffect acima
         * salva a referência e limpa o endereço.
         */}
        <Route
          path="*"
          element={<Home />}
        />
      </Routes>
    </>
  );
}