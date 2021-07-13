import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIES, REFRESH_TOKEN_COOKIES } from "../common/const/cookies.const";
import { ACCESS_TOKEN_ENPOINT } from "../common/const/end-point.const";

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
};


const getAccessToken = async () => {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIES);
    if (refreshToken) {
        const response = await axios.post(ACCESS_TOKEN_ENPOINT, {
            refreshToken,
        }).then(res => res.data)
        const accessToken = response.accessToken;
        // console.log("Access Token " + accessToken);
        Cookies.set(ACCESS_TOKEN_COOKIES, accessToken);
        return accessToken;
    }
}

const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1",
    headers,
});


client.interceptors.request.use(
    async (config: any) => {
        let token = Cookies.get(ACCESS_TOKEN_COOKIES);
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