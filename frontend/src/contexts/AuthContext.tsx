import React, { createContext, useContext } from "react";
export const AuthContext = createContext<any>({ user:null, login:()=>{}, logout:()=>{} });
export const AuthProvider: React.FC<{children:React.ReactNode}> = ({children}) =>
  <AuthContext.Provider value={{ user:null, login:()=>{}, logout:()=>{} }}>{children}</AuthContext.Provider>;
export const useAuth = () => useContext(AuthContext);
