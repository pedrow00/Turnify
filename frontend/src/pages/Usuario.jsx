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

const etiquetaProfesional = (profesional) => {
  const nombre = [profesional.apellido, profesional.nombre]
    .filter(Boolean)
    .join(", ");
  const especialidad = profesional.especialidad_nombre || "Sin especialidad";
  return `${nombre} — ${especialidad}`;
};

function Modal({ titulo, subtitulo, onClose, children }) {
  return (
    <div className="usuarios-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="usuarios-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="usuarios-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>

        <h2>{titulo}</h2>
        {subtitulo ? <p className="usuarios-modal-sub">{subtitulo}</p> : null}

        {children}
      </div>
    </div>
  );
}

export default function Usuario() {
  const { user } = useAuth();
  const location = useLocation();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(
    location.state?.creado ? "Usuario creado correctamente." : ""
  );

  const [usuarioRol, setUsuarioRol] = useState(null);
  const [nuevoRol, setNuevoRol] = useState("");
  const [nuevoProfesional, setNuevoProfesional] = useState("");
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [usuarioEstado, setUsuarioEstado] = useState(null);
  const [modalError, setModalError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [usuariosData, rolesData, profesionalesData] = await Promise.all([
          apiGet("/usuarios"),
          apiGet("/roles"),
          apiGet("/profesionales"),
        ]);
        setUsuarios(usuariosData);
        setRoles(rolesData);
        setProfesionales(profesionalesData);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const cerrarModales = () => {
    setUsuarioRol(null);
    setUsuarioPassword(null);
    setUsuarioEstado(null);
    setModalError("");
  };

  useEffect(() => {
    if (!usuarioRol && !usuarioPassword && !usuarioEstado) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") cerrarModales();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [usuarioRol, usuarioPassword, usuarioEstado]);

  const termino = busqueda.trim().toLowerCase();
  const hayFiltros =
    termino !== "" || rolFiltro !== "" || estadoFiltro !== "todos";

  const usuariosFiltrados = usuarios.filter((usuario) => {
    // El texto libre solo busca en datos variables: email y datos del
    // profesional. Rol y estado son catalogos y van por desplegable.
    const valores = [
      usuario.email,
      usuario.profesional_nombre,
      usuario.profesional_apellido,
      usuario.matricula,
    ]
      .filter(Boolean)
      .map((valor) => String(valor).toLowerCase());

    const coincideTexto = !termino || valores.some((valor) => valor.includes(termino));
    const coincideRol = !rolFiltro || Number(usuario.rol_id) === Number(rolFiltro);
    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" ? usuario.activo : !usuario.activo);

    return coincideTexto && coincideRol && coincideEstado;
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setRolFiltro("");
    setEstadoFiltro("todos");
  };

  const abrirRol = (usuario) => {
    setUsuarioRol(usuario);
    setNuevoRol(String(usuario.rol_id));
    setNuevoProfesional(
      usuario.profesional_id ? String(usuario.profesional_id) : ""
    );
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

  const confirmarBaja = (usuario) => {
    setUsuarioEstado(usuario);
    setModalError("");
    setMensaje("");
  };

  const rolSeleccionado = roles.find((rol) => String(rol.id) === nuevoRol);
  const esProfesional = rolSeleccionado?.nombre === "profesional";

  const guardarRol = async (event) => {
    event.preventDefault();
    setModalError("");

    if (esProfesional && !nuevoProfesional) {
      setModalError("Seleccioná el profesional asociado al usuario");
      return;
    }

    setGuardando(true);

    try {
      const actualizado = await apiPut(`/usuarios/${usuarioRol.id}`, {
        rol_id: Number(nuevoRol),
        profesional_id: esProfesional ? Number(nuevoProfesional) : null,
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

  const cambiarEstado = async (usuario, activo) => {
    setGuardando(true);
    setModalError("");

    try {
      const actualizado = await apiPut(`/usuarios/${usuario.id}/estado`, {
        activo,
      });
      setUsuarios((prev) =>
        prev.map((item) => (item.id === actualizado.id ? actualizado : item))
      );
      setUsuarioEstado(null);
      setMensaje(
        activo
          ? `${actualizado.email} reactivado.`
          : `${actualizado.email} desactivado.`
      );
    } catch (err) {
      setModalError(err.message || "No se pudo actualizar el estado");
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
              placeholder="Buscar por email, profesional o matrícula..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              aria-label="Buscar usuarios por email, profesional o matrícula"
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

          <select
            className="usuarios-select"
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          {hayFiltros ? (
            <button
              type="button"
              className="usuarios-btn-limpiar"
              onClick={limpiarFiltros}
            >
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
                <th scope="col">Especialidad / MP</th>
                <th scope="col">Estado</th>
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
                  <tr
                    key={usuario.id}
                    className={usuario.activo ? "" : "usuarios-fila-inactiva"}
                  >
                    <td className="usuarios-email">{usuario.email}</td>
                    <td>
                      <span className={`rol-badge rol-${usuario.rol_nombre}`}>
                        {rolLabel(usuario.rol_nombre)}
                      </span>
                    </td>
                    <td>
                      {usuario.especialidad_nombre ? (
                        <div className="usuarios-celda-especialidad">
                          <span className="usuarios-especialidad">
                            {usuario.especialidad_nombre}
                          </span>
                          {usuario.matricula ? (
                            <span className="usuarios-mp">
                              MP: {usuario.matricula}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="usuarios-sin-dato">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`estado-badge ${
                          usuario.activo ? "estado-activo" : "estado-inactivo"
                        }`}
                        title={
                          usuario.activo
                            ? "Puede iniciar sesión"
                            : `Baja: ${formatFecha(usuario.fecha_baja)}`
                        }
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="usuarios-fecha">
                      {formatFecha(usuario.fecha_creacion)}
                    </td>
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

                        {usuario.activo ? (
                          <button
                            type="button"
                            className="usuarios-btn-accion peligro"
                            onClick={() => confirmarBaja(usuario)}
                            disabled={esUsuarioActual}
                            title={
                              esUsuarioActual
                                ? "No podés desactivar tu propio usuario"
                                : "Dar de baja al usuario"
                            }
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="usuarios-btn-accion"
                            onClick={() => cambiarEstado(usuario, true)}
                            disabled={guardando}
                          >
                            Activar
                          </button>
                        )}
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
        <Modal
          titulo="Cambiar rol"
          subtitulo={usuarioRol.email}
          onClose={cerrarModales}
        >
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

            {esProfesional ? (
              <div className="usuarios-field">
                <label htmlFor="usuario-profesional">Profesional</label>
                <select
                  id="usuario-profesional"
                  value={nuevoProfesional}
                  onChange={(event) => setNuevoProfesional(event.target.value)}
                  required
                >
                  <option value="">Seleccioná un profesional</option>
                  {profesionales.map((profesional) => (
                    <option key={profesional.id} value={profesional.id}>
                      {etiquetaProfesional(profesional)}
                    </option>
                  ))}
                </select>
                <span className="usuarios-hint">
                  De acá salen la especialidad y la matrícula.
                </span>
              </div>
            ) : null}

            <div className="usuarios-modal-actions">
              <button
                type="button"
                className="usuarios-btn-secundario"
                onClick={cerrarModales}
              >
                Cancelar
              </button>
              <button type="submit" className="usuarios-btn-primario" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {usuarioPassword ? (
        <Modal
          titulo="Restablecer contraseña"
          subtitulo={usuarioPassword.email}
          onClose={cerrarModales}
        >
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
              <button
                type="button"
                className="usuarios-btn-secundario"
                onClick={cerrarModales}
              >
                Cancelar
              </button>
              <button type="submit" className="usuarios-btn-primario" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {usuarioEstado ? (
        <Modal
          titulo="Desactivar usuario"
          subtitulo={usuarioEstado.email}
          onClose={cerrarModales}
        >
          {modalError ? <div className="usuarios-alert error">{modalError}</div> : null}

          <p className="usuarios-modal-texto">
            El usuario no va a poder iniciar sesión, pero sus turnos e historial
            se conservan. Podés reactivarlo cuando quieras.
          </p>

          <div className="usuarios-modal-actions">
            <button
              type="button"
              className="usuarios-btn-secundario"
              onClick={cerrarModales}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="usuarios-btn-peligro"
              disabled={guardando}
              onClick={() => cambiarEstado(usuarioEstado, false)}
            >
              {guardando ? "Desactivando..." : "Desactivar"}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
