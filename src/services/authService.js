import axios from 'axios';


// IMPORTANT: Ensure your backend is running on port 8081
const API_URL = `${process.env.REACT_APP_API_URL}/auth/`;

const signup = (username, password, email, designation, role) => {
    return axios.post(API_URL + 'signup', {
        username,
        password,
        email,
        designation,
        role,
    });
};

const signin = (username, password) => {
    return axios.post(API_URL + 'signin', {
        username,
        password,
    });
};

const authService = {
    signup,
    signin,
};

export default authService;

