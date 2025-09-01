import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // backend URL

// Signup
export const signup = async (data) => {
  const res = await axios.post(`${API_URL}/signup`, data);
  return res.data;
};

// Login
export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
