import { Buffer } from 'buffer';

export async function login(username: string, password: string): Promise<boolean> {
    const url = 'http://localhost:8080/api/auth/login';
    const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({username: username, password: password})
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', parseToken('sub'));
        localStorage.setItem('name', parseToken('name'));
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
};

export async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
};

export function parseToken(field: string): string {
    const token = localStorage.getItem('token');
    if (!token) {
        return '';
    }
    const [, payload] = token.split('.');
    const buff = Buffer.from(payload, 'base64');
    const obj = JSON.parse(buff.toString('utf-8'));
    return obj[field];
}

export function isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    // const exp = parseInt(parseToken('exp'));
    return true;
}