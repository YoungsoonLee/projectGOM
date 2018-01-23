import axios from 'axios';

export const getNewsData = ({page}) => axios.get('/api/v1.0/news/getNewsData/'+page);
export const getNewsItem = (id) => axios.get('/api/v1.0/news/getNewsItem/'+id);
export const addNews = (sdata) => axios.post('/api/v1.0/news/addNews', sdata);
export const updateNews = (id, sdata) => axios.post('/api/v1.0/news/updateNews/'+id, sdata);
export const deleteNews = (id) => axios.post('/api/v1.0/news/deleteNews/'+id);