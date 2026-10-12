import { useState } from 'react';
import { ArrowLeft, ChevronDown, Search, HelpCircle } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const faqCategories = [
  {
    name: 'Uso básico',
    icon: '🚌',
    questions: [
      { q: '¿Cómo busco una ruta?', a: 'Abre la app, permite el acceso a tu ubicación o selecciona tu ciudad, y escribe tu destino en el buscador. La app te mostrará las mejores opciones de transporte público disponibles.' },
      { q: '¿Puedo usar la app sin GPS?', a: 'Sí. Si no permites el acceso a tu ubicación, puedes seleccionar manualmente tu ciudad y escribir tu punto de partida.' },
      { q: '¿Qué significa "cobertura parcial"?', a: 'Indica que tenemos datos de algunos sistemas de transporte en esa ciudad, pero no de todos. Las rutas mostradas son válidas pero pueden no cubrir todas las opciones.' },
      { q: '¿Las rutas son exactas?', a: 'Las rutas se basan en datos oficiales y estimaciones verificadas. Los tiempos pueden variar según el tráfico y la frecuencia real de los vehículos.' },
    ]
  },
  {
    name: 'Pagos y Premium',
    icon: '💳',
    questions: [
      { q: '¿Cuántas consultas gratuitas tengo?', a: 'Tienes 5 consultas de rutas gratuitas por día. Se reinician a medianoche según tu zona horaria local.' },
      { q: '¿Qué incluye Premium?', a: 'Consultas ilimitadas, datos en tiempo real, favoritos sin límite, historial completo, navegación avanzada y soporte prioritario.' },
      { q: '¿Cómo cancelo Premium?', a: 'Ve a Ajustes → Suscripción → Cancelar. Mantendrás el acceso hasta el final del periodo pagado.' },
      { q: '¿Se renueva automáticamente?', a: 'Sí. La suscripción se renueva automáticamente cada semana/mes/año según el plan elegido. Puedes cancelar en cualquier momento.' },
    ]
  },
  {
    name: 'Transporte local',
    icon: '🗺️',
    questions: [
      { q: '¿Qué es un colectivo?', a: 'Son vehículos (autos, vans o minibuses) que recorren rutas fijas. No tienen paraderos formales: haces seña y paras donde puedas. Se paga en efectivo al cobrador.' },
      { q: '¿Cómo pago el transporte?', a: 'Depende del sistema: algunos usan tarjetas recargables (Metropolitano, Metro), otros aceptan efectivo (colectivos, buses informales). La app indica la forma de pago en cada ruta.' },
      { q: '¿Es seguro viajar de noche?', a: 'Prioriza sistemas formales como Metropolitano o Metro. Evita buses informales muy llenos o vacíos. De noche, considera usar apps de rideshare.' },
      { q: '¿Los horarios son confiables?', a: 'Los sistemas formales (Metro, BRT) tienen horarios confiables. El transporte informal puede variar. La app indica la fuente de cada dato.' },
    ]
  },
  {
    name: 'Privacidad',
    icon: '🔒',
    questions: [
      { q: '¿Qué datos guardan de mí?', a: 'Solo los necesarios: tu cuenta, historial de búsquedas y preferencias. Tu ubicación GPS no se almacena permanentemente.' },
      { q: '¿Comparten mi ubicación?', a: 'No. Tu ubicación se usa solo para calcular rutas y no se comparte con terceros.' },
      { q: '¿Puedo borrar mi historial?', a: 'Sí. Ve a Ajustes → Privacidad → Borrar historial. También puedes eliminar tu cuenta completamente.' },
    ]
  },
];

export default function FAQ() {
  const { setView } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = activeCategory
    ? faqCategories.filter(c => c.name === activeCategory)
    : faqCategories;

  const filteredQuestions = searchQuery
    ? faqCategories.flatMap(c =>
        c.questions.filter(q =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : null;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/10">
        <button onClick={() => setView('home')} className="p-2 text-white/70">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Ayuda y Preguntas</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar preguntas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-teal-400/50"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !activeCategory ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/60'
            }`}
          >
            Todas
          </button>
          {faqCategories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === cat.name ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {filteredQuestions ? (
          filteredQuestions.length > 0 ? (
            filteredQuestions.map((q, i) => (
              <QuestionItem
                key={i}
                question={q.q}
                answer={q.a}
                expanded={expanded === `search-${i}`}
                onToggle={() => setExpanded(expanded === `search-${i}` ? null : `search-${i}`)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <HelpCircle size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No se encontraron resultados</p>
              <p className="text-white/30 text-xs mt-1">Intenta con otros términos</p>
            </div>
          )
        ) : (
          filteredCategories.map(category => (
            <div key={category.name} className="mb-4">
              <h3 className="text-xs font-bold text-white/40 uppercase mb-2 flex items-center gap-1">
                <span>{category.icon}</span> {category.name}
              </h3>
              <div className="space-y-2">
                {category.questions.map((q, i) => (
                  <QuestionItem
                    key={i}
                    question={q.q}
                    answer={q.a}
                    expanded={expanded === `${category.name}-${i}`}
                    onToggle={() => setExpanded(expanded === `${category.name}-${i}` ? null : `${category.name}-${i}`)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact support */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full bg-teal-500/20 border border-teal-500/30 text-teal-400 font-medium py-3 rounded-xl text-sm">
          ¿No encontraste tu respuesta? Contáctanos
        </button>
      </div>
    </div>
  );
}

function QuestionItem({ question, answer, expanded, onToggle }: {
  question: string; answer: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <span className="text-sm font-medium text-white/90 pr-4">{question}</span>
        <ChevronDown size={16} className={`text-white/40 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-sm text-white/60 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
