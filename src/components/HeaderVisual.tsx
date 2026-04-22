import { Link } from 'react-router-dom';

export function HeaderVisual() {
  return (
    <header className="w-full overflow-hidden">
      {/* Envolvemos todo o conteúdo em um Link para a raiz (/).
          Como você tem o ScrollToTop no App.tsx, ele vai resetar a página para o topo.
      */}
      <Link to="/" className="block w-full hover:opacity-95 transition-opacity cursor-pointer">
        
        {/* MOBILE */}
        <div className="block md:hidden w-full">
          <img
            src="/banner_cel.png"
            alt="Header Mobile - Consultoque"
            className="w-full h-auto"
          />
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block w-full">
          <img
            src="/banner_desk.png"
            alt="Header Desktop - Consultoque"
            className="w-full h-auto"
          />
        </div>
        
      </Link>
    </header>
  );
}