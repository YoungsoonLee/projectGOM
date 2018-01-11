import axios from 'axios';

export const emailConfirm = (confirm_token) => axios.post('/api/v1.0/user/emailConfirm/'+confirm_token);
export const resendEmailConfirm = (email) => axios.post('/api/v1.0/user/resendEmailConfirm/'+email);
export const forgotPassword = (email) => axios.post('/api/v1.0/user/forgotPassword/'+email);
export const isValidResetPasswordToken = (reset_token) => axios.post('/api/v1.0/user/isValidResetPasswordToken/'+reset_token);
export const resetPassword = (reset_token, password) => axios.post('/api/v1.0/user/resetPassword',{
    reset_token,
    password
  });
export const getProfile = (id) => axios.post('/api/v1.0/user/getProfile/'+id);
export const updateProfile = (id, password) => axios.post('/api/v1.0/user/updateProfile',{
  id,
  password
});
