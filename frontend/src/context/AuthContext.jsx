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
import { login as loginService, signup as signupService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     🔥 RESTORE USER + PROFILE (PHOTO, NAME) ON APP LOAD
     ===================================================== */
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        const baseUser = JSON.parse(savedUser);

        try {
          // 🔹 Fetch profile from backend
          const res = await fetch("http://localhost:5000/api/profile/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const profile = await res.json();

            baseUser.photoURL = profile.photo || "";
            baseUser.name = profile.name || baseUser.name;
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

  /* ================= UPDATE USER (PHOTO / NAME) ================= */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  /* ================= EMAIL / PASSWORD LOGIN ================= */
  const login = async (email, password) => {
    const res = await loginService({ email, password });

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);

    return res.user;
  };

  const signup = async (name, email, password) => {
    const res = await signupService({ fullName: name, email, password });
    return res;
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    try {
      await signOut(auth);
    } catch (err) { }
  };

  /* ================= SOCIAL LOGIN ================= */
  const handleSocialSignIn = async (provider) => {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const idToken = await getIdToken(firebaseUser);

    localStorage.setItem("token", idToken);

    try {
      const resp = await fetch("http://localhost:5000/api/auth/firebase-login", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await resp.json();

      if (data?.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error("Firebase backend sync failed");
    }

    const fallbackUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };

    localStorage.setItem("user", JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return fallbackUser;
  };

  const loginWithGoogle = () => handleSocialSignIn(googleProvider);
  const loginWithGitHub = () => handleSocialSignIn(githubProvider);

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    return true;
  };

  /* ================= FIREBASE EMAIL LOGIN ================= */
  const firebaseEmailSignUp = async (email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);

    const profile = {
      uid: res.user.uid,
      email: res.user.email,
      name: res.user.displayName,
    };

    localStorage.setItem("token", idToken);
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  };

  const firebaseEmailLogin = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);

    const profile = {
      uid: res.user.uid,
      email: res.user.email,
      name: res.user.displayName,
    };

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
