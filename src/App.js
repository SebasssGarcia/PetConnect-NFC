import React, { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

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

function FotoMascotaEditor({ mascota, onFotoActualizada }) {
  const [foto, setFoto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMensaje("");
    const file = e.target.files[0];
    if (!file) {
      setFoto(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMensaje("El archivo seleccionado no es una imagen válida.");
      setFoto(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMensaje("La imagen es demasiado grande (máx 5MB).");
      setFoto(null);
      return;
    }
    setFoto(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!foto) {
      setMensaje("Selecciona una imagen válida.");
      return;
    }
    setLoading(true);
    const nombreArchivo = `${mascota.id}_${Date.now()}_${foto.name}`;
    const { error: storageError } = await supabase.storage
      .from("mascotas")
      .upload(nombreArchivo, foto, { cacheControl: "3600", upsert: true });
    if (storageError) {
      setMensaje("Error al subir la foto. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    const foto_url = supabase.storage.from("mascotas").getPublicUrl(nombreArchivo).data.publicUrl;
    // Actualizar mascota en la base de datos
    const { error: updateError } = await supabase
      .from("mascotas")
      .update({ foto_url })
      .eq("id", mascota.id);
    setLoading(false);
    if (updateError) {
      setMensaje("Error al guardar la foto en la base de datos.");
    } else {
      setMensaje("Foto actualizada correctamente.");
      setFoto(null);
      onFotoActualizada && onFotoActualizada(foto_url);
    }
  };

  return (
    <form className="foto-mascota-editor" onSubmit={handleUpload}>
      <label>
        Nueva foto:
        <input type="file" accept="image/*" onChange={handleChange} />
      </label>
      <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Subiendo..." : "Actualizar Foto"}
      </button>
      {mensaje && <div className="mensaje-estado">{mensaje}</div>}
    </form>
  );
}

function AuthForm({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }
    setLoading(false);
    if (result.error) {
      setMensaje(result.error.message);
    } else {
      setMensaje(isLogin ? "¡Bienvenido!" : "¡Registro exitoso! Revisa tu correo para confirmar.");
      onAuth();
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? "Iniciar sesión" : "Registrarse"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : isLogin ? "Iniciar sesión" : "Registrarse"}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="switch-auth">
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
      {mensaje && <div className="mensaje-estado">{mensaje}</div>}
    </div>
  );
}

function App() {
  const [form, setForm] = useState({
    nombreMascota: "",
    raza: "",
    edad: "",
    nombreDuenio: "",
    telefono: ""
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mascotas, setMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [fotoEditandoId, setFotoEditandoId] = useState(null);
  const [fotoPreview, setFotoPreview] = useState({});
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    async function checkSession() {
      setCheckingSession(true);
      setSessionError("");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) setSessionError("Error al obtener la sesión: " + error.message);
        setUser(data.session?.user || null);
        if (data.session?.user) obtenerMascotas(data.session.user.id);
      } catch (e) {
        setSessionError("Error al obtener la sesión: " + e.message);
      }
      setCheckingSession(false);
    }
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) obtenerMascotas(session.user.id);
      else setMascotas([]);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const obtenerMascotas = async (userId) => {
    setCargandoMascotas(true);
    const { data, error } = await supabase
      .from("mascotas")
      .select("id, nombre_mascota, raza, edad, nombre_duenio, telefono, foto_url, fecha_registro")
      .eq("user_id", userId)
      .order("fecha_registro", { ascending: false });
    if (!error) setMascotas(data);
    setCargandoMascotas(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    if (!user) {
      setMensaje("Debes iniciar sesión para registrar una mascota.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("mascotas").insert([
      {
        nombre_mascota: form.nombreMascota,
        raza: form.raza,
        edad: form.edad ? parseInt(form.edad) : null,
        nombre_duenio: form.nombreDuenio,
        telefono: form.telefono,
        foto_url: null,
        user_id: user.id,
      },
    ]);
    setLoading(false);
    if (error) {
      setMensaje("Error: " + (error.message || "al registrar la mascota. Intenta de nuevo."));
    } else {
      setMensaje("¡Mascota registrada exitosamente!");
      setForm({ nombreMascota: "", raza: "", edad: "", nombreDuenio: "", telefono: "" });
      obtenerMascotas(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMascotas([]);
  };

  const getBaseUrl = () => {
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000";
    }
    return window.location.origin;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <header className="App-header">
                <h1>Registro de Mascotas</h1>
                {user && <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>}
                <p>¡Bienvenido! Escanea tu llavero NFC para comenzar el registro de tu mascota.</p>
              </header>
              <main>
                {checkingSession ? (
                  <div className="mensaje-estado">Verificando sesión...</div>
                ) : sessionError ? (
                  <div className="mensaje-estado error">{sessionError}</div>
                ) : !user ? (
                  <AuthForm onAuth={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))} />
                ) : (
                  <>
                    <form className="pet-form" onSubmit={handleSubmit}>
                      <label>
                        Nombre de la mascota
                        <input
                          type="text"
                          name="nombreMascota"
                          value={form.nombreMascota}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        Raza
                        <input
                          type="text"
                          name="raza"
                          value={form.raza}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        Edad
                        <input
                          type="number"
                          name="edad"
                          value={form.edad}
                          onChange={handleChange}
                          required
                          min="0"
                        />
                      </label>
                      <label>
                        Nombre del dueño
                        <input
                          type="text"
                          name="nombreDuenio"
                          value={form.nombreDuenio}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        Teléfono de contacto
                        <input
                          type="tel"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{10,15}"
                          placeholder="Ej. 5551234567"
                        />
                      </label>
                      <button type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar Mascota"}
                      </button>
                    </form>
                    {mensaje && <div className="mensaje-estado">{mensaje}</div>}
                    <section className="lista-mascotas">
                      <h2>Mascotas Registradas</h2>
                      {cargandoMascotas ? (
                        <p>Cargando mascotas...</p>
                      ) : mascotas.length === 0 ? (
                        <p>No hay mascotas registradas aún.</p>
                      ) : (
                        <ul>
                          {mascotas.map((m) => (
                            <li key={m.id} className="mascota-item">
                              {m.foto_url ? (
                                <img src={fotoPreview[m.id] || m.foto_url} alt={m.nombre_mascota} className="foto-mascota" />
                              ) : (
                                <span className="foto-placeholder">Sin foto</span>
                              )}
                              <strong>{m.nombre_mascota}</strong> ({m.raza})<br />
                              Edad: {m.edad || "-"} <br />
                              Dueño: {m.nombre_duenio} <br />
                              Tel: {m.telefono}
                              <div style={{ margin: "1rem 0" }}>
                                <QRCodeSVG
                                  value={`${getBaseUrl()}/mascota/${m.id}`}
                                  size={80}
                                  bgColor="#fff"
                                  fgColor="#4e73df"
                                  level="H"
                                  includeMargin={true}
                                />
                                <div style={{ fontSize: "0.9rem", marginTop: 4 }}>
                                  <a href={`/mascota/${m.id}`} target="_blank" rel="noopener noreferrer">
                                    Ver ficha pública
                                  </a>
                                </div>
                              </div>
                              <button onClick={() => setFotoEditandoId(fotoEditandoId === m.id ? null : m.id)} style={{ marginBottom: 8 }}>
                                {fotoEditandoId === m.id ? "Cancelar" : m.foto_url ? "Cambiar foto" : "Agregar foto"}
                              </button>
                              {fotoEditandoId === m.id && (
                                <FotoMascotaEditor
                                  mascota={m}
                                  onFotoActualizada={(url) => {
                                    setFotoPreview((prev) => ({ ...prev, [m.id]: url }));
                                    setFotoEditandoId(null);
                                    obtenerMascotas(user.id);
                                  }}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </>
                )}
              </main>
            </div>
          }
        />
        <Route path="/mascota/:id" element={<MascotaPublica />} />
      </Routes>
    </Router>
  );
}

export default App;
