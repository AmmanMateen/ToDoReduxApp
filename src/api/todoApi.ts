import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export interface ApiTodo {
  userId: number;
  id: string | number;
  title: string;
  completed: boolean;
}

class TodoApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('📤 Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('✅ Response:', response.status, response.statusText);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Response error:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  async fetchTodos(): Promise<ApiTodo[]> {
    try {
      const response = await this.axiosInstance.get<ApiTodo[]>('/todos?_limit=10');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      throw error;
    }
  }

  async createTodo(title: string, completed: boolean = false): Promise<ApiTodo> {
    try {
      const response = await this.axiosInstance.post<ApiTodo>('/todos', {
        title,
        completed,
        userId: 1,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  }

  async updateTodo(id: string | number, title: string, completed: boolean): Promise<ApiTodo> {
    try {
      const response = await this.axiosInstance.put<ApiTodo>(`/todos/${id}`, {
        title,
        completed,
        userId: 1,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  }

  async deleteTodo(id: string | number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/todos/${id}`);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  }
}

export const todoApiClient = new TodoApiClient();
