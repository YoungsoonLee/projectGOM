import axios from 'axios';

export const getNewsData = ({page}) => axios.get('/api/v1.0/news/getNewsData/'+page);
export const getNewsItem = (id) => axios.get('/api/v1.0/news/getNewsItem/'+id);