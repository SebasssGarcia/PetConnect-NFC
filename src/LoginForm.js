import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onLogin && onLogin();
      navigate("/menu");
    }
  };

  return (
    <div className="container">
      <form className="form_area" onSubmit={handleLogin}>
        <div className="title">Iniciar sesión</div>
        <div className="form_group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            className="form_style"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form_group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="form_style"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        {error && <div className="mensaje-estado error">{error}</div>}
      </form>
    </div>
  );
}
