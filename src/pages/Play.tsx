import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Play as PlayIcon } from "lucide-react";

interface VideoConfig {
  titulo: string;
  wistiaId: string;
  formato: "vertical" | "horizontal" | "quadrado";
  aspectRatio: string;
}

interface WistiaIframeApi {
  currentTime: number;
  duration: number;
  play: () => Promise<void> | void;
  addEventListener: (
    evento: string,
    callback: () => void
  ) => void;
  removeEventListener: (
    evento: string,
    callback: () => void
  ) => void;
}

interface WistiaIframeElement
  extends HTMLIFrameElement {
  wistiaApi?: WistiaIframeApi;
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

export function Play() {
  const { video: nomeVideo, ref } = useParams<{
    video: string;
    ref: string;
  }>();

  const iframeRef =
    useRef<WistiaIframeElement | null>(null);

  const [showButton, setShowButton] =
    useState(false);

  const [videoReady, setVideoReady] =
    useState(false);

  const videoSelecionado = nomeVideo
    ? videosPromocionais[nomeVideo]
    : undefined;

  const wistiaId = videoSelecionado?.wistiaId;

  /*
   * Captura, salva e mascara o código do colaborador.
   *
   * Exemplo:
   * /play/crianca-noite/0002
   *
   * Depois de salvar, o endereço mostrado será:
   * /play/crianca-noite
   */
  useEffect(() => {
    const somenteNumeros = String(ref ?? "").replace(
      /\D/g,
      ""
    );

    const referenciaDoLinkValida =
      somenteNumeros.length >= 1 &&
      somenteNumeros.length <= 4;

    const referenciaSalva = localStorage.getItem(
      "referenciador_id"
    );

    const referenciaSalvaValida =
      referenciaSalva &&
      /^\d{4}$/.test(referenciaSalva);

    const codigo = referenciaDoLinkValida
      ? somenteNumeros.padStart(4, "0")
      : referenciaSalvaValida
        ? referenciaSalva
        : "0001";

    localStorage.setItem(
      "referenciador_id",
      codigo
    );

    document.cookie = [
      `referenciador_id=${codigo}`,
      "path=/",
      `max-age=${60 * 60 * 24 * 30}`,
      "SameSite=Lax",
    ].join("; ");

    /*
     * Esconde o número do colaborador sem recarregar.
     */
    if (ref && nomeVideo) {
      window.history.replaceState(
        {},
        "",
        `/play/${nomeVideo}`
      );
    }
  }, [ref, nomeVideo]);

  /*
   * Prepara a página e carrega o script necessário
   * para acessar a API do iframe da Wistia.
   */
  useEffect(() => {
    if (!wistiaId) return;

    setShowButton(false);
    setVideoReady(false);

    document.documentElement.style.backgroundColor =
      "black";

    document.body.style.backgroundColor = "black";
    document.body.style.overflowY = "auto";

    const scriptExistente =
      document.querySelector<HTMLScriptElement>(
        'script[data-wistia-iframe-api="true"]'
      );

    if (!scriptExistente) {
      const script =
        document.createElement("script");

      script.src =
        "https://fast.wistia.net/player.js";

      script.async = true;
      script.dataset.wistiaIframeApi = "true";

      document.body.appendChild(script);
    }

    return () => {
      document.documentElement.style.backgroundColor =
        "";

      document.body.style.backgroundColor = "";
      document.body.style.overflowY = "";
    };
  }, [wistiaId]);

  /*
   * Depois que o iframe carregar, procura a API
   * da Wistia e controla o botão final.
   */
  useEffect(() => {
    if (!videoReady || !wistiaId) return;

    let api: WistiaIframeApi | undefined;
    let tentativas = 0;
    let cancelado = false;

    const verificarTempo = () => {
      if (!api) return;

      const tempoAtual = Number(api.currentTime);
      const duracao = Number(api.duration);

      if (
        !Number.isFinite(tempoAtual) ||
        !Number.isFinite(duracao) ||
        duracao <= 0
      ) {
        return;
      }

      const tempoRestante =
        duracao - tempoAtual;

      if (tempoRestante <= 5) {
        setShowButton(true);
      }
    };

    const terminouVideo = () => {
      setShowButton(true);
    };

    const conectarApi = () => {
      if (cancelado) return;

      api = iframeRef.current?.wistiaApi;

      if (!api) {
        tentativas += 1;

        /*
         * Aguarda até dez segundos pela API.
         * O vídeo permanece visível mesmo se a
         * API demorar ou não ficar disponível.
         */
        if (tentativas < 100) {
          window.setTimeout(
            conectarApi,
            100
          );
        }

        return;
      }

      api.addEventListener(
        "time-update",
        verificarTempo
      );

      api.addEventListener(
        "ended",
        terminouVideo
      );

      try {
        const resultado = api.play();

        if (
          resultado &&
          typeof resultado.catch === "function"
        ) {
          resultado.catch(() => {
            /*
             * Se o navegador bloquear autoplay,
             * o player exibirá o botão normal.
             */
          });
        }
      } catch (error) {
        console.error(
          "Autoplay bloqueado pelo navegador:",
          error
        );
      }
    };

    conectarApi();

    return () => {
      cancelado = true;

      if (api) {
        api.removeEventListener(
          "time-update",
          verificarTempo
        );

        api.removeEventListener(
          "ended",
          terminouVideo
        );
      }
    };
  }, [videoReady, wistiaId]);

  /*
   * A indicação já está salva.
   * Por isso o botão pode ir diretamente para a Home.
   */
  const goToSite = () => {
    window.location.href = "/";
  };

  /*
   * Vídeo não cadastrado.
   */
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

  let larguraContainer =
    "max-w-lg md:max-w-xl lg:max-w-2xl";

  if (videoSelecionado.formato === "horizontal") {
    larguraContainer = "max-w-5xl";
  }

  if (videoSelecionado.formato === "quadrado") {
    larguraContainer = "max-w-2xl";
  }

  const urlVideo =
    `https://fast.wistia.net/embed/iframe/${wistiaId}` +
    `?web_component=true&autoplay=true&playerColor=2566af`;

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-8 pb-20 relative">
      <div
        className={`w-[95%] ${larguraContainer} relative shadow-2xl`}
      >
        <div
          className="relative bg-black"
          style={{
            width: "100%",
            aspectRatio:
              videoSelecionado.aspectRatio,
          }}
        >
          <iframe
            key={wistiaId}
            ref={iframeRef}
            src={urlVideo}
            title={videoSelecionado.titulo}
            allow="autoplay; fullscreen"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
            onLoad={() => {
              setVideoReady(true);
            }}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {showButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
            <button
              type="button"
              onClick={goToSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl md:text-2xl font-bold flex items-center gap-3 shadow-2xl animate-bounce"
            >
              <PlayIcon fill="white" />

              CLIQUE PARA SABER MAIS
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