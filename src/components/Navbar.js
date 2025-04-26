import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <NavLink to="/menu" className={({isActive}) => isActive ? 'nav-active' : ''} end>Inicio</NavLink>
      <NavLink to="/mis-mascotas" className={({isActive}) => isActive ? 'nav-active' : ''}>Mis Mascotas</NavLink>
      <NavLink to="/nueva-mascota" className={({isActive}) => isActive ? 'nav-active' : ''}>Nueva Mascota</NavLink>
      <NavLink to="/perfil" className={({isActive}) => isActive ? 'nav-active' : ''}>Perfil</NavLink>
      <NavLink to="/ayuda" className={({isActive}) => isActive ? 'nav-active' : ''}>Ayuda</NavLink>
      <button className="nav-logout" onClick={onLogout}>Cerrar sesión</button>
    </nav>
  );
}
