import axios from 'axios';

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Track ongoing requests to prevent duplicates
const pendingRequests = new Map<string, Promise<any>>();

const clearAllCache = (): void => {
  cache.clear();
  pendingRequests.clear();
  console.log('All API cache cleared');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const isAuthEndpoint = config.url?.includes('/auth/login') || 
                        config.url?.includes('/auth/register') ||
                        config.url?.includes('/auth/refresh');
  
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Response interceptor – handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                          originalRequest?.url?.includes('/auth/register');
    
    // Only handle 401 for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear all auth data and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('coupleUser');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - clear and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('coupleUser');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);


const cachedGet = async <T = any>(
  url: string, 
  forceRefresh: boolean = false,
  ttl: number = CACHE_TTL
): Promise<T> => {
  const cacheKey = url;
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }
  }
  
  // Check for pending request to prevent duplicates
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }
  
  // Make the request
  const requestPromise = api.get<T>(url)
    .then(response => {
      // Cache the response
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      pendingRequests.delete(cacheKey);
      return response.data;
    })
    .catch(error => {
      pendingRequests.delete(cacheKey);
      throw error;
    });
  
  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

const batchGet = async <T = any>(urls: string[]): Promise<T[]> => {
  return Promise.all(urls.map(url => cachedGet<T>(url)));
};

const clearCache = (): void => {
  cache.clear();
  pendingRequests.clear();
};


const clearCacheFor = (url: string): void => {
  cache.delete(url);
  pendingRequests.delete(url);
};


const prefetch = async (url: string): Promise<void> => {
  try {
    await cachedGet(url);
  } catch (error) {
    // Silently fail for prefetch
    console.debug('Prefetch failed for:', url, error);
  }
};

export { 
  api,
  cachedGet,
  batchGet,
  clearCache,
  clearCacheFor,
  clearAllCache, 
  prefetch,
};