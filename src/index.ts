// src/types.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// src/db.ts
import { Todo } from './types';

// In-memory store for todos (replace with your preferred database)
let todos: Todo[] = [];

export const db = {
  getTodos: () => todos,
  addTodo: (text: string): Todo => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    todos.push(todo);
    return todo;
  },
  updateTodo: (id: string, updates: Partial<Todo>): Todo | null => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return null;
    
    todos[index] = { ...todos[index], ...updates };
    return todos[index];
  },
  deleteTodo: (id: string): boolean => {
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id);
    return todos.length !== initialLength;
  }
};

// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Get all todos
app.get('/api/todos', (c) => {
  return c.json(db.getTodos());
});

// Create a new todo
app.post('/api/todos', async (c) => {
  const { text } = await c.req.json();
  
  if (!text || typeof text !== 'string') {
    return c.json({ error: 'Invalid todo text' }, 400);
  }

  const todo = db.addTodo(text);
  return c.json(todo, 201);
});

// Update a todo
app.put('/api/todos/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  const todo = db.updateTodo(id, updates);
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }
  
  return c.json(todo);
});

// Delete a todo
app.delete('/api/todos/:id', (c) => {
  const id = c.req.param('id');
  const deleted = db.deleteTodo(id);
  
  if (!deleted) {
    return c.json({ error: 'Todo not found' }, 404);
  }
  
  return c.json({ success: true });
});

export default app;

// src/client/TodoList.tsx
import React, { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  
  useEffect(() => {
    fetchTodos();
  }, []);
  
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };
  
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo }),
      });
      
      if (response.ok) {
        const todo = await response.json();
        setTodos([...todos, todo]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };
  
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };
  
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 p-2 border rounded"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </form>
      
      <ul className="space-y-2">
        {todos.map(todo => (
          <li 
            key={todo.id}
            className="flex items-center justify-between p-3 bg-white border rounded shadow-sm"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                className="h-4 w-4"
              />
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
