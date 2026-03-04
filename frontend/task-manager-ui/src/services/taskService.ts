import axios from 'axios';
import { authService } from './authService';

// Use environment variable for API base URL
// In Vite, env variables must be prefixed with VITE_ to be accessible in client code
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  overdue: number;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

class TaskService {
  private getAuthHeader(): Record<string, string> | undefined {
    const header = authService.getAuthHeader();
    return header ? header : undefined;
  }

  async getTasks(status?: TaskStatus, priority?: TaskPriority): Promise<Task[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    params.append('size', '100');
    
    const response = await axios.get(`${API_BASE_URL}/tasks?${params.toString()}`, {
      headers: this.getAuthHeader()
    });
    return response.data.content || [];
  }

  async getAllTasks(): Promise<Task[]> {
    const response = await axios.get(`${API_BASE_URL}/tasks?size=1000`, {
      headers: this.getAuthHeader()
    });
    return response.data.content || [];
  }

  async getTaskStats(): Promise<TaskStats> {
    const tasks = await this.getAllTasks();
    const now = new Date();
    
    const stats: TaskStats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      highPriority: tasks.filter(t => t.priority === 'HIGH').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < now;
      }).length
    };
    
    return stats;
  }

  async createTask(task: TaskRequest): Promise<Task> {
    const response = await axios.post(`${API_BASE_URL}/tasks`, task, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateTask(taskId: number, task: TaskRequest): Promise<Task> {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, task, {
      headers: this.getAuthHeader()
    });
    return response.data;
  }

  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
    const response = await axios.patch(
      `${API_BASE_URL}/tasks/${taskId}/status?status=${status}`,
      {},
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteTask(taskId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: this.getAuthHeader()
    });
  }
}

export const taskService = new TaskService();
