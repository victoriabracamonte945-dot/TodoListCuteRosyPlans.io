
import React from 'https://esm.sh/react@19.0.0';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0/client';
import htm from 'https://esm.sh/htm';
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai';
import * as Lucide from 'https://esm.sh/lucide-react';

const html = htm.bind(React.createElement);

// --- CONFIGURACIÓN DE IA ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SERVICIOS ---
async function suggestTasksWithAi(input) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugiere 3 subtareas cortas y motivadoras para: "${input}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['work', 'personal', 'health', 'social'] },
            },
            required: ['task', 'category']
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getCalendarUrl(todo) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crea un evento de Google Calendar para: ${todo.text}. Dame título, descripción y horas ISO hoy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            description: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING }
          }
        }
      }
    });
    const data = JSON.parse(response.text);
    const base = "https://www.google.com/calendar/render?action=TEMPLATE";
    const dates = `${data.startTime.replace(/[-:]/g, '')}/${data.endTime.replace(/[-:]/g, '')}`;
    return `${base}&text=${encodeURIComponent(data.summary)}&details=${encodeURIComponent(data.description)}&dates=${dates}`;
  } catch (e) {
    return null;
  }
}

// --- COMPONENTE TAREA ---
const TodoItem = ({ todo, onToggle, onDelete, onSync }) => {
  const categories = {
    work: 'bg-blue-100 text-blue-500',
    personal: 'bg-purple-100 text-purple-500',
    health: 'bg-green-100 text-green-500',
    social: 'bg-pink-100 text-pink-500'
  };

  return html`
    <div className="task-card flex items-center justify-between p-4 mb-3 rounded-2xl bg-white cute-shadow border border-pink-50 ${todo.completed ? 'opacity-60' : ''}">
      <div className="flex items-center space-x-3">
        <button 
          onClick=${() => onToggle(todo.id)}
          className="w-6 h-6 rounded-full border-2 border-pink-200 flex items-center justify-center transition-colors ${todo.completed ? 'bg-pink-400 border-pink-400' : 'bg-white'}"
        >
          ${todo.completed && html`<${Lucide.Check} size=${14} className="text-white" />`}
        </button>
        <div>
          <p className="font-semibold text-gray-700 ${todo.completed ? 'line-through' : ''}">${todo.text}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${categories[todo.category] || categories.personal}">
            ${todo.category}
          </span>
        </div>
      </div>
      <div className="flex space-x-1">
        <button onClick=${() => onSync(todo)} className="p-2 text-blue-300 hover:text-blue-500"><${Lucide.Calendar} size=${18} /></button>
        <button onClick=${() => onDelete(todo.id)} className="p-2 text-pink-200 hover:text-pink-400"><${Lucide.Trash2} size=${18} /></button>
      </div>
    </div>
  `;
};

// --- APP PRINCIPAL ---
const App = () => {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('¡Hola! Soy Rosy, vamos a organizarnos. ✨');
  const [filter, setFilter] = React.useState('active');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('rosy-db-v3');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  React.useEffect(() => {
    localStorage.setItem('rosy-db-v3', JSON.stringify(todos));
  }, [todos]);

  const addTask = (text, cat = 'personal') => {
    if (!text.trim()) return;
    setTodos(prev => [{ id: Date.now().toString(), text, completed: false, category: cat }, ...prev]);
    setInput('');
  };

  const handleAi = async () => {
    if (!input) return setMsg("Escribe algo para que pueda ayudarte... 🌸");
    setLoading(true);
    setMsg("Consultando con las hadas... 🧚‍♀️");
    const res = await suggestTasksWithAi(input);
    if (res.length) {
      res.forEach(s => addTask(s.task, s.category));
      setMsg("¡Listo! He planeado tus pasos mágicos. 🎀");
    } else {
      setMsg("Mi magia falló un poquito, ¿intentamos de nuevo? 😿");
    }
    setLoading(false);
  };

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed);

  return html`
    <div className="min-h-screen pb-32">
      <header className="pt-10 pb-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-white px-6 py-2 rounded-full shadow-sm border border-pink-50">
          <${Lucide.Heart} className="text-pink-400 fill-pink-400" size=${20} />
          <h1 className="text-2xl font-bold text-pink-500">Rosy Plans</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6">
        <div className="bg-white p-4 rounded-3xl cute-shadow mb-6 flex items-start space-x-3 border border-pink-50">
          <div className="text-pink-400">
            ${loading ? html`<${Lucide.Loader2} className="animate-spin" size=${20} />` : html`<${Lucide.Sparkles} size=${20} />`}
          </div>
          <p className="text-xs text-gray-500 italic">${msg}</p>
        </div>

        <div className="relative mb-8">
          <input 
            ref=${inputRef}
            type="text" 
            value=${input}
            onChange=${e => setInput(e.target.value)}
            onKeyPress=${e => e.key === 'Enter' && addTask(input)}
            placeholder="¿Qué haremos hoy? ✨"
            className="w-full pl-6 pr-28 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-pink-200 cute-shadow font-medium text-pink-600 placeholder-pink-200"
          />
          <div className="absolute right-2 top-2 flex space-x-1">
            <button onClick=${handleAi} className="p-2.5 bg-purple-400 text-white rounded-xl"><${Lucide.Wand2} size=${20} /></button>
            <button onClick=${() => addTask(input)} className="p-2.5 bg-pink-400 text-white rounded-xl"><${Lucide.Plus} size=${20} /></button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between px-2 mb-2 text-[10px] font-bold text-pink-300 uppercase tracking-widest">
            <span>${filter === 'active' ? 'Pendientes' : 'Logros'} (${filtered.length})</span>
            <button onClick=${() => setFilter(filter === 'all' ? 'active' : 'all')}>Ver Todo</button>
          </div>
          ${filtered.map(t => html`<${TodoItem} 
            key=${t.id} 
            todo=${t} 
            onToggle=${id => setTodos(todos.map(x => x.id === id ? {...x, completed: !x.completed} : x))}
            onDelete=${id => setTodos(todos.filter(x => x.id !== id))}
            onSync=${async todo => {
              const url = await getCalendarUrl(todo);
              if (url) window.open(url, '_blank');
            }}
          />`)}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-pink-50 px-8 py-4 flex justify-around items-center">
        <button onClick=${() => { setFilter('completed'); setMsg("¡Mira cuánto has avanzado! 💖"); }} 
          className="p-2 ${filter === 'completed' ? 'text-pink-500' : 'text-pink-200'}">
          <${Lucide.Heart} size=${28} className="${filter === 'completed' ? 'fill-current' : ''}" />
        </button>
        
        <button onClick=${() => { setFilter('active'); inputRef.current.focus(); }}
          className="p-4 bg-pink-400 text-white rounded-full -mt-12 border-8 border-[#fff5f7] shadow-lg">
          <${Lucide.Plus} size=${32} />
        </button>
        
        <button onClick=${() => window.open('https://calendar.google.com', '_blank')} className="p-2 text-pink-200">
          <${Lucide.Calendar} size=${28} />
        </button>
      </nav>
    </div>
  `;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
