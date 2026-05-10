// import { QueryClient, QueryFunction } from "@tanstack/react-query";

// export async function apiRequest(
//   method: string,
//   url: string,
//   data?: unknown,
// ): Promise<Response> {
//   const res = await fetch(url, {
//     method,
//     headers: data ? { "Content-Type": "application/json" } : undefined,
//     body: data ? JSON.stringify(data) : undefined,
//   });

//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     throw new Error(errorData.error || errorData.message || `API request failed: ${res.status}`);
//   }

//   return res;
// }

// type UnauthorizedBehavior = "returnNull" | "throw";
// export const getQueryFn: <T>(options: {
//   on401: UnauthorizedBehavior;
// }) => QueryFunction<T> =
//   ({ on401 }) =>
//   async ({ queryKey }) => {
//     const url = queryKey[0] as string;
//     const res = await fetch(url);
//     if (!res.ok) {
//       if (res.status === 401 && on401 === "returnNull") {
//         return null as T;
//       }
//       throw new Error(`Failed to fetch ${url}`);
//     }
//     return res.json();
//   };

// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryFn: getQueryFn({ on401: "throw" }),
//       refetchInterval: false,
//       refetchOnWindowFocus: false,
//       staleTime: Infinity,
//       retry: false, // Prevents endless loading spinners on 401 Unauthorized
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 1. Point to the remote backend in production, or fallback to local in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    // 2. CRITICAL FOR SEPARATE SERVERS: Tells the browser to send the session cookie!
    credentials: "include", 
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API request failed: ${res.status}`);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // We also must update React Query's default GET fetcher
    const res = await fetch(`${API_BASE_URL}${url}`, {
      credentials: "include", // <-- Don't forget this here too!
    });
    
    if (!res.ok) {
      if (res.status === 401 && on401 === "returnNull") {
        return null as T;
      }
      throw new Error(`Failed to fetch ${url}`);
    }
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false, // Prevents endless loading spinners on 401 Unauthorized
    },
    mutations: {
      retry: false,
    },
  },
});