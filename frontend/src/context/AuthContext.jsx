import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // keep user logged in even after refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const currentUser = {
          id: fbUser.uid,
          email: fbUser.email,
          fullName: fbUser.displayName || "",
          photoURL: fbUser.photoURL || "",
        };
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));

        const token = await fbUser.getIdToken();
        localStorage.setItem("token", token);
      } else {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // email/password login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // signup
  const signup = async (fullName, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: fullName });
    return cred.user;
  };

  // forgot password
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // logout
  const logout = () => signOut(auth);

  // Google + GitHub popup login
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const loginWithGitHub = () => signInWithPopup(auth, githubProvider);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, resetPassword, logout, loginWithGoogle, loginWithGitHub }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
