import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function HeaderVisual() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Área do Associado', path: '/cliente' },
    { name: 'Área do Colaborador', path: '/colaborador' },
    {
      name: 'Área Administrativa',
      path: 'https://coletivo.consultoque.com.br/admin',
      externo: true,
    },
  ];

  return (
    <header className="w-full relative bg-green-600">
      <Link to="/" className="block w-full">
        <img
          src="/banner_cel.png"
          alt="Consultoque"
          className="block md:hidden w-full"
        />
        <img
          src="/banner_desk.png"
          alt="Consultoque"
          className="hidden md:block w-full"
        />
      </Link>

      <nav className="w-full bg-green-600 py-3 px-4 flex justify-between items-center md:justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-1"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className="hidden md:flex gap-8">
          {menuItems.map((item) =>
            item.externo ? (
              <a
                key={item.path}
                href={item.path}
                className="text-white font-bold text-sm uppercase tracking-wide hover:text-green-100 transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className="text-white font-bold text-sm uppercase tracking-wide hover:text-green-100 transition-colors"
              >
                {item.name}
              </Link>
            ),
          )}
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-green-700 w-full p-4 flex flex-col gap-4 border-t border-green-600">
          {menuItems.map((item) =>
            item.externo ? (
              <a
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="text-white font-bold text-sm uppercase py-2 border-b border-green-600"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="text-white font-bold text-sm uppercase py-2 border-b border-green-600"
              >
                {item.name}
              </Link>
            ),
          )}
        </div>
      )}
    </header>
  );
}