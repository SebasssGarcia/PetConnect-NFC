// Formulario completo para agregar una nueva mascota con todos los datos generales
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function NuevaMascota({ user }) {
  const [form, setForm] = useState({
    nombreMascota: "",
    especie: "",
    raza: "",
    edad: "",
    sexo: "",
    color: "",
    nombreDuenio: "",
    telefono: "",
    direccion: "",
    notas: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    const nuevaMascota = {
      nombre_mascota: form.nombreMascota,
      especie: form.especie,
      raza: form.raza,
      edad: form.edad ? parseInt(form.edad) : null,
      sexo: form.sexo,
      color: form.color,
      nombre_duenio: form.nombreDuenio,
      telefono: form.telefono,
      direccion: form.direccion,
      notas: form.notas,
      foto_url: null,
      user_id: user.id,
    };
    const { error } = await supabase.from("mascotas").insert([nuevaMascota]);
    setLoading(false);
    if (error) {
      setMensaje("Error: " + (error.message || "al registrar la mascota. Intenta de nuevo."));
    } else {
      setMensaje("¡Mascota registrada exitosamente!");
      setForm({ nombreMascota: "", especie: "", raza: "", edad: "", sexo: "", color: "", nombreDuenio: "", telefono: "", direccion: "", notas: "" });
    }
  };

  return (
    <form className="pet-form" onSubmit={handleSubmit}>
      <label>Nombre de la mascota
        <input type="text" name="nombreMascota" value={form.nombreMascota} onChange={handleChange} required />
      </label>
      <label>Especie
        <input type="text" name="especie" value={form.especie} onChange={handleChange} required />
      </label>
      <label>Raza
        <input type="text" name="raza" value={form.raza} onChange={handleChange} />
      </label>
      <label>Edad
        <input type="number" name="edad" min="0" value={form.edad} onChange={handleChange} />
      </label>
      <label>Sexo
        <select name="sexo" value={form.sexo} onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="Macho">Macho</option>
          <option value="Hembra">Hembra</option>
        </select>
      </label>
      <label>Color
        <input type="text" name="color" value={form.color} onChange={handleChange} />
      </label>
      <label>Nombre del dueño
        <input type="text" name="nombreDuenio" value={form.nombreDuenio} onChange={handleChange} required />
      </label>
      <label>Teléfono
        <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} required />
      </label>
      <label>Dirección
        <input type="text" name="direccion" value={form.direccion} onChange={handleChange} />
      </label>
      <label>Notas adicionales
        <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} />
      </label>
      <button type="submit" disabled={loading}>{loading ? "Registrando..." : "Registrar mascota"}</button>
      {mensaje && <div className="mensaje-estado">{mensaje}</div>}
    </form>
  );
}
