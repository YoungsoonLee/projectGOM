import axios from 'axios';

export const checkAdminLoginStatus = () => axios.get('/api/v1.0/admin/checkAdmin');

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
