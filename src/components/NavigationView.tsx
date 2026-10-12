import { useState, useEffect } from 'react';
import { X, Navigation, Volume2, VolumeX, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export default function NavigationView() {
  const { selectedRoute, selectedDestination, currentStepIndex, setCurrentStepIndex, setIsNavigating, setView, currentCity } = useAppStore();
  const [isMuted, setIsMuted] = useState(false);
  const [showExpanded, setShowExpanded] = useState(true);

  useEffect(() => {
    if (!selectedRoute) return;
    // Simulate progress
    const interval = setInterval(() => {
      setCurrentStepIndex(Math.min(currentStepIndex + 1, selectedRoute.steps.length - 1));
    }, 15000);
    return () => clearInterval(interval);
  }, [currentStepIndex, selectedRoute]);

  if (!selectedRoute || !selectedDestination) return null;

  const currentStep = selectedRoute.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / selectedRoute.steps.length) * 100;

  const handleExit = () => {
    setIsNavigating(false);
    setView('route-detail');
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'walk': return 'from-blue-500 to-blue-600';
      case 'bus': return 'from-green-500 to-green-600';
      case 'metro': return 'from-amber-500 to-amber-600';
      case 'brt': return 'from-red-500 to-red-600';
      case 'train': return 'from-purple-500 to-purple-600';
      default: return 'from-teal-500 to-teal-600';
    }
  };

  const getStepEmoji = (type: string) => {
    switch (type) {
      case 'walk': return '🚶';
      case 'bus': return '🚌';
      case 'metro': return '🚇';
      case 'brt': return '🚍';
      case 'train': return '🚆';
      case 'tram': return '🚊';
      case 'collectivo': return '🚐';
      default: return '📍';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={handleExit} className="p-2 text-white">
          <X size={24} />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">Navegando hacia</p>
          <p className="text-teal-400 text-xs">{selectedDestination.name}</p>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Map placeholder */}
      <div className="flex-1 relative bg-slate-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Navigation size={28} className="text-white" />
            </div>
            <p className="text-white font-medium">Mapa de navegación</p>
            <p className="text-slate-400 text-sm">GPS activo • Siguiendo ruta</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-600">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom instructions panel */}
      <div className={`bg-white rounded-t-3xl transition-all duration-300 ${showExpanded ? 'max-h-[50vh]' : 'max-h-32'}`}>
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => setShowExpanded(!showExpanded)} className="p-1">
            {showExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
          </button>
          <p className="text-xs text-slate-500 font-medium">
            Paso {currentStepIndex + 1} de {selectedRoute.steps.length}
          </p>
          <div className="w-6" />
        </div>

        {/* Current step - big instruction */}
        <div className={`px-4 pb-4 bg-gradient-to-r ${getStepColor(currentStep.type)} mx-4 rounded-2xl text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getStepEmoji(currentStep.type)}</span>
            <div>
              <p className="text-xs opacity-80 uppercase font-semibold">
                {currentStep.type === 'walk' ? 'Caminata' : currentStep.type === 'bus' ? 'Bus' : currentStep.type === 'metro' ? 'Metro' : currentStep.type === 'brt' ? 'BRT' : 'Transporte'}
              </p>
              <p className="font-bold text-lg">{currentStep.duration} min</p>
            </div>
          </div>
          <p className="text-base font-medium leading-snug">
            {currentStep.instruction}
          </p>
          {currentStep.lineName && (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-bold">
                {currentStep.lineName}
              </span>
              {currentStep.direction && (
                <span className="text-sm opacity-80">→ {currentStep.direction}</span>
              )}
            </div>
          )}
        </div>

        {/* Remaining steps */}
        {showExpanded && currentStepIndex < selectedRoute.steps.length - 1 && (
          <div className="px-4 py-3 max-h-32 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Siguientes pasos</p>
            {selectedRoute.steps.slice(currentStepIndex + 1).map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 py-1.5 text-sm">
                <span>{getStepEmoji(step.type)}</span>
                <span className="text-slate-600 truncate flex-1">{step.instruction}</span>
                <span className="text-slate-400 text-xs">{step.duration}m</span>
              </div>
            ))}
          </div>
        )}

        {/* Arrival notification */}
        {currentStepIndex === selectedRoute.steps.length - 1 && (
          <div className="px-4 py-3 bg-emerald-50 mx-4 mb-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-800">¡Has llegado!</p>
                <p className="text-sm text-emerald-600">{selectedDestination.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cost summary */}
        <div className="px-4 pb-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Costo total estimado:</span>
          <span className="font-bold text-teal-700">{currentCity?.currencySymbol} {selectedRoute.totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
