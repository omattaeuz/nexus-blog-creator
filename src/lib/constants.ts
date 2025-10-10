
// Authentication constants
export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Form validation constants
export const VALIDATION_CONSTANTS = {
  EMAIL_PATTERN: /\S+@\S+\.\S+/,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 10000,
} as const;

// UI constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 300, // 300ms
  LOADING_TIMEOUT: 10000, // 10 seconds
} as const;

// API constants
export const API_CONSTANTS = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POSTS: '/posts',
  CREATE_POST: '/posts/new',
  EDIT_POST: (id: string) => `/posts/${id}/edit`,
  POST_DETAIL: (id: string) => `/posts/${id}`,
  CONFIG: '/config',
  EMAIL_CONFIRMATION: '/email-confirmation',
  RESET_PASSWORD: '/reset-password',
  TEST_AUTH: '/test-auth',
  DEBUG_AUTH: '/debug-auth',
  NOT_FOUND: '*',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_POST: 'draft_post',
  LAST_VISITED: 'last_visited',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  UNAUTHORIZED: 'Não autorizado. Faça login para continuar.',
  FORBIDDEN: 'Acesso negado. Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Por favor, corrija os erros no formulário.',
  UNEXPECTED_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
  EMAIL_NOT_CONFIRMED: 'Email não confirmado. Verifique sua caixa de entrada.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  PASSWORD_TOO_WEAK: 'A senha deve ter pelo menos 6 caracteres.',
  PASSWORDS_DONT_MATCH: 'As senhas não coincidem.',
  EMAIL_ALREADY_EXISTS: 'Este email já está em uso.',
  INVALID_EMAIL: 'Por favor, digite um email válido.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  REGISTER_SUCCESS: 'Conta criada com sucesso!',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  POST_CREATED: 'Post criado com sucesso!',
  POST_UPDATED: 'Post atualizado com sucesso!',
  POST_DELETED: 'Post deletado com sucesso!',
  PASSWORD_RESET_SENT: 'Email de reset enviado com sucesso!',
  PASSWORD_UPDATED: 'Senha atualizada com sucesso!',
  EMAIL_CONFIRMED: 'Email confirmado com sucesso!',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  LOGGING_IN: 'Fazendo login...',
  REGISTERING: 'Criando conta...',
  LOADING_POSTS: 'Carregando posts...',
  CREATING_POST: 'Criando post...',
  UPDATING_POST: 'Atualizando post...',
  DELETING_POST: 'Deletando post...',
  SENDING_EMAIL: 'Enviando email...',
  UPDATING_PASSWORD: 'Atualizando senha...',
  PROCESSING: 'Processando...',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.DEV,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
} as const;

// Dashboard tabs
export const DASHBOARD_TABS = {
  OVERVIEW: 'overview',
  ANALYTICS: 'analytics',
  COMMENTS: 'comments',
  TEMPLATES: 'templates',
  SEARCH: 'search',
  NOTIFICATIONS: 'notifications',
  BACKUP: 'backup',
  SETTINGS: 'settings',
} as const;

// Comment modes
export const COMMENT_MODES = {
  STANDALONE: 'standalone',
  CONTROLLED: 'controlled',
} as const;

// Form types
export const FORM_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  POST: 'post',
  COMMENT: 'comment',
} as const;

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;