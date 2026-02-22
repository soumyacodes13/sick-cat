import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useEffect } from "react";
import Navbar from "../components/Navbar";


function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/music");
  }
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        const res = await api.post("/auth/login", formData);

        localStorage.setItem("token", res.data.token);
        navigate("/music");
      } else {
        await api.post("/auth/register", formData);
        alert("Account created. Please login.");
        setMode("login");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-8 py-10 text-center"
      >
        <h1 className="text-white text-3xl font-medium">
          {mode === "login" ? "Login" : "Sign up"}
        </h1>

        <p className="text-gray-400 text-sm mt-2 mb-6">
          Please sign in to continue
        </p>

        {/* Username */}
        <div className="flex items-center w-full mt-4 bg-white/5 ring-2 ring-white/10 focus-within:ring-indigo-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center mt-4 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-indigo-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : mode === "login"
              ? "Login"
              : "Sign up"}
        </button>

        <p
          onClick={() =>
            setMode(prev => prev === "login" ? "register" : "login")
          }
          className="text-gray-400 text-sm mt-6 cursor-pointer"
        >
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <span className="text-indigo-400 ml-1 hover:underline">
            Click here
          </span>
        </p>
      </form>

      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-800/30 rounded-full blur-3xl" />
        <div className="absolute right-12 bottom-10 w-[400px] h-[200px] bg-indigo-700/30 rounded-full blur-2xl" />
      </div>

    </div>
  );
}

export default Login;