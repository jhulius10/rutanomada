import { useState } from 'react';
import { ArrowLeft, Users, Map, CreditCard, BarChart3, Settings, Globe, Bus, DollarSign, TrendingUp, Activity, Shield, Database, Bell } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

type AdminTab = 'dashboard' | 'cities' | 'users' | 'providers' | 'billing' | 'settings';

export default function AdminPanel() {
  const { setView } = useAppStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/10 bg-slate-900/50">
        <button onClick={() => setView('home')} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">Panel de Administración</h1>
          <p className="text-xs text-white/40">RutaNómada SaaS • v1.0</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 bg-slate-900/30 hide-scrollbar">
        {[
          { id: 'dashboard', icon: <BarChart3 size={14} />, label: 'Dashboard' },
          { id: 'cities', icon: <Globe size={14} />, label: 'Ciudades' },
          { id: 'users', icon: <Users size={14} />, label: 'Usuarios' },
          { id: 'providers', icon: <Bus size={14} />, label: 'Proveedores' },
          { id: 'billing', icon: <CreditCard size={14} />, label: 'Facturación' },
          { id: 'settings', icon: <Settings size={14} />, label: 'Config' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'text-teal-400 border-b-2 border-teal-400' : 'text-white/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'cities' && <CitiesTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'providers' && <ProvidersTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Users size={18} />} label="Usuarios activos" value="12,847" change="+12%" color="teal" />
        <StatCard icon={<Map size={18} />} label="Consultas hoy" value="34,521" change="+8%" color="blue" />
        <StatCard icon={<DollarSign size={18} />} label="Ingresos (mes)" value="US$4,230" change="+23%" color="emerald" />
        <StatCard icon={<TrendingUp size={18} />} label="Conversión" value="3.2%" change="+0.4%" color="amber" />
      </div>

      {/* API Costs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-amber-400" /> Costos de APIs (hoy)
        </h3>
        <div className="space-y-2">
          <CostRow provider="Google Maps Routes" cost="$42.30" calls="1,240" />
          <CostRow provider="Google Maps Places" cost="$18.50" calls="3,450" />
          <CostRow provider="Google Maps Geocoding" cost="$8.20" calls="890" />
          <CostRow provider="GTFS Data" cost="$0.00" calls="12,300" />
        </div>
        <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
          <span className="text-sm text-white/60">Total estimado</span>
          <span className="font-bold text-amber-400">$69.00/día</span>
        </div>
      </div>

      {/* Cache stats */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Database size={16} className="text-teal-400" /> Caché
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-teal-400">67%</p>
            <p className="text-xs text-white/50">Hit rate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">23,400</p>
            <p className="text-xs text-white/50">Hits hoy</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-400">$46</p>
            <p className="text-xs text-white/50">Ahorro</p>
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Bell size={16} className="text-orange-400" /> Alertas recientes
        </h3>
        <div className="space-y-2">
          <AlertItem type="warning" message="API Google Maps cerca del 80% del presupuesto diario" time="Hace 2h" />
          <AlertItem type="info" message="Nueva ciudad activada: Quito, Ecuador" time="Hace 5h" />
          <AlertItem type="success" message="Backup completado exitosamente" time="Hace 8h" />
        </div>
      </div>
    </div>
  );
}

function CitiesTab() {
  const citiesData = [
    { name: 'Lima', country: 'Perú', coverage: 'partial', users: 3200, active: true },
    { name: 'Bogotá', country: 'Colombia', coverage: 'complete', users: 2800, active: true },
    { name: 'Buenos Aires', country: 'Argentina', coverage: 'complete', users: 2100, active: true },
    { name: 'Santiago', country: 'Chile', coverage: 'complete', users: 1900, active: true },
    { name: 'São Paulo', country: 'Brasil', coverage: 'complete', users: 1500, active: true },
    { name: 'Quito', country: 'Ecuador', coverage: 'partial', users: 800, active: true },
    { name: 'La Paz', country: 'Bolivia', coverage: 'partial', users: 450, active: true },
    { name: 'Caracas', country: 'Venezuela', coverage: 'walking-only', users: 200, active: true },
    { name: 'Montevideo', country: 'Uruguay', coverage: 'partial', users: 350, active: true },
    { name: 'Asunción', country: 'Paraguay', coverage: 'walking-only', users: 150, active: false },
  ];

  return (
    <div className="space-y-3">
      <button className="w-full bg-teal-500/20 border border-teal-500/30 text-teal-400 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2">
        <Globe size={16} /> Activar nueva ciudad
      </button>

      {citiesData.map((city) => (
        <div key={city.name} className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-sm">{city.name}, {city.country}</p>
              <p className="text-xs text-white/50">{city.users.toLocaleString()} usuarios</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                city.coverage === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                city.coverage === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {city.coverage === 'complete' ? 'Completa' : city.coverage === 'partial' ? 'Parcial' : 'Solo peatonal'}
              </span>
              <div className={`w-2 h-2 rounded-full ${city.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  return (
    <div className="space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3">Resumen de usuarios</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-teal-400">12,847</p>
            <p className="text-xs text-white/50">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-400">847</p>
            <p className="text-xs text-white/50">Premium</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-400">342</p>
            <p className="text-xs text-white/50">Nuevos (7d)</p>
          </div>
        </div>
      </div>

      {/* User list */}
      {['María García', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez', 'Lucía Fernández'].map((name, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-white/50">{i < 2 ? 'Premium' : 'Gratuito'} • {Math.floor(Math.random() * 50)} consultas</p>
          </div>
          <button className="text-white/30 text-xs">Ver</button>
        </div>
      ))}
    </div>
  );
}

function ProvidersTab() {
  return (
    <div className="space-y-3">
      {[
        { name: 'Google Maps Routes API', status: 'active', calls: '1,240', cost: '$42.30', priority: 1 },
        { name: 'Google Maps Places API', status: 'active', calls: '3,450', cost: '$18.50', priority: 2 },
        { name: 'Google Maps Geocoding', status: 'active', calls: '890', cost: '$8.20', priority: 3 },
        { name: 'GTFS Lima (Metropolitano)', status: 'active', calls: '5,200', cost: '$0.00', priority: 1 },
        { name: 'GTFS Bogotá (TransMilenio)', status: 'active', calls: '4,100', cost: '$0.00', priority: 1 },
        { name: 'GTFS Buenos Aires', status: 'active', calls: '3,000', cost: '$0.00', priority: 1 },
      ].map((provider) => (
        <div key={provider.name} className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-sm">{provider.name}</p>
            <div className={`w-2 h-2 rounded-full ${provider.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>{provider.calls} llamadas</span>
            <span>•</span>
            <span className={provider.cost === '$0.00' ? 'text-emerald-400' : 'text-amber-400'}>{provider.cost}</span>
            <span>•</span>
            <span>Prioridad: {provider.priority}</span>
          </div>
        </div>
      ))}

      <button className="w-full bg-white/5 border border-dashed border-white/20 text-white/50 font-medium py-3 rounded-xl text-sm">
        + Agregar proveedor
      </button>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<DollarSign size={18} />} label="Ingresos (mes)" value="US$4,230" change="+23%" color="emerald" />
        <StatCard icon={<TrendingUp size={18} />} label="MRR" value="US$3,890" change="+18%" color="teal" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3">Suscripciones activas</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Semanales (US$1)</span>
            <span className="font-medium text-amber-400">623</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Mensuales (US$3.99)</span>
            <span className="font-medium text-amber-400">189</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Anuales (US$29.99)</span>
            <span className="font-medium text-amber-400">35</span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3">Últimas transacciones</h3>
        <div className="space-y-2">
          {[
            { user: 'María G.', amount: 'US$1.00', status: 'success', date: 'Hace 5min' },
            { user: 'Carlos L.', amount: 'US$3.99', status: 'success', date: 'Hace 12min' },
            { user: 'Ana M.', amount: 'US$1.00', status: 'pending', date: 'Hace 30min' },
            { user: 'Pedro R.', amount: 'US$29.99', status: 'success', date: 'Hace 1h' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white/80">{tx.user}</p>
                <p className="text-xs text-white/40">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-emerald-400">{tx.amount}</p>
                <p className={`text-xs ${tx.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {tx.status === 'success' ? '✓ Completada' : '⏳ Pendiente'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Shield size={16} className="text-teal-400" /> Configuración general
        </h3>
        <div className="space-y-3">
          <SettingRow label="Consultas gratuitas/día" value="5" />
          <SettingRow label="Precio semanal" value="US$1.00" />
          <SettingRow label="Precio mensual" value="US$3.99" />
          <SettingRow label="Precio anual" value="US$29.99" />
          <SettingRow label="Límite diario APIs" value="US$100" />
          <SettingRow label="Cache TTL (rutas)" value="15 min" />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Database size={16} className="text-blue-400" /> Base de datos
        </h3>
        <div className="space-y-2">
          <button className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 py-2 rounded-lg text-sm">
            Ejecutar backup manual
          </button>
          <button className="w-full bg-white/5 border border-white/10 text-white/70 py-2 rounded-lg text-sm">
            Ver migraciones pendientes
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Activity size={16} className="text-orange-400" /> Auditoría
        </h3>
        <div className="space-y-2 text-xs">
          <p className="text-white/60">• Admin activó ciudad Quito — Hace 5h</p>
          <p className="text-white/60">• Precio semanal actualizado — Hace 2d</p>
          <p className="text-white/60">• GTFS Lima importado — Hace 3d</p>
          <p className="text-white/60">• Backup automático ejecutado — Hace 6h</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: string; change: string; color: string }) {
  const colorClasses: Record<string, string> = {
    teal: 'from-teal-500/20 to-teal-500/5 border-teal-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
  };
  const textColor: Record<string, string> = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={textColor[color]}>{icon}</span>
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-emerald-400">{change}</p>
    </div>
  );
}

function CostRow({ provider, cost, calls }: { provider: string; cost: string; calls: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{provider}</span>
      <div className="text-right">
        <span className="text-amber-400 font-medium">{cost}</span>
        <span className="text-white/30 text-xs ml-2">({calls})</span>
      </div>
    </div>
  );
}

function AlertItem({ type, message, time }: { type: 'warning' | 'info' | 'success'; message: string; time: string }) {
  const colors = {
    warning: 'text-orange-400 bg-orange-400/10',
    info: 'text-blue-400 bg-blue-400/10',
    success: 'text-emerald-400 bg-emerald-400/10',
  };
  return (
    <div className="flex items-start gap-2">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${colors[type].split(' ')[0].replace('text-', 'bg-')}`} />
      <div className="flex-1">
        <p className="text-sm text-white/80">{message}</p>
        <p className="text-xs text-white/40">{time}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-medium text-teal-400">{value}</span>
    </div>
  );
}
