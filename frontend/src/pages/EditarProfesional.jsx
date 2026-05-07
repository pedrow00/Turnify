import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function EditarProfesional() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fotoInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [form, setForm] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [errors, setErrors] = useState({});
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingProfesional, setLoadingProfesional] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

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

  const cargarProfesional = useCallback(async () => {
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
        sexo: profesional.sexo ?? "",
        cuil: profesional.cuil ?? "",
        email: profesional.email ?? "",
        telefono: profesional.telefono ?? "",
        calle: profesional.calle ?? "",
        numero: profesional.numero ?? "",
        codigo_postal: profesional.codigo_postal ?? "",
        piso: profesional.piso ?? "",
        departamento: profesional.departamento ?? "",
        provincia_nombre: profesional.provincia_nombre ?? "",
        localidad_nombre: profesional.localidad_nombre ?? "",
        foto_url: profesional.foto_url ?? "",
      };

      setForm(nextForm);
      setInitialSnapshot(JSON.stringify(nextForm));
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el profesional.");
    } finally {
      setLoadingProfesional(false);
    }
  }, [apiUrl, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarProfesional();
  }, [cargarProfesional]);

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

  const handleAbrirSelectorFoto = () => {
    if (!guardando) {
      fotoInputRef.current?.click();
    }
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
    calle: form.calle.trim(),
    numero: form.numero.trim(),
    codigo_postal: form.codigo_postal.trim(),
    piso: form.piso.trim(),
    departamento: form.departamento.trim(),
    foto_url: form.foto_url.trim(),
  });
  const isDirty = formSnapshot !== initialSnapshot;
  const canSubmit =
    !guardando && !loadingProfesional && !loadingProvincias && !loadError && isDirty;

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
            <button
              type="button"
              className="registro-summary-avatar registro-summary-avatar-button"
              onClick={handleAbrirSelectorFoto}
              aria-label="Cambiar foto del profesional"
              disabled={guardando}
            >
              {form.foto_url ? (
                <img src={form.foto_url} alt="Foto del profesional" />
              ) : (
                <span>{iniciales || "P"}</span>
              )}
            </button>
            <div className="registro-summary-content">
              <span className="registro-summary-label">Profesional en edicion</span>
              <h2>{nombreCompleto || "Profesional sin nombre"}</h2>
              <p>
                {form.cuil ? `CUIL ${form.cuil}` : "Completa los datos identificatorios"} -{" "}
                {isDirty ? "Hay cambios sin guardar" : "Sin cambios pendientes"}
              </p>
            </div>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFotoChange}
              className="foto-input"
            />
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

                <div className="field">
                  <label htmlFor="sexo">Sexo</label>
                  <select
                    id="sexo"
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className={errors.sexo ? "input-error" : ""}
                    disabled={guardando}
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
                    disabled={loadingProvincias || guardando}
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
                    disabled={!form.provincia_nombre || loadingLocalidades || guardando}
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
                    disabled={guardando}
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
                    disabled={guardando}
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
                    disabled={guardando}
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
                    disabled={guardando}
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
                    disabled={guardando}
                  />
                </div>

                <div className="field field-full">
                  <span className="field-label">Foto</span>
                  <div className="foto-uploader">
                    <button
                      type="button"
                      className="foto-preview"
                      onClick={handleAbrirSelectorFoto}
                      disabled={guardando}
                    >
                      {form.foto_url ? (
                        <img src={form.foto_url} alt="Vista previa del profesional" />
                      ) : (
                        <span>Agregar foto</span>
                      )}
                    </button>
                    <div className="foto-controls">
                      <button
                        type="button"
                        className="btn-secondary foto-button"
                        onClick={handleAbrirSelectorFoto}
                        disabled={guardando}
                      >
                        Elegir desde la compu
                      </button>
                      {form.foto_url ? (
                        <button
                          type="button"
                          className="btn-secondary foto-button"
                          onClick={handleQuitarFoto}
                          disabled={guardando}
                        >
                          Quitar foto
                        </button>
                      ) : null}
                      <p>Tambien podes tocar el avatar de arriba para cambiarla.</p>
                    </div>
                  </div>
                  {errors.foto_url ? (
                    <span className="field-error">{errors.foto_url}</span>
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
