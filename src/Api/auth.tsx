import { Buffer } from 'buffer';

const API_URL = 'http://localhost:8080/api/auth';

async function login(username: string, password: string): Promise<boolean> {
    const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ username, password })
    };

    try {
        const response = await fetch(`${API_URL}/login`, options);
        if (response.status === 401) throw new Error('401');
        const { access_token } = await response.json();
        localStorage.setItem('token', access_token);
        localStorage.setItem('userId', parseToken('sub'));
        localStorage.setItem('name', parseToken('name') || parseToken('preferred_username'));
        localStorage.setItem('roles', JSON.stringify(getRoles()));
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function logout() {
    ['token', 'userId', 'name', 'roles'].forEach(item => localStorage.removeItem(item));
}

async function register(username: string, password: string, email: string): Promise<boolean> {
    const options = {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            credentials: [{ temporary: false, type: 'password', value: password }],
            username, email, emailVerified: true, enabled: true, realmRoles: ['user']
        })
    };

    try {
        await fetch(`${API_URL}/register`, options);
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

function parseToken(field: string): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const [, payload] = token.split('.');
    const { [field]: value } = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return value;
}

function isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const exp = parseInt(parseToken('exp'));
    if (exp < Math.floor(Date.now() / 1000)) {
        logout();
        return false;
    }
    return true;
}

function getRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const [, payload] = token.split('.');
    const { realm_access: { roles } } = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return roles;
}

export { login, logout, register, parseToken, isTokenValid };