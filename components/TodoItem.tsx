
import React from 'react';
import { Todo, CategoryColor } from '../types';
import { Check, Trash2, Calendar, Sparkles } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSync: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onSync }) => {
  return (
    <div className={`flex items-center justify-between p-4 mb-3 rounded-2xl bg-white cute-shadow border border-pink-50 transition-all hover:scale-[1.01] ${todo.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed ? 'bg-pink-400 border-pink-400' : 'border-pink-200 bg-white'
          }`}
        >
          {todo.completed && <Check size={16} className="text-white" />}
        </button>
        
        <div>
          <h3 className={`font-semibold text-gray-700 ${todo.completed ? 'line-through' : ''}`}>
            {todo.text}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${CategoryColor[todo.category]}`}>
              {todo.category}
            </span>
            {todo.estimatedTime && (
              <span className="text-[10px] text-gray-400 flex items-center">
                <Sparkles size={10} className="mr-1 text-yellow-400" /> {todo.estimatedTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onSync(todo)}
          title="Sync to Google Calendar"
          className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Calendar size={18} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-pink-300 hover:bg-pink-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
