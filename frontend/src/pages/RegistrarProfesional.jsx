import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/RegistrarPaciente.css";

const API_GOBIERNO_BASE_URL = "https://apis.datos.gob.ar/georef/api";
const FOTO_MAX_SIZE = 2 * 1024 * 1024;
const FOTO_FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const initialForm = {
  nombre: "",
  apellido: "",
  sexo: "",
  cuil: "",
  email: "",
  telefono: "",
  calle: "",
  numero: "",
  codigo_postal: "",
  piso: "",
  departamento: "",
  provincia_nombre: "",
  localidad_nombre: "",
  foto_url: "",
};

export default function RegistrarProfesional() {
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
    if (!form.provincia_nombre) {
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
  }, [form.provincia_nombre]);

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
    setForm((currentForm) => ({
      ...currentForm,
      provincia_nombre: event.target.value,
      localidad_nombre: "",
    }));

    clearFieldError("provincia_nombre");
    clearFieldError("localidad_nombre");
    setSubmitError("");
  };

  const handleFotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!FOTO_FORMATOS_VALIDOS.includes(file.type)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        foto_url: "Selecciona una imagen JPG, PNG, WEBP o GIF.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > FOTO_MAX_SIZE) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        foto_url: "La imagen no puede superar los 2 MB.",
      }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((currentForm) => ({
        ...currentForm,
        foto_url: String(reader.result || ""),
      }));
      clearFieldError("foto_url");
      setSubmitError("");
      event.target.value = "";
    };

    reader.onerror = () => {
      setErrors((currentErrors) => ({
        ...currentErrors,
        foto_url: "No se pudo cargar la imagen.",
      }));
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleQuitarFoto = () => {
    setForm((currentForm) => ({
      ...currentForm,
      foto_url: "",
    }));
    clearFieldError("foto_url");
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

    if (!form.sexo) {
      nuevosErrores.sexo = "Selecciona el sexo.";
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

    if (form.numero.trim() && !/^\d+$/.test(form.numero.trim())) {
      nuevosErrores.numero = "El numero debe contener solo digitos.";
    }

    if (form.codigo_postal.trim() && !/^[A-Za-z0-9 -]{4,12}$/.test(form.codigo_postal.trim())) {
      nuevosErrores.codigo_postal = "Ingresa un codigo postal valido.";
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
        sexo: form.sexo,
        cuil: form.cuil.trim(),
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        calle: form.calle.trim() || null,
        numero: form.numero.trim() || null,
        codigo_postal: form.codigo_postal.trim() || null,
        piso: form.piso.trim() || null,
        departamento: form.departamento.trim() || null,
        provincia_nombre: form.provincia_nombre || null,
        localidad_nombre: form.localidad_nombre || null,
        foto_url: form.foto_url.trim() || null,
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

              <div className="field">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={form.sexo}
                  onChange={handleChange}
                  className={errors.sexo ? "input-error" : ""}
                >
                  <option value="">Selecciona una opcion</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="X">No binario / X</option>
                </select>
                {errors.sexo ? <span className="field-error">{errors.sexo}</span> : null}
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

          <section className="registro-section">
            <div className="section-heading">
              <h2>Ubicacion</h2>
              <p>Provincia, localidad y domicilio del profesional.</p>
            </div>

            <div className="registro-grid">
              <div className="field">
                <label htmlFor="provincia_nombre">Provincia</label>
                <select
                  id="provincia_nombre"
                  name="provincia_nombre"
                  value={form.provincia_nombre}
                  onChange={handleProvinciaChange}
                  className={errors.provincia_nombre ? "input-error" : ""}
                  disabled={loadingProvincias}
                >
                  <option value="">
                    {loadingProvincias ? "Cargando provincias..." : "Selecciona una provincia"}
                  </option>
                  {provincias.map((provincia) => (
                    <option key={provincia.id} value={provincia.nombre}>
                      {provincia.nombre}
                    </option>
                  ))}
                </select>
                {errors.provincia_nombre ? (
                  <span className="field-error">{errors.provincia_nombre}</span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="localidad_nombre">Localidad</label>
                <select
                  id="localidad_nombre"
                  name="localidad_nombre"
                  value={form.localidad_nombre}
                  onChange={handleChange}
                  className={errors.localidad_nombre ? "input-error" : ""}
                  disabled={!form.provincia_nombre || loadingLocalidades}
                >
                  <option value="">
                    {!form.provincia_nombre
                      ? "Primero selecciona una provincia"
                      : loadingLocalidades
                        ? "Cargando localidades..."
                        : "Selecciona una localidad"}
                  </option>
                  {localidades.map((localidad) => (
                    <option key={localidad.id} value={localidad.nombre}>
                      {localidad.nombre}
                    </option>
                  ))}
                </select>
                {errors.localidad_nombre ? (
                  <span className="field-error">{errors.localidad_nombre}</span>
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
                <label htmlFor="departamento">Departamento</label>
                <input
                  id="departamento"
                  name="departamento"
                  type="text"
                  value={form.departamento}
                  onChange={handleChange}
                  placeholder="B"
                />
              </div>

              <div className="field field-full">
                <span className="field-label">Foto</span>
                <div className="foto-uploader">
                  <label htmlFor="foto_archivo" className="foto-preview">
                    {form.foto_url ? (
                      <img src={form.foto_url} alt="Vista previa del profesional" />
                    ) : (
                      <span>Agregar foto</span>
                    )}
                  </label>
                  <div className="foto-controls">
                    <label htmlFor="foto_archivo" className="btn-secondary foto-button">
                      Elegir desde la compu
                    </label>
                    {form.foto_url ? (
                      <button type="button" className="btn-secondary foto-button" onClick={handleQuitarFoto}>
                        Quitar foto
                      </button>
                    ) : null}
                    <p>JPG, PNG, WEBP o GIF. Maximo 2 MB.</p>
                  </div>
                  <input
                    id="foto_archivo"
                    name="foto_archivo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFotoChange}
                    className="foto-input"
                  />
                </div>
                {errors.foto_url ? <span className="field-error">{errors.foto_url}</span> : null}
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
