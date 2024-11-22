export async function login(username: string, password: string): Promise<string> {
    const url = 'http://localhost:8080/api/auth/login';
    const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({username: username, password: password})
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        return Promise.reject(error);
    }
};

export async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
};