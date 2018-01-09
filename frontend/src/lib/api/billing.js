import axios from 'axios';

export const getChargeItems = () => axios.get('/api/v1.0/billing/getChargeItems');
export const getPaymentToken = ({user_id, item_id}) => axios.post('/api/v1.0/billing/getPaymentToken', {user_id, item_id});