const URL_PLANOS_COLETIVOS =
  'https://coletivo.consultoque.com.br';

export function CollectivePlansCall() {
  return (
    <section
      id="planos-coletivos"
      className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-14 text-center text-white"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-blue-100">
          Empresas e grupos
        </p>

        <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
          Temos Planos Coletivos
        </h2>

        <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-50 md:text-xl">
          Soluções acessíveis para empresas, grupos e equipes cuidarem
          da saúde de seus colaboradores.
        </p>

        <a
          href={URL_PLANOS_COLETIVOS}
          className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-black text-blue-700 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-50 active:scale-95"
        >
          Saiba mais sobre os planos coletivos
        </a>
      </div>
    </section>
  );
}