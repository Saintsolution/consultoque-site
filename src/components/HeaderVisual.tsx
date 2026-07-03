import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function HeaderVisual() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Área do Associado', path: '/cliente' },
    { name: 'Área do Colaborador', path: '/colaborador' },
    { name: 'Área Administrativa', path: '/admin' },
  ];

  return (
    <header className="w-full relative bg-green-600"> {/* Cor de fundo da tarja */}
      {/* Imagens do Banner */}
      <Link to="/" className="block w-full">
        <img src="/banner_cel.png" alt="Consultoque" className="block md:hidden w-full" />
        <img src="/banner_desk.png" alt="Consultoque" className="hidden md:block w-full" />
      </Link>

      {/* Tarja de Navegação */}
      <nav className="w-full bg-green-600 py-3 px-4 flex justify-between items-center md:justify-center">
        
        {/* Botão Sanduíche (Aparece só no Mobile) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-1"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Links Desktop (Escondido no Mobile) */}
        <div className="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="text-white font-bold text-sm uppercase tracking-wide hover:text-green-100 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Menu Mobile Dropdown (Aparece quando aberto) */}
      {isOpen && (
        <div className="md:hidden bg-green-700 w-full p-4 flex flex-col gap-4 border-t border-green-600">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsOpen(false)}
              className="text-white font-bold text-sm uppercase py-2 border-b border-green-600"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}