import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function MascotaPublica({ user }) {
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchMascota = async () => {
      const { data } = await supabase
        .from("mascotas")
        .select("id, id_original, nombre_mascota, raza, edad, nombre_duenio, telefono, foto_url, user_id, direccion, notas")
        .eq("id", id)
        .single();
      setMascota(data);
      setLoading(false);
      if (user && data && data.user_id === user.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    };
    fetchMascota();
  }, [id, user]);

  if (loading) return <div className="mensaje-estado">Cargando ficha...</div>;
  if (!mascota) return <div className="mensaje-estado">Mascota no encontrada.</div>;

  return (
    <div className="ficha-publica">
      <h2>Ficha de {mascota.nombre_mascota}</h2>
      {mascota.foto_url ? (
        <img src={mascota.foto_url} alt={mascota.nombre_mascota} className="foto-mascota" style={{ marginBottom: 16 }} />
      ) : (
        <div className="foto-placeholder">Sin foto</div>
      )}
      <div className="datos-publicos">
        <p><strong>ID de mascota:</strong> {mascota.id_original || mascota.id}</p>
        <p><strong>Nombre:</strong> {mascota.nombre_mascota}</p>
        <p><strong>Raza:</strong> {mascota.raza || "-"}</p>
        <p><strong>Edad:</strong> {mascota.edad || "-"}</p>
        <p><strong>Color:</strong> {mascota.color || "-"}</p>
        <p><strong>Especie:</strong> {mascota.especie || "-"}</p>
        <p><strong>Dueño:</strong> {mascota.nombre_duenio}</p>
        <p><strong>Teléfono de contacto:</strong> <a href={`tel:${mascota.telefono}`}>{mascota.telefono}</a></p>
        {isOwner ? (
          <>
            <p><strong>Dirección:</strong> {mascota.direccion || "-"}</p>
            <p><strong>Notas:</strong> {mascota.notas || "-"}</p>
            <div className="mensaje-estado exito">Esta es tu mascota. Puedes editarla desde tu panel privado.</div>
          </>
        ) : (
          <div className="mensaje-estado">Esta es una ficha pública. Solo el dueño puede ver información privada.</div>
        )}
      </div>
      <Link to="/">Volver al registro</Link>
    </div>
  );
}
