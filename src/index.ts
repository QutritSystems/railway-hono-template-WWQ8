// src/index.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/*', cors())

// Serve static files from public directory
app.use('/*', serveStatic({ root: './public' }))

// Serve index.html
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide-react@latest"></script>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        const { useState } = React;
        const { Trash2 } = lucide;

        function TodoApp() {
            const [todos, setTodos] = useState([
                { id: '1', text: 'Create landing page', completed: false },
                { id: '2', text: 'Design product mockups', completed: true },
            ]);
            const [newTodo, setNewTodo] = useState('');

            const addTodo = (e) => {
                e.preventDefault();
                if (!newTodo.trim()) return;
                
                setTodos([
                    ...todos,
                    { id: Date.now().toString(), text: newTodo, completed: false }
                ]);
                setNewTodo('');
            };

            const toggleTodo = (id) => {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, completed: !todo.completed } : todo
                ));
            };

            const deleteTodo = (id) => {
                setTodos(todos.filter(todo => todo.id !== id));
            };

            return React.createElement('div', { 
                className: 'max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-10' 
            }, [
                React.createElement('h2', { 
                    className: 'text-lg font-semibold mb-4',
                    key: 'title'
                }, 'Project Tasks'),
                
                React.createElement('form', { 
                    onSubmit: addTodo,
                    className: 'flex gap-2 mb-4',
                    key: 'form'
                }, [
                    React.createElement('input', {
                        type: 'text',
                        value: newTodo,
                        onChange: (e) => setNewTodo(e.target.value),
                        placeholder: 'Add a new task...',
                        className: 'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                        key: 'input'
                    }),
                    React.createElement('button', {
                        type: 'submit',
                        className: 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        key: 'button'
                    }, 'Add')
                ]),
                
                React.createElement('div', { 
                    className: 'space-y-2',
                    key: 'todos'
                }, todos.map(todo => 
                    React.createElement('div', {
                        key: todo.id,
                        className: 'flex items-center justify-between p-3 bg-gray-50 rounded-md'
                    }, [
                        React.createElement('div', {
                            className: 'flex items-center gap-3',
                            key: 'content'
                        }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: todo.completed,
                                onChange: () => toggleTodo(todo.id),
                                className: 'h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500',
                                key: 'checkbox'
                            }),
                            React.createElement('span', {
                                className: todo.completed ? 'line-through text-gray-500' : 'text-gray-700',
                                key: 'text'
                            }, todo.text)
                        ]),
                        React.createElement('button', {
                            onClick: () => deleteTodo(todo.id),
                            className: 'text-gray-400 hover:text-red-500 focus:outline-none',
                            key: 'delete'
                        }, React.createElement(Trash2, { size: 18 }))
                    ])
                ))
            ]);
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(TodoApp));
    </script>
</body>
</html>
  `)
})

// Start the server
const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
