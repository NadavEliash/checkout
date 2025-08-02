// HTTP Interceptor for automatic token refresh and error handling
import apiService from '../services/api';

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

class HttpInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  async interceptRequest(
    url: string, 
    config: RequestConfig = {}
  ): Promise<Response> {
    // Skip auth for certain requests
    if (config.skipAuth) {
      return fetch(url, config);
    }

    const token = apiService.getToken();
    
    // Add auth header if token exists
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    // Handle 401 unauthorized - token might be expired
    if (response.status === 401 && !config.skipRetry && token) {
      if (this.isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry original request with new token
          const newToken = apiService.getToken();
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
          }
          return fetch(url, { ...config, skipRetry: true });
        });
      }

      this.isRefreshing = true;

      try {
        // Try to refresh token
        await apiService.refreshToken();
        this.processQueue(null, apiService.getToken());
        
        // Retry original request with new token
        const newToken = apiService.getToken();
        if (newToken) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
        }
        
        return fetch(url, { ...config, skipRetry: true });
      } catch (error) {
        this.processQueue(error, null);
        
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    return response;
  }
}

// Create singleton instance
const httpInterceptor = new HttpInterceptor();

// Export the interceptor for direct use instead of overriding global fetch
export const interceptedFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const config = init || {};
  
  // Always use original fetch for better DevTools compatibility
  return httpInterceptor.interceptRequest(url, config);
};

export default httpInterceptor;