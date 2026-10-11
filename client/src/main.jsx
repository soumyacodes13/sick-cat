import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import api from "./services/api";

function AppLayout() {
  const [ready, setReady] = useState(false);
  const [platform, setPlatform] = useState("spotify");

  // Auto guest login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setReady(true);
      return;
    }

    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("guestId", guestId);
    }

    api.post("/auth/guest", { guestId })
      .then(res => {
        localStorage.setItem("token", res.data.token);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", background: "#09070f",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#948ea1", fontSize: "0.95rem",
        gap: 12,
      }}>
        <div style={{ fontSize: 32, animation: "pulseGlow 1.2s infinite" }}>🎵</div>
        <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff" }}>Loading music…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard platform={platform} setPlatform={setPlatform} />} />
      <Route path="/music" element={<Dashboard platform={platform} setPlatform={setPlatform} />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppLayout />
  </BrowserRouter>
);
