
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'health' | 'social';
  dueDate: string;
  estimatedTime?: string;
}

export interface AssistantMessage {
  role: 'assistant' | 'user';
  text: string;
}

export enum CategoryColor {
  work = 'bg-blue-100 text-blue-600',
  personal = 'bg-purple-100 text-purple-600',
  health = 'bg-green-100 text-green-600',
  social = 'bg-pink-100 text-pink-600'
}
