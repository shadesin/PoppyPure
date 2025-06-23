import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); //Initializes the theme state using the useState hook.
                                                                                // It tries to retrieve the theme preference from localStorage.getItem("theme").
                                                                                //If no theme is found in localStorage (e.g., first-time user), it defaults to "light".

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme); //It sets a data-theme attribute on the root <html> element of my HTML document.
    console.log(`Theme set to: ${theme}`); // Debug
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log(`Toggling theme to: ${newTheme}`); // Debug
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
