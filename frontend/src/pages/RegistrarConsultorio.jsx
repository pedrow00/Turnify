import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/RegistrarConsultorio.css";

const initialForm = {
  numero_consultorio: "",
  piso: "",
  ubicacion: "",
  activo: true,
};

export default function RegistrarConsultorio() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const clearFieldError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name);
    setSubmitError("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.numero_consultorio.trim()) {
      nuevosErrores.numero_consultorio = "El número es obligatorio.";
    } else if (!/^\d+$/.test(form.numero_consultorio)) {
      nuevosErrores.numero_consultorio = "Solo números.";
    }

    if (!form.piso.trim()) {
      nuevosErrores.piso = "El piso es obligatorio.";
    }

    if (!form.ubicacion.trim()) {
      nuevosErrores.ubicacion = "La ubicación es obligatoria.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      setSubmitError("");

      const payload = {
        numero_consultorio: Number(form.numero_consultorio),
        piso: form.piso.trim(),
        ubicacion: form.ubicacion.trim(),
        activo: form.activo,
      };

      const response = await fetch(`${apiUrl}/consultorios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo registrar el consultorio.");
      }

      navigate("/consultorio");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="registro-consultorio-page">
      <div className="registro-consultorio-shell">

        {/* HEADER */}
        <div className="registro-consultorio-header">
          <div>
            <span className="registro-badge">Nuevo consultorio</span>
            <h1>Registrar consultorio</h1>
            <p>Agrega un nuevo consultorio al sistema.</p>
          </div>

          <Link to="/consultorio" className="registro-link-back">
            Volver al listado
          </Link>
        </div>

        {/* FORM */}
        <form className="registro-consultorio-form" onSubmit={handleSubmit}>

          <section className="registro-section">
            <div className="section-heading">
              <h2>Datos del consultorio</h2>
              <p>Información básica del consultorio.</p>
            </div>

            <div className="registro-grid">

              <div className="field">
                <label>Número</label>
                <input
                  name="numero_consultorio"
                  value={form.numero_consultorio}
                  onChange={handleChange}
                  placeholder="101"
                  className={errors.numero_consultorio ? "input-error" : ""}
                />
                {errors.numero_consultorio && (
                  <span className="field-error">{errors.numero_consultorio}</span>
                )}
              </div>

              <div className="field">
                <label>Piso</label>
                <input
                  name="piso"
                  value={form.piso}
                  onChange={handleChange}
                  placeholder="1"
                  className={errors.piso ? "input-error" : ""}
                />
                {errors.piso && (
                  <span className="field-error">{errors.piso}</span>
                )}
              </div>

              <div className="field">
                <label>Ubicación</label>
                <input
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  placeholder="Ala Norte"
                  className={errors.ubicacion ? "input-error" : ""}
                />
                {errors.ubicacion && (
                  <span className="field-error">{errors.ubicacion}</span>
                )}
              </div>

              <div className="field">
                <label>Estado</label>
                <select
                  name="activo"
                  value={form.activo}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

            </div>
          </section>

          {submitError && <div className="submit-error">{submitError}</div>}

          <div className="registro-actions">
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar consultorio"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/consultorio")}
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