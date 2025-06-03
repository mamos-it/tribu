import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = 'http://localhost:5000';
  console.log(`Making ${method} request to ${url}`, data); // Log della richiesta

  const res = await fetch(`${baseUrl}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`Response status: ${res.status}`); // Log della risposta
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${errorText}`); // Log degli errori
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
    const baseUrl = 'http://localhost:5000';
    const res = await fetch(`${baseUrl}${queryKey[0]}`, {
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
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Aumentiamo lo staleTime
      cacheTime: 1000 * 60 * 30, // Cache per 30 minuti
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
