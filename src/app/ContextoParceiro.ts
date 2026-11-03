import { createContext, useContext } from 'react';
import type { OfertaParceiro } from '../services/parceiro';
export const ContextoParceiro = createContext<OfertaParceiro | null>(null);
export const useParceiro = () => useContext(ContextoParceiro);
