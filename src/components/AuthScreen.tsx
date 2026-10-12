import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Bus } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const { setView } = useAppStore();
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('home');
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => setView('home')} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center px-6 pt-4 pb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
          <Bus size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {mode === 'login' ? 'Ingresa a tu cuenta de RutaNómada' : 'Únete a miles de viajeros'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 px-6 space-y-4">
        {mode === 'register' && (
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-teal-400/50 transition-colors"
            />
          </div>
        )}

        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-teal-400/50 transition-colors"
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-white/30 outline-none focus:border-teal-400/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === 'login' && (
          <button type="button" className="text-sm text-teal-400 text-right w-full">
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === 'login' ? 'Ingresando...' : 'Creando cuenta...'}
            </span>
          ) : (
            mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40">o continúa con</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social login */}
        <div className="grid grid-cols-3 gap-3">
          <button type="button" className="bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-xl">🔵</span>
          </button>
          <button type="button" className="bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-xl">🔴</span>
          </button>
          <button type="button" className="bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-xl">⚫</span>
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-white/50 pt-4">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-teal-400 font-medium ml-1"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </form>

      {/* Footer */}
      <div className="relative z-10 mt-auto p-6 text-center">
        <p className="text-xs text-white/30">
          Al continuar aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}
