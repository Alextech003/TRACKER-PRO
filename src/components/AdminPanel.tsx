import { useState, FormEvent, useEffect } from 'react';
import { ArrowLeft, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { saveUserProfile, subscribeUsers, UserProfile, deleteUserById, updateUserRole } from '../lib/userStorage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mgabikdbuelwynmgazfo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kGXuX1lFglmuJm3U59xHUA_X4uml3lo';

// Create a secondary client that doesn't persist the session
// Custom memory storage to avoid clobbering the master acc session
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const secondarySupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: dummyStorage,
    autoRefreshToken: false,
    persistSession: false
  }
});

export function AdminPanel() {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'tecnico' | 'tecnico_criador'>('tecnico');

  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tecnico' | 'tecnico_criador'>('tecnico');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const isMasterAccount = user?.email === 'alexs.passos3@gmail.com' || user?.email === 'master@trackerpro.com' || userProfile?.role === 'admin';

  useEffect(() => {
    if (!isMasterAccount) return;
    const unsubscribe = subscribeUsers((data) => {
      setUsers(data);
      setLoadingUsers(false);
    });
    return () => unsubscribe();
  }, [isMasterAccount]);

  if (!isMasterAccount) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Acesso Negado</h2>
          <p className="text-slate-400 mb-6 text-sm">Este painel é restrito à conta master.</p>
          <button onClick={() => navigate('/')} className="bg-amber-500 text-black font-black uppercase text-sm py-3 px-6 rounded-xl">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const email = username.includes('@') ? username : `${username.toLowerCase().trim()}@trackerpro.com`;
      
      const { data, error } = await secondarySupabase.auth.signUp({
        email,
        password
      });

      if (error) {
         setMessage(`Erro: ${error.message}`);
         return;
      }

      const newUser = data.user;
      if (newUser) {
        await saveUserProfile({
          uid: newUser.id,
          username: username,
          email: email,
          role: role
        });

        setMessage(`Membro ${username} criado com sucesso!`);
        setUsername('');
        setPassword('');
      } else {
        setMessage('Erro ao obter dados do usuário recém criado.');
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (uid: string) => {
    try {
      await updateUserRole(uid, editRole);
      setEditingUserId(null);
      alert('Perfil atualizado com sucesso.');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleEditClick = (u: UserProfile) => {
    setEditRole(u.role);
    setEditingUserId(u.uid);
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteUserById(uid);
      setDeleteUserId(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir usuário');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      {deleteUserId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 italic uppercase">Remover usuário?</h3>
            <p className="text-slate-400 text-sm mb-6">O acesso deste usuário será revogado.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteUserId(null)} 
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeleteUser(deleteUserId)} 
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-red-500/20"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Painel Master</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Gerenciamento de Equipe</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleCreateUser} className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl sticky top-24">
            <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex flex-col items-center justify-center text-amber-500 shrink-0">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase italic tracking-wide">Adicionar Integrante</h2>
                <p className="text-xs text-slate-400">Criar novo acesso de técnico.</p>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.startsWith('Erro') ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}>
                {message}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                  placeholder="ex: mario"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Senha Temporária</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                  placeholder="Mínimo de 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tipo de Acesso</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'tecnico' | 'tecnico_criador')}
                  className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none appearance-none"
                  required
                >
                  <option value="tecnico">Técnico Normal (Apenas Visualiza)</option>
                  <option value="tecnico_criador">Técnico Avançado (Pode Adicionar Equipamentos)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none text-black font-black uppercase tracking-tight text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                {loading && <Loader2 size={18} className="animate-spin text-black" />}
                {loading ? 'Criando Conta...' : 'Adicionar Conta de Equipe'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
             <h2 className="text-lg font-bold text-white uppercase italic tracking-wide mb-4 border-b border-slate-800 pb-4">Usuários Cadastrados</h2>
             
             {loadingUsers ? (
               <div className="text-center py-6 text-slate-500">
                 <Loader2 className="animate-spin mx-auto mb-2" />
                 Carregando...
               </div>
             ) : users.length === 0 ? (
               <div className="text-center py-6 text-slate-500">
                 Nenhum usuário encontrado.
               </div>
             ) : (
               <div className="space-y-3">
                 {users.map((u) => (
                   <div key={u.uid} className="bg-[#121214] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 group hover:border-slate-700 transition">
                     {editingUserId === u.uid ? (
                       <div className="flex-1 space-y-2">
                         <p className="font-bold text-white uppercase text-sm">{u.username}</p>
                         <select
                           value={editRole}
                           onChange={e => setEditRole(e.target.value as 'admin' | 'tecnico' | 'tecnico_criador')}
                           className="w-full sm:w-auto bg-[#1C1C1E] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none text-xs"
                         >
                           <option value="tecnico">Normal (Visualiza)</option>
                           <option value="tecnico_criador">Avançado (Adiciona)</option>
                           <option value="admin">Administrador</option>
                         </select>
                         <div className="flex items-center gap-2 mt-2">
                           <button onClick={() => handleSaveRole(u.uid)} className="bg-amber-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition hover:bg-amber-600">Salvar</button>
                           <button onClick={() => setEditingUserId(null)} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition hover:bg-slate-700">Cancelar</button>
                         </div>
                       </div>
                     ) : (
                       <>
                         <div>
                           <p className="font-bold text-white uppercase text-sm">{u.username}</p>
                           <p className="text-[10px] text-slate-500 font-mono mt-1">
                             Acesso: {u.lastAccess ? new Date(u.lastAccess).toLocaleString() : 'NUNCA'}
                           </p>
                           <p className="text-[10px] text-amber-500/80 font-mono mt-0.5">
                             Acesso: {u.role === 'tecnico_criador' ? 'Avançado (Adiciona)' : u.role === 'tecnico' ? 'Normal (Visualiza)' : 'Administrador'}
                           </p>
                         </div>
                         <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                           <button 
                             onClick={() => handleEditClick(u)} 
                             className="text-blue-500/50 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-500/10"
                             title="Editar"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                           </button>
                           {u.role !== 'admin' && (
                             <button 
                               onClick={() => setDeleteUserId(u.uid)} 
                               className="text-red-500/50 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                               title="Remover"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                         </div>
                       </>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
