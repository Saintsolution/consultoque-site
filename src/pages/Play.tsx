import { useEffect } from 'react';

export function Play() {
  useEffect(() => {
    window.location.href = 'https://consultoque.netlify.app';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Carregando apresentação...</p>
    </div>
  );
}
