import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function EditarMascota({ mascota, onGuardado, onCancelar }) {
  const [editForm, setEditForm] = useState({
    nombre_mascota: mascota.nombre_mascota,
    raza: mascota.raza,
    edad: mascota.edad,
    nombre_duenio: mascota.nombre_duenio,
    telefono: mascota.telefono,
  });
  const [loading, setLoading] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    const { error } = await supabase.from("mascotas").update({
      ...editForm,
      edad: editForm.edad ? parseInt(editForm.edad) : null
    }).eq("id", mascota.id);
    setLoading(false);
    if (!error && onGuardado) onGuardado();
  };

  return (
    <div className="editar-mascota">
      <input name="nombre_mascota" value={editForm.nombre_mascota} onChange={handleEditChange} placeholder="Nombre" />
      <input name="raza" value={editForm.raza} onChange={handleEditChange} placeholder="Raza" />
      <input name="edad" value={editForm.edad} onChange={handleEditChange} placeholder="Edad" type="number" min="0" />
      <input name="nombre_duenio" value={editForm.nombre_duenio} onChange={handleEditChange} placeholder="Dueño" />
      <input name="telefono" value={editForm.telefono} onChange={handleEditChange} placeholder="Teléfono" />
      <button onClick={handleSaveEdit} disabled={loading}>Guardar</button>
      <button onClick={onCancelar}>Cancelar</button>
    </div>
  );
}
