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
    // Fundo preto, mas permitindo o scroll (overflow-y: auto)
    document.documentElement.style.backgroundColor = "black";
    document.body.style.backgroundColor = "black";
    document.body.style.overflowY = "auto"; 

    window._wq = window._wq || [];
    window._wq.push({
      id: wistiaId,
      options: {
        autoPlay: true,
        playerColor: "2566af",
      },
      onReady: (video: any) => {
        setVideoReady(true);
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
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      if (document.body.contains(script1)) document.body.removeChild(script1);
      if (document.body.contains(script2)) document.body.removeChild(script2);
    };
  }, []);

  const goToSite = () => {
    const searchParams = window.location.search;
    window.location.href = "/" + searchParams;
  };

  return (
    /* Tiramos o justify-center para o vídeo não ficar "preso" e permitimos scroll */
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-8 pb-20 relative">
      
      {/* O container agora tem uma largura máxima, mas permite que você role a página */}
      <div className="w-[95%] max-w-lg md:max-w-xl lg:max-w-2xl relative shadow-2xl">
        
        <div 
          className="wistia_responsive_wrapper" 
          style={{ 
            height: "auto", 
            width: "100%", 
            aspectRatio: "9/16", /* Mantém a bitola vertical */
            position: "relative",
            backgroundColor: "black" 
          }}
        >
          <div 
            className={`wistia_embed wistia_async_${wistiaId} seo=true videoFoam=true`} 
            style={{ height: "100%", width: "100%", position: "relative" }}
          >
          </div>
        </div>

        {/* Botão de "Saber Mais" */}
        {showButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
            <button
              onClick={goToSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl md:text-2xl font-bold flex items-center gap-3 shadow-2xl animate-bounce"
            >
              <PlayIcon fill="white" /> CLIQUE PARA SABER MAIS
            </button>
          </div>
        )}

        {!videoReady && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
            <div className="text-white text-xl animate-pulse">Carregando...</div>
          </div>
        )}
      </div>
    </div>
  );
}