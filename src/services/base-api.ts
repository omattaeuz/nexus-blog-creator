import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { N8N_CONFIG } from '@/config/n8n';
import { logApi, logError } from '@/lib/logger';
import { ErrorHandler } from '@/lib/error-handler';

export abstract class BaseApiService {
  protected client: AxiosInstance;
  protected supabaseClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: N8N_CONFIG.WEBHOOK_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.supabaseClient = axios.create({
      baseURL: N8N_CONFIG.SUPABASE.URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': N8N_CONFIG.SUPABASE.ANON_KEY,
        'Authorization': `Bearer ${N8N_CONFIG.SUPABASE.ANON_KEY}`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logApi('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL
        });
        return config;
      },
      (error) => {
        logError('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logApi('API Response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logError('Response interceptor error', error);
        return Promise.reject(error);
      }
    );
  }

  protected async get<T>(url: string, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.client.get<T>(url, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'GET', { url });
    }
  }

  protected async post<T>(url: string, data: any, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.client.post<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'POST', { url, data });
    }
  }

  protected async put<T>(url: string, data: any, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.client.put<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'PUT', { url, data });
    }
  }

  protected async delete<T>(url: string, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.client.delete<T>(url, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'DELETE', { url });
    }
  }

  protected async supabaseGet<T>(url: string, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.supabaseClient.get<T>(url, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAuthError(error, 'SUPABASE_GET');
    }
  }

  protected async supabasePost<T>(url: string, data: any, token?: string): Promise<T> {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.supabaseClient.post<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAuthError(error, 'SUPABASE_POST');
    }
  }
}