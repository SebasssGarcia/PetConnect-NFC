import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../supabaseClient";

export default function Perfil({ user }) {
  // Personalización y accesibilidad
  const [tema, setTema] = useState("claro");
  const [fuenteGrande, setFuenteGrande] = useState(false);
  const [msg, setMsg] = useState("");
  // QR y NFC
  const [qrValue, setQrValue] = useState(user ? user.email : "");
  const [nfcMsg, setNfcMsg] = useState("");

  // Cargar preferencias guardadas
  useEffect(() => {
    async function cargarPreferencias() {
      const { data } = await supabase.from("usuarios").select("tema, fuente_grande").eq("id", user.id).single();
      if(data) {
        if(data.tema) setTema(data.tema);
        if(data.fuente_grande) setFuenteGrande(data.fuente_grande);
      }
    }
    if(user) cargarPreferencias();
  }, [user]);

  // Guardar preferencias
  const guardarPreferencias = async (nuevoTema, nuevaFuente) => {
    const { error } = await supabase.from("usuarios").update({
      tema: nuevoTema,
      fuente_grande: nuevaFuente
    }).eq("id", user.id);
    setMsg(error ? "Error al guardar preferencias" : "Preferencias guardadas");
    setTimeout(() => setMsg(""), 1800);
  };

  const handleTema = (e) => {
    setTema(e.target.value);
    guardarPreferencias(e.target.value, fuenteGrande);
  };
  const handleFuente = (e) => {
    setFuenteGrande(e.target.checked);
    guardarPreferencias(tema, e.target.checked);
  };
  const handleQrValue = (e) => setQrValue(e.target.value);

  const grabarNFC = async () => {
    if ('NDEFWriter' in window) {
      const ndef = new window.NDEFWriter();
      try {
        await ndef.write(qrValue);
        setNfcMsg("¡Enlace grabado en el NFC correctamente!");
      } catch (error) {
        setNfcMsg("Error al grabar el NFC: " + error);
      }
    } else {
      setNfcMsg("Tu navegador no soporta escritura NFC. Usa Chrome en Android.");
    }
  };

  return (
    <div className={`perfil-page${tema === 'oscuro' ? ' perfil-oscuro' : ''}${fuenteGrande ? ' perfil-fuente-grande' : ''}`}>
      <h2>Mi Perfil</h2>
      <div className="perfil-info">
        <strong>Email:</strong> {user.email}
      </div>
      <div className="perfil-personalizacion">
        <h3>Personalización y accesibilidad</h3>
        <label> Tema visual:
          <select value={tema} onChange={handleTema}>
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={fuenteGrande} onChange={handleFuente} /> Fuente grande
        </label>
        {msg && <div style={{color:'#4e73df',marginTop:6}}>{msg}</div>}
      </div>
      <div className="perfil-qr-nfc">
        <h3>Generar QR y vincular NFC</h3>
        <label>Texto/URL para QR y NFC:
          <input type="text" value={qrValue} onChange={handleQrValue} style={{width:'100%'}} />
        </label>
        <div style={{margin:'10px 0'}}>
          <QRCodeSVG value={qrValue} size={120} fgColor="#4e73df" />
        </div>
        <button type="button" onClick={grabarNFC}>Grabar en NFC</button>
        {nfcMsg && <div style={{marginTop:6, color:'#DE5499'}}>{nfcMsg}</div>}
      </div>
      <div style={{marginTop: 16, color: '#888'}}>Próximamente: edición de perfil, cambio de contraseña, etc.</div>
    </div>
  );
}
