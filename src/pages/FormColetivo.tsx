import { useEffect } from 'react';

const URL_FORMULARIO_COLETIVO =
  'https://coletivo.consultoque.com.br/formcoletivo';

export function FormColetivo() {
  const params = new URLSearchParams(window.location.search);
  const referencia =
    params.get('ref') || localStorage.getItem('referenciador_id') || '0001';

  params.set('ref', referencia);

  const destino = `${URL_FORMULARIO_COLETIVO}?${params.toString()}`;

  useEffect(() => {
    window.location.replace(destino);
  }, [destino]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-4 text-center">
      <p className="font-bold text-slate-700">
        Abrindo o formulário de contratação...
      </p>
      <a
        href={destino}
        className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
      >
        Continuar
      </a>
    </main>
  );
}
