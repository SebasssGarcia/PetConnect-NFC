import React, { useState, useEffect } from "react";
import "./App.css";
import "./authFormStyles.css";
import { supabase } from "./supabaseClient";
// import { QRCodeSVG } from "qrcode.react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NuevaMascota from "./pages/NuevaMascota";
import MascotasLista from "./pages/MascotasLista";
import Navbar from "./components/Navbar";
import Perfil from "./pages/Perfil";
import Ayuda from "./pages/Ayuda";
import RegistroForm from "./RegistroForm";

function MascotaPublica() {
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMascota = async () => {
      const { data } = await supabase
        .from("mascotas")
        .select("id, nombre_mascota, raza, edad, nombre_duenio, telefono, foto_url")
        .eq("id", id)
        .single();
      setMascota(data);
      setLoading(false);
    };
    fetchMascota();
  }, [id]);

  if (loading) return <div className="mensaje-estado">Cargando ficha...</div>;
  if (!mascota) return <div className="mensaje-estado">Mascota no encontrada.</div>;

  return (
    <div className="ficha-publica">
      <h2>Ficha pública de {mascota.nombre_mascota}</h2>
      {mascota.foto_url ? (
        <img src={mascota.foto_url} alt={mascota.nombre_mascota} className="foto-mascota" style={{ marginBottom: 16 }} />
      ) : (
        <div className="foto-placeholder">Sin foto</div>
      )}
      <div className="datos-publicos">
        <p><strong>Nombre:</strong> {mascota.nombre_mascota}</p>
        <p><strong>Raza:</strong> {mascota.raza || "-"}</p>
        <p><strong>Edad:</strong> {mascota.edad || "-"}</p>
        <p><strong>Dueño:</strong> {mascota.nombre_duenio}</p>
        <p><strong>Teléfono de contacto:</strong> <a href={`tel:${mascota.telefono}`}>{mascota.telefono}</a></p>
      </div>
      <Link to="/">Volver al registro</Link>
    </div>
  );
}

// function FotoMascotaEditor({ mascota, onFotoActualizada }) {
//   const [foto, setFoto] = useState(null);
//   const [mensaje, setMensaje] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setMensaje("");
//     const file = e.target.files[0];
//     if (!file) {
//       setFoto(null);
//       return;
//     }
//     if (!file.type.startsWith("image/")) {
//       setMensaje("El archivo seleccionado no es una imagen válida.");
//       setFoto(null);
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       setMensaje("La imagen es demasiado grande (máx 5MB).");
//       setFoto(null);
//       return;
//     }
//     setFoto(file);
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!foto) {
//       setMensaje("Selecciona una imagen válida.");
//       return;
//     }
//     setLoading(true);
//     const nombreArchivo = `${mascota.id}_${Date.now()}_${foto.name}`;
//     const { error: storageError } = await supabase.storage
//       .from("mascotas")
//       .upload(nombreArchivo, foto, { cacheControl: "3600", upsert: true });
//     if (storageError) {
//       setMensaje("Error al subir la foto. Intenta de nuevo.");
//       setLoading(false);
//       return;
//     }
//     const foto_url = supabase.storage.from("mascotas").getPublicUrl(nombreArchivo).data.publicUrl;
//     // Actualizar mascota en la base de datos
//     const { error: updateError } = await supabase
//       .from("mascotas")
//       .update({ foto_url })
//       .eq("id", mascota.id);
//     setLoading(false);
//     if (updateError) {
//       setMensaje("Error al guardar la foto en la base de datos.");
//     } else {
//       setMensaje("Foto actualizada correctamente.");
//       setFoto(null);
//       onFotoActualizada && onFotoActualizada(foto_url);
//     }
//   };

//   return (
//     <form className="foto-mascota-editor" onSubmit={handleUpload}>
//       <label>
//         Nueva foto:
//         <input type="file" accept="image/*" onChange={handleChange} />
//       </label>
//       <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
//         {loading ? "Subiendo..." : "Actualizar Foto"}
//       </button>
//       {mensaje && <div className="mensaje-estado">{mensaje}</div>}
//     </form>
//   );
// }

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
      <Route path="/mascota/:id" element={<MascotaPublica />} />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
