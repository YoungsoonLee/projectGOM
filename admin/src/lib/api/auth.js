import axios from 'axios';

export const checkLoginStatus = () => axios.get('/api/v1.0/auth/check');
export const checkEmail = (email) => axios.get('/api/v1.0/auth/exists/email/' + email);
export const checkDisplayName = (displayName) => axios.get('/api/v1.0/auth/exists/displayName/' + displayName);
/*
export const localRegister = ({
  displayName,
  email,
  password
}) => axios.post('/api/v1.0/auth/register/local', {
  displayName,
  email,
  password
});


export const localLogin = ({email, password}) => axios.post('/api/v1.0/auth/login/local', {
  email, password
});
*/

export const adminRegister = ({
  displayName,
  email,
  password
}) => axios.post('/api/v1.0/admin/register/admin', {
  displayName,
  email,
  password
});

export const adminLogin = ({email, password}) => axios.post('/api/v1.0/admin/login/admin', {
  email, password
});


export const logout = () => axios.post('/api/v1.0/auth/logout');
