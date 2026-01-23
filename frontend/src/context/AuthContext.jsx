// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";
import {
  login as loginService,
  signup as signupService,
} from "../services/authService";
import { forgotPasswordLocal } from "../api/userApi";
import authHeader from "@/services/authHeader";
//import { a } from "framer-motion/dist/types.d-Cjd591yU";

const AuthContext = createContext();

/* ================= NORMALIZE USER ================= */
const normalizeUser = (user) => ({
  ...user,
  name: user.name || user.fullName || "",
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     🔥 RESTORE USER + PROFILE ON APP LOAD
     ===================================================== */
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        let baseUser = normalizeUser(JSON.parse(savedUser));

        try {
          const res = await fetch("http://localhost:5000/api/profile/me", {
            headers: {
              ...authHeader(),
            },
          });

          if (res.ok) {
            const profile = await res.json();

            baseUser = normalizeUser({
              ...baseUser,
              fullName: profile.fullName,
              name: profile.fullName,
              photoURL: profile.photo || baseUser.photoURL,
            });
          }
        } catch (err) {
          console.error("Profile restore failed:", err);
        }

        setUser(baseUser);
        localStorage.setItem("user", JSON.stringify(baseUser));
      }

      setLoading(false);
    };

    init();
  }, []);

  /* ================= UPDATE USER ================= */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = normalizeUser({ ...prev, ...updatedFields });
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  /* ================= EMAIL / PASSWORD LOGIN ================= */
  /* ================= EMAIL / PASSWORD LOGIN ================= */
  const login = async (email, password) => {
    try {
      // ✅ Use BACKEND login for local users
      const res = await loginService({ email, password });

      const normalized = normalizeUser({
        ...res.user,
        name: res.user.fullName,
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);

      return normalized;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    return await signupService({ fullName: name, email, password });
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    try {
      await signOut(auth);
    } catch { }
  };

  /* ================= SOCIAL LOGIN ================= */
  const handleSocialSignIn = async (provider) => {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken(true);
    // true = force refresh fresh token

    localStorage.setItem("token", idToken);

    try {
      const resp = await fetch(
        "http://localhost:5000/api/auth/firebase-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({}),
        }
      );

      const data = await resp.json();

      if (data?.success && data.user) {
        const normalized = normalizeUser({
          ...data.user,
          name: data.user.fullName,
        });

        localStorage.setItem("user", JSON.stringify(normalized));
        setUser(normalized);
        return normalized;
      }
    } catch {
      console.error("Firebase backend sync failed");
    }

    const fallbackUser = normalizeUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });

    localStorage.setItem("user", JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return fallbackUser;
  };

  const loginWithGoogle = () => handleSocialSignIn(googleProvider);
  const loginWithGitHub = () => handleSocialSignIn(githubProvider);

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async (email, provider = "local") => {
    if (provider === "local") {
      // 🔥 MongoDB reset
      return await forgotPasswordLocal(email);
    } else {
      // 🔥 Firebase reset
      await sendPasswordResetEmail(auth, email);
      return true;
    }
  };


  /* ================= FIREBASE EMAIL LOGIN ================= */
  const firebaseEmailSignUp = async (email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);

    const profile = normalizeUser({
      uid: res.user.uid,
      email: res.user.email,
      name: res.user.displayName,
    });

    localStorage.setItem("token", idToken);
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const firebaseEmailLogin = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);

    const profile = normalizeUser({
      uid: res.user.uid,
      email: res.user.email,
      name: res.user.displayName,
    });

    localStorage.setItem("token", idToken);
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        resetPassword,
        firebaseEmailSignUp,
        firebaseEmailLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
