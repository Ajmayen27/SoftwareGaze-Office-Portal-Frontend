import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const signup = (username, password, email, designation, role) => {
    return axios.post(`${API_BASE_URL.replace(/\/$/, '')}/auth/signup`, {
        username,
        password,
        email,
        designation,
        role,
    });
};

const signin = (username, password) => {
    return axios.post(`${API_BASE_URL.replace(/\/$/, '')}/auth/signin`, {
        username,
        password,
    });
};

const authService = {
    signup,
    signin,
};

export default authService;

