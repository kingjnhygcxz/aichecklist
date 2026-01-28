import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { safeRedirect } from "./security";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // Special handling for rate limit errors - don't throw to preserve cache
    if (res.status === 429) {
      console.warn('Rate limited - slowing down requests');
      throw new Error(`429: Too many requests. Please slow down and try again.`);
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | null | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data);
  
  // If DELETE method, don't send a body even if data is an empty object
  const shouldSendBody = method !== "DELETE" && data !== null && data !== undefined;
  
  // Get session token from localStorage
  const sessionId = localStorage.getItem('sessionId');
  
  const headers: Record<string, string> = {};
  if (shouldSendBody) {
    headers["Content-Type"] = "application/json";
  }
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: shouldSendBody ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    console.error(`API Error: ${method} ${url}`, res.status, res.statusText);
    
    // If we get a 401 error, the user is likely not authenticated
    // Redirect to login page
    if (res.status === 401) {
      localStorage.removeItem('sessionId');
      safeRedirect('/auth');
      return res;
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get session token from localStorage
    const sessionId = localStorage.getItem('sessionId');
    
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers["Authorization"] = `Bearer ${sessionId}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      } else {
        // Remove invalid session token and redirect to login
        localStorage.removeItem('sessionId');
        safeRedirect('/auth');
        throw new Error('Authentication required');
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
