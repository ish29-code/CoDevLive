// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, signup as signupService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // if redirected back with token, save it
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    localStorage.setItem("token", token);

    // fetch user profile right away
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          localStorage.setItem("user", JSON.stringify(data));
          setUser(data);
        }
      })
      .catch((err) => console.error("Failed to fetch user:", err));

    window.history.replaceState({}, document.title, "/"); // clean URL
  }
}, []);


  // Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  

  const login = async (email, password) => {
    const res = await loginService({ email, password });
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const signup = async (name, email, password) => {
    const res = await signupService({ name, email, password });
    // after signup, we don't auto login
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
