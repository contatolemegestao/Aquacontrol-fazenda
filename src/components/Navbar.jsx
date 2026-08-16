import React from 'react';
import { 
  Waves, 
  Layers, 
  Fish, 
  SlidersHorizontal, 
  FilePlus2, 
  BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'viveiros', label: 'Cadastro de Viveiros', icon: Layers },
  { id: 'povoamento', label: 'Povoamento', icon: Fish },
  { id: 'parametros', label: 'Parâmetros', icon: SlidersHorizontal },
  { id: 'lancamento', label: 'Lançamento', icon: FilePlus2 },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('viveiros')}>
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                Aqua<span className="text-brand-500">Control</span>
              </span>
              <span className="text-xs text-gray-500 block font-medium">Gestão de Qualidade de Água</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-brand-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-gray-100 bg-white px-2 py-1.5 flex overflow-x-auto gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[72px] py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[80px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
