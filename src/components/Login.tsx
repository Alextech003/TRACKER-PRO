import { useState, FormEvent } from 'react';
import { Wrench, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Transform username into email format for Firebase
      const loginEmail = username.includes('@') ? username : `${username.toLowerCase().trim()}@trackerpro.com`;
      
      try {
        await signInWithEmailAndPassword(auth, loginEmail, password);
        navigate('/');
      } catch (err: any) {
        // Se for a conta master e falhar, pode ser que não tenha sido criada com senha ainda
        if (loginEmail === 'master@trackerpro.com' || loginEmail === 'alexs.passos3@gmail.com') {
          try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            await createUserWithEmailAndPassword(auth, loginEmail, password);
            navigate('/');
            return;
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              setError('Senha incorreta para a conta master.');
            } else {
              setError(createErr.message || 'Erro ao criar conta master.');
            }
            return;
          }
        }

        if (err.code === 'auth/invalid-credential') {
          setError('Usuário ou senha incorretos.');
        } else {
          setError(err.message || 'Erro ao realizar login.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0B] p-4 text-slate-200 font-sans">
      <div className="max-w-md w-full bg-gradient-to-br from-[#1C1C1E] to-[#121214] rounded-3xl shadow-lg border border-slate-800 p-8 text-center">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 italic">TRACKER <span className="text-amber-500 font-light">PRO</span></h1>
        <p className="text-slate-400 mb-8 text-sm">Área restrita para a equipe de instaladores de rastreadores e serviços de campo.</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 transition-all"
              placeholder="Ex: alex"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none text-black font-black uppercase tracking-tight py-3 text-sm px-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-amber-500/10 mt-6"
          >
            {loading && <Loader2 size={18} className="animate-spin text-black" />}
            {loading ? 'Acessando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
