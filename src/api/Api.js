import axios from 'axios';

export const getResponse = async (currentHistory) => {
  const response = await fetchBackend(currentHistory);
  return response;
};

const fetchBackend = async (currentHistory) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  if (!API_BASE_URL) throw new Error("API URL not found");
  
  const response = await axios.post(API_BASE_URL, { history: currentHistory }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data?.response;
};