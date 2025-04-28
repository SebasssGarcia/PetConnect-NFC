import React, { useState, useEffect } from "react";
import "./App.css";
import "./authFormStyles.css";
import { supabase } from "./supabaseClient";
// import { QRCodeSVG } from "qrcode.react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NuevaMascota from "./pages/NuevaMascota";
import MascotasLista from "./pages/MascotasLista";
import Navbar from "./components/Navbar";
import Perfil from "./pages/Perfil";
import Ayuda from "./pages/Ayuda";
import RegistroForm from "./RegistroForm";
import MascotaPublica from "./pages/MascotaPublica";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  // Función robusta para obtener la sesión y usuario actual
  const getAndSetSession = async () => {
    setCheckingSession(true);
    setSessionError("");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setSessionError("Error al obtener la sesión: " + error.message);
        setUser(null);
      } else {
        setUser(data.session?.user || null);
      }
    } catch (e) {
      setSessionError("Error inesperado de sesión: " + e.message);
      setUser(null);
    }
    setCheckingSession(false);
  };

  useEffect(() => {
    getAndSetSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Si ocurre un error al cerrar sesión, lo ignoramos para no bloquear al usuario
    }
    setUser(null);
  };

  if (checkingSession) return <div className="mensaje-estado">Verificando sesión...</div>;
  if (sessionError) return <div className="mensaje-estado error">{sessionError}</div>;

  return (
    <Routes>
      <Route path="/registro" element={<RegistroForm />} />
      <Route path="/menu" element={user ? <MainMenu user={user} onLogout={handleLogout} /> : <Navigate to="/registro" />} />
      <Route path="/mis-mascotas" element={user ? <><Navbar onLogout={handleLogout} /><MisMascotasPage user={user} /></> : <Navigate to="/registro" />} />
      <Route path="/nueva-mascota" element={user ? <><Navbar onLogout={handleLogout} /><NuevaMascotaPage user={user} /></> : <Navigate to="/registro" />} />
      <Route path="/perfil" element={user ? <><Navbar onLogout={handleLogout} /><Perfil user={user} /></> : <Navigate to="/registro" />} />
      <Route path="/ayuda" element={user ? <><Navbar onLogout={handleLogout} /><Ayuda /></> : <Navigate to="/registro" />} />
      <Route path="*" element={<Navigate to={user ? "/menu" : "/registro"} />} />
      <Route path="/mascota/:id" element={<MascotaPublica user={user} />} />
    </Routes>
  );
}

function MainMenu({ user, onLogout }) {
  return (
    <>
      <Navbar onLogout={onLogout} />
      <Dashboard user={user} onLogout={onLogout} />
    </>
  );
}

function NuevaMascotaPage({ user }) {
  return <NuevaMascota user={user} />;
}

function MisMascotasPage({ user }) {
  return <MascotasLista user={user} />;
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
