import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/RegistrarPaciente.css";

const initialForm = {
  nombre: "",
  apellido: "",
  cuil: "",
  email: "",
  telefono: "",
};

export default function RegistrarProfesional() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

      const response = await fetch(`${apiUrl}/profesionales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo registrar el profesional.");
      }

      navigate("/profesional");
    } catch (error) {
      setSubmitError(error.message || "No se pudo registrar el profesional.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="registro-paciente-page">
      <div className="registro-paciente-shell">
        <div className="registro-paciente-header">
          <div>
            <span className="registro-badge">Nuevo profesional</span>
            <h1>Registrar profesional</h1>
            <p>Carga los datos principales y guardalos directamente en Turnify.</p>
          </div>
          <Link to="/profesional" className="registro-link-back">
            Volver al listado
          </Link>
        </div>

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
                />
                {errors.telefono ? (
                  <span className="field-error">{errors.telefono}</span>
                ) : null}
              </div>
            </div>
          </section>

          {submitError ? <div className="submit-error">{submitError}</div> : null}

          <div className="registro-actions">
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar profesional"}
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
      </div>
    </div>
  );
}
