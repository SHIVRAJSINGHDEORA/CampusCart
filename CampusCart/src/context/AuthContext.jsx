import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

// Create the context
const AuthContext = createContext(null);

// Provider wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // logged-in user object
  const [loading, setLoading] = useState(true); // waiting for /auth/me

  // On app start, check if cookie still has a valid token
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const signup = async (username, email, password, phone) => {
    const res = await api.post("/auth/signup", {
      username,
      email,
      password,
      phone,
    });
    setUser(res.data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  // Admin check — only admin@gmail.com is admin
  const isAdmin = user?.email === "admin@gmail.com";

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
