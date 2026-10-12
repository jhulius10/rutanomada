import { useState } from 'react';
import { Send, ArrowLeft, Bot, User, Lightbulb } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { ChatMessage } from '../types';

const suggestedQuestions = [
  '¿Cómo funciona el Metropolitano?',
  '¿Dónde compro una tarjeta de transporte?',
  '¿Es seguro viajar de noche?',
  '¿Cuál es el horario del Metro?',
  '¿Cómo pago el bus?',
  '¿Qué es un colectivo?',
];

const getAssistantResponse = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes('metropolitano') || q.includes('brt')) {
    return 'El **Metropolitano** es un sistema BRT (Bus de Tránsito Rápido) de Lima. Funciona así:\n\n🚌 **Cómo usarlo:**\n1. Compra una tarjeta recargable en las estaciones (S/ 5 el primer uso)\n2. Ingresa por las torniquetes\n3. Espera en el andén según tu dirección (Norte/Sur)\n4. Los servicios son: Regular (para todas), Expreso (menos paradas) y Super Expreso\n\n💰 **Tarifa:** S/ 2.50 con tarjeta\n⏰ **Horario:** 5:00 AM - 11:00 PM (lunes a sábado)\n\n⚠️ En horas punta (7-9 AM, 6-8 PM) puede estar muy lleno.';
  }
  if (q.includes('tarjeta') || q.includes('pago') || q.includes('compro') || q.includes('comprar')) {
    return '💳 **Opciones de pago en Lima:**\n\n1. **Tarjeta Metropolitano** - Para el BRT. Se compra en estaciones.\n2. **Tarjeta Civica** - Para el Metro de Lima.\n3. **Efectivo** - Aceptado en colectivos y buses informales.\n4. **Aplicaciones** - Algunas apps permiten pago digital.\n\n📍 **Dónde comprar:** En las estaciones del Metropolitano o Metro. También en kioscos autorizados.\n\n💡 **Tip:** Siempre lleva monedas de S/ 1 y S/ 2 por si necesitas pagar en efectivo.';
  }
  if (q.includes('seguro') || q.includes('seguridad') || q.includes('noche')) {
    return '🔒 **Consejos de seguridad:**\n\n✅ **Recomendado:**\n- Usa el Metropolitano o Metro (más seguros)\n- Viaja en horas de mayor movimiento\n- Mantén tus pertenencias cerca\n- Usa apps de rideshare de noche\n\n⚠️ **Precauciones:**\n- Evita mostrar objetos de valor\n- En buses informales, siéntate cerca del cobrador\n- Consulta con locales sobre zonas\n- Si tienes dudas, pregunta al personal\n\n🌙 **De noche:** Prioriza taxis/Uber o el Metropolitano hasta las 11 PM.';
  }
  if (q.includes('horario') || q.includes('hora')) {
    return '⏰ **Horarios principales en Lima:**\n\n🚍 **Metropolitano:**\n- Lunes a Sábado: 5:00 AM - 11:00 PM\n- Domingos: 5:00 AM - 10:00 PM\n\n🚇 **Metro de Lima (Línea 1):**\n- Lunes a Domingo: 6:00 AM - 10:00 PM\n- Frecuencia: cada 4-8 minutos\n\n🚌 **Buses/Corredores:**\n- Generalmente: 5:00 AM - 11:00 PM\n- Frecuencia variable según ruta\n\n🚐 **Colectivos:**\n- Muchos operan hasta medianoche\n- Sin horario fijo establecido';
  }
  if (q.includes('colectivo')) {
    return '🚐 **¿Qué es un colectivo?**\n\nLos colectivos son vehículos (autos, vans o minibuses) que recorren rutas fijas dentro de la ciudad. Son muy comunes en Latinoamérica.\n\n**Cómo identificarlos:**\n- Tienen carteles con su destino en el parabrisas\n- Suelen tener un color o número distintivo\n- No tienen paraderos formales (paras donde puedas)\n\n**Cómo usarlos:**\n1. Identifica el colectivo con tu dirección\n2. Haz seña al conductor levantando la mano\n3. Sube y pregunta si pasa por tu destino\n4. Paga al cobrador (efectivo)\n\n💡 **Tip para turistas:** Pregunta a un local "¿Qué colectivo me lleva a [lugar]?"';
  }
  return '¡Buena pregunta! 🤔 Como tu asistente de movilidad turística, puedo ayudarte con:\n\n🚌 Información sobre rutas y transporte\n💰 Tarifas y formas de pago\n🔒 Consejos de seguridad\n⏰ Horarios y frecuencias\n📍 Cómo llegar a lugares turísticos\n\nIntenta preguntarme algo más específico como:\n- "¿Cómo llego a [lugar]?"\n- "¿Cómo funciona el transporte en [ciudad]?"\n- "¿Es seguro tomar bus de noche?"\n\n¡Estoy aquí para ayudarte! 😊';
};

export default function Assistant() {
  const { chatMessages, addChatMessage, setView } = useAppStore();
  const [input, setInput] = useState('');

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    addChatMessage(userMsg);
    setInput('');

    // Simulate assistant response
    setTimeout(() => {
      const response = getAssistantResponse(message);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      addChatMessage(assistantMsg);
    }, 800);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setView('home')} className="p-1">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-teal-700" />
        </div>
        <div>
          <p className="font-bold text-slate-800">Asistente de Movilidad</p>
          <p className="text-xs text-emerald-600">● En línea</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-teal-700" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-br-md'
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
            }`}>
              <div className="text-sm leading-relaxed space-y-1">
                {formatContent(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {/* Suggested questions */}
        {chatMessages.length <= 1 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <Lightbulb size={12} /> Preguntas frecuentes
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 outline-none text-sm focus:ring-2 focus:ring-teal-200"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
