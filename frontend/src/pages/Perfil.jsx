import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../utils/api";
import { useAuth } from "../context/useAuth";
import "../styles/Usuarios.css";
import "../styles/Perfil.css";

const ROLE_LABELS = {
  admin: "Administrador",
  socio: "Socio",
  secretaria: "Secretaría",
  profesional: "Profesional",
};

const formatFecha = (fecha) => {
  if (!fecha) return "Sin dato";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function Dato({ etiqueta, children, derivado, titulo }) {
  return (
    <div className="perfil-dato">
      <dt>{etiqueta}</dt>
      <dd className={derivado ? "usuarios-dato-derivado" : undefined} title={titulo}>
        {children || "—"}
      </dd>
    </div>
  );
}

export default function Perfil() {
  const { refreshUser } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setPerfil(await apiGet("/auth/perfil"));
      } catch (err) {
        setError(err.message || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const handlePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setMensaje("");

    if (passwordNueva.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);

    try {
      await apiPut("/auth/password", {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      });
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      setMensaje("Contraseña actualizada correctamente.");
      // El nombre del navbar puede haber cambiado si un admin editó los datos.
      await refreshUser();
    } catch (err) {
      setPasswordError(err.message || "No se pudo actualizar la contraseña");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="usuarios-estado">Cargando perfil...</p>;
  if (error) return <p className="usuarios-estado">{error}</p>;
  if (!perfil) return null;

  return (
    <div className="usuarios-page perfil-page">
      <div className="usuarios-header">
        <div className="usuarios-header-title">
          <h1>Mi perfil</h1>
          <p>Tus datos de acceso y de contacto</p>
        </div>
      </div>

      {mensaje ? <div className="usuarios-alert success">{mensaje}</div> : null}

      <section className="perfil-card" aria-labelledby="perfil-datos">
        <div className="perfil-card-header">
          <h2 id="perfil-datos">Datos personales</h2>
          <p>
            Los datos se administran desde la sección Usuarios. Si algo no es
            correcto, pedile a un administrador que lo actualice.
          </p>
        </div>

        <dl className="perfil-grid">
          <Dato
            etiqueta="Nombre y apellido"
            derivado={perfil.nombre_derivado}
            titulo={
              perfil.nombre_derivado ? "Deducido del email" : undefined
            }
          >
            {perfil.nombre_completo}
          </Dato>

          <Dato
            etiqueta="Usuario"
            derivado={perfil.usuario_derivado}
            titulo={
              perfil.usuario_derivado
                ? "Deducido del email; un admin puede definirlo"
                : undefined
            }
          >
            {perfil.nombre_usuario ? `@${perfil.nombre_usuario}` : ""}
          </Dato>

          <Dato etiqueta="Email">{perfil.email}</Dato>

          <Dato etiqueta="CUIL">{perfil.cuil}</Dato>

          <Dato etiqueta="Rol">
            <span className={`rol-badge rol-${perfil.rol_nombre}`}>
              {ROLE_LABELS[perfil.rol_nombre] || perfil.rol_nombre}
            </span>
          </Dato>

          {perfil.rol_nombre === "profesional" ? (
            <Dato etiqueta="Especialidad / MP">
              {perfil.especialidad_nombre
                ? `${perfil.especialidad_nombre}${
                    perfil.matricula ? ` — MP ${perfil.matricula}` : ""
                  }`
                : "Sin especialidad asignada"}
            </Dato>
          ) : null}

          <Dato etiqueta="Alta">{formatFecha(perfil.fecha_creacion)}</Dato>
        </dl>
      </section>

      <section className="perfil-card" aria-labelledby="perfil-password">
        <div className="perfil-card-header">
          <h2 id="perfil-password">Cambiar contraseña</h2>
          <p>Para confirmar el cambio tenés que ingresar tu contraseña actual.</p>
        </div>

        {passwordError ? (
          <div className="usuarios-alert error">{passwordError}</div>
        ) : null}

        <form className="perfil-password-form" onSubmit={handlePassword}>
          <div className="usuarios-field">
            <label htmlFor="perfil-password-actual">Contraseña actual</label>
            <input
              id="perfil-password-actual"
              type="password"
              value={passwordActual}
              onChange={(event) => setPasswordActual(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="usuarios-field">
            <label htmlFor="perfil-password-nueva">Nueva contraseña</label>
            <input
              id="perfil-password-nueva"
              type="password"
              value={passwordNueva}
              onChange={(event) => setPasswordNueva(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            <span className="usuarios-hint">Mínimo 8 caracteres</span>
          </div>

          <div className="usuarios-field">
            <label htmlFor="perfil-password-confirmar">
              Confirmar nueva contraseña
            </label>
            <input
              id="perfil-password-confirmar"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="perfil-password-actions">
            <button
              type="submit"
              className="usuarios-btn-primario"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
