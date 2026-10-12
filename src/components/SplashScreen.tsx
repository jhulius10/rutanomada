import { useEffect, useState } from 'react';
import { MapPin, Bus, Navigation, Globe } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute top-40 right-20 w-20 h-20 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 left-20 w-40 h-40 border-2 border-white rounded-full" />
        <div className="absolute bottom-40 right-10 w-24 h-24 border-2 border-white rounded-full" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30">
          <div className="relative">
            <Bus size={40} className="text-white" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
              <MapPin size={10} className="text-teal-800" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight mb-1">
          Ruta<span className="text-amber-300">Nómada</span>
        </h1>
        <p className="text-teal-100 text-sm font-medium mb-8">
          Tu guía de transporte público
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-4 mt-6 text-white/60">
          <div className="flex items-center gap-1 text-xs">
            <Globe size={12} />
            <span>10 países</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Navigation size={12} />
            <span>GPS</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Bus size={12} />
            <span>Multimodal</span>
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/50 text-xs">
          Descubre cómo moverte en cualquier ciudad
        </p>
        <p className="text-white/40 text-xs mt-1">
          como si tuvieras un guía local en el bolsillo
        </p>
      </div>
    </div>
  );
}
