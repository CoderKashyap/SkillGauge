import { QueryClient } from "@tanstack/react-query";

async function handleRequest(
  method: string,
  url: string,
  body?: any
): Promise<any> {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Request failed");
  }

  // Handle empty responses (204 No Content, DELETE requests)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }

  return response.json();
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: any
): Promise<T> {
  return handleRequest(method, url, data);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        // Build URL from queryKey - handle both simple strings and arrays with params
        const url = Array.isArray(queryKey) ? queryKey.join("/") : (queryKey as string);
        return handleRequest("GET", url);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});
