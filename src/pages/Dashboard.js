import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { QRCodeSVG } from "qrcode.react";

export default function Dashboard({ user, onLogout }) {
  const [mascotas, setMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);

  useEffect(() => {
    obtenerMascotas();
    // eslint-disable-next-line
  }, [user]);

  const obtenerMascotas = async () => {
    setCargandoMascotas(true);
    const { data } = await supabase
      .from("mascotas")
      .select("id, nombre_mascota, raza, edad, nombre_duenio, telefono, foto_url, fecha_registro")
      .eq("user_id", user.id)
      .order("fecha_registro", { ascending: false });
    setMascotas(data || []);
    setCargandoMascotas(false);
  };

  return (
    <div className="dashboard">
      <div className="bienvenida-container">
        <h2>¡Bienvenido a PetConnect NFC!</h2>
        <p>Gestiona todas tus mascotas aquí. Puedes ver, editar o eliminar cada ficha.</p>
        <button onClick={onLogout} style={{marginTop: 8}}>Cerrar sesión</button>
      </div>
      <div className="mascotas-lista">
        <h3>Mascotas registradas</h3>
        {cargandoMascotas ? (
          <p>Cargando mascotas...</p>
        ) : mascotas.length === 0 ? (
          <p>No tienes mascotas registradas aún.</p>
        ) : (
          <ul style={{padding:0}}>
            {mascotas.map(m => (
              <li key={m.id} className="mascota-item">
                <div><strong>{m.nombre_mascota}</strong> ({m.raza})</div>
                <div>Edad: {m.edad || "-"}</div>
                <div>Dueño: {m.nombre_duenio}</div>
                <div>Tel: {m.telefono}</div>
                <div style={{marginTop:8}}>
                  <QRCodeSVG value={`${window.location.origin}/mascota/${m.id}`} size={70} fgColor="#4e73df" />
                  <div style={{fontSize:"0.9rem",marginTop:4}}>
                    <a href={`/mascota/${m.id}`} target="_blank" rel="noopener noreferrer">Ver ficha pública</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
