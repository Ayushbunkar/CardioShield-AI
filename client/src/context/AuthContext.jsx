import React, { useContext, useEffect, useState } from "react";

const AuthContext = React.createContext();

export const AuthProvider = (props) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("EventUser")) || ""
  );
  const [isLogin, setIsLogin] = useState(!!user);
  const [isAdmin, setIsAdmin] = useState(user?.role === "Admin");

  useEffect(() => {
    setIsLogin(!!user);
    setIsAdmin(user?.role === "Admin");
  }, [user]);

  // persist user to sessionStorage so the dashboard can read it after refresh
  useEffect(() => {
    if (user) {
      try {
        sessionStorage.setItem("EventUser", JSON.stringify(user));
      } catch (e) {
        console.warn("Could not persist user to sessionStorage", e);
      }
    } else {
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
