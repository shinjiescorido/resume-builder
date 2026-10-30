'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccess(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken: string };
      accessToken = data.accessToken;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  raw?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : `Request failed with status ${status}`);
  }
}

export async function api<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers, raw, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body instanceof FormData ? {} : { 'content-type': 'application/json' }),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(headers ?? {}),
    },
    body:
      body == null
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  };

  let res = await fetch(`${API_URL}${path}`, init);

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const fresh = await refreshAccess();
    if (fresh) {
      const retryInit: RequestInit = {
        ...init,
        headers: { ...(init.headers as Record<string, string>), authorization: `Bearer ${fresh}` },
      };
      res = await fetch(`${API_URL}${path}`, retryInit);
    }
  }

  if (raw) return res as unknown as T;

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, payload ?? text);
  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiUrl = API_URL;
