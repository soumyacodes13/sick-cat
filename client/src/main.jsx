import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import "./index.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const location = useLocation();
  const hideNavbar = ["/login"].includes(location.pathname);
  const isHome = location.pathname === "/";

  const [catMode,      setCatMode]      = useState(false);
  const [catColor,     setCatColor]     = useState("#c4956a");
  const [accessory,    setAccessory]    = useState("none");
  const [catHappiness, setCatHappiness] = useState(10);
  const [platform,     setPlatform]     = useState("spotify");
  const [darkMode,     setDarkMode]     = useState(false);
  const [showPlayer,   setShowPlayer]   = useState(false);

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const sharedProps = { darkMode, setDarkMode, catMode, setCatMode, catColor, setCatColor, accessory, setAccessory, platform, setPlatform, showPlayer, setShowPlayer };

  return (
    <>
      {!hideNavbar && (
        <Navbar
          {...sharedProps}
          isHome={isHome}
        />
      )}
      <Routes>
        <Route path="/"      element={<Home darkMode={darkMode} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/music" element={
          <ProtectedRoute>
            <Dashboard
              {...sharedProps}
              onHappinessChange={setCatHappiness}
            />
          </ProtectedRoute>
        } />
        <Route path="/games" element={
          <ProtectedRoute>
            <Games
              {...sharedProps}
              catHappiness={catHappiness}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter><AppLayout /></BrowserRouter>
);
