import type {
  MouseEvent,
} from 'react';

import {
  Link,
} from 'react-router-dom';

const URL_CADASTRO_COLABORADOR =
  'https://coletivo.consultoque.com.br/seja-colaborador';

function obterCodigoIndicador() {
  const armazenado =
    localStorage.getItem(
      'referenciador_id'
    );

  const numeros =
    String(armazenado ?? '')
      .replace(/\D/g, '');

  if (
    numeros.length < 1 ||
    numeros.length > 4
  ) {
    return '0001';
  }

  return numeros.padStart(
    4,
    '0'
  );
}

function criarLinkCadastro() {
  const indicador =
    obterCodigoIndicador();

  return (
    `${URL_CADASTRO_COLABORADOR}` +
    `?ref=${encodeURIComponent(indicador)}`
  );
}

function abrirCadastro(
  event: MouseEvent<HTMLAnchorElement>
) {
  event.preventDefault();

  window.location.href =
    criarLinkCadastro();
}

export function SejaAfiliado() {
  return (
    <div className="min-h-screen bg-white">
      {/* VOLTAR */}
      <div className="p-6">
        <Link
          to="/"
          className="font-semibold text-blue-600"
        >
          ← Voltar para o site
        </Link>
      </div>

      {/* HERO AFILIADO */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-500 px-6 py-24 text-center text-white">
        <h1 className="mb-6 text-4xl font-extrabold md:text-6xl">
          Seja um parceiro de indicações ConsulToque
        </h1>

        <p className="mx-auto mb-6 max-w-5xl text-xl font-semibold md:text-3xl">
          Construa sua renda recorrente com nosso sistema de células
        </p>

        <p className="mx-auto max-w-4xl text-lg text-green-50 md:text-2xl">
          Ao se tornar nosso colaborador, você recebe um{' '}
          <strong>link exclusivo</strong>. Indique pessoas e receba
          comissões automáticas todos os meses por cada indicado ativo.
        </p>

        <div className="mt-10">
          <a
            href={URL_CADASTRO_COLABORADOR}
            onClick={abrirCadastro}
            className="inline-flex transform items-center justify-center rounded-full border-b-4 border-green-800 bg-[#22C55E] px-14 py-6 text-xl font-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#16a34a] active:scale-95 md:px-20 md:text-2xl"
          >
            Quero meu link exclusivo e começar
          </a>
        </div>
      </section>

      {/* PROVA / GANHO RECORRENTE */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="flex justify-center">
            <img
              src="/vendedor.png"
              alt="Ganhos recorrentes com indicações"
              className="w-full max-w-sm rounded-2xl object-contain shadow-2xl"
            />
          </div>

          <div>
            <h2 className="mb-6 text-3xl font-extrabold md:text-4xl">
              Sua Renda Recorrente, Mês a Mês
            </h2>

            <p className="mb-4 text-lg md:text-xl">
              Ganhe apenas indicando a ConsulToque. Aqui, cada pessoa que
              você indica torna-se um ativo que gera comissão constante e
              automática.
            </p>

            <p className="text-lg md:text-xl">
              Ao formar sua base, você cria uma fonte de renda previsível
              que cresce no seu ritmo.
              <strong> Liberdade real:</strong> o seu esforço de hoje
              constrói a estabilidade do seu amanhã.
            </p>
          </div>
        </div>
      </section>

      {/* CONTEXTO AZUL COM VÍDEOS */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 py-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-12">
          <h2 className="mb-8 text-3xl font-extrabold uppercase md:text-4xl">
            PORQUÊ INDICAR A ConsulToque?
          </h2>

          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-lg">
              <iframe
                src="https://fast.wistia.net/embed/iframe/54eu0gg5vq?videoFoam=true"
                title="Video 1"
                allow="autoplay; fullscreen"
                frameBorder="0"
                className="h-full w-full"
              />
            </div>

            <div className="mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-2xl">
              <iframe
                src="https://fast.wistia.net/embed/iframe/c7gl82cath?videoFoam=true"
                title="Video 2"
                allow="autoplay; fullscreen"
                frameBorder="0"
                className="h-full w-full"
              />
            </div>

            <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-lg">
              <iframe
                src="https://fast.wistia.net/embed/iframe/mxjr8nkqqe?videoFoam=true"
                title="Video 3"
                allow="autoplay; fullscreen"
                frameBorder="0"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-24 text-center text-white">
        <h2 className="mb-6 text-3xl font-extrabold md:text-4xl">
          Crie sua rede de clientes indicados por você
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg font-medium opacity-90 md:text-xl">
          Ao formar sua rede, você amplia seus resultados: se alguém usar
          seu link para se tornar um colaborador, você também recebe
          comissões sobre as indicações geradas por ele.
        </p>

        <a
          href={URL_CADASTRO_COLABORADOR}
          onClick={abrirCadastro}
          className="inline-block rounded-full bg-white px-16 py-6 text-2xl font-black text-green-700 shadow-2xl transition-transform hover:scale-105"
        >
          Quero meu link exclusivo e começar
        </a>
      </section>
    </div>
  );
}