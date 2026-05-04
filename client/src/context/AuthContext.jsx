import React, { useContext, useEffect, useState } from "react";

const AuthContext = React.createContext();

export const AuthProvider = (props) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("EventUser") || sessionStorage.getItem("EventUser");
      return stored ? JSON.parse(stored) : "";
    } catch (e) {
      console.warn("Could not read user from storage", e);
      return "";
    }
  });
  const [isLogin, setIsLogin] = useState(!!user);
  const [isAdmin, setIsAdmin] = useState(user?.role === "Admin");

  useEffect(() => {
    setIsLogin(!!user);
    setIsAdmin(user?.role === "Admin");
  }, [user]);

  // Persist user across browser restarts until explicit logout
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("EventUser", JSON.stringify(user));
        sessionStorage.removeItem("EventUser");
      } catch (e) {
        console.warn("Could not persist user to localStorage", e);
      }
    } else {
      localStorage.removeItem("EventUser");
      sessionStorage.removeItem("EventUser");
    }
  }, [user]);

  const value = {
    user,
    isLogin,
    isAdmin,
    setUser,
    setIsLogin,
    setIsAdmin,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
