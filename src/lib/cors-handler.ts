// CORS Handler for API requests
// This module provides utilities to handle CORS issues with n8n webhooks

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface CorsConfig {
  origin: string;
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nexta-boarding.vercel.app',
  'https://nexus-blog-creator.vercel.app',
];

// Function to get the appropriate origin for CORS
function getCorsOrigin(requestOrigin?: string): string {
  if (!requestOrigin) return '*';
  
  // Check if the request origin is in our allowed list
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // For development, allow localhost with any port
  if (requestOrigin.startsWith('http://localhost:')) {
    return requestOrigin;
  }
  
  // Default to wildcard for other cases
  return '*';
}

export const DEFAULT_CORS_CONFIG: CorsConfig = {
  origin: '*', // Will be dynamically set based on request
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  headers: [
    'Content-Type',
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  credentials: false,
  maxAge: 86400, // 24 hours
};

/**
 * Adds CORS headers to a request configuration
 */
export function addCorsHeaders(config: InternalAxiosRequestConfig, corsConfig: CorsConfig = DEFAULT_CORS_CONFIG, requestOrigin?: string): InternalAxiosRequestConfig {
  const origin = getCorsOrigin(requestOrigin);
  
  // Add CORS headers to the existing headers
  config.headers.set('Access-Control-Allow-Origin', origin);
  config.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  config.headers.set('Access-Control-Allow-Headers', corsConfig.headers.join(', '));
  config.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());

  if (corsConfig.credentials) {
    config.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return config;
}

/**
 * Adds CORS headers to a response
 */
export function addCorsHeadersToResponse(response: AxiosResponse, corsConfig: CorsConfig = DEFAULT_CORS_CONFIG, requestOrigin?: string): AxiosResponse {
  const origin = getCorsOrigin(requestOrigin);
  
  const headers = {
    ...response.headers,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': corsConfig.methods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.headers.join(', '),
    'Access-Control-Max-Age': corsConfig.maxAge.toString(),
  };

  if (corsConfig.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return {
    ...response,
    headers,
  };
}

/**
 * Creates a mock OPTIONS response for preflight requests
 */
export function createPreflightResponse(config: InternalAxiosRequestConfig, corsConfig: CorsConfig = DEFAULT_CORS_CONFIG, requestOrigin?: string): AxiosResponse {
  const origin = getCorsOrigin(requestOrigin);
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': corsConfig.methods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.headers.join(', '),
    'Access-Control-Max-Age': corsConfig.maxAge.toString(),
  };

  if (corsConfig.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return {
    data: '',
    status: 204,
    statusText: 'No Content',
    headers,
    config,
    request: {},
  };
}

/**
 * Checks if a request is a preflight OPTIONS request
 */
export function isPreflightRequest(config: InternalAxiosRequestConfig): boolean {
  return config.method?.toLowerCase() === 'options';
}

/**
 * Intercepts and handles preflight requests
 */
export function handlePreflightRequest(config: InternalAxiosRequestConfig, corsConfig: CorsConfig = DEFAULT_CORS_CONFIG, requestOrigin?: string): AxiosResponse | null {
  if (isPreflightRequest(config)) {
    return createPreflightResponse(config, corsConfig, requestOrigin);
  }
  return null;
}

/**
 * Creates an axios interceptor that handles CORS
 */
export function createCorsInterceptor(corsConfig: CorsConfig = DEFAULT_CORS_CONFIG) {
  return {
    request: (config: InternalAxiosRequestConfig) => {
      // Get the request origin from the browser
      const requestOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
      
      // Handle preflight requests
      const preflightResponse = handlePreflightRequest(config, corsConfig, requestOrigin);
      if (preflightResponse) {
        // Return a promise that resolves to the preflight response
        return Promise.resolve(preflightResponse);
      }

      // Add CORS headers to regular requests
      return addCorsHeaders(config, corsConfig, requestOrigin);
    },
    response: (response: AxiosResponse) => {
      // Get the request origin from the browser
      const requestOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
      
      // Add CORS headers to responses
      return addCorsHeadersToResponse(response, corsConfig, requestOrigin);
    },
    error: (error: any) => {
      // Get the request origin from the browser
      const requestOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
      
      // Add CORS headers to error responses
      if (error.response) {
        error.response = addCorsHeadersToResponse(error.response, corsConfig, requestOrigin);
      }
      return Promise.reject(error);
    },
  };
}