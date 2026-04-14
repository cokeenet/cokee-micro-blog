export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5253';

/**
 * Standardized fetch wrapper that automatically injects the JWT token
 * and handles base URL resolution.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(typeof options.body === 'object' && options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-unauthorized'));
    }

    return response;
}
