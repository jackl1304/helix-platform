import React, { createContext, useContext } from "react";
export const SettingsContext = createContext<any>({ locale:"de-DE" });
export const SettingsProvider: React.FC<{children:React.ReactNode}> = ({children}) =>
  <SettingsContext.Provider value={{ locale:"de-DE" }}>{children}</SettingsContext.Provider>;
export const useSettings = () => useContext(SettingsContext);
