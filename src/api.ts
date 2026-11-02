const API_BASE_URL = 'http://localhost:8081';

export interface Task {
    id: number;
    userTaskNumber: number;
    description: string;
    isCompleted: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
}

export async function login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
    }

    const data: AuthResponse = await response.json();
    return data.token;
}

export async function getTasks(token: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks?size=100`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Ошибка загрузки задач');

    const data = await response.json();
    return data.content;
}

export async function createTask(token: string, description: string,
                                 priority: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, priority }),
    });

    if (!response.ok) throw new Error('Ошибка создания задачи');
    return response.json();
}