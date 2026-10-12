import { ArrowLeft, Globe, Moon, Sun, Bell, Shield, CreditCard, HelpCircle, Star, Info, ChevronRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useState } from 'react';

export default function SettingsPage() {
  const { setView, currentCity } = useAppStore();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('es');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setView('home')} className="p-1">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Ajustes</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧳</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800">Viajero</p>
              <p className="text-sm text-slate-500">Plan gratuito</p>
            </div>
            <button className="bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Premium
            </button>
          </div>
        </div>

        {/* Current city */}
        <div className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Ubicación actual</p>
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-teal-600" />
            <div className="flex-1">
              <p className="font-medium text-slate-800">{currentCity?.name}, {currentCity?.country}</p>
              <p className="text-xs text-slate-500">Moneda: {currentCity?.currencySymbol} ({currentCity?.currency})</p>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white mx-4 mt-3 rounded-2xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase px-4 pt-4 pb-2">Preferencias</p>
          
          <SettingToggle
            icon={<Moon size={18} className="text-slate-600" />}
            label="Modo oscuro"
            description="Reduce el brillo de la pantalla"
            enabled={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
          <SettingToggle
            icon={<Bell size={18} className="text-slate-600" />}
            label="Notificaciones"
            description="Alertas de llegada y desvíos"
            enabled={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
        </div>

        {/* Language */}
        <div className="bg-white mx-4 mt-3 rounded-2xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase px-4 pt-4 pb-2">Idioma</p>
          <div className="px-4 pb-3 flex gap-2">
            {[
              { code: 'es', label: 'Español', flag: '🇪🇸' },
              { code: 'pt', label: 'Português', flag: '🇧🇷' },
              { code: 'en', label: 'English', flag: '🇺🇸' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  language === lang.code
                    ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                    : 'bg-slate-50 text-slate-600 border-2 border-transparent'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <p className="text-xs mt-0.5">{lang.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Other options */}
        <div className="bg-white mx-4 mt-3 rounded-2xl shadow-sm overflow-hidden mb-4">
          <SettingRow icon={<CreditCard size={18} className="text-slate-600" />} label="Métodos de pago" />
          <SettingRow icon={<Shield size={18} className="text-slate-600" />} label="Privacidad y datos" />
          <SettingRow icon={<Star size={18} className="text-slate-600" />} label="Calificar la app" />
          <SettingRow icon={<HelpCircle size={18} className="text-slate-600" />} label="Ayuda y soporte" />
          <SettingRow icon={<Info size={18} className="text-slate-600" />} label="Acerca de RutaNómada" />
        </div>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">RutaNómada v1.0.0</p>
          <p className="text-xs text-slate-300 mt-1">Hecho con ❤️ para viajeros</p>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ icon, label, description, enabled, onToggle }: {
  icon: React.ReactNode; label: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-50">
      {icon}
      <div className="flex-1">
        <p className="font-medium text-slate-700 text-sm">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-teal-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
          style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function SettingRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-3 w-full px-4 py-3 border-t border-slate-50 hover:bg-slate-50 transition-colors">
      {icon}
      <span className="flex-1 text-left font-medium text-slate-700 text-sm">{label}</span>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}
