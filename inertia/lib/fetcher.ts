import axios from 'axios';

const request = axios.create({
  withCredentials: true,
});

const fetcher = (url: string) => request.get(url).then((res) => res.data);

export default fetcher;
