import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const shareUrl = "https://illustrious-beignet-919ff5.netlify.app/registro";

export default function Ayuda() {
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("¡Enlace copiado al portapapeles!");
  };

  return (
    <div className="ayuda-page">
      <h2>Ayuda y Soporte</h2>
      <p>¿Tienes dudas sobre cómo usar PetConnect NFC?</p>
      <p>
        ¿Tienes problemas para escanear el NFC o tu dispositivo no tiene esa función? Puedes acceder al registro de manera sencilla usando el siguiente código QR o compartiendo el enlace:
      </p>
      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <QRCodeCanvas value={shareUrl} size={180} />
        <p style={{ wordBreak: 'break-all', margin: '0.5rem 0' }}>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a>
        </p>
        <button onClick={handleCopy} style={{ padding: '0.5rem 1rem', borderRadius: 5, border: '1px solid #4e73df', background: '#4e73df', color: 'white', cursor: 'pointer' }}>
          Copiar enlace
        </button>
      </div>
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
