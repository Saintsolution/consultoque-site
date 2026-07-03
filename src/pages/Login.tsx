export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-sm text-center">
        <h1 className="text-xl font-black text-slate-900 mb-6 uppercase">Acesso ao Sistema</h1>
        <input type="text" placeholder="Digite seu CPF" className="w-full p-3 border rounded-xl mb-4" />
        <button className="w-full bg-blue-600 text-white font-black py-3 rounded-xl uppercase hover:bg-blue-700">Entrar</button>
      </div>
    </div>
  );
}