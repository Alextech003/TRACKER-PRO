import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

const CAR_BRANDS = [
  { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg' },
  { name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg' },
  { name: 'Fiat', logo: 'https://cdn.worldvectorlogo.com/logos/fiat-3.svg' },
  { name: 'Chevrolet', logo: 'https://cdn.worldvectorlogo.com/logos/chevrolet-1.svg' },
  { name: 'Ford', logo: 'https://cdn.worldvectorlogo.com/logos/ford-8.svg' },
  { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { name: 'Nissan', logo: 'https://cdn.worldvectorlogo.com/logos/nissan-6.svg' },
  { name: 'Hyundai', logo: 'https://cdn.worldvectorlogo.com/logos/hyundai.svg' },
  { name: 'Peugeot', logo: 'https://cdn.worldvectorlogo.com/logos/peugeot-1.svg' },
  { name: 'Renault', logo: 'https://cdn.simpleicons.org/renault/000000' },
  { name: 'Jeep', logo: 'https://cdn.worldvectorlogo.com/logos/jeep.svg' },
  { name: 'Mitsubishi', logo: 'https://cdn.worldvectorlogo.com/logos/mitsubishi-motors-1.svg' },
  { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  { name: 'Mercedes-Benz', logo: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg' },
  { name: 'Kia', logo: 'https://cdn.worldvectorlogo.com/logos/kia-1.svg' },
];

const MOTO_BRANDS = [
  { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { name: 'Yamaha', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Yamaha_Motor_Logo.svg/1024px-Yamaha_Motor_Logo.svg.png' },
  { name: 'Suzuki', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg' },
  { name: 'Kawasaki', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Kawasaki_Logo.svg' },
  { name: 'BMW Motorrad', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  { name: 'Triumph', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Triumph_Motorcycles_logo.svg' },
  { name: 'Harley-Davidson', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Harley-Davidson_logo.svg' },
  { name: 'Ducati', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ducati_red_logo.svg/1024px-Ducati_red_logo.svg.png' },
];

const TRUCK_BRANDS = [
  { name: 'Scania', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Scania_badge.svg' },
  { name: 'Volvo', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Volvo_logo.svg' },
  { name: 'Mercedes-Benz', logo: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg' },
  { name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg' },
  { name: 'Iveco', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Iveco_Logo.svg' },
  { name: 'DAF', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/DAF_logo.svg' },
  { name: 'Ford', logo: 'https://cdn.worldvectorlogo.com/logos/ford-8.svg' },
];

const TRACTOR_BRANDS = [
  { name: 'John Deere', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/John_Deere_logo.svg' },
  { name: 'Caterpillar', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Caterpillar_logo.svg' },
  { name: 'Massey Ferguson', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Massey_Ferguson.png' },
  { name: 'New Holland', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/New_Holland_Agriculture_logo.png' },
  { name: 'Case IH', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/CASE_IH_Logo.svg' },
  { name: 'Valtra', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Valtra_logo.svg' },
  { name: 'Komatsu', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Komatsu_Logo.svg' },
];

export function BrandSelect() {
  const { type, category } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  let BRANDS = CAR_BRANDS;
  if (category === 'moto') BRANDS = MOTO_BRANDS;
  if (category === 'caminhao') BRANDS = TRUCK_BRANDS;
  if (category === 'maquina') BRANDS = TRACTOR_BRANDS;

  const filteredBrands = BRANDS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (brand: string) => {
    navigate(`/records/${type}/${category}/${brand}`);
  };

  const getCategoryName = () => {
    if (category === 'moto') return 'Motos';
    if (category === 'caminhao') return 'Caminhões';
    if (category === 'maquina') return 'Máquinas Pesadas';
    return 'Carros';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 pb-24 font-sans">
      <header className="bg-[#0A0A0B] border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Link to={`/category/${type}`} className="w-10 h-10 flex items-center justify-center text-slate-400 bg-[#1C1C1E] border border-slate-800 rounded-xl hover:bg-slate-800 transition shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Marcas - {getCategoryName()}</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Procurar em {type}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder={`Buscar marca de ${getCategoryName().toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder:text-slate-600 shadow-xl"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleSelect(brand.name)}
              className="bg-[#1C1C1E] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <div className="w-16 h-16 bg-white rounded-full p-3 mb-4 shrink-0 flex items-center justify-center overflow-hidden">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-black text-slate-800">${brand.name.charAt(0)}</span>`;
                  }}
                />
              </div>
              <span className="font-bold text-sm text-slate-300 uppercase tracking-wide text-center leading-tight">{brand.name}</span>
            </button>
          ))}
          {search && filteredBrands.length === 0 && (
            <button
              onClick={() => handleSelect(search)}
              className="col-span-full bg-[#1C1C1E] border border-slate-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center hover:border-amber-500 transition-all cursor-pointer"
            >
              <span className="font-bold text-sm text-amber-500 uppercase tracking-wide mb-1">Buscar "{search}"</span>
              <span className="text-xs text-slate-500">Clique para pesquisar registros desta marca</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
