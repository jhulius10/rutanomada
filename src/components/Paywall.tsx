import { useState } from 'react';
import { ArrowLeft, Check, Crown, Zap, Shield, Clock, X, Star, ChevronRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export default function Paywall() {
  const { setView, freeQueriesRemaining } = useAppStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  if (showCheckout) {
    return <CheckoutView onBack={() => setShowCheckout(false)} />;
  }

  if (showTerms) {
    return <TermsView onBack={() => setShowTerms(false)} />;
  }

  const isExhausted = freeQueriesRemaining === 0;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <button onClick={() => setView('home')} className="p-2 text-white/70">
          <X size={24} />
        </button>
        <div className="flex items-center gap-1">
          <Crown size={20} className="text-amber-400" />
          <span className="font-bold text-amber-400">Premium</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 px-6 py-6">
        {isExhausted ? (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                <Crown size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-2">¡Sin consultas gratuitas!</h1>
              <p className="text-white/60 text-sm">
                Has utilizado tus 5 rutas gratuitas de hoy.
                <br />Sigue explorando la ciudad con RutaNómada Premium.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                <Zap size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black mb-2">Potencia tu viaje</h1>
              <p className="text-white/60 text-sm">
                Te quedan <span className="text-amber-400 font-bold">{freeQueriesRemaining}</span> consultas gratuitas.
                <br />Desbloquea todo con Premium.
              </p>
            </div>
          </>
        )}

        {/* Price card */}
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-amber-300 uppercase font-bold tracking-wider">Plan Premium</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-white">US$1</span>
                <span className="text-white/60 text-sm">/semana</span>
              </div>
            </div>
            <div className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
              -80% vs mensual
            </div>
          </div>
          <p className="text-xs text-white/50">
            Renovación automática. Cancela cuando quieras. Impuestos incluidos.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <FeatureItem icon={<Zap size={18} />} text="Consultas ilimitadas de rutas" highlight />
          <FeatureItem icon={<Clock size={18} />} text="Datos en tiempo real" />
          <FeatureItem icon={<Star size={18} />} text="Favoritos ilimitados e historial" />
          <FeatureItem icon={<Shield size={18} />} text="Navegación paso a paso avanzada" />
          <FeatureItem icon={<Zap size={18} />} text="Comparador de rutas avanzado" />
          <FeatureItem icon={<Star size={18} />} text="Alertas de servicio y desvíos" />
          <FeatureItem icon={<Shield size={18} />} text="Soporte prioritario 24/7" />
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform mb-3"
        >
          Activar Premium — US$1/semana
        </button>

        <button
          onClick={() => setView('home')}
          className="w-full text-white/60 font-medium py-3 text-sm"
        >
          {isExhausted ? 'Esperar al próximo reinicio' : 'Volver a mis rutas'}
        </button>

        <button
          onClick={() => setShowTerms(true)}
          className="w-full text-white/40 text-xs py-2 underline"
        >
          Ver condiciones, renovación y cancelación
        </button>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text, highlight }: { icon: React.ReactNode; text: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-white/60'}`}>
        {icon}
      </div>
      <span className={`text-sm ${highlight ? 'text-white font-semibold' : 'text-white/80'}`}>{text}</span>
    </div>
  );
}

function CheckoutView({ onBack }: { onBack: () => void }) {
  const [method, setMethod] = useState<'card' | 'mercadopago' | 'paypal'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setView } = useAppStore();

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="h-full flex flex-col bg-slate-950 text-white items-center justify-center p-6">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 animate-pulse">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-black mb-2">¡Bienvenido a Premium!</h1>
        <p className="text-white/60 text-center text-sm mb-8">
          Tu suscripción está activa. Disfruta de rutas ilimitadas y todas las funciones premium.
        </p>
        <button
          onClick={() => setView('home')}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Empezar a explorar 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-y-auto">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Checkout</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Order summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">RutaNómada Premium</span>
            <span className="text-white font-bold">US$1.00</span>
          </div>
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Periodo: 1 semana</span>
            <span>Renovación automática</span>
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-black text-lg text-amber-400">US$1.00</span>
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Método de pago</p>
          <div className="space-y-2">
            <PaymentMethod
              icon="💳"
              label="Tarjeta de crédito/débito"
              subtitle="Visa, Mastercard, AMEX"
              selected={method === 'card'}
              onSelect={() => setMethod('card')}
            />
            <PaymentMethod
              icon="🟦"
              label="Mercado Pago"
              subtitle="Disponible en LATAM"
              selected={method === 'mercadopago'}
              onSelect={() => setMethod('mercadopago')}
            />
            <PaymentMethod
              icon="🅿️"
              label="PayPal"
              subtitle="Pago seguro"
              selected={method === 'paypal'}
              onSelect={() => setMethod('paypal')}
            />
          </div>
        </div>

        {/* Card form */}
        {method === 'card' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Número de tarjeta"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-400/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-400/50"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-400/50"
              />
            </div>
            <input
              type="text"
              placeholder="Nombre del titular"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-400/50"
            />
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <Shield size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/80">
            Pago 100% seguro. No almacenamos datos de tu tarjeta. Procesado por proveedores certificados PCI-DSS.
          </p>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform disabled:opacity-60"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            'Pagar US$1.00 y activar Premium'
          )}
        </button>

        <p className="text-center text-xs text-white/40">
          Al pagar aceptas los términos de servicio y la política de renovación automática.
        </p>
      </div>
    </div>
  );
}

function PaymentMethod({ icon, label, subtitle, selected, onSelect }: {
  icon: string; label: string; subtitle: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
        selected ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-amber-400' : 'border-white/30'}`}>
        {selected && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />}
      </div>
    </button>
  );
}

function TermsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-y-auto">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/10 sticky top-0 bg-slate-950 z-10">
        <button onClick={onBack} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Términos y condiciones</h1>
      </div>

      <div className="p-4 space-y-4 text-sm text-white/70">
        <section>
          <h2 className="font-bold text-white mb-2">📋 Renovación automática</h2>
          <p>Tu suscripción Premium se renovará automáticamente cada 7 días por US$1.00 hasta que la canceles. El cobro se realizará al método de pago registrado.</p>
        </section>

        <section>
          <h2 className="font-bold text-white mb-2">❌ Cancelación</h2>
          <p>Puedes cancelar en cualquier momento desde Ajustes → Suscripción. Mantendrás el acceso Premium hasta el final del periodo pagado. No se realizan reembolsos parciales.</p>
        </section>

        <section>
          <h2 className="font-bold text-white mb-2">💰 Precios e impuestos</h2>
          <p>El precio mostrado incluye todos los impuestos aplicables. Nos reservamos el derecho de modificar precios con notificación previa de 30 días.</p>
        </section>

        <section>
          <h2 className="font-bold text-white mb-2">🛡️ Uso razonable</h2>
          <p>Las consultas ilimitadas están sujetas a una política de uso razonable (máximo 500 consultas/día). El abuso puede resultar en suspensión de la cuenta.</p>
        </section>

        <section>
          <h2 className="font-bold text-white mb-2">🔒 Privacidad</h2>
          <p>No almacenamos datos de tarjetas. Los pagos son procesados por proveedores certificados. Tu ubicación se trata según nuestra política de privacidad.</p>
        </section>

        <section>
          <h2 className="font-bold text-white mb-2">📍 Datos de transporte</h2>
          <p>Las rutas y tarifas son estimaciones basadas en datos disponibles. No garantizamos exactitud absoluta. Verifica siempre con operadores locales.</p>
        </section>
      </div>
    </div>
  );
}
