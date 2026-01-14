
import React, { useState, useEffect, useRef } from 'react';
import { Todo } from './types';
import { TodoItem } from './components/TodoItem';
import { suggestTasks, getCalendarFriendlyFormat } from './services/geminiService';
import { Plus, Sparkles, Wand2, Calendar as CalendarIcon, Loader2, Heart, ListChecks } from 'lucide-react';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('¡Hola! Soy Rosy, tu asistente mágico. ✨');
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('active');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('rosy-plans-todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('rosy-plans-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, category: Todo['category'] = 'personal', estimatedTime?: string) => {
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      category,
      dueDate: new Date().toISOString(),
      estimatedTime
    };
    setTodos([newTodo, ...todos]);
    setInput('');
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input);
      setAiMessage(`¡Genial! Añadí "${input}" a tu lista. ¿Necesitas ayuda para planearlo? 🎀`);
    }
  };

  const handleAiSuggest = async () => {
    if (!input.trim()) {
      setAiMessage("Dime una tarea primero para que pueda usar mi magia... ✨");
      return;
    }
    setIsAiLoading(true);
    setAiMessage("Consultando con las estrellas... 🌟");
    try {
      const suggestions = await suggestTasks(input);
      if (suggestions && suggestions.length > 0) {
        suggestions.forEach((s: any) => {
          addTodo(s.task, s.category, s.estimatedTime);
        });
        setAiMessage(`¡Bip! He desglosado "${input}" en pasos pequeñitos para ti. ¡Tú puedes! 💖`);
        setInput('');
      }
    } catch (error) {
      setAiMessage("¡Oh no! Mi varita mágica falló. Intenta de nuevo. 🌸");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      setAiMessage("¡Yuhu! ¡Eres increíble! Una tarea menos. 🎉");
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const syncToCalendar = async (todo: Todo) => {
    setIsAiLoading(true);
    setAiMessage("Preparando tu evento mágico... 📅");
    const link = await getCalendarFriendlyFormat(todo);
    setIsAiLoading(false);
    if (link) {
      window.open(link, '_blank');
      setAiMessage("¡Todo listo! Solo confirma en Google Calendar. 🗓️✨");
    } else {
      setAiMessage("No pude crear el link, inténtalo de nuevo. 😿");
    }
  };

  const focusInput = () => {
    setFilter('active');
    setTimeout(() => {
      inputRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    setAiMessage("¿Qué nueva aventura vamos a planear? 🌸");
  };

  const showAchievements = () => {
    setFilter('completed');
    const completedCount = todos.filter(t => t.completed).length;
    setAiMessage(`¡Mira todo lo que has logrado! Llevas ${completedCount} tareas mágicas hechas. 💖`);
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'active') return !t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fff5f7] pb-32">
      {/* Header Area */}
      <header className="pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center space-x-2 mb-4">
          <div className="bg-pink-400 p-3 rounded-2xl rotate-3 shadow-lg">
            <Heart className="text-white fill-white" size={28} />
          </div>
          <h1 className="text-4xl font-bold text-pink-500 tracking-tight">Rosy Plans</h1>
        </div>
        <p className="text-pink-300 font-medium">Productividad hecha con amor y magia</p>
      </header>

      <main className="max-w-md mx-auto px-6">
        {/* Assistant Bubble */}
        <div className="bg-white p-4 rounded-3xl border border-pink-100 cute-shadow mb-8 relative">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              {isAiLoading ? (
                <Loader2 className="animate-spin text-pink-400" size={20} />
              ) : (
                <Sparkles className="text-pink-400" size={20} />
              )}
            </div>
            <p className="text-sm text-gray-600 italic py-1 leading-relaxed">
              {aiMessage}
            </p>
          </div>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white border-r border-b border-pink-100 transform rotate-45"></div>
        </div>

        {/* Input Section */}
        <form onSubmit={handleManualAdd} className="mb-8">
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="¿Qué vamos a lograr hoy? ✨"
              className="w-full pl-6 pr-32 py-4 bg-white rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-pink-600 placeholder-pink-200 cute-shadow transition-all font-medium"
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading}
                className="p-2.5 bg-purple-400 hover:bg-purple-500 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
                title="Sugerencias mágicas"
              >
                <Wand2 size={20} />
              </button>
              <button
                type="submit"
                className="p-2.5 bg-pink-400 hover:bg-pink-500 text-white rounded-xl transition-colors shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </form>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-lg font-bold text-pink-400 flex items-center capitalize">
              {filter === 'all' ? 'Todas las tareas' : filter === 'completed' ? 'Mis Logros' : 'Pendientes'} 
              <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-500 text-xs rounded-full">{filteredTodos.length}</span>
            </h2>
            <button 
              onClick={() => setFilter(filter === 'all' ? 'active' : 'all')}
              className="text-xs text-pink-300 font-bold hover:text-pink-400 transition-colors uppercase tracking-widest"
            >
              {filter === 'all' ? 'Ver activas' : 'Ver todas'}
            </button>
          </div>

          {filteredTodos.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-pink-100">
              <div className="mb-4 flex justify-center opacity-20">
                {filter === 'completed' ? <ListChecks size={64} className="text-pink-300" /> : <CalendarIcon size={64} className="text-pink-300" />}
              </div>
              <p className="text-pink-300 font-medium">
                {filter === 'completed' 
                  ? 'Aún no hay logros aquí... \n¡Tú puedes empezar hoy! 🌟' 
                  : '¡No hay tareas pendientes! \nDisfruta de tu día libre 🌸'}
              </p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onSync={syncToCalendar}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-50 px-8 py-4 flex justify-around items-center z-50">
        <button 
          onClick={showAchievements}
          className={`p-2 transition-all transform hover:scale-110 ${filter === 'completed' ? 'text-pink-500' : 'text-pink-200'}`}
          title="Ver logros"
        >
          <Heart size={28} className={filter === 'completed' ? 'fill-current' : ''} />
        </button>
        
        <button 
          onClick={focusInput}
          className="p-4 bg-pink-400 hover:bg-pink-500 text-white rounded-full -mt-12 border-8 border-[#fff5f7] shadow-lg transition-all transform hover:scale-110 active:scale-95"
          title="Nueva tarea"
        >
          <Plus size={32} />
        </button>
        
        <button 
          onClick={() => window.open('https://calendar.google.com', '_blank')}
          className="p-2 text-pink-200 hover:text-pink-400 transition-all transform hover:scale-110"
          title="Abrir Google Calendar"
        >
          <CalendarIcon size={28} />
        </button>
      </nav>
    </div>
  );
};

export default App;
