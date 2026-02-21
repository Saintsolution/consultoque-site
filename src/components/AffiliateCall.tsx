import { Link } from 'react-router-dom';

export function AffiliateCall() {
  return (
    <section className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-20 px-6 text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
        Seja um Afiliado e lucre todos os meses!
      </h2>

      <p className="text-lg md:text-2xl max-w-4xl mx-auto mb-10">
        Ganhe comissões recorrentes sobre cada assinatura indicada. 
        Cadastro grátis, rápido e com material de divulgação pronto. 
        Comece a faturar agora!
      </p>

      <Link
        to="/seja-afiliado"
        className="inline-block bg-white text-green-600 px-14 py-6 rounded-full
                   text-xl md:text-2xl font-black shadow-2xl
                   transition hover:scale-105 active:scale-95"
      >
        Quero ser afiliado
      </Link>
    </section>
  );
}
