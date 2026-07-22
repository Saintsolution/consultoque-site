import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play as PlayIcon } from "lucide-react";

interface VideoConfig {
  titulo: string;
  wistiaId: string;
  formato: "vertical" | "horizontal" | "quadrado";
  aspectRatio: string;
}

interface WistiaVideoApi {
  time: () => number;
  duration: () => number;
  play: () => Promise<void> | void;
  bind: (evento: string, callback: (...args: unknown[]) => void) => void;
  unbind: (evento: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    _wq?: Array<Record<string, unknown>>;
  }
}

const videosPromocionais: Record<string, VideoConfig> = {
  "crianca-noite": {
    titulo: "Criança durante a noite",
    wistiaId: "bc1abxofrt",
    formato: "vertical",
    aspectRatio: "9/16",
  },
  "morena-tiktok": {
    titulo: "Morena TikTok",
    wistiaId: "waaunlm911",
    formato: "vertical",
    aspectRatio: "9/16",
  },
  "japones-doente": {
    titulo: "Japonês doente",
    wistiaId: "efxptifhnp",
    formato: "vertical",
    aspectRatio: "9/16",
  },
  "medico-explica": {
    titulo: "Médico explica",
    wistiaId: "6a7aa410u4",
    formato: "horizontal",
    aspectRatio: "16/9",
  },
};

const SEGUNDOS_ANTES_DO_FIM = 7;

export function Play() {
  const { video: nomeVideo, ref } = useParams<{
    video: string;
    ref: string;
  }>();

  const [showButton, setShowButton] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoSelecionado = nomeVideo
    ? videosPromocionais[nomeVideo]
    : undefined;

  const wistiaId = videoSelecionado?.wistiaId;

  /* Salva a indicação e limpa o número da barra do navegador. */
  useEffect(() => {
    const somenteNumeros = String(ref ?? "").replace(/\D/g, "");
    const referenciaDoLinkValida =
      somenteNumeros.length >= 1 && somenteNumeros.length <= 4;

    const referenciaSalva = localStorage.getItem("referenciador_id");
    const referenciaSalvaValida =
      referenciaSalva && /^\d{4}$/.test(referenciaSalva);

    const codigo = referenciaDoLinkValida
      ? somenteNumeros.padStart(4, "0")
      : referenciaSalvaValida
        ? referenciaSalva
        : "0001";

    localStorage.setItem("referenciador_id", codigo);

    document.cookie = [
      `referenciador_id=${codigo}`,
      "path=/",
      `max-age=${60 * 60 * 24 * 30}`,
      "SameSite=Lax",
    ].join("; ");

    if (ref && nomeVideo) {
      window.history.replaceState({}, "", `/play/${nomeVideo}`);
    }
  }, [ref, nomeVideo]);

  /* Carrega o embed padrão da Wistia e usa a API oficial do player. */
  useEffect(() => {
    if (!wistiaId) return;

    let api: WistiaVideoApi | undefined;
    let cancelado = false;

    setShowButton(false);
    setVideoReady(false);

    document.documentElement.style.backgroundColor = "black";
    document.body.style.backgroundColor = "black";
    document.body.style.overflowY = "auto";

    const verificarTempo = () => {
      if (!api) return;

      const tempoAtual = Number(api.time());
      const duracao = Number(api.duration());

      if (
        !Number.isFinite(tempoAtual) ||
        !Number.isFinite(duracao) ||
        duracao <= 0
      ) {
        return;
      }

      if (duracao - tempoAtual <= SEGUNDOS_ANTES_DO_FIM) {
        setShowButton(true);
      }
    };

    const terminouVideo = () => {
      setShowButton(true);
    };

    window._wq = window._wq || [];
    window._wq.push({
      id: wistiaId,
      options: {
        autoPlay: true,
        playerColor: "2566af",
        videoFoam: true,
      },
      onReady: (wistiaVideo: WistiaVideoApi) => {
        if (cancelado) return;

        api = wistiaVideo;
        setVideoReady(true);

        api.bind("secondchange", verificarTempo);
        api.bind("end", terminouVideo);
        verificarTempo();

        try {
          const resultado = api.play();
          if (resultado && typeof resultado.catch === "function") {
            resultado.catch(() => undefined);
          }
        } catch (error) {
          console.error("Autoplay bloqueado pelo navegador:", error);
        }
      },
    });

    const seletorVideo = `script[data-wistia-media="${wistiaId}"]`;
    let scriptVideo =
      document.querySelector<HTMLScriptElement>(seletorVideo);

    if (!scriptVideo) {
      scriptVideo = document.createElement("script");
      scriptVideo.src =
        `https://fast.wistia.com/embed/medias/${wistiaId}.jsonp`;
      scriptVideo.async = true;
      scriptVideo.dataset.wistiaMedia = wistiaId;
      document.body.appendChild(scriptVideo);
    }

    const seletorPrincipal = 'script[data-wistia-principal="true"]';
    let scriptPrincipal =
      document.querySelector<HTMLScriptElement>(seletorPrincipal);

    if (!scriptPrincipal) {
      scriptPrincipal = document.createElement("script");
      scriptPrincipal.src =
        "https://fast.wistia.com/assets/external/E-v1.js";
      scriptPrincipal.async = true;
      scriptPrincipal.dataset.wistiaPrincipal = "true";
      document.body.appendChild(scriptPrincipal);
    }

    return () => {
      cancelado = true;

      if (api) {
        api.unbind("secondchange", verificarTempo);
        api.unbind("end", terminouVideo);
      }

      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      document.body.style.overflowY = "";
    };
  }, [wistiaId]);

  const goToSite = () => {
    window.location.href = "/";
  };

  if (!videoSelecionado || !wistiaId) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-white text-2xl font-bold">
          Vídeo não encontrado
        </h1>
        <button
          type="button"
          onClick={goToSite}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold"
        >
          IR PARA O SITE
        </button>
      </div>
    );
  }

  let larguraContainer = "max-w-lg md:max-w-xl lg:max-w-2xl";

  if (videoSelecionado.formato === "horizontal") {
    larguraContainer = "max-w-5xl";
  }

  if (videoSelecionado.formato === "quadrado") {
    larguraContainer = "max-w-2xl";
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-8 pb-20 relative">
      <div
        className={`w-[95%] ${larguraContainer} relative shadow-2xl`}
      >
        <div
          className="relative bg-black"
          style={{
            width: "100%",
            aspectRatio: videoSelecionado.aspectRatio,
          }}
        >
          <div
            key={wistiaId}
            className={`wistia_embed wistia_async_${wistiaId} videoFoam=true`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {showButton && (
          <div className="absolute inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
            <button
              type="button"
              onClick={goToSite}
              className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm md:text-base font-bold flex items-center gap-2 shadow-xl animate-pulse"
            >
              <PlayIcon size={18} fill="white" />
              SAIBA MAIS
            </button>
          </div>
        )}

        {!videoReady && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
            <div className="text-white text-xl animate-pulse">
              Carregando...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}