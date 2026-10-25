import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { apiGet, apiPut } from "../utils/api";
import "../styles/Usuarios.css";

const ROLE_LABELS = {
  admin: "Administrador",
  socio: "Socio",
  secretaria: "Secretaría",
  profesional: "Profesional",
};

const rolLabel = (rol) => ROLE_LABELS[rol] || rol;

const formatFecha = (fecha) => {
  if (!fecha) return "Sin dato";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function Usuario() {
  const { user } = useAuth();
  const location = useLocation();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(
    location.state?.creado ? "Usuario creado correctamente." : ""
  );

  const [usuarioRol, setUsuarioRol] = useState(null);
  const [nuevoRol, setNuevoRol] = useState("");
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [modalError, setModalError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [usuariosData, rolesData] = await Promise.all([
          apiGet("/usuarios"),
          apiGet("/roles"),
        ]);
        setUsuarios(usuariosData);
        setRoles(rolesData);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!usuarioRol && !usuarioPassword) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setUsuarioRol(null);
        setUsuarioPassword(null);
        setModalError("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [usuarioRol, usuarioPassword]);

  const termino = busqueda.trim().toLowerCase();
  const hayFiltros = termino !== "" || rolFiltro !== "";

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideTexto = !termino || String(usuario.email).toLowerCase().includes(termino);
    const coincideRol = !rolFiltro || Number(usuario.rol_id) === Number(rolFiltro);
    return coincideTexto && coincideRol;
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setRolFiltro("");
  };

  const cerrarModales = () => {
    setUsuarioRol(null);
    setUsuarioPassword(null);
    setModalError("");
  };

  const abrirRol = (usuario) => {
    setUsuarioRol(usuario);
    setNuevoRol(String(usuario.rol_id));
    setModalError("");
    setMensaje("");
  };

  const abrirPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setPassword("");
    setPasswordConfirm("");
    setModalError("");
    setMensaje("");
  };

  const guardarRol = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setModalError("");

    try {
      const actualizado = await apiPut(`/usuarios/${usuarioRol.id}`, {
        rol_id: Number(nuevoRol),
      });
      setUsuarios((prev) =>
        prev.map((item) => (item.id === actualizado.id ? actualizado : item))
      );
      setUsuarioRol(null);
      setMensaje(`Rol de ${actualizado.email} actualizado.`);
    } catch (err) {
      setModalError(err.message || "No se pudo actualizar el rol");
    } finally {
      setGuardando(false);
    }
  };

  const guardarPassword = async (event) => {
    event.preventDefault();
    setModalError("");

    if (password.length < 8) {
      setModalError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== passwordConfirm) {
      setModalError("Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);

    try {
      await apiPut(`/usuarios/${usuarioPassword.id}/password`, { password });
      setMensaje(`Contraseña de ${usuarioPassword.email} actualizada.`);
      setUsuarioPassword(null);
    } catch (err) {
      setModalError(err.message || "No se pudo actualizar la contraseña");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="usuarios-estado">Cargando usuarios...</p>;
  if (error) return <p className="usuarios-estado">{error}</p>;

  return (
    <>
      <div className="usuarios-page">
        <div className="usuarios-header">
          <div className="usuarios-header-title">
            <h1>Usuarios</h1>
            <p>Administrá quién puede acceder al sistema y con qué rol</p>
          </div>
          <Link to="/usuarios/nuevo" className="usuarios-btn-nuevo">
            + Nuevo Usuario
          </Link>
        </div>

        {mensaje ? <div className="usuarios-alert success">{mensaje}</div> : null}

        <div className="usuarios-filters">
          <div className="usuarios-search">
            <input
              type="text"
              placeholder="Buscar por email..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              aria-label="Buscar usuarios por email"
            />
          </div>

          <select
            className="usuarios-select"
            value={rolFiltro}
            onChange={(event) => setRolFiltro(event.target.value)}
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rolLabel(rol.nombre)}
              </option>
            ))}
          </select>

          {hayFiltros ? (
            <button type="button" className="usuarios-btn-limpiar" onClick={limpiarFiltros}>
              Limpiar
            </button>
          ) : null}
        </div>

        <p className="usuarios-contador">
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </p>

        <div className="usuarios-tabla-wrapper">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Rol</th>
                <th scope="col">Creado</th>
                <th scope="col" className="usuarios-col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const esUsuarioActual = usuario.id === user?.id;

                return (
                  <tr key={usuario.id}>
                    <td className="usuarios-email">{usuario.email}</td>
                    <td>
                      <span className={`rol-badge rol-${usuario.rol_nombre}`}>
                        {rolLabel(usuario.rol_nombre)}
                      </span>
                    </td>
                    <td className="usuarios-fecha">{formatFecha(usuario.fecha_creacion)}</td>
                    <td>
                      <div className="usuarios-acciones">
                        <button
                          type="button"
                          className="usuarios-btn-accion"
                          onClick={() => abrirRol(usuario)}
                          disabled={esUsuarioActual}
                          title={
                            esUsuarioActual
                              ? "No podés cambiar tu propio rol"
                              : "Cambiar el rol de este usuario"
                          }
                        >
                          Cambiar rol
                        </button>
                        <button
                          type="button"
                          className="usuarios-btn-accion"
                          onClick={() => abrirPassword(usuario)}
                        >
                          Contraseña
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {usuariosFiltrados.length === 0 ? (
            <div className="usuarios-vacio">
              <p>
                {hayFiltros
                  ? "No se encontraron usuarios con esos filtros"
                  : "Todavía no hay usuarios cargados"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {usuarioRol ? (
        <div
          className="usuarios-modal-overlay"
          onClick={cerrarModales}
          role="presentation"
        >
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-rol"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="usuarios-modal-close"
              onClick={cerrarModales}
              aria-label="Cerrar"
            >
              x
            </button>

            <h2 id="usuarios-modal-rol">Cambiar rol</h2>
            <p className="usuarios-modal-sub">{usuarioRol.email}</p>

            {modalError ? <div className="usuarios-alert error">{modalError}</div> : null}

            <form onSubmit={guardarRol}>
              <div className="usuarios-field">
                <label htmlFor="usuario-rol">Rol</label>
                <select
                  id="usuario-rol"
                  value={nuevoRol}
                  onChange={(event) => setNuevoRol(event.target.value)}
                >
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rolLabel(rol.nombre)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="usuarios-modal-actions">
                <button type="button" className="usuarios-btn-secundario" onClick={cerrarModales}>
                  Cancelar
                </button>
                <button type="submit" className="usuarios-btn-primario" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {usuarioPassword ? (
        <div
          className="usuarios-modal-overlay"
          onClick={cerrarModales}
          role="presentation"
        >
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-password"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="usuarios-modal-close"
              onClick={cerrarModales}
              aria-label="Cerrar"
            >
              x
            </button>

            <h2 id="usuarios-modal-password">Restablecer contraseña</h2>
            <p className="usuarios-modal-sub">{usuarioPassword.email}</p>

            {modalError ? <div className="usuarios-alert error">{modalError}</div> : null}

            <form onSubmit={guardarPassword}>
              <div className="usuarios-field">
                <label htmlFor="usuario-password">Nueva contraseña</label>
                <input
                  id="usuario-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
                <span className="usuarios-hint">Mínimo 8 caracteres</span>
              </div>

              <div className="usuarios-field">
                <label htmlFor="usuario-password-confirm">Confirmar contraseña</label>
                <input
                  id="usuario-password-confirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="usuarios-modal-actions">
                <button type="button" className="usuarios-btn-secundario" onClick={cerrarModales}>
                  Cancelar
                </button>
                <button type="submit" className="usuarios-btn-primario" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
