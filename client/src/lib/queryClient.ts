import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { logger, LoggingUtils } from '../utils/logger';
import { createCacheKey } from "@/utils/performance";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// FIXED: Robust API request function with proper error handling
export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: any
): Promise<any> {
  logger.info('[API] ${method} ${url}', data);
  
  const requestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: "include",
  };
  
  // Add body for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
    requestOptions.body = JSON.stringify(data);
    logger.info('[API] Request body:', requestOptions.body);
  }
  
  try {
    // Fix API URL to use direct backend connection
    const apiUrl = url.startsWith('/api') ? `http://localhost:3000${url}` : url;
    apiLogger.info('Requesting: ${apiUrl}', { context: 'API' });
    apiLogger.info('Original URL: ${url}', { context: 'API' });
    const response = await fetch(apiUrl, requestOptions);
    apiLogger.info('Response ${response.status} for ${apiUrl}', { context: 'API' });

    if (!response.ok) {
      const errorText = await response.text();
      apiLogger.error('Error ${response.status}: ${errorText}', { context: 'API' });
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      logger.info('[API] Success:', result);
      return result;
    }
    
    apiLogger.info('Non-JSON response for ${url}', { context: 'API' });
    return {};
  } catch (error) {
    logger.error('[API] Fetch error for ${method} ${url}:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use custom queryFn for better error handling
      queryFn: async ({ queryKey }) => {
        let url = queryKey[0] as string;
        const params = queryKey[1] as Record<string, any> || {};
        
        // Skip invalid URLs
        if (!url || url === '/' || url === '') {
          console.warn(`[QUERY CLIENT] Skipping invalid URL: "${url}"`);
          return null;
        }
        
        // Build query string from parameters
        if (Object.keys(params).length > 0) {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          url += `?${searchParams.toString()}`;
        }
        
        // Fix API URL to use direct backend connection
        const apiUrl = url.startsWith('/api') ? `http://localhost:3000${url}` : url;
        logger.info('Fetching: ${apiUrl}', { context: 'QUERY CLIENT' });
        logger.info('Original URL: ${url}', { context: 'QUERY CLIENT' });
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: "include",
        });

        logger.info('Response status: ${response.status} for ${url}', { context: 'QUERY CLIENT' });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('Error: ${response.status} - ${errorText}', { context: 'QUERY CLIENT' });
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          logger.error('[QUERY CLIENT] Non-JSON response for ${url}:', textResponse.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
        }

        const data = await response.json();
        logger.info('Success: ${typeof data} data for ${url}', { context: 'QUERY CLIENT' });
        return data;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error) => {
        logger.info('[QUERY CLIENT] Retry ${failureCount} for error:', error);
        if (failureCount >= 2) {
          return false; // Reduced retries
        }
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('Expected JSON'))) {
          return false; // Don't retry 404 or JSON parsing errors
        }
        return true;
      },
      retryDelay: (attemptIndex) => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
        logger.info('Retry delay: ${delay}ms', { context: 'QUERY CLIENT' });
        return delay;
      },
    },
    mutations: {
      retry: 2,
    },
  },
});
