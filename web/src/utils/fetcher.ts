import axios from 'axios';

const fetcher = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

fetcher.interceptors.response.use(
  (data) => data.data,
  (err) => {
    if (
      err?.response?.status === 401
      && !window.location.pathname.startsWith('/login')
    ) {
      window.location.replace('/login');
    }

    return Promise.reject(err);
  },
);

export default fetcher;
