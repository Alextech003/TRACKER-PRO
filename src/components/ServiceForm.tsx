import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router';
import { useAuth } from './AuthProvider';
import { ServiceType } from '../types';
import { Camera, ArrowLeft, Loader2, Video } from 'lucide-react';
import { Link } from 'react-router';
import { saveRecord, uploadFile, getRecordById, updateRecord } from '../lib/storage';

export function ServiceForm() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  const initialType = (searchParams.get('type') as ServiceType) || 'BLOQUEIO';
  const initialMake = searchParams.get('make') || '';

  const [formData, setFormData] = useState({
    serviceType: initialType,
    vehicleMake: initialMake,
    vehicleModel: '',
    vehicleYear: '',
    blockPoint: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [recordUserId, setRecordUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getRecordById(id).then(record => {
        if (record) {
          setFormData({
            serviceType: record.serviceType,
            vehicleMake: record.vehicleMake,
            vehicleModel: record.vehicleModel,
            vehicleYear: record.vehicleYear || '',
            blockPoint: record.blockPoint || '',
            date: record.date.split('T')[0],
            notes: record.notes || ''
          });
          if (record.photoUrl) setPhotoBase64(record.photoUrl);
          if (record.videoUrl) setVideoUrl(record.videoUrl);
          setRecordUserId(record.userId);
        }
      });
    }
  }, [id]);

  const handlePhotoCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize and compress
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
        setPhotoBase64(dataUrl);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) { // 20MB limit for Firebase Storage
      alert("O vídeo é muito grande. O limite máximo é de 20MB.");
      return;
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
  };

  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const isMasterAccount = user.email === 'alexs.passos3@gmail.com' || user.email === 'master@trackerpro.com';
      const canCreate = isMasterAccount || userProfile?.role === 'admin' || userProfile?.role === 'tecnico_criador';
      
      if (!canCreate) {
        navigate('/');
      }
    }
  }, [user, userProfile, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let finalVideoUrl = videoUrl;
      // If we selected a NEW file, we must upload it
      if (videoFile) {
        const path = `videos/${user.id}/${Date.now()}_${videoFile.name}`;
        finalVideoUrl = await uploadFile(videoFile, path);
      }

      const recordData = {
        serviceType: formData.serviceType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear || undefined,
        blockPoint: formData.blockPoint || undefined,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes,
        photoUrl: photoBase64,
        videoUrl: finalVideoUrl,
      };

      if (id) {
        // Can only update if they own it or are admin
        if (recordUserId !== user.id && userProfile?.role !== 'admin') {
           throw new Error('Permissão negada para editar este registro.');
        }
        await updateRecord(id, recordData);
      } else {
        await saveRecord({
          userId: user.id,
          ...recordData
        });
      }

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">{id ? 'Editar Registro' : 'Novo Registro'}</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{id ? 'Atualizar Instalação' : 'Cadastrar Instalação'}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4">
        <form onSubmit={handleSubmit} className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tipo de Serviço</label>
              <select 
                value={formData.serviceType}
                onChange={e => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              >
                <option value="BLOQUEIO">Bloqueio</option>
                <option value="TELEMETRIA">Telemetria</option>
                <option value="ALARME">Alarme / Travas</option>
                <option value="OUTROS">Outros Serviços</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Marca</label>
                <input 
                  type="text" 
                  value={formData.vehicleMake}
                  onChange={e => setFormData({ ...formData, vehicleMake: e.target.value })}
                  className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                  placeholder="Ex: Hyundai"
                  required
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Modelo</label>
                  <input 
                    type="text" 
                    value={formData.vehicleModel}
                    onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                    placeholder="Ex: HB20"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Ano(s)</label>
                  <input 
                    type="text" 
                    value={formData.vehicleYear}
                    onChange={e => setFormData({ ...formData, vehicleYear: e.target.value })}
                    className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                    placeholder="Ex: 13-14-15 ou 2014 a 2018"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Ponto de Instalação / Bloqueio</label>
              <input 
                type="text" 
                value={formData.blockPoint}
                onChange={e => setFormData({ ...formData, blockPoint: e.target.value })}
                className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600"
                placeholder="Ex: Bomba de Combustível, Ignição, etc."
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Data da Instalação</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Foto da Instalação (Local / Fio)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef}
                onChange={handlePhotoCapture}
                className="hidden"
              />
              {photoBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black flex justify-center h-32 sm:h-48">
                  <img src={photoBase64} alt="Captured" className="h-full object-contain" />
                  <button 
                    type="button"
                    onClick={() => setPhotoBase64('')}
                    className="absolute top-2 right-2 bg-red-500/90 text-white rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur shadow-lg border border-red-400/20 hover:bg-red-500 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-xl bg-[#121214] hover:bg-slate-800 transition-colors text-slate-500 min-h-32 sm:min-h-48 text-center"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-2 text-amber-500">
                    <Camera size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">Adicionar Foto</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Vídeo da Instalação</label>
              <input 
                type="file" 
                accept="video/*" 
                capture="environment" 
                ref={videoInputRef}
                onChange={handleVideoCapture}
                className="hidden"
              />
              {videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black flex justify-center h-32 sm:h-48">
                  <video src={videoUrl} controls className="h-full w-full object-contain bg-black" />
                  <button 
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoUrl('');
                    }}
                    className="absolute top-2 right-2 bg-red-500/90 text-white rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur shadow-lg border border-red-400/20 hover:bg-red-500 transition-colors z-10"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-xl bg-[#121214] hover:bg-slate-800 transition-colors text-slate-500 min-h-32 sm:min-h-48 text-center"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-2 text-blue-500">
                    <Video size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">Adicionar Vídeo</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Observações</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#121214] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 min-h-[120px]"
              placeholder="Fio de bloqueio X (exemplo: Verde com listra branca), na parte inferior esquerda coluna A..."
              maxLength={2000}
            />
          </div>

          <div className="pt-4">
             <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none text-black font-black uppercase text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {loading && <Loader2 size={18} className="animate-spin text-black" />}
              {loading ? 'Salvando...' : 'Salvar Instalação'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
