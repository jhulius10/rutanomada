import { Clock, Footprints, ArrowRightLeft, Shield, AlertTriangle } from 'lucide-react';
import { RouteOption } from '../types';
import { useAppStore } from '../stores/appStore';

interface Props {
  route: RouteOption;
  onSelect: () => void;
  isSelected?: boolean;
}

const dataQualityLabels = {
  'real-time': { label: 'Datos en tiempo real', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
  'scheduled': { label: 'Horarios programados', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  'estimated': { label: 'Estimación basada en datos históricos', color: 'bg-amber-100 text-amber-700', icon: '🟡' },
  'approximate': { label: 'Datos aproximados', color: 'bg-orange-100 text-orange-700', icon: '🟠' },
};

export default function RouteCard({ route, onSelect, isSelected }: Props) {
  const { currentCity } = useAppStore();
  const quality = dataQualityLabels[route.dataQuality];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
        isSelected
          ? 'border-teal-500 bg-teal-50 shadow-lg scale-[1.01]'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{route.emoji}</span>
          <div>
            <p className="font-bold text-slate-800">{route.label}</p>
            <p className="text-xs text-slate-500">Ruta {route.type === 'cheapest' ? 'económica' : route.type === 'fastest' ? 'rápida' : route.type === 'simplest' ? 'sencilla' : 'cómoda'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-teal-700">
            {currentCity?.currencySymbol} {route.totalCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5">
          <Clock size={14} className="text-teal-600" />
          <span className="text-sm font-medium text-slate-700">{route.duration} min</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5">
          <Footprints size={14} className="text-teal-600" />
          <span className="text-sm font-medium text-slate-700">{route.walkingDistance}m</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5">
          <ArrowRightLeft size={14} className="text-teal-600" />
          <span className="text-sm font-medium text-slate-700">{route.transfers} transb.</span>
        </div>
      </div>

      {/* Transport lines preview */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {route.steps.filter(s => s.type !== 'walk').map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: step.lineColor || '#64748b' }}
            >
              {step.lineName?.split(' - ')[0] || step.type}
            </span>
            {i < route.steps.filter(s => s.type !== 'walk').length - 1 && (
              <ArrowRightLeft size={12} className="text-slate-300" />
            )}
          </div>
        ))}
      </div>

      {/* Data quality */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${quality.color}`}>
          <span>{quality.icon}</span>
          {quality.label}
        </span>
        <div className="flex items-center gap-1">
          {route.confidence >= 80 ? (
            <Shield size={12} className="text-emerald-500" />
          ) : (
            <AlertTriangle size={12} className="text-amber-500" />
          )}
          <span className="text-xs text-slate-500">{route.confidence}% confianza</span>
        </div>
      </div>
    </button>
  );
}
