import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL;

// console.log("API URL:", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
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

export default api;


export const getLiveRequests = () => {
  return api.get("/api/live-class/requests");
};

export const respondToRequest = (id, action) => {
  return api.post(`/api/live-class/respond/${id}`, { action });
};