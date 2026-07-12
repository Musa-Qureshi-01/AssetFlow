export type AuthUser = {
    id: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    twoFactorEnabled?: boolean;
    name?: string;
};

export type AuthResponse = {
    message: string;
    accessToken?: string;
    user?: AuthUser;
    resetUrl?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") || "";

    const payload = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

    if (!response.ok) {
        throw new Error(payload?.message || "Request failed");
    }

    return payload as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        headers: {
            "content-type": "application/json",
            ...(init?.headers || {}),
        },
        credentials: "include",
    });

    return parseResponse<T>(response);
}

export async function registerUser(input: {
    name: string;
    email: string;
    password: string;
}) {
    return request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function loginUser(input: {
    email: string;
    password: string;
    twoFactorCode?: string;
}) {
    return request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function getCurrentUser(accessToken: string) {
    return request<{ user: AuthUser }>("/user/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function refreshAccessToken() {
    return request<AuthResponse>("/auth/refresh", {
        method: "POST",
    });
}

export async function logoutUser() {
    return request<{ message: string }>("/auth/logout", {
        method: "POST",
    });
}