import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { getRecordById, deleteRecordById, getRelatedRecords } from '../lib/storage';
import { ServiceRecord } from '../types';
import { ArrowLeft, Clock, Calendar, Trash2, Camera, Video, Wrench, Layers } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function ServiceDetails() {
  const { id } = useParams();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ServiceRecord | null>(null);
  const [relatedRecords, setRelatedRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const isAdmin = user?.email === 'alexs.passos3@gmail.com' || user?.email === 'master@trackerpro.com' || userProfile?.role === 'admin';
  const canDelete = isAdmin || (record && user && record.userId === user.uid);

  useEffect(() => {
    async function loadRecord() {
      if (!id || !user) return;
      try {
        setLoading(true);
        const found = await getRecordById(id);
        if (found) {
          setRecord(found);
          const related = await getRelatedRecords(found.vehicleMake, found.vehicleModel, id);
          setRelatedRecords(related);
        } else {
          setRecord(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [id, user]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!id || !user) return;
    try {
      await deleteRecordById(id);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col font-sans">
        <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
        </header>
        <div className="p-8 flex justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col font-sans">
        <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Não encontrado</h1>
        </header>
        <div className="p-8 text-center text-slate-500">O registro não existe ou você não tem permissão para acessá-lo.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
             <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Detalhes</h1>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">INFO DO REGISTRO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <>
              <Link 
                to={`/edit/${id}`}
                className="px-4 h-10 flex items-center justify-center text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Editar
              </Link>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </header>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 italic uppercase">Excluir registro?</h3>
            <p className="text-slate-400 text-sm mb-6">Esta ação não pode ser desfeita. O registro será removido permanentemente do sistema.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomedImg && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImg(null)}>
          <img src={zoomedImg} alt="Zoom" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <main className="max-w-3xl mx-auto p-4 mt-4">
        <div className="bg-[#1C1C1E] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {record.videoUrl && (
            <div className="aspect-video bg-black w-full relative border-b border-slate-800">
              <video src={record.videoUrl} controls className="w-full h-full object-contain" />
            </div>
          )}
          {record.photoUrl && (
            <div className="aspect-video bg-black w-full relative border-b border-slate-800 cursor-zoom-in overflow-hidden group" onClick={() => setZoomedImg(record.photoUrl)}>
              <img src={record.photoUrl} alt="Foto da instalação" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          {!record.videoUrl && !record.photoUrl && (
            <div className="aspect-video bg-gradient-to-br from-[#1C1C1E] to-[#121214] w-full flex flex-col items-center justify-center text-slate-600 border-b border-slate-800">
              <div className="flex gap-4">
                <Camera size={40} className="mb-4 opacity-20" />
                <Video size={40} className="mb-4 opacity-20" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Sem Mídia</span>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="mb-8 relative">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 ${record.serviceType === 'BLOQUEIO' ? 'bg-amber-500/20 text-amber-500' : record.serviceType === 'TELEMETRIA' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-400'}`}>
                {record.serviceType}
              </span>
              <h2 className="text-3xl font-bold text-white italic">
                {record.vehicleMake} {record.vehicleModel} {record.vehicleYear && <span className="opacity-60">{record.vehicleYear}</span>}
              </h2>
            </div>
            
            {record.blockPoint && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
                <div className="bg-amber-500/20 p-2 rounded-xl text-amber-500 shrink-0 mt-1">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">Ponto de Instalação</h3>
                  <p className="text-white font-medium">{record.blockPoint}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#121214] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Calendar size={16} />
                  <div className="text-[10px] font-bold uppercase tracking-wider">Instalação</div>
                </div>
                <div className="text-white font-medium">{new Date(record.date).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#121214] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Clock size={16} />
                  <div className="text-[10px] font-bold uppercase tracking-wider">Registrado Em</div>
                </div>
                <div className="text-white font-medium">{record.createdAt?.toLocaleDateString()}</div>
              </div>
            </div>

            {record.notes && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Observações</h3>
                <div className="bg-[#121214] rounded-2xl p-5 text-slate-300 whitespace-pre-wrap text-sm border border-slate-800 leading-relaxed font-mono">
                  {record.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedRecords.length > 0 && (
          <div className="mt-8 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1C1C1E] border border-slate-800 flex items-center justify-center text-slate-400">
                <Layers size={16} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Outros registros para {record.vehicleMake} {record.vehicleModel}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedRecords.map(rel => (
                <Link 
                  key={rel.id} 
                  to={`/service/${rel.id}`}
                  className="bg-[#1C1C1E] border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:-translate-y-1 transition-all group flex"
                >
                  {rel.photoUrl ? (
                    <div className="w-24 h-full bg-black shrink-0 relative overflow-hidden">
                      <img src={rel.photoUrl} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                  ) : rel.videoUrl ? (
                     <div className="w-24 h-full bg-black shrink-0 flex items-center justify-center text-slate-600 border-r border-slate-800">
                       <Video size={20} />
                     </div>
                  ) : (
                    <div className="w-24 h-full bg-[#121214] shrink-0 flex items-center justify-center text-slate-600 border-r border-slate-800">
                      <Camera size={20} />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">{rel.serviceType}</span>
                    <h4 className="text-white font-medium text-sm mt-1">{rel.blockPoint || 'Ponto não especificado'}</h4>
                    <p className="text-slate-500 text-xs mt-1">{new Date(rel.date).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
