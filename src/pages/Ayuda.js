import React from "react";

export default function Ayuda() {
  return (
    <div className="ayuda-page">
      <h2>Ayuda y Soporte</h2>
      <p>¿Tienes dudas sobre cómo usar PetConnect NFC?</p>
      <ul>
        <li>Para registrar una mascota, ve a "Nueva Mascota".</li>
        <li>Puedes ver y editar tus mascotas en "Mis Mascotas".</li>
        <li>Haz clic en el QR para ver la ficha pública de tu mascota.</li>
        <li>Para soporte técnico, escribe a <a href="mailto:soporte@petconnect.com">soporte@petconnect.com</a>.</li>
      </ul>
      <div style={{marginTop: 16, color: '#888'}}>Próximamente: tutoriales, preguntas frecuentes y más.</div>
    </div>
  );
}
