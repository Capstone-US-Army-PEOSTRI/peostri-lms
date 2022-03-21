import { LoginInformation } from 'src/util/types'
import { AuthProvider } from 'react-admin';

const authProvider: AuthProvider = {
    login: ({ username, password }) => {
        const request = new Request(`${process.env.REACT_APP_API_URL}/auth`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'include'
        });
        return fetch(request)
        .then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
    },
    logout: () => {
        const request = new Request(`${process.env.REACT_APP_API_URL}/auth/logout`, {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'include'
        });
        return fetch(request)
        .then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return;
        })
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
    checkAuth: () => {
        const request = new Request(`${process.env.REACT_APP_API_URL}/auth`, {
            method: 'GET',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'include'
        });
        return fetch(request)
        .then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return;
        })
    },
    getPermissions: () => Promise.reject('Unknown method'),
    getIdentity: () => {
        const request = new Request(`${process.env.REACT_APP_API_URL}/auth`, {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'include'
        });
        return fetch(request)
        .then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            return Promise.resolve({
                id: data.id,
                fullName: data.firstName + " " + data.lastName,
                avatar: data.avatar
            });
        })
    }
};

export default authProvider;