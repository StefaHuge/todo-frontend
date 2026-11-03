import {useEffect, useState, type SubmitEvent, useMemo} from "react";
import {login, getTasks, createTask, toggleTask, deleteTask, type Task, register, updateTask} from "./api";

function App() {
  const [token, setToken] = useState<string | null>(localStorage
      .getItem('token'));
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>
  ('MEDIUM');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(
      'all');
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'HIGH' | 'MEDIUM' |
  'LOW'>('MEDIUM');

  useEffect(() => {
    if (token) {
      getTasks(token).then(setTasks).catch(() => setError(
          'Сессия истекла'));
    }
  }, [token]);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Произошла неизвестная ошибка');
    }
  };

  const handleRegister = async (
      e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newToken = await register(email, password);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setError('');
    } catch (err: unknown) {
      handleError(err);
    }
  };

  const handleLogin = async (
      e: SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const newToken = await login(email, password);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setError('');
    } catch (err: unknown) {
      handleError(err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return !task.isCompleted;
      if (filter === 'completed') return task.isCompleted;
      return true;
    });
  }, [tasks, filter]);

  const handleCreate = async (
      e: SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!newTask.trim() || !token) return;
    try {
      const task = await createTask(token, newTask, newPriority);
      setTasks([...tasks, task]);
      setNewTask('');
      setNewPriority('MEDIUM');
    } catch (err: unknown) {
      handleError(err);
    }
  };

  const handleToggle = async (task: Task) => {
    if (!token) return;
    try {
      const updated = await toggleTask(token, task);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: unknown) {
      handleError(err);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!token) return;
    try {
      await deleteTask(token, taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      handleError(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  };

  const handleEditStart = (task: Task) => {
    setEditingTask(task);
    setEditDescription(task.description);
    setEditPriority(task.priority);
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditDescription('');
  };

  const handleEditSave = async () => {
    if (!token || !editingTask || !editDescription.trim()) return;
    try {
      const updated = await updateTask(
          token,
          editingTask.id,
          editDescription,
          editPriority,
          editingTask.isCompleted
      );
      setTasks(tasks.map((t) => (t.id === updated.id ?
          updated : t)));
      setEditingTask(null);
      setEditDescription('');
    } catch (err: unknown) {
      handleError(err);
    }
  };

  if (!token) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center
        justify-center p-4">
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin}
                className="bg-white p-8 rounded-xl
          shadow-md w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-6 text-center">ToDO App</h1>
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
            <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg
                font-semibold hover:bg-blue-700"
            >
              {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
            </button>
            <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="w-full mt-3 text-blue-600 text-sm hover:underline"
            >
              {isRegisterMode ? 'Уже есть аккаунт? Войти' :
                  'Нет аккаунта? Зарегистрироваться'}
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
            <div className="flex gap-2 mb-4">
              <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 
                    'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              >
                Все ({tasks.length})
              </button>
              <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'active' ? 'bg-blue-600 text-white' : 
                    'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              >
                Активные ({tasks.filter((t) => !t.isCompleted)
                  .length})
              </button>
              <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === 'completed' ? 'bg-blue-600 text-white' :
                        'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Выполненные ({tasks.filter((t) => t
                  .isCompleted).length})
              </button>
            </div>
            <button onClick={handleLogout} className="text-red-600
            text-sm hover:underline">Выйти</button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <input
                type="text"
                placeholder="Новая задача..."
                value={newTask}
                onChange={(e
                ) => setNewTask(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
            />
            <select
            value={newPriority}
            onChange={
              (e) =>
                  setNewPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' )}
            className="p-3 border rounded-lg bg-white"
            >
              <option value="HIGH">🔴 Высокий</option>
              <option value="MEDIUM">🟡 Средний</option>
              <option value="LOW">🟢 Низкий</option>
            </select>
            <button type="submit" className="bg-green-600 text-white
            px-6 rounded-lg font-semibold hover:bg-green-700">
              Добавить
            </button>
          </form>

          <ul className="space-y-2">
            {filteredTasks.map((task) => (
                <li key={task.id} className="bg-white p-4 rounded-lg
                shadow flex items-center gap-3">
                  {editingTask?.id === task.id ? (
                      <>
                        <input
                            type="text"
                            value={editDescription}
                            onChange={
                          (e) =>
                                setEditDescription(e.target.value)}
                            className="flex-1 p-2 border rounded-lg"
                        />
                        <select
                            value={editPriority}
                            onChange={
                          (e) =>
                              setEditPriority(e.target.value as 'HIGH' |
                              'MEDIUM' | 'LOW')}
                            className="p-2 border rounded-lg bg-white"
                        >
                          <option value="HIGH">🔴 Высокий</option>
                          <option value="MEDIUM">🟡 Средний</option>
                          <option value="LOW">🟡 Средний</option>
                        </select>
                        <button
                            onClick={handleEditSave}
                            className="text-sm px-3 py-1 rounded
                            bg-green-600 text-white
                            hover:bg-green-700"
                            title="Сохранить"
                        >
                          ✓
                        </button>
                        <button
                            onClick={handleEditCancel}
                            className="text-sm px-3 py-1 rounded
                            bg-gray-300 text-gray-700
                            hover:bg-gray-400"
                            title="Отменить"
                        >
                          ✕
                        </button>
                        </>
                      ) : (
                          <>
                  <span className="text-gray-400 text-sm w-8">#{task
                      .userTaskNumber}</span>
                  <span className={`flex-1 ${task.isCompleted ? 
                      'line-through text-gray-400' : ''}`}>
    {task.description}
  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'HIGH' ? 'bg-red-100 ' +
                          'text-red-700' :
                          task.priority === 'LOW' ? 'bg-green-100 ' +
                              'text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                  }`}>
    {task.priority}
  </span>

                  <button
                  onClick={() => handleEditStart(task)}
                  className="text-sm px-3 py-1 rounded bg-blue-100
                  text-blue-700 hover:bg-blue-200"
                  title="Редактировать"
                  >
                    ✎
                  </button>
                  <button
                      onClick={() => handleToggle(task)}
                      className={`text-sm px-3 py-1 rounded ${
                          task.isCompleted
                              ? 'bg-gray-200 text-gray-600 ' +
                              'hover:bg-gray-300'
                              : 'bg-green-100 text-green-700 ' +
                              'hover:bg-green-200'
                      }`}
                      title={task.isCompleted ? 'Вернуть в работу' :
                          'Отметить выполненной'}
                  >
                    {task.isCompleted ? '↩' : '✓'}
                  </button>
                  <button
                      onClick={() => handleDelete(task.id)}
                      className="text-sm px-3 py-1 rounded bg-red-100
                      text-red-700 hover:bg-red-200"
                      title="Удалить задачу"
                  >
                    ✕
                  </button>
                  </>
                  )}
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}

export default App;
