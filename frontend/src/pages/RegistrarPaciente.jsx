import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/RegistrarPaciente.css";

const API_GOBIERNO_BASE_URL = "https://apis.datos.gob.ar/georef/api";

const initialForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  provincia_id: "",
  provincia_nombre: "",
  localidad_id: "",
  localidad_nombre: "",
  calle: "",
  numero: "",
  codigo_postal: "",
  piso: "",
  dpto: "",
  observaciones: "",
};

export default function RegistrarPaciente() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        const response = await fetch(
          `${API_GOBIERNO_BASE_URL}/provincias?campos=id,nombre&max=100`
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las provincias");
        }

        const data = await response.json();
        const provinciasOrdenadas = [...(data.provincias ?? [])].sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );

        setProvincias(provinciasOrdenadas);
      } catch {
        setSubmitError("No se pudieron cargar las provincias.");
      } finally {
        setLoadingProvincias(false);
      }
    };

    cargarProvincias();
  }, []);

  useEffect(() => {
    if (!form.provincia_id || !form.provincia_nombre) {
      return;
    }

    const cargarLocalidades = async () => {
      try {
        setLoadingLocalidades(true);

        const response = await fetch(
          `${API_GOBIERNO_BASE_URL}/localidades?provincia=${encodeURIComponent(
            form.provincia_nombre
          )}&campos=id,nombre&max=5000`
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las localidades");
        }

        const data = await response.json();
        const localidadesOrdenadas = [...(data.localidades ?? [])].sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );

        setLocalidades(localidadesOrdenadas);
      } catch {
        setLocalidades([]);
        setSubmitError("No se pudieron cargar las localidades.");
      } finally {
        setLoadingLocalidades(false);
      }
    };

    cargarLocalidades();
  }, [form.provincia_id, form.provincia_nombre]);

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

  const handleProvinciaChange = (event) => {
    const provinciaId = event.target.value;
    const provinciaSeleccionada = provincias.find(
      (provincia) => String(provincia.id) === provinciaId
    );

    setForm((currentForm) => ({
      ...currentForm,
      provincia_id: provinciaId,
      provincia_nombre: provinciaSeleccionada?.nombre ?? "",
      localidad_id: "",
      localidad_nombre: "",
    }));

    clearFieldError("provincia_id");
    clearFieldError("localidad_id");
    setSubmitError("");
  };

  const handleLocalidadChange = (event) => {
    const localidadId = event.target.value;
    const localidadSeleccionada = localidades.find(
      (localidad) => String(localidad.id) === localidadId
    );

    setForm((currentForm) => ({
      ...currentForm,
      localidad_id: localidadId,
      localidad_nombre: localidadSeleccionada?.nombre ?? "",
    }));

    clearFieldError("localidad_id");
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

    if (!form.dni.trim()) {
      nuevosErrores.dni = "El DNI es obligatorio.";
    } else if (!/^\d{7,15}$/.test(form.dni.trim())) {
      nuevosErrores.dni = "El DNI debe tener entre 7 y 15 digitos.";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevosErrores.email = "Ingresa un email valido.";
    }

    if (form.telefono.trim() && !/^\d{6,15}$/.test(form.telefono.trim())) {
      nuevosErrores.telefono = "El telefono debe tener entre 6 y 15 digitos.";
    }

    if (form.numero.trim() && !/^\d+$/.test(form.numero.trim())) {
      nuevosErrores.numero = "El numero debe contener solo digitos.";
    }

    if (form.codigo_postal.trim() && !/^[A-Za-z0-9 -]{4,12}$/.test(form.codigo_postal.trim())) {
      nuevosErrores.codigo_postal = "Ingresa un codigo postal valido.";
    }

    if (!form.fecha_nacimiento) {
      nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria.";
    } else {
      const fechaSeleccionada = new Date(`${form.fecha_nacimiento}T00:00:00`);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (Number.isNaN(fechaSeleccionada.getTime()) || fechaSeleccionada >= hoy) {
        nuevosErrores.fecha_nacimiento = "Ingresa una fecha valida anterior a hoy.";
      }
    }

    if (!form.provincia_id) {
      nuevosErrores.provincia_id = "Selecciona una provincia.";
    }

    if (!form.localidad_id) {
      nuevosErrores.localidad_id = "Selecciona una localidad.";
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
        dni: form.dni.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento,
        provincia_id: form.provincia_id,
        provincia_nombre: form.provincia_nombre,
        localidad_id: form.localidad_id,
        localidad_nombre: form.localidad_nombre,
        calle: form.calle.trim() || null,
        numero: form.numero.trim() || null,
        codigo_postal: form.codigo_postal.trim() || null,
        piso: form.piso.trim() || null,
        dpto: form.dpto.trim() || null,
        observaciones: form.observaciones.trim() || null,
      };

      const response = await fetch(`${apiUrl}/pacientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo registrar el paciente.");
      }

      navigate("/paciente");
    } catch (error) {
      setSubmitError(error.message || "No se pudo registrar el paciente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="registro-paciente-page">
      <div className="registro-paciente-shell">
        <div className="registro-paciente-header">
          <div>
            <span className="registro-badge">Nuevo paciente</span>
            <h1>Registrar paciente</h1>
            <p>Carga los datos basicos y guardalos directamente en Turnify.</p>
          </div>
          <Link to="/paciente" className="registro-link-back">
            Volver al listado
          </Link>
        </div>

        <form className="registro-paciente-form" onSubmit={handleSubmit}>
          <section className="registro-section">
            <div className="section-heading">
              <h2>Datos personales</h2>
              <p>La informacion principal para identificar al paciente.</p>
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
                <label htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  name="dni"
                  type="text"
                  inputMode="numeric"
                  value={form.dni}
                  onChange={handleChange}
                  placeholder="35123456"
                  className={errors.dni ? "input-error" : ""}
                />
                {errors.dni ? <span className="field-error">{errors.dni}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                <input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  className={errors.fecha_nacimiento ? "input-error" : ""}
                />
                {errors.fecha_nacimiento ? (
                  <span className="field-error">{errors.fecha_nacimiento}</span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="registro-section">
            <div className="section-heading">
              <h2>Contacto</h2>
              <p>Datos para comunicacion y seguimiento.</p>
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
                  placeholder="juan@email.com"
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

          <section className="registro-section">
            <div className="section-heading">
              <h2>Ubicacion</h2>
              <p>Provincia, localidad y domicilio del paciente.</p>
            </div>

            <div className="registro-grid">
              <div className="field">
                <label htmlFor="provincia">Provincia</label>
                <select
                  id="provincia"
                  name="provincia"
                  value={form.provincia_id}
                  onChange={handleProvinciaChange}
                  className={errors.provincia_id ? "input-error" : ""}
                  disabled={loadingProvincias}
                >
                  <option value="">
                    {loadingProvincias ? "Cargando provincias..." : "Selecciona una provincia"}
                  </option>
                  {provincias.map((provincia) => (
                    <option key={provincia.id} value={provincia.id}>
                      {provincia.nombre}
                    </option>
                  ))}
                </select>
                {errors.provincia_id ? (
                  <span className="field-error">{errors.provincia_id}</span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="localidad">Localidad</label>
                <select
                  id="localidad"
                  name="localidad"
                  value={form.localidad_id}
                  onChange={handleLocalidadChange}
                  className={errors.localidad_id ? "input-error" : ""}
                  disabled={!form.provincia_id || loadingLocalidades}
                >
                  <option value="">
                    {!form.provincia_id
                      ? "Primero selecciona una provincia"
                      : loadingLocalidades
                        ? "Cargando localidades..."
                        : "Selecciona una localidad"}
                  </option>
                  {localidades.map((localidad) => (
                    <option key={localidad.id} value={localidad.id}>
                      {localidad.nombre}
                    </option>
                  ))}
                </select>
                {errors.localidad_id ? (
                  <span className="field-error">{errors.localidad_id}</span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="calle">Calle</label>
                <input
                  id="calle"
                  name="calle"
                  type="text"
                  value={form.calle}
                  onChange={handleChange}
                  placeholder="Av. San Martin"
                />
              </div>

              <div className="field">
                <label htmlFor="numero">Numero</label>
                <input
                  id="numero"
                  name="numero"
                  type="text"
                  inputMode="numeric"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="1234"
                  className={errors.numero ? "input-error" : ""}
                />
                {errors.numero ? <span className="field-error">{errors.numero}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="codigo_postal">Codigo postal</label>
                <input
                  id="codigo_postal"
                  name="codigo_postal"
                  type="text"
                  value={form.codigo_postal}
                  onChange={handleChange}
                  placeholder="5000"
                  className={errors.codigo_postal ? "input-error" : ""}
                />
                {errors.codigo_postal ? (
                  <span className="field-error">{errors.codigo_postal}</span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="piso">Piso</label>
                <input
                  id="piso"
                  name="piso"
                  type="text"
                  value={form.piso}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>

              <div className="field">
                <label htmlFor="dpto">Departamento</label>
                <input
                  id="dpto"
                  name="dpto"
                  type="text"
                  value={form.dpto}
                  onChange={handleChange}
                  placeholder="B"
                />
              </div>
            </div>
          </section>

          <section className="registro-section">
            <div className="section-heading">
              <h2>Observaciones</h2>
              <p>Notas internas para completar la ficha del paciente.</p>
            </div>

            <div className="registro-grid">
              <div className="field field-full">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder="Alergias, indicaciones o referencias relevantes"
                  rows="4"
                />
              </div>
            </div>
          </section>

          {submitError ? <div className="submit-error">{submitError}</div> : null}

          <div className="registro-actions">
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar paciente"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/paciente")}
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
