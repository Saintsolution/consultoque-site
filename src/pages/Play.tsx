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
    // Fundo preto para foco total no vídeo
    document.documentElement.style.backgroundColor = "black";
    document.body.style.backgroundColor = "black";

    window._wq = window._wq || [];
    window._wq.push({
      id: wistiaId,
      options: {
        autoPlay: true,
        playerColor: "2566af",
      },
      onReady: (video: any) => {
        setVideoReady(true);
        
        // Mostra o botão somente ao final da fala do médico
        video.bind("end", () => {
          setShowButton(true);
        });

        video.play();
      },
    });

    const script1 = document.createElement("script");
    script1.src = `https://fast.wistia.com/embed/medias/${wistiaId}.jsonp`;
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      // Restaura o estilo do site ao sair da página
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      if (document.body.contains(script1)) document.body.removeChild(script1);
      if (document.body.contains(script2)) document.body.removeChild(script2);
    };
  }, []);

  const goToSite = () => {
    // IMPORTANTE: Captura os parâmetros do afiliado (ex: ?src=zap) e leva para a Home
    const searchParams = window.location.search;
    window.location.href = "/" + searchParams;
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative p-4">
      
      <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl relative">
        <div className="wistia_responsive_wrapper" style={{ height: "85vh", width: "100%", position: "relative" }}>
          <div className={`wistia_embed wistia_async_${wistiaId} seo=true videoFoam=true`} style={{ height: "100%", width: "100%", position: "relative" }}>
          </div>
        </div>

        {/* Botão de conversão com proteção de rastreio */}
        {showButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
            <button
              onClick={goToSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-2xl font-bold flex items-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.6)] animate-bounce transition-all hover:scale-110"
            >
              <PlayIcon className="w-7 h-7" fill="white" /> SABER MAIS AGORA
            </button>
          </div>
        )}

        {!videoReady && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
            <div className="text-white text-xl animate-pulse font-light tracking-widest">
              CARREGANDO APRESENTAÇÃO...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}