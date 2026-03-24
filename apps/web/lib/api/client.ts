import { ApiError, ApiErrorBody } from "@/lib/api/types";

type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: unknown;
  token?: string | null;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function parseErrorBody(response: Response): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  { body, token, method = "GET", headers, ...init }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    const message =
      (Array.isArray(errorBody?.message)
        ? errorBody?.message.join(", ")
        : errorBody?.message) ??
      errorBody?.error ??
      "Request failed";
    throw new ApiError(message, response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
