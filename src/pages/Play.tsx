import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play as PlayIcon } from "lucide-react";

declare global {
  interface Window {
    _wq: any[];
    Wistia: any;
  }
}

interface VideoConfig {
  titulo: string;
  wistiaId: string;
  formato: "vertical" | "horizontal" | "quadrado";
  aspectRatio: string;
}

const videosPromocionais: Record<string, VideoConfig> = {
  "crianca-noite": {
    titulo: "Criança durante a noite",
    wistiaId: "p0tnqk8s6k",
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

  const [showButton, setShowButton] = useState(false);
  const [videoReady, setVideoReady] = useState(false);


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
    const somenteNumeros = String(ref ?? "")
      .replace(/\D/g, "");

    const referenciaDoLinkValida =
      somenteNumeros.length >= 1 &&
      somenteNumeros.length <= 4;

    const referenciaSalva =
      localStorage.getItem("referenciador_id");

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
   * Carrega e controla o vídeo da Wistia.
   */
  useEffect(() => {
    if (!wistiaId) return;

    setShowButton(false);
    setVideoReady(false);

    document.documentElement.style.backgroundColor =
      "black";

    document.body.style.backgroundColor = "black";
    document.body.style.overflowY = "auto";

    window._wq = window._wq || [];

    window._wq.push({
      id: wistiaId,

      options: {
        autoPlay: true,
        playerColor: "2566af",
      },

      onReady: (wistiaVideo: any) => {
        setVideoReady(true);

        /*
         * Mostra o botão faltando cinco segundos.
         */
        const verificarTempo = () => {
          const tempoAtual = Number(
            wistiaVideo.time()
          );

          const duracao = Number(
            wistiaVideo.duration()
          );

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

        wistiaVideo.bind(
          "secondchange",
          verificarTempo
        );

        /*
         * Continua mostrando depois que terminar.
         */
        wistiaVideo.bind("end", () => {
          setShowButton(true);
        });

        wistiaVideo.play();
      },
    });

    /*
     * Script específico do vídeo.
     */
    const scriptVideo =
      document.createElement("script");

    scriptVideo.src =
      `https://fast.wistia.com/embed/medias/${wistiaId}.jsonp`;

    scriptVideo.async = true;
    scriptVideo.dataset.wistiaVideo = wistiaId;

    document.body.appendChild(scriptVideo);

    /*
     * Script principal da Wistia.
     * Só adiciona se ainda não estiver carregado.
     */
    const scriptPrincipalExistente =
      document.querySelector<HTMLScriptElement>(
        'script[data-wistia-principal="true"]'
      );

    if (!scriptPrincipalExistente) {
      const scriptPrincipal =
        document.createElement("script");

      scriptPrincipal.src =
        "https://fast.wistia.com/assets/external/E-v1.js";

      scriptPrincipal.async = true;

      scriptPrincipal.dataset.wistiaPrincipal =
        "true";

      document.body.appendChild(
        scriptPrincipal
      );
    }

    return () => {
      document.documentElement.style.backgroundColor =
        "";

      document.body.style.backgroundColor = "";
      document.body.style.overflowY = "";

      if (
        document.body.contains(scriptVideo)
      ) {
        document.body.removeChild(scriptVideo);
      }
    };
  }, [wistiaId]);

  /*
   * A indicação já está salva.
   * Por isso, o botão pode ir diretamente para a Home.
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

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-8 pb-20 relative">
      <div
        className={`w-[95%] ${larguraContainer} relative shadow-2xl`}
      >
        <div
          className="wistia_responsive_wrapper"
          style={{
            width: "100%",
            aspectRatio:
              videoSelecionado.aspectRatio,
            position: "relative",
            backgroundColor: "black",
          }}
        >
          <div
            key={wistiaId}
            className={`wistia_embed wistia_async_${wistiaId} seo=true videoFoam=true`}
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
            }}
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