import type { OfertaParceiro } from '../services/parceiro';

// A identidade visual é derivada da resposta do cadastro, sem lista por parceiro.
export function identidadeParceiro(oferta: OfertaParceiro) {
  const apelido = oferta.apelido;
  return {
    nome: apelido.replace(/-/g, ' ').replace(/\b[a-z]/g, letra => letra.toUpperCase()),
    logo: `/${encodeURIComponent(apelido)}.png`,
  };
}
