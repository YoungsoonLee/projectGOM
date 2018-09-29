import axios from 'axios';

//export const checkLoginStatus = () => axios.get('/api/v1.0/auth/check');
export const checkEmail = (email) => axios.get('/api/v1.0/auth/exists/email/' + email);

//export const checkDisplayName = (displayName) => axios.get('/api/v1.0/auth/exists/displayName/' + displayName);
//export const localRegister = ({displayName,email,password}) => axios.post('/api/v1.0/auth/register/local', {displayName,email,password});
//export const localLogin = ({email, password}) => axios.post('/api/v1.0/auth/login/local', {email, password});
//export const socialLogin = ({provider, accessToken}) => axios.post('/api/v1.0/auth/login/' + provider, {accessToken});
//export const socialRegister = ({displayName,provider,accessToken}) => axios.post('/api/v1.0/auth/register/' + provider, {displayName,accessToken});

export const logout = () => axios.post('/api/v1.0/auth/logout');

// new for RESTfulapi_go
export const checkDisplayName = (displayname) => axios.get('/v1/auth/checkDisplayName/' + displayname);
export const localRegister = ({displayname,email,password}) => axios.post('/v1/auth/register', {displayname,email,password});
export const localLogin = ({displayname, password}) => axios.post('/v1/auth/login', {displayname, password});
export const checkLoginStatus = (token) => axios.get('/v1/auth/checkLogin', {headers: {Authorization: token}});
export const socialAuth = ({provider, accessToken}) => axios.post('/v1/auth/social', {provider, accessToken});

export const socialRegister = ({displayname,provider,accessToken}) => axios.post('/api/v1.0/auth/register/' + provider, {displayname,accessToken});