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
  const [user, setUser] = useState(null); // app user profile object
  const [loading, setLoading] = useState(true);



  // On mount: if token in localStorage, fetch profile from backend (if you use backend)
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    init();
  }, []);

  // 🔹 Update user fields (photo, name, etc)
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };
  // ---------- Email / Password via your backend (existing) ----------
  const login = async (email, password) => {
    // keep using your existing backend service
    const res = await loginService({ email, password }); // expects { email, password }


    // backend returns { token, user }
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const signup = async (name, email, password) => {
    // use your backend signup (keeps manual registration)
    const res = await signupService({ fullName: name, email, password });
    return res;
  };

  const logout = async () => {
    // clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // also sign out from Firebase if used
    try { await signOut(auth); } catch (err) { /* ignore */ }
  };

  // ---------- Firebase social login helpers ----------
  // We use signInWithPopup (dev-friendly). After successful Firebase sign-in we can:
  // - store the Firebase ID token in localStorage, and optionally send it to backend to create/find user in DB.
  const handleSocialSignIn = async (provider) => {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const idToken = await getIdToken(firebaseUser);

    // Store token for frontend usage
    localStorage.setItem("token", idToken);

    // Optionally: send idToken to backend to create / fetch user profile and persist in DB
    // Example endpoint: POST /api/auth/firebase-login { idToken }
    try {
      const resp = await fetch("http://localhost:5000/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (data?.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        // if backend not used, we can still set a minimal profile from Firebase
        const smallProfile = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName };
        localStorage.setItem("user", JSON.stringify(smallProfile));
        setUser(smallProfile);
        return smallProfile;
      }
    } catch (err) {
      // fallback: set minimal firebase profile
      const smallProfile = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName };
      localStorage.setItem("user", JSON.stringify(smallProfile));
      setUser(smallProfile);
      return smallProfile;
    }
  };

  const loginWithGoogle = () => handleSocialSignIn(googleProvider);
  const loginWithGitHub = () => handleSocialSignIn(githubProvider);

  // ---------- Reset password ----------
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    return true;
  };

  // Additional helper: sign in with Firebase email/password (optional)
  const firebaseEmailSignUp = async (email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);
    localStorage.setItem("token", idToken);
    const profile = { uid: res.user.uid, email: res.user.email, name: res.user.displayName };
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const firebaseEmailLogin = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(res.user);
    localStorage.setItem("token", idToken);
    const profile = { uid: res.user.uid, email: res.user.email, name: res.user.displayName };
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
