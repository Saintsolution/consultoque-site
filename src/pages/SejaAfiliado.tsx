import { Link } from 'react-router-dom';

export function SejaAfiliado() {
  return (
    <div className="min-h-screen bg-white">

      {/* VOLTAR */}
      <div className="p-6">
        <Link to="/" className="text-blue-600 font-semibold">
          ← Voltar para o site
        </Link>
      </div>

      {/* HERO AFILIADO */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-500 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Seja um afiliado ConsulToque
        </h1>

        <p className="text-xl md:text-3xl font-semibold max-w-5xl mx-auto mb-6">
          Construa sua aposentadoria muito antes do que você imagina
        </p>

        <p className="text-lg md:text-2xl max-w-4xl mx-auto text-green-50">
          Ganhe comissões <strong>recorrentes</strong> todos os meses,
          vendendo um plano popular, acessível e de fácil aceitação.
        </p>

        {/* CTA HERO */}
        <div className="mt-10">
          <a
            href="https://affiliate.hotmart.com/affiliate-recruiting/view/0884P103466181"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center
              bg-[#22C55E] hover:bg-[#16a34a]
              text-white
              px-14 py-6 md:px-20
              rounded-full
              shadow-[0_18px_40px_rgba(0,0,0,0.35)]
              transition-all duration-300
              transform hover:scale-105 active:scale-95
              border-b-4 border-green-800
              text-xl md:text-2xl font-black
            "
          >
            Quero me afiliar agora
          </a>
        </div>
      </section>

      {/* PROVA / GANHO RECORRENTE */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div className="flex justify-center">
            <img
              src="/vendedor.png"
              alt="Ganhos recorrentes com afiliados"
              className="w-full max-w-sm rounded-2xl shadow-2xl object-contain"
            />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Comissão recorrente que constrói renda fixa
            </h2>

            <p className="text-lg md:text-xl mb-4">
              Sua Renda Fixa com Comissão Recorrente.<strong> Faça 1 venda por dia</strong>, e em menos de um ano
              <strong> conquiste R$ 2.000,00 mensais.</strong> Lucre até quando  
estiver de férias. <strong>Liberdade real</strong>.
            </p>

            <p className="text-lg md:text-xl">
              Essa renda vem das <strong>mensalidades recorrentes</strong> pagas
              pelos clientes que você indicou.
            </p>
          </div>
        </div>
      </section>

      {/* CONTEXTO AZUL - ATUALIZADO COM VÍDEO VERTICAL (ESTILO TIKTOK) */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
        <div className="max-w-6xl mx-auto text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 uppercase">
            PORQUÊ VENDER TELEMEDICINA?
          </h2>

          <p className="text-lg md:text-xl max-w-4xl mx-auto mb-12 text-blue-50">
            Produto de <strong>baixo custo</strong>, alta aceitação popular,
            atendimento rápido, remoto e acessível.
          </p>

          {/* GRID DE VÍDEOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Vídeo 1 - Quadrado */}
            <div className="aspect-square w-full bg-black/20 rounded-xl overflow-hidden shadow-lg border border-white/10">
              <iframe 
                src="https://fast.wistia.net/embed/iframe/54eu0gg5vq?videoFoam=true" 
                title="Wistia video player" 
                allow="autoplay; fullscreen" 
                frameBorder="0" 
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Vídeo 2 - Vertical (TikTok Style 9:16) */}
            <div className="aspect-[9/16] w-full max-w-[300px] mx-auto bg-black/20 rounded-xl overflow-hidden shadow-2xl border border-white/20">
              <iframe 
                src="https://fast.wistia.net/embed/iframe/c7gl82cath?videoFoam=true" 
                title="Wistia video player" 
                allow="autoplay; fullscreen" 
                frameBorder="0" 
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Vídeo 3 - Quadrado */}
            <div className="aspect-square w-full bg-black/20 rounded-xl overflow-hidden shadow-lg border border-white/10">
              <iframe 
                src="https://fast.wistia.net/embed/iframe/mxjr8nkqqe?videoFoam=true" 
                title="Wistia video player" 
                allow="autoplay; fullscreen" 
                frameBorder="0" 
                className="w-full h-full"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* MANUAL PASSO A PASSO */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-center">
          Como se tornar afiliado e começar a vender
        </h2>

        {/* PASSO 1 */}
        <div className="mb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">1. Cadastre-se na Hotmart</h3>
            <p className="text-lg">
              Faça seu cadastro gratuito como afiliado no portal oficial. Entre no link. Nas telas seguintes, escolha ser afiliado, vender produtos, e entre com seus dados, rede social (preferencialmente YouTube, se não tiver nenhuma), telefone e endereço.Feito isso, aguarde alguns minutos enquanto o HOTMART valida suas infos. Feita a afiliação, saia e  passe a etapa seguinte, acessando o link de afiliação direto da Consultoque.
            </p>
            <a
              href="https://hotmart.com/pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-green-600 font-bold underline"
            >
              Associe-se a Hotmart
            </a>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela01.webp" alt="Cadastro Hotmart" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        {/* PASSO 2 */}
        <div className="mb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">2. Solicite a afiliação</h3>
            <p className="text-lg">
              Feita a sua associação, acesse o link disponível aqui e solicite sua afiliação ao ConsulToque. Ao final, o sistema avisa que você está afiliado.
            </p>
            <a
              href="https://affiliate.hotmart.com/affiliate-recruiting/view/0884P103466181"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-green-600 font-bold underline"
            >
              Link de afiliação ConsulToque
            </a>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela02.webp" alt="Solicitação de Afiliação" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        {/* PASSO 3 */}
        <div className="mb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">3. Encontre o produto</h3>
            <p className="text-lg">
              Você irá direto para os links de afiliados e material de divulgação. Se não, pode sair e entrar de novo e vá em <strong>Produtos</strong> e procure por
              <strong> ConsulToque SESSP</strong>.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela03.webp" alt="Encontrar Produto" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        {/* PASSO 4 */}
        <div className="mb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">4. Vá em LINKS DE AFILIADOS.</h3>
            <p className="text-lg">
              Ao entrar na pagina de produtos você verá duas opções, uma de LINKS PARA AFILIADOS. Estes links voce irá espalhar pelas suas redes sociais. Todos eles detém informações de que as comissões geradas pelos links serão suas.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela04.webp" alt="Links de Afiliados" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        {/* PASSO 5 */}
        <div className="mb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">5. Vá em MATERIAL DE DIVULGAÇÃO.</h3>
            <p className="text-lg">
              Descarregue materiais de vendas, textos, pdfs, imagens, baners e vídeos para suas redes. Estes materiais devem ser distribuidos junto com seus liniks de divulgação, pois é com eles que o sistema reconhece a sua venda.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela05.webp" alt="Material de Divulgação" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>

        {/* PASSO 6 */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">6. Receba suas comissões</h3>
            <p className="text-lg">
              As comissões aparecem na Hotmart e são transferidas para sua conta.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img src="/tela06.webp" alt="Receber Comissões" className="w-full rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-24 px-6 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
          Comece hoje a construir sua renda recorrente
        </h2>

        <a
          href="https://affiliate.hotmart.com/affiliate-recruiting/view/0884P103466181"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-green-700 px-16 py-6 rounded-full text-2xl font-black shadow-2xl hover:scale-105 transition-transform"
        >
          Quero me afiliar agora
        </a>
      </section>

    </div>
  );
}