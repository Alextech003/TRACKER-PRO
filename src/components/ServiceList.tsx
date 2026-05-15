import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { subscribeRecords } from '../lib/storage';
import { ServiceRecord } from '../types';
import { ArrowLeft, Search, PlusCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function ServiceList() {
  const { type, category, make } = useParams();
  const { user, userProfile } = useAuth();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isMasterAccount = user?.email === 'alexs.passos3@gmail.com' || user?.email === 'master@trackerpro.com';
  const canCreate = isMasterAccount || userProfile?.role === 'admin' || userProfile?.role === 'tecnico_criador';

  useEffect(() => {
    const unsubscribe = subscribeRecords((allRecords) => {
      const targetMake = (make || '').trim().toLowerCase();
      const filtered = allRecords.filter(r => {
        const recordMake = (r.vehicleMake || '').trim().toLowerCase();
        const recordModel = (r.vehicleModel || '').trim().toLowerCase();
        return r.serviceType === type && 
          (recordMake === targetMake || 
           recordMake.includes(targetMake) ||
           recordModel.includes(targetMake));
      });
      
      setRecords(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type, make]);

  const filteredRecords = records.filter(r => 
    r.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
    (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/brands/${type}/${category}`} className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">{make}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Registros de {type}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-xs font-bold">
          {records.length} REGISTROS
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-4">
        {records.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por modelo ou observação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 shadow-lg"
            />
          </div>
        )}

        {records.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-slate-800 border-dashed rounded-3xl p-12 text-center mt-8">
            <p className="text-slate-500 uppercase tracking-widest font-bold text-sm mb-2">Nenhum Registro Encontrado</p>
            <p className="text-slate-600 text-xs">Ainda não há instalações de {type} para veículos da marca {make}.</p>
            {canCreate && (
              <Link to={`/new?type=${type}&make=${make}`} className="inline-block mt-6 px-6 py-3 bg-amber-500 text-black font-bold uppercase tracking-wide text-xs rounded-xl hover:bg-amber-600 transition">
                Criar Primeiro Registro
              </Link>
            )}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhum veículo corresponde à sua busca.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRecords.map(record => (
              <Link 
                key={record.id}
                to={`/service/${record.id}`}
                className="bg-[#1C1C1E] rounded-xl overflow-hidden hover:bg-slate-800 transition-colors shadow-lg border border-slate-800 hover:border-slate-600 block flex flex-col group"
              >
                <div className="aspect-[4/3] bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {record.vehiclePhotoUrl ? (
                    <img src={record.vehiclePhotoUrl} alt="Veículo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : record.photoUrl ? (
                    <img src={record.photoUrl} alt="Thumb" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : record.videoUrl ? (
                    <video src={record.videoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-[10px] text-slate-500 font-mono block mb-1">SEM FOTO</span>
                      <span className="text-[10px] text-slate-600 font-mono block">Clique para adic.</span>
                    </div>
                  )}
                  {record.serviceType === 'BLOQUEIO' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                  )}
                  {record.serviceType === 'TELEMETRIA' && (
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white truncate">
                    {record.vehicleMake} {record.vehicleModel}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-400 truncate">
                      {record.vehicleYear ? record.vehicleYear : (record.blockPoint || 'Sem ano')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
