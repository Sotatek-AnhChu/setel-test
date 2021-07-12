import axios from "axios";
import { ACCESS_TOKEN_LOCAL, REFRESH_TOKEN_LOCAL } from "../common/const/local-storage.const";

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
};


const getAccessToken = async () => {
    const rawRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_LOCAL);
    const refreshToken = rawRefreshToken ? JSON.parse(rawRefreshToken) : null;
    if (refreshToken) {
        const response = await axios.post("http://localhost:3025/auth/access-token", {
            refreshToken,
        }).then(res => res.data)
        const accessToken = response.accessToken;
        // console.log("Access Token " + accessToken);
        localStorage.setItem(ACCESS_TOKEN_LOCAL, JSON.stringify(accessToken));
        return accessToken;
    }
}

const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1",
    headers,
});


client.interceptors.request.use(
    async (config: any) => {
        let token = localStorage.getItem(ACCESS_TOKEN_LOCAL);
        if (token) {
            if (token[0] === '"') {
                token = token?.substring(1, token.length - 1);
            }
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        // console.log("debug " + JSON.stringify(config.headers, null, 2));
        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


client.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const access_token = await getAccessToken();
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        return client(originalRequest);
    }
    return Promise.reject(error);
});

export default client;