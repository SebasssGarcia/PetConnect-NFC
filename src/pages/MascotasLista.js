import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { QRCodeSVG } from "qrcode.react";

function EditarMascotaModal({ mascota, onClose, onSave }) {
  const [form, setForm] = useState({ ...mascota });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("mascotas").update({
      ...form,
      edad: form.edad ? parseInt(form.edad) : null
    }).eq("id", mascota.id);
    setLoading(false);
    if (!error) onSave();
  };
  return (
    <div className="modal-bg">
      <div className="modal">
        <h3>Editar mascota</h3>
        <form onSubmit={handleSubmit}>
          <input name="nombre_mascota" value={form.nombre_mascota} onChange={handleChange} placeholder="Nombre" required />
          <input name="especie" value={form.especie||''} onChange={handleChange} placeholder="Especie" />
          <input name="raza" value={form.raza||''} onChange={handleChange} placeholder="Raza" />
          <input name="edad" value={form.edad||''} onChange={handleChange} placeholder="Edad" type="number" min="0" />
          <input name="sexo" value={form.sexo||''} onChange={handleChange} placeholder="Sexo" />
          <input name="color" value={form.color||''} onChange={handleChange} placeholder="Color" />
          <input name="nombre_duenio" value={form.nombre_duenio} onChange={handleChange} placeholder="Dueño" required />
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" required />
          <input name="direccion" value={form.direccion||''} onChange={handleChange} placeholder="Dirección" />
          <textarea name="notas" value={form.notas||''} onChange={handleChange} placeholder="Notas" rows={2} />
          <button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
          <button type="button" onClick={onClose} style={{marginLeft:8}}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default function MascotasLista({ user }) {
  const [mascotas, setMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerMascotas();
    // eslint-disable-next-line
  }, [user]);

  const obtenerMascotas = async () => {
    setCargandoMascotas(true);
    const { data } = await supabase
      .from("mascotas")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha_registro", { ascending: false });
    setMascotas(data || []);
    setCargandoMascotas(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta mascota?")) {
      await supabase.from("mascotas").delete().eq("id", id);
      obtenerMascotas();
    }
  };

  return (
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
              <div>Especie: {m.especie || "-"}</div>
              <div>Sexo: {m.sexo || "-"}</div>
              <div>Color: {m.color || "-"}</div>
              <div>Dueño: {m.nombre_duenio}</div>
              <div>Tel: {m.telefono}</div>
              <div>Dirección: {m.direccion || "-"}</div>
              <div>Notas: {m.notas || "-"}</div>
              <div style={{marginTop:8}}>
                <QRCodeSVG value={`${window.location.origin}/mascota/${m.id}`} size={70} fgColor="#4e73df" />
                <div style={{fontSize:"0.9rem",marginTop:4}}>
                  <a href={`/mascota/${m.id_original || m.id}`} target="_blank" rel="noopener noreferrer">Ver ficha pública</a>
                </div>
              </div>
              <button onClick={()=>setEditando(m)}>Editar</button>
              <button onClick={()=>handleDelete(m.id)} style={{marginLeft:8}}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      {editando && <EditarMascotaModal mascota={editando} onClose={()=>setEditando(null)} onSave={()=>{setEditando(null); obtenerMascotas();}} />}
    </div>
  );
}
