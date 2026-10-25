import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/api";
import "../styles/Usuarios.css";

const ROLE_LABELS = {
  admin: "Administrador",
  socio: "Socio",
  secretaria: "Secretaría",
  profesional: "Profesional",
};

const rolLabel = (rol) => ROLE_LABELS[rol] || rol;

const etiquetaProfesional = (profesional) => {
  const nombre = [profesional.apellido, profesional.nombre]
    .filter(Boolean)
    .join(", ");
  const especialidad = profesional.especialidad_nombre || "Sin especialidad";
  return `${nombre} — ${especialidad}`;
};

export default function RegistrarUsuario() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [rolId, setRolId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [rolesData, profesionalesData] = await Promise.all([
          apiGet("/roles"),
          apiGet("/profesionales"),
        ]);
        setRoles(rolesData);
        setProfesionales(profesionalesData);

        const porDefecto =
          rolesData.find((rol) => rol.nombre === "secretaria") || rolesData[0];
        if (porDefecto) setRolId(String(porDefecto.id));
      } catch (err) {
        setError(err.message || "No se pudieron cargar los roles");
      } finally {
        setCargandoCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const rolSeleccionado = roles.find((rol) => String(rol.id) === rolId);
  const esProfesional = rolSeleccionado?.nombre === "profesional";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (esProfesional && !profesionalId) {
      setError("Seleccioná el profesional asociado al usuario");
      return;
    }

    setLoading(true);

    try {
      await apiPost("/usuarios", {
        email: email.trim(),
        password,
        rol_id: Number(rolId),
        profesional_id: esProfesional ? Number(profesionalId) : null,
      });
      navigate("/usuarios", { state: { creado: true } });
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div className="usuarios-header-title">
          <h1>Nuevo usuario</h1>
          <p>Creá una cuenta y asignale un rol</p>
        </div>
        <Link to="/usuarios" className="usuarios-btn-secundario">
          Volver al listado
        </Link>
      </div>

      <form className="usuarios-form-card" onSubmit={handleSubmit}>
        {error ? <div className="usuarios-alert error">{error}</div> : null}

        <div className="usuarios-form-grid">
          <div className="usuarios-field">
            <label htmlFor="usuario-email">Email</label>
            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@turnify.test"
              autoComplete="off"
              required
            />
          </div>

          <div className="usuarios-field">
            <label htmlFor="usuario-rol-nuevo">Rol</label>
            <select
              id="usuario-rol-nuevo"
              value={rolId}
              onChange={(event) => {
                setRolId(event.target.value);
                setProfesionalId("");
              }}
              disabled={cargandoCatalogos}
              required
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
              <label htmlFor="usuario-profesional-nuevo">Profesional</label>
              <select
                id="usuario-profesional-nuevo"
                value={profesionalId}
                onChange={(event) => setProfesionalId(event.target.value)}
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

          <div className="usuarios-field">
            <label htmlFor="usuario-password-nuevo">Contraseña</label>
            <input
              id="usuario-password-nuevo"
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
            <label htmlFor="usuario-password-confirmar">Confirmar contraseña</label>
            <input
              id="usuario-password-confirmar"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div className="usuarios-form-actions">
          <Link to="/usuarios" className="usuarios-btn-secundario">
            Cancelar
          </Link>
          <button type="submit" className="usuarios-btn-primario" disabled={loading}>
            {loading ? "Creando usuario..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
