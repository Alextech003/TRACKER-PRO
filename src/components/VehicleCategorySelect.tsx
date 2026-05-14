import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Car, Bike, Truck, Tractor } from 'lucide-react';

const CATEGORIES = [
  { id: 'carro', name: 'Carro', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'moto', name: 'Moto', icon: Bike, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'caminhao', name: 'Caminhão', icon: Truck, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'maquina', name: 'Máquina Pesada', icon: Tractor, color: 'text-red-500', bg: 'bg-red-500/10' },
];

export function VehicleCategorySelect() {
  const { type } = useParams();
  const navigate = useNavigate();

  const handleSelect = (categoryId: string) => {
    navigate(`/brands/${type}/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Link to="/" className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Tipo de Veículo</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{type}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-8 flex items-center gap-6 hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95 text-left"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                <cat.icon size={32} />
              </div>
              <div>
                <h2 className="font-black text-2xl text-white uppercase tracking-tight">{cat.name}</h2>
                <p className="text-slate-500 text-sm font-medium">Selecionar marcas</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
