import {useEffect, useState} from "react";
import {login, getTasks, createTask, toggleTask, deleteTask, type Task} from "./api";
import * as React from "react";

function App() {
  const [token, setToken] = useState<string | null>(localStorage
      .getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      getTasks(token).then(setTasks).catch(() => setError(
          'Сессия истекла'));
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newToken = await login(email, password);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !token) return;
    try {
      const task = await createTask(token, newTask, 'MEDIUM');
      setTasks([...tasks, task]);
      setNewTask('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (task: Task) => {
    if (!token) return;
    try {
      const updated = await toggleTask(token, task);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!token) return;
    try {
      await deleteTask(token, taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  };

  if (!token) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-
        center p-4">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl
          shadow-md w-full max-w-sm">
            <h1 className="text-2x1 font-bold mb-6 text-center">ToDO App</h1>
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
                setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
            required
            />
            <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) =>
                setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            required
            />
            <button type="submit" className="w-full bg-blue-600 text-white
            p-3 rounded-lg font-semibold hover:bg-blue-700">
              Войти
            </button>
          </form>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Мои задачи</h1>
            <button onClick={handleLogout} className="text-red-600 text-sm hover:underline">Выйти</button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <input
                type="text"
                placeholder="Новая задача..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
            />
            <button type="submit" className="bg-green-600 text-white px-6 rounded-lg font-semibold hover:bg-green-700">
              Добавить
            </button>
          </form>

          <ul className="space-y-2">
            {tasks.map((task) => (
                <li key={task.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-8">#{task.userTaskNumber}</span>
                  <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
    {task.description}
  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          task.priority === 'LOW' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                  }`}>
    {task.priority}
  </span>
                  <button
                      onClick={() => handleToggle(task)}
                      className={`text-sm px-3 py-1 rounded ${
                          task.isCompleted
                              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={task.isCompleted ? 'Вернуть в работу' : 'Отметить выполненной'}
                  >
                    {task.isCompleted ? '↩' : '✓'}
                  </button>
                  <button
                      onClick={() => handleDelete(task.id)}
                      className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      title="Удалить задачу"
                  >
                    ✕
                  </button>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}

export default App;
