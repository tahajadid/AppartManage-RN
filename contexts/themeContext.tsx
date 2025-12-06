import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeType = "light" | "dark" | "system";
type ThemeContextType = {
  theme: "light" | "dark";
  mode: ThemeType;
  setMode: (mode: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  mode: "system",
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeType>("system");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem("themeMode");
      if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
        setMode(savedMode);
      }
    })();
  }, []);

  useEffect(() => {
    if (mode === "system") {
      setTheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setTheme(mode);
    }
    AsyncStorage.setItem("themeMode", mode);
  }, [mode, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
