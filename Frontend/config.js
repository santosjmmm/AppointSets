const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost/appointsets/Backend" 
  : "https://appointsets-production.up.railway.app";

export default API_BASE_URL;
