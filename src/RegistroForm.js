import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import LoginForm from "./LoginForm";

export default function RegistroForm({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
      setTimeout(() => {
        setShowLogin(true);
      }, 2500);
    }
  };

  if (showLogin) {
    return <LoginForm />;
  }

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <img src={process.env.PUBLIC_URL + '/LOGO NFC.png'} alt="Logo PetConnect" style={{ width: 120, marginBottom: 16 }} />
      </div>
      <form className="form_area" onSubmit={handleSubmit}>
        <div className="title">Registro de usuario</div>
        <div className="sub_title">PetConnect NFC</div>
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
        <div className="form_group">
          <label htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            type="password"
            className="form_style"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        {error && <div className="mensaje-estado error">{error}</div>}
        {success && <div className="mensaje-estado exito">{success}</div>}
      </form>
      <div style={{ marginTop: 16 }}>
        ¿Ya tienes cuenta?{' '}
        <button className="btn" onClick={() => setShowLogin(true)} style={{ background: "none", color: "#4e73df", border: "none", textDecoration: "underline", cursor: "pointer" }}>Iniciar sesión</button>
      </div>
    </div>
  );
}
