import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Instagram } from 'lucide-react';

const TikTokIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.91-.73 3.81-2.03 5.11-1.32 1.3-3.22 2.03-5.13 2.03-1.28.01-2.58-.3-3.75-1-2.31-1.39-3.66-3.9-3.44-6.56.22-2.67 2.14-5.04 4.71-5.78 1.05-.3 2.17-.38 3.26-.23v4.02c-.82-.16-1.7-.1-2.46.31-.93.51-1.47 1.52-1.4 2.58.07 1.06.82 2.03 1.83 2.35 1.06.33 2.27.13 3.13-.6.8-.68 1.25-1.7 1.25-2.75V.02z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex flex-col items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <img src="/consultoque_logo_fundo_branco_final.png" alt="CONSULTOQUE" className="h-16 w-16 object-contain bg-white rounded-full p-1" />
              <span className="text-lg font-bold text-white uppercase tracking-tight">CONSULTOQUE</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-[200px]">Telemedicina e vantagens para toda família.</p>
          </div>

         {/* Serviços */}
<div>
  <h3 className="text-white font-semibold mb-4 text-base">Serviços</h3>
  <ul className="space-y-2 text-sm">
    <li><a href="/#hero" className="hover:text-blue-400 transition-colors">Telemedicina</a></li>
    {/* Alteração feita na linha abaixo: */}
    <li><a href="/#club-benefits" className="hover:text-blue-400 transition-colors">Vantagens</a></li>
    <li><Link to="/seja-afiliado" className="hover:text-blue-400 transition-colors font-bold text-blue-300">Quero ser Colaborador</Link></li>
  </ul>
</div>

          {/* Institucional */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/#benefits" className="hover:text-blue-400 transition-colors">Como Funciona</a></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><Link to="/privacidade" className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-blue-400 transition-colors">Política de Uso</Link></li>
            </ul>
          </div>

          {/* Acesso Restrito (Dashboard e Áreas) */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Acesso Restrito</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-amber-400 text-amber-500 font-bold">Área Administrativa</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Área do Colaborador</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Área do Associado</Link></li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Atendimento</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <a href="https://wa.me/5521964791774" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">(21) 96479-1774</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:consultoque@gmail.com" className="hover:text-white transition-colors">consultoque@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé Final */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">© 2026 CONSULTOQUE / SESSP. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/consultoque" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@consultoquereal" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-black transition-colors text-white">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}