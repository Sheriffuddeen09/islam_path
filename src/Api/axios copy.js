import axios from 'axios';

// ----------------------- GET COOKIE FUNCTION -----------------------
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

// ----------------------- AXIOS INSTANCE ----------------------------
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    accept: 'application/json',
    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
  },
  withCredentials: true,
});

export default api;
