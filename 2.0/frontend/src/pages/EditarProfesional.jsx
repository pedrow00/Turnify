import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/RegistrarPaciente.css";

const initialForm = {
  nombre: "",
  apellido: "",
  cuil: "",
  email: "",
  telefono: "",
};

export default function EditarProfesional() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [form, setForm] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [errors, setErrors] = useState({});
  const [loadingProfesional, setLoadingProfesional] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

  const cargarProfesional = async () => {
    try {
      setLoadingProfesional(true);
      setSubmitError("");
      setLoadError("");

      const response = await fetch(`${apiUrl}/profesionales/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo cargar el profesional.");
      }

      const profesional = await response.json();
      const nextForm = {
        nombre: profesional.nombre ?? "",
        apellido: profesional.apellido ?? "",
        cuil: profesional.cuil ?? "",
        email: profesional.email ?? "",
        telefono: profesional.telefono ?? "",
      };

      setForm(nextForm);
      setInitialSnapshot(JSON.stringify(nextForm));
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el profesional.");
    } finally {
      setLoadingProfesional(false);
    }
  };

  useEffect(() => {
    cargarProfesional();
  }, [apiUrl, id]);

  const clearFieldError = (fieldName) => {
    if (!errors[fieldName]) {
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    clearFieldError(name);
    setSubmitError("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (!/^[\p{L} ]+$/u.test(form.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo puede contener letras.";
    }

    if (!form.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (!/^[\p{L} ]+$/u.test(form.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo puede contener letras.";
    }

    if (!form.cuil.trim()) {
      nuevosErrores.cuil = "El CUIL es obligatorio.";
    } else if (!/^\d{11}$/.test(form.cuil.trim())) {
      nuevosErrores.cuil = "El CUIL debe tener 11 digitos.";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevosErrores.email = "Ingresa un email valido.";
    }

    if (form.telefono.trim() && !/^\d{6,15}$/.test(form.telefono.trim())) {
      nuevosErrores.telefono = "El telefono debe tener entre 6 y 15 digitos.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);
      setSubmitError("");

      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cuil: form.cuil.trim(),
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
      };

      const response = await fetch(`${apiUrl}/profesionales/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo actualizar el profesional.");
      }

      setInitialSnapshot(JSON.stringify(payload));
      navigate("/profesional");
    } catch (error) {
      setSubmitError(error.message || "No se pudo actualizar el profesional.");
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = `${form.nombre} ${form.apellido}`.trim();
  const iniciales = nombreCompleto
    .split(" ")
    .filter(Boolean)
    .map((segmento) => segmento[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const formSnapshot = JSON.stringify({
    ...form,
    email: form.email.trim(),
    telefono: form.telefono.trim(),
  });
  const isDirty = formSnapshot !== initialSnapshot;
  const canSubmit = !guardando && !loadingProfesional && !loadError && isDirty;

  return (
    <div className="registro-paciente-page">
      <div className="registro-paciente-shell">
        <div className="registro-paciente-header">
          <div>
            <span className="registro-badge">Editar profesional</span>
            <h1>Actualizar profesional</h1>
            <p>Modifica los datos del profesional y guarda los cambios en Turnify.</p>
          </div>
          <Link to="/profesional" className="registro-link-back">
            Volver al listado
          </Link>
        </div>

        {!loadingProfesional && !loadError ? (
          <section className="registro-section registro-summary-card">
            <div className="registro-summary-avatar">{iniciales || "P"}</div>
            <div className="registro-summary-content">
              <span className="registro-summary-label">Profesional en edicion</span>
              <h2>{nombreCompleto || "Profesional sin nombre"}</h2>
              <p>
                {form.cuil ? `CUIL ${form.cuil}` : "Completa los datos identificatorios"} ·{" "}
                {isDirty ? "Hay cambios sin guardar" : "Sin cambios pendientes"}
              </p>
            </div>
          </section>
        ) : null}

        {loadingProfesional ? (
          <section className="registro-section registro-feedback-card">
            <div className="section-heading">
              <h2>Cargando datos</h2>
              <p>Estamos trayendo la informacion del profesional para editarla.</p>
            </div>
            <div className="registro-loading-pulse" />
            <div className="registro-loading-pulse short" />
          </section>
        ) : loadError ? (
          <section className="registro-section registro-feedback-card">
            <div className="section-heading">
              <h2>No pudimos abrir la ficha</h2>
              <p>{loadError}</p>
            </div>
            <div className="registro-actions">
              <button type="button" className="btn-primary" onClick={cargarProfesional}>
                Reintentar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/profesional")}
              >
                Volver al listado
              </button>
            </div>
          </section>
        ) : (
          <form className="registro-paciente-form" onSubmit={handleSubmit}>
            <section className="registro-section">
              <div className="section-heading">
                <h2>Datos personales</h2>
                <p>Informacion base para identificar al profesional.</p>
              </div>

              <div className="registro-grid">
                <div className="field">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className={errors.nombre ? "input-error" : ""}
                    disabled={guardando}
                  />
                  {errors.nombre ? <span className="field-error">{errors.nombre}</span> : null}
                </div>

                <div className="field">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    value={form.apellido}
                    onChange={handleChange}
                    placeholder="Perez"
                    className={errors.apellido ? "input-error" : ""}
                    disabled={guardando}
                  />
                  {errors.apellido ? (
                    <span className="field-error">{errors.apellido}</span>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="cuil">CUIL</label>
                  <input
                    id="cuil"
                    name="cuil"
                    type="text"
                    inputMode="numeric"
                    value={form.cuil}
                    onChange={handleChange}
                    placeholder="20301234567"
                    className={errors.cuil ? "input-error" : ""}
                    disabled={guardando}
                  />
                  {errors.cuil ? <span className="field-error">{errors.cuil}</span> : null}
                </div>
              </div>
            </section>

            <section className="registro-section">
              <div className="section-heading">
                <h2>Contacto</h2>
                <p>Datos para comunicacion y coordinacion.</p>
              </div>

              <div className="registro-grid">
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="profesional@email.com"
                    className={errors.email ? "input-error" : ""}
                    disabled={guardando}
                  />
                  {errors.email ? <span className="field-error">{errors.email}</span> : null}
                </div>

                <div className="field">
                  <label htmlFor="telefono">Telefono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="text"
                    inputMode="numeric"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="3511234567"
                    className={errors.telefono ? "input-error" : ""}
                    disabled={guardando}
                  />
                  {errors.telefono ? (
                    <span className="field-error">{errors.telefono}</span>
                  ) : null}
                </div>
              </div>
            </section>

            {submitError ? <div className="submit-error">{submitError}</div> : null}

            <div className="registro-actions">
              <button type="submit" className="btn-primary" disabled={!canSubmit}>
                {guardando ? "Guardando..." : isDirty ? "Guardar cambios" : "Sin cambios"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/profesional")}
                disabled={guardando}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
