import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { ServiceRecord } from '../types';
import { Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { subscribeRecords } from '../lib/storage';
import { auth } from '../lib/firebase';
import { updateUserLastAccess } from '../lib/userStorage';

export function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isMasterAccount = user?.email === 'alexs.passos3@gmail.com' || user?.email === 'master@trackerpro.com';
  const canCreate = isMasterAccount || userProfile?.role === 'admin' || userProfile?.role === 'tecnico_criador';

  useEffect(() => {
    if (!user) return;
    
    updateUserLastAccess(user.uid).catch(console.error);

    const unsubscribe = subscribeRecords((data) => {
       setRecords(data);
       setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] px-6 py-6 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-black" />
            </div>
            TRACKER <span className="text-amber-500 font-light italic">PRO</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Equipe Técnica
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isMasterAccount && (
            <Link to="/admin" className="hidden sm:flex items-center gap-2 bg-[#1C1C1E] px-4 py-2 rounded-full border border-slate-800 hover:border-amber-500 transition text-sm font-medium text-amber-500">
              Painel Master
            </Link>
          )}
          <div className="flex items-center gap-4 bg-[#1C1C1E] px-4 py-2 rounded-full border border-slate-800 cursor-pointer hover:border-slate-700 transition" onClick={handleLogout} title="Sair">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user?.email?.split('@')[0] || 'Instalador'}</p>
              <p className="text-[10px] text-green-500">● Online</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-amber-500 overflow-hidden shrink-0">
               {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <span className="text-sm font-bold text-white">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Quick Actions (Bento blocks) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Bloqueios */}
            <Link to="/category/BLOQUEIO" className="bg-gradient-to-br from-[#1C1C1E] to-[#121214] border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500 transition-colors block text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 text-amber-500 shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 italic">BLOQUEIOS</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs">Registros de interrupção.</p>
              </div>
              <div className="mt-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] rounded-full font-bold">
                  {records.filter(r => r.serviceType === 'BLOQUEIO').length} REG
                </span>
              </div>
            </Link>

            {/* Telemetria */}
            <Link to="/category/TELEMETRIA" className="bg-gradient-to-br from-[#1C1C1E] to-[#121214] border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-blue-500 transition-colors block text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 text-blue-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 italic">TELEMETRIA</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs">Sensores e CANBUS.</p>
              </div>
              <div className="mt-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-500 text-[10px] rounded-full font-bold">
                  {records.filter(r => r.serviceType === 'TELEMETRIA').length} REG
                </span>
              </div>
            </Link>

            {/* Alarmes */}
            <Link to="/category/ALARME" className="bg-gradient-to-br from-[#1C1C1E] to-[#121214] border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-red-500 transition-colors block text-left col-span-2 sm:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 text-red-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 italic">ALARMES</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs">Portas, travas e sensores.</p>
              </div>
              <div className="mt-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-500 text-[10px] rounded-full font-bold">
                  {records.filter(r => r.serviceType === 'ALARME').length} REG
                </span>
              </div>
            </Link>
          </div>
          
          {/* History / Recent Entries */}
          <div className="bg-[#121214] border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs">Últimas Instalações</h3>
              {loading && <span className="text-amber-500 text-xs font-bold animate-pulse">Carregando...</span>}
            </div>
            
            {!loading && records.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-slate-500 text-sm mb-4">Nenhum serviço registrado.</p>
                 {canCreate && (
                   <Link to="/new" className="text-amber-500 text-xs font-bold underline">Criar primeiro registro</Link>
                 )}
               </div>
            ) : (
              <div className="space-y-3">
                {records.slice(0, 5).map(record => (
                  <Link 
                    key={record.id}
                    to={`/service/${record.id}`}
                    className={`flex items-center justify-between p-3 bg-[#1C1C1E] rounded-xl border-l-4 hover:bg-slate-800 transition-colors ${record.serviceType === 'BLOQUEIO' ? 'border-amber-500' : record.serviceType === 'TELEMETRIA' ? 'border-blue-500' : record.serviceType === 'ALARME' ? 'border-red-500' : 'border-slate-500'}`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-slate-500 italic shrink-0 font-mono">
                        {record.photoUrl ? (
                          <img src={record.photoUrl} alt="Thumb" className="w-full h-full object-cover opacity-80" />
                        ) : record.videoUrl ? (
                          <video src={record.videoUrl} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          'SEM MIDIA'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {record.vehicleMake} {record.vehicleModel}
                          {record.vehicleYear && <span className="opacity-60 font-normal ml-1">{record.vehicleYear}</span>}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {record.blockPoint ? <span className="text-amber-500 font-bold">{record.blockPoint}</span> : (record.notes ? record.notes : 'Sem observações')} • {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                       <span className={`text-[10px] bg-slate-900 px-2 py-1 rounded font-mono uppercase ${record.serviceType === 'BLOQUEIO' ? 'text-amber-500/80' : record.serviceType === 'TELEMETRIA' ? 'text-blue-500/80' : record.serviceType === 'ALARME' ? 'text-red-500/80' : 'text-slate-400'}`}>
                        {record.serviceType}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {records.length > 5 && (
              <div className="mt-4 text-center">
                 <span className="text-slate-500 text-xs">Exibindo as 5 mais recentes</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar / Action */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quick Register Button */}
          {canCreate && (
            <Link to="/new" className="bg-amber-500 rounded-2xl sm:rounded-3xl p-6 flex flex-col items-center justify-center text-black cursor-pointer shadow-lg shadow-amber-500/10 hover:bg-amber-400 active:scale-[0.98] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-lg sm:text-xl font-black uppercase tracking-tight text-center">Novo Registro</span>
              <span className="text-[10px] sm:text-xs font-bold opacity-60 uppercase">Adicionar Veículo</span>
            </Link>
          )}

          {/* Stats Widget */}
          <div className="bg-gradient-to-t from-slate-900 to-[#1C1C1E] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 flex-1 flex flex-col">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resumo Geral</p>
            <div className="space-y-6 flex-1 justify-center flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase">Total</p>
                  <p className="text-3xl font-black text-white">{records.length}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase">Este Mês</p>
                  <p className="text-3xl font-black text-white">
                    {records.filter(r => {
                      const d = new Date(r.createdAt || r.date);
                      const now = new Date();
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                <p className="text-xs italic text-amber-200/60">"Organização é o segredo para uma instalação perfeita."</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
