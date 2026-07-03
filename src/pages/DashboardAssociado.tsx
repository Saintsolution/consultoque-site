import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Plano {
  num_contrato: number;
  tit_nome: string;
  status_titular: string;
  cod_plano: string;
}

export function DashboardAssociado() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dados = sessionStorage.getItem('associado_dados');
    if (!dados) { navigate('/'); return; }
    setPlanos(JSON.parse(dados));
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Minha Central de Gestão</h1>
      <div className="grid gap-6">
        {planos.map((plano) => (
          <div key={plano.num_contrato} className="p-6 border rounded-xl shadow-sm bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Contrato: {plano.num_contrato}</h3>
                <p className="text-gray-600">Plano: {plano.cod_plano}</p>
                <p className={`mt-2 font-bold ${plano.status_titular === 'ativo' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {plano.status_titular.toUpperCase()}
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Gerenciar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}