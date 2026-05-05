import axios from "axios";
import { toast } from "react-hot-toast"; // or your toast lib



// const API_URL = process.env.REACT_APP_API_URL;

// console.log("API URL:", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true,
});

// Interceptor to attach the latest token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      toast.error("You are offline, please check your network");
    } else {
      toast.error(error.response.data?.message || "Something went wrong");
    }
    return Promise.reject(error);
  }
);


export default api;


export const getLiveRequests = () => {
  return api.get("/api/live-class/requests");
};

export const respondToRequest = (id, action) => {
  return api.post(`/api/live-class/respond/${id}`, { action });
};

export const studentRespondToRequest = (id, action) => {
  return api.post(`/api/student-friend/respond/${id}`, { action });
};