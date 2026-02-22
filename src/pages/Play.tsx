import { useEffect, useState } from "react";
import { Play as PlayIcon } from "lucide-react";

declare global {
  interface Window {
    _wq: any[];
    Wistia: any;
  }
}

export function Play() {
  const [showButton, setShowButton] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const wistiaId = "efxptifhnp";

  useEffect(() => {
    // Força o fundo preto e remove scrolls desnecessários
    document.documentElement.style.backgroundColor = "black";
    document.body.style.backgroundColor = "black";
    document.body.style.overflow = "hidden";

    window._wq = window._wq || [];
    window._wq.push({
      id: wistiaId,
      options: {
        autoPlay: true,
        playerColor: "2566af",
        copyLinkAndContext: false,
      },
      onReady: (video: any) => {
        setVideoReady(true);
        
        // Monitora o fim do vídeo para exibir o CTA
        video.bind("end", () => {
          setShowButton(true);
        });

        video.play();
      },
    });

    // Injeção dos scripts do Wistia
    const script1 = document.createElement("script");
    script1.src = `https://fast.wistia.com/embed/medias/${wistiaId}.jsonp`;
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      // Limpeza ao sair da página para não afetar o resto do site
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      document.body.style.overflow = "auto";
      if (document.body.contains(script1)) document.body.removeChild(script1);
      if (document.body.contains(script2)) document.body.removeChild(script2);
    };
  }, []);

  const goToSite = () => {
    // Captura parâmetros de afiliado (?src=... etc) e leva para a Home
    const searchParams = window.location.search;
    window.location.href = "/" + searchParams;
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative p-4 overflow-hidden">
      
      {/* Container Principal com limites de tamanho para Desk e Mobile */}
      <div className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl relative shadow-2xl">
        
        {/* Wrapper do Wistia com proporção 16:9 corrigida */}
        <div 
          className="wistia_responsive_wrapper" 
          style={{ 
            height: "auto", 
            width: "100%", 
            aspectRatio: "16/9", 
            position: "relative",
            backgroundColor: "black" 
          }}
        >
          <div 
            className={`wistia_embed wistia_async_${wistiaId} seo=true videoFoam=true`} 
            style={{ height: "100%", width: "100%", position: "relative" }}
          >
            {/* O player será injetado aqui */}
          </div>
        </div>

        {/* Botão Central de "Saber Mais" (Só aparece no final) */}
        {showButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
            <button
              onClick={goToSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-xl md:text-3xl font-black flex items-center gap-3 shadow-[0_0_50px_rgba(37,99,235,0.7)] animate-bounce transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
            >
              <PlayIcon className="w-6 h-6 md:w-8 md:h-8" fill="white" /> 
              CLIQUE AQUI PARA SABER MAIS
            </button>
          </div>
        )}

        {/* Overlay de carregamento */}
        {!videoReady && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40">
            <div className="text-white text-lg md:text-xl animate-pulse font-light tracking-[0.2em] text-center">
              PREPARANDO APRESENTAÇÃO...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}