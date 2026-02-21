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
