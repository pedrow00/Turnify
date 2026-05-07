import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/RegistrarConsultorio.css";

const initialForm = {
  numero_consultorio: "",
  piso: "",
  ubicacion: "",
  activo: true,
};

export default function EditarConsultorio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [form, setForm] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

  // 🔹 CARGAR CONSULTORIO
  const cargarConsultorio = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(`${apiUrl}/consultorios/${id}`);

      if (!response.ok) {
        throw new Error("No se pudo cargar el consultorio");
      }

      const data = await response.json();

      const nextForm = {
        numero_consultorio: data.numero_consultorio ?? "",
        piso: data.piso ?? "",
        ubicacion: data.ubicacion ?? "",
        activo: data.activo ?? true,
      };

      setForm(nextForm);
      setInitialSnapshot(JSON.stringify(nextForm));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, id]);

  useEffect(() => {
    cargarConsultorio();
  }, [cargarConsultorio]);

  // 🔹 HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  // 🔹 VALIDACION
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.numero_consultorio.trim()) {
      nuevosErrores.numero_consultorio = "El numero es obligatorio";
    } else if (!/^\d+$/.test(form.numero_consultorio)) {
      nuevosErrores.numero_consultorio = "Debe ser numerico";
    }

    if (form.piso && !/^\d+$/.test(form.piso)) {
      nuevosErrores.piso = "El piso debe ser numerico";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      setSubmitError("");

      const payload = {
        numero_consultorio: form.numero_consultorio.trim(),
        piso: form.piso || null,
        ubicacion: form.ubicacion || null,
        activo: form.activo,
      };

      const response = await fetch(`${apiUrl}/consultorios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar");
      }

      navigate("/consultorio");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  // 🔹 DETECTAR CAMBIOS
  const isDirty = JSON.stringify(form) !== initialSnapshot;

  return (
    <div className="registro-consultorio-page">
      <div className="registro-consultorio-shell">
        
        {/* HEADER */}
        <div className="registro-consultorio-header">
          <div>
            <span className="registro-badge">Editar consultorio</span>
            <h1>Actualizar consultorio</h1>
            <p>Modifica los datos del consultorio.</p>
          </div>

          <Link to="/consultorio" className="registro-link-back">
            Volver
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="registro-section">
            <p>Cargando...</p>
          </div>
        ) : loadError ? (
          <div className="registro-section">
            <p>{loadError}</p>
            <button onClick={cargarConsultorio} className="btn-primary">
              Reintentar
            </button>
          </div>
        ) : (
          <form className="registro-consultorio-form" onSubmit={handleSubmit}>
            
            <section className="registro-section">
              <div className="section-heading">
                <h2>Datos del consultorio</h2>
                <p>Informacion basica del consultorio</p>
              </div>

              <div className="registro-grid">

                <div className="field">
                  <label>Numero</label>
                  <input
                    name="numero_consultorio"
                    value={form.numero_consultorio}
                    onChange={handleChange}
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
                    className={errors.piso ? "input-error" : ""}
                  />
                  {errors.piso && <span className="field-error">{errors.piso}</span>}
                </div>

                <div className="field">
                  <label>Ubicacion</label>
                  <input
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>Activo</label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={form.activo}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </section>

            {submitError && <div className="submit-error">{submitError}</div>}

            <div className="registro-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={!isDirty || guardando}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/consultorio")}
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