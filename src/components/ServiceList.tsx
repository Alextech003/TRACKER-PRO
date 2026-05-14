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
          <div className="space-y-3">
            {filteredRecords.map(record => (
              <Link 
                key={record.id}
                to={`/service/${record.id}`}
                className={`flex items-center justify-between p-4 bg-[#1C1C1E] rounded-2xl border-l-4 hover:bg-slate-800 transition-colors shadow-lg ${record.serviceType === 'BLOQUEIO' ? 'border-amber-500' : record.serviceType === 'TELEMETRIA' ? 'border-blue-500' : 'border-slate-500'}`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center text-[10px] text-slate-500 italic shrink-0 font-mono">
                    {record.photoUrl ? (
                      <img src={record.photoUrl} alt="Thumb" className="w-full h-full object-cover opacity-80" />
                    ) : record.videoUrl ? (
                      <video src={record.videoUrl} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      'SEM MÍDIA'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white truncate">
                      {record.vehicleMake} {record.vehicleModel}
                      {record.vehicleYear && <span className="text-sm opacity-60 ml-2">{record.vehicleYear}</span>}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {record.blockPoint ? (
                        <span className="text-amber-500 font-bold">{record.blockPoint}</span>
                      ) : (
                        record.notes ? record.notes : 'Sem observações'
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {new Date(record.date).toLocaleDateString()}
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
