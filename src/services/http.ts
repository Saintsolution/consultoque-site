// Sem retry, transformação de payload ou interpretação de autorização.
export function enviarIntegracao(url: RequestInfo | URL, opcoes: RequestInit): Promise<Response> {
  return fetch(url, opcoes);
}
