import {
  useEffect,
} from 'react';

import {
  Routes,
  Route,
} from 'react-router-dom';

import {
  ScrollToTop,
} from './components/ScrollToTop';

import {
  Home,
} from './pages/Home';

import {
  FormIndividual,
} from './pages/FormIndividual';

import {
  FormFamiliar,
} from './pages/FormFamiliar';

import {
  FormColetivo,
} from './pages/FormColetivo';

import {
  SejaAfiliado,
} from './pages/SejaAfiliado';

import {
  InscricaoColaborador,
} from './pages/InscricaoColaborador';

import {
  AdminAsaas,
} from './pages/AdminAsaas';

import {
  MaterialPromocional,
} from './pages/MaterialPromocional';

import {
  PanfletosPromocionais,
} from './pages/PanfletosPromocionais';

import {
  MontarFolder,
} from './pages/MontarFolder';

import {
  SolicitarImpressos,
} from './pages/SolicitarImpressos';

import {
  EmpresaDashboard,
} from './pages/EmpresaDashboard';

import {
  Play,
} from './pages/Play';

import {
  VideoAfiliados,
} from './pages/VideoAfiliados';

import {
  FAQ,
} from './pages/FAQ';

import {
  Termos,
} from './pages/Termos';

import {
  Privacidade,
} from './pages/Privacidade';

const URL_ASSOCIADO =
  'https://coletivo.consultoque.com.br/associado';

const URL_COLABORADOR =
  'https://coletivo.consultoque.com.br/colaborador';

/*
 * Nome antigo mantido para não quebrar
 * as funcionalidades do site Vendas.
 */
const CHAVE_REFERENCIADOR_LOCAL =
  'referenciador_id';

const COOKIE_REFERENCIADOR_ANTIGO =
  'referenciador_id';

/*
 * Cookie compartilhado entre:
 * consultoque.com.br
 * coletivo.consultoque.com.br
 */
const COOKIE_INDICADOR_COMPARTILHADO =
  'indicador_consultoque';

type RedirecionamentoProps = {
  destino: string;
  mensagem: string;
};

function RedirecionamentoExterno({
  destino,
  mensagem,
}: RedirecionamentoProps) {
  useEffect(() => {
    window.location.replace(
      destino
    );
  }, [
    destino,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
          ↗
        </div>

        <p className="font-bold text-slate-700">
          {mensagem}
        </p>

        <a
          href={destino}
          className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          Continuar
        </a>
      </div>
    </main>
  );
}

export default function App() {
  useEffect(() => {
    /*
     * Aceita indicação nestes formatos:
     *
     * consultoque.com.br/0002
     * consultoque.com.br/?ref=0002
     */
    const params =
      new URLSearchParams(
        window.location.search
      );

    const refParam =
      params.get('ref');

    const caminhoCompleto =
      window.location.pathname.substring(
        1
      );

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
      /^\d{1,4}$/.test(
        caminhoCompleto
      );

    const referenciaEncontrada =
      refParam ||
      (
        isRefPath
          ? caminhoCompleto
          : null
      );

    if (!referenciaEncontrada) {
      return;
    }

    const somenteNumeros =
      String(
        referenciaEncontrada
      ).replace(
        /\D/g,
        ''
      );

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
      somenteNumeros.padStart(
        4,
        '0'
      );

    const validadeEmSegundos =
      60 * 60 * 24 * 30;

    /*
     * Mantém a chave antiga no localStorage,
     * porque outras páginas do site Vendas
     * ainda podem utilizá-la.
     */
    localStorage.setItem(
      CHAVE_REFERENCIADOR_LOCAL,
      refFormatado
    );

    /*
     * Mantém também o cookie antigo,
     * evitando quebrar funcionalidades existentes
     * dentro do site Vendas.
     */
    document.cookie = [
      `${COOKIE_REFERENCIADOR_ANTIGO}=${refFormatado}`,
      'Path=/',
      `Max-Age=${validadeEmSegundos}`,
      'SameSite=Lax',
    ].join('; ');

    /*
     * Cria o novo cookie compartilhado.
     * Em produção, o domínio .consultoque.com.br
     * permite que o site Empresas também o leia.
     */
    const partesCookieCompartilhado = [
      `${COOKIE_INDICADOR_COMPARTILHADO}=${refFormatado}`,
      'Path=/',
      `Max-Age=${validadeEmSegundos}`,
      'SameSite=Lax',
    ];

    const dominioConsulToque =
      window.location.hostname ===
        'consultoque.com.br' ||
      window.location.hostname.endsWith(
        '.consultoque.com.br'
      );

    if (dominioConsulToque) {
      partesCookieCompartilhado.push(
        'Domain=.consultoque.com.br'
      );

      partesCookieCompartilhado.push(
        'Secure'
      );
    }

    document.cookie =
      partesCookieCompartilhado.join(
        '; '
      );

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
          element={
            <FormIndividual />
          }
        />

        <Route
          path="/form-familiar"
          element={
            <FormFamiliar />
          }
        />

        <Route
          path="/form-coletivo"
          element={
            <FormColetivo />
          }
        />

        {/*
         * O acesso antigo do associado agora abre
         * a Área do Associado do sistema coletivo.
         */}
        <Route
          path="/cliente"
          element={
            <RedirecionamentoExterno
              destino={
                URL_ASSOCIADO
              }
              mensagem="Abrindo a Área do Associado..."
            />
          }
        />

        {/*
         * O acesso antigo do colaborador agora abre
         * a Área do Colaborador do sistema coletivo.
         */}
        <Route
          path="/colaborador"
          element={
            <RedirecionamentoExterno
              destino={
                URL_COLABORADOR
              }
              mensagem="Abrindo a Área do Colaborador..."
            />
          }
        />

        <Route
          path="/material-promocional"
          element={
            <MaterialPromocional />
          }
        />

        <Route
          path="/panfletos-promocionais"
          element={
            <PanfletosPromocionais />
          }
        />

        <Route
          path="/montar-folder"
          element={
            <MontarFolder />
          }
        />

        <Route
          path="/solicitar-impressos"
          element={
            <SolicitarImpressos />
          }
        />

        {/*
         * Novo dashboard administrativo.
         * Possui login protegido por token.
         */}
        <Route
          path="/admin"
          element={
            <EmpresaDashboard />
          }
        />

        {/*
         * Painel administrativo antigo.
         * Mantido temporariamente para conferência.
         */}
        <Route
          path="/admin-asaas"
          element={
            <AdminAsaas />
          }
        />

        <Route
          path="/seja-afiliado"
          element={
            <SejaAfiliado />
          }
        />

        <Route
          path="/inscricao-colaborador"
          element={
            <InscricaoColaborador />
          }
        />

        {/*
         * Página universal dos vídeos promocionais.
         *
         * Exemplo:
         * /play/crianca-noite/0002
         */}
        <Route
          path="/play/:video/:ref"
          element={
            <Play />
          }
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
          element={
            <Play />
          }
        />

        {/*
         * Mantida como segurança.
         * Sem nome de vídeo, o Play mostrará
         * "Vídeo não encontrado".
         */}
        <Route
          path="/play"
          element={
            <Play />
          }
        />

        <Route
          path="/videoafiliados"
          element={
            <VideoAfiliados />
          }
        />

        <Route
          path="/faq"
          element={
            <FAQ />
          }
        />

        <Route
          path="/termos"
          element={
            <Termos />
          }
        />

        <Route
          path="/privacidade"
          element={
            <Privacidade />
          }
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