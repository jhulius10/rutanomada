import { ArrowLeft, Navigation, MapPin, Footprints, Bus, Train, TramFront, CircleDot } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { RouteStep } from '../types';

const stepIcons: Record<string, React.ReactNode> = {
  walk: <Footprints size={20} className="text-blue-500" />,
  bus: <Bus size={20} className="text-green-600" />,
  metro: <Train size={20} className="text-amber-500" />,
  train: <Train size={20} className="text-purple-600" />,
  brt: <Bus size={20} className="text-red-600" />,
  tram: <TramFront size={20} className="text-teal-600" />,
  collectivo: <CircleDot size={20} className="text-yellow-600" />,
};

export default function RouteDetail() {
  const { selectedRoute, setView, setSelectedRoute, setIsNavigating, selectedDestination, currentCity } = useAppStore();

  if (!selectedRoute || !selectedDestination) return null;

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setView('navigation');
  };

  const handleBack = () => {
    setView('results');
  };

  const renderStep = (step: RouteStep, index: number) => {
    const isLast = index === selectedRoute.steps.length - 1;
    const isWalk = step.type === 'walk';

    return (
      <div key={step.id} className="flex gap-3">
        {/* Timeline */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWalk ? 'bg-blue-50' : 'bg-slate-100'}`}>
            {stepIcons[step.type]}
          </div>
          {!isLast && (
            <div className={`w-0.5 flex-1 my-1 ${isWalk ? 'bg-blue-200' : 'bg-slate-200'}`}
              style={isWalk ? { backgroundImage: 'repeating-linear-gradient(to bottom, #93c5fd 0px, #93c5fd 4px, transparent 4px, transparent 8px)' } : {}}
            />
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
          <p className="font-medium text-slate-800 text-[15px] leading-snug">
            <span className="text-teal-600 font-bold">Paso {index + 1}.</span>{' '}
            {step.instruction}
          </p>

          {step.lineName && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: step.lineColor || '#64748b' }}
              >
                {step.lineName}
              </span>
              {step.direction && (
                <span className="text-xs text-slate-500">→ {step.direction}</span>
              )}
            </div>
          )}

          {step.fromStop && step.toStop && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={10} />
              <span>{step.fromStop} → {step.toStop}</span>
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            <span>⏱ {step.duration} min</span>
            {step.distance && <span>📏 {step.distance}m</span>}
            {step.fare && (
              <span className="font-medium text-teal-700">
                💰 {currentCity?.currencySymbol} {step.fare.toFixed(2)}
                {step.fareNote && <span className="text-slate-400 font-normal"> ({step.fareNote})</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-4 py-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => { setView('results'); }} className="p-1">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <p className="text-sm opacity-80">Ruta hacia</p>
            <p className="font-bold text-lg">{selectedDestination.icon} {selectedDestination.name}</p>
          </div>
          <span className="text-2xl">{selectedRoute.emoji}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold">{selectedRoute.duration} min</p>
            <p className="text-xs opacity-80">Duración</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold">{currentCity?.currencySymbol} {selectedRoute.totalCost.toFixed(2)}</p>
            <p className="text-xs opacity-80">Costo</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold">{selectedRoute.walkingDistance}m</p>
            <p className="text-xs opacity-80">Caminata</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-sm font-semibold text-slate-500 uppercase mb-4">Instrucciones paso a paso</p>
        {selectedRoute.steps.map((step, i) => renderStep(step, i))}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={handleStartNavigation}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-200 transition-all active:scale-95"
        >
          <Navigation size={20} />
          Iniciar viaje — Acompáñame
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
          Se mostrará tu ubicación GPS y las instrucciones en el mapa
        </p>
      </div>
    </div>
  );
}
