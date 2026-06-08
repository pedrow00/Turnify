import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/RegistrarPaciente.css";
import {
  crearHorarioVacio,
  diasSemana,
  getHorariosError,
  normalizarHorariosDesdeApi,
  prepararHorariosPayload,
} from "../utils/horariosProfesionales";
import { apiGet, apiPut } from "../utils/api";

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

const crearEspecialidadProfesional = () => ({
  especialidad_id: "",
  matricula: "",
  es_principal: true,
});

export default function EditarProfesional() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fotoInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [especialidadesProfesional, setEspecialidadesProfesional] = useState([
    crearEspecialidadProfesional(),
  ]);
  const [consultorioIds, setConsultorioIds] = useState([]);
  const [horarios, setHorarios] = useState([crearHorarioVacio()]);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [errors, setErrors] = useState({});
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [loadingProfesional, setLoadingProfesional] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const cargarDatosProfesionales = async () => {
      try {
        const data = await apiGet("/especialidades");
        const consultoriosData = await apiGet("/consultorios");
        setEspecialidades(data);
        setConsultorios(consultoriosData);
      } catch {
        setSubmitError("No se pudieron cargar las especialidades y consultorios.");
      } finally {
        setLoadingEspecialidades(false);
      }
    };

    cargarDatosProfesionales();
  }, []);

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

      const profesional = await apiGet(`/profesionales/${id}`);
      const nextHorarios = normalizarHorariosDesdeApi(profesional.horarios);
      const nextEspecialidades = Array.isArray(profesional.especialidades) && profesional.especialidades.length > 0
        ? profesional.especialidades.map((especialidad) => ({
            especialidad_id: String(especialidad.id),
            matricula: especialidad.matricula ?? "",
            es_principal: especialidad.es_principal === true,
          }))
        : [
            {
              especialidad_id: profesional.especialidad_id ? String(profesional.especialidad_id) : "",
              matricula: profesional.matricula ?? "",
              es_principal: true,
            },
          ];
      const nextConsultorioIds = Array.isArray(profesional.consultorios)
        ? profesional.consultorios.map((consultorio) => consultorio.id)
        : [];
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
      setEspecialidadesProfesional(
        nextEspecialidades.some((especialidad) => especialidad.es_principal)
          ? nextEspecialidades
          : nextEspecialidades.map((especialidad, index) => ({
              ...especialidad,
              es_principal: index === 0,
            }))
      );
      setConsultorioIds(nextConsultorioIds);
      setHorarios(nextHorarios.length > 0 ? nextHorarios : [crearHorarioVacio()]);
      setInitialSnapshot(
        JSON.stringify({
          form: nextForm,
          especialidades: nextEspecialidades.map((especialidad) => ({
            especialidad_id: Number(especialidad.especialidad_id),
            matricula: especialidad.matricula.trim(),
            es_principal: especialidad.es_principal,
          })),
          consultorio_ids: nextConsultorioIds,
          horarios: prepararHorariosPayload(nextHorarios.length > 0 ? nextHorarios : [crearHorarioVacio()]),
        })
      );
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el profesional.");
    } finally {
      setLoadingProfesional(false);
    }
  }, [id]);

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

  const handleHorarioChange = (index, fieldName, value) => {
    setHorarios((currentHorarios) =>
      currentHorarios.map((horario, currentIndex) =>
        currentIndex === index ? { ...horario, [fieldName]: value } : horario
      )
    );
    clearFieldError("horarios");
    setSubmitError("");
  };

  const agregarHorario = () => {
    setHorarios((currentHorarios) => [...currentHorarios, crearHorarioVacio()]);
    clearFieldError("horarios");
    setSubmitError("");
  };

  const quitarHorario = (index) => {
    setHorarios((currentHorarios) =>
      currentHorarios.length === 1
        ? [crearHorarioVacio()]
        : currentHorarios.filter((_, currentIndex) => currentIndex !== index)
    );
    clearFieldError("horarios");
    setSubmitError("");
  };

  const especialidadIdsSeleccionadas = especialidadesProfesional
    .map((item) => Number(item.especialidad_id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const consultoriosCompatibles = consultorios.filter((consultorio) => {
    if (consultorio.activo === false || especialidadIdsSeleccionadas.length === 0) {
      return false;
    }

    return consultorio.especialidades?.some((especialidad) =>
      especialidadIdsSeleccionadas.includes(Number(especialidad.id))
    );
  });

  const limpiarConsultoriosIncompatibles = (nextEspecialidades) => {
    const nextEspecialidadIds = nextEspecialidades
      .map((item) => Number(item.especialidad_id))
      .filter((especialidadId) => Number.isInteger(especialidadId) && especialidadId > 0);

    setConsultorioIds((currentIds) =>
      currentIds.filter((consultorioId) => {
        const consultorio = consultorios.find((item) => Number(item.id) === Number(consultorioId));
        return consultorio?.especialidades?.some((especialidad) =>
          nextEspecialidadIds.includes(Number(especialidad.id))
        );
      })
    );
  };

  const handleEspecialidadProfesionalChange = (index, fieldName, value) => {
    setEspecialidadesProfesional((currentItems) => {
      const nextItems = currentItems.map((item, currentIndex) => {
        if (currentIndex !== index) return item;
        return { ...item, [fieldName]: value };
      });

      limpiarConsultoriosIncompatibles(nextItems);
      return nextItems;
    });
    clearFieldError("especialidades");
    setSubmitError("");
  };

  const marcarEspecialidadPrincipal = (index) => {
    setEspecialidadesProfesional((currentItems) =>
      currentItems.map((item, currentIndex) => ({
        ...item,
        es_principal: currentIndex === index,
      }))
    );
    clearFieldError("especialidades");
    setSubmitError("");
  };

  const agregarEspecialidadProfesional = () => {
    setEspecialidadesProfesional((currentItems) => [
      ...currentItems,
      { ...crearEspecialidadProfesional(), es_principal: false },
    ]);
    clearFieldError("especialidades");
    setSubmitError("");
  };

  const quitarEspecialidadProfesional = (index) => {
    setEspecialidadesProfesional((currentItems) => {
      const nextItems = currentItems.length === 1
        ? [crearEspecialidadProfesional()]
        : currentItems.filter((_, currentIndex) => currentIndex !== index);

      if (!nextItems.some((item) => item.es_principal)) {
        nextItems[0] = { ...nextItems[0], es_principal: true };
      }

      limpiarConsultoriosIncompatibles(nextItems);
      return nextItems;
    });
    clearFieldError("especialidades");
    setSubmitError("");
  };

  const handleConsultorioChange = (consultorioId) => {
    setConsultorioIds((currentIds) =>
      currentIds.includes(consultorioId)
        ? currentIds.filter((item) => item !== consultorioId)
        : [...currentIds, consultorioId]
    );
    clearFieldError("consultorio_ids");
    setSubmitError("");
  };

  const prepararEspecialidadesPayload = () =>
    especialidadesProfesional.map((item) => ({
      especialidad_id: Number(item.especialidad_id),
      matricula: item.matricula.trim(),
      es_principal: item.es_principal,
    }));

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

    const especialidadesPayload = prepararEspecialidadesPayload();
    const especialidadIds = especialidadesPayload.map((item) => item.especialidad_id);
    const especialidadesUnicas = new Set(especialidadIds);
    const principales = especialidadesPayload.filter((item) => item.es_principal);

    if (
      especialidadesPayload.some(
        (item) => !item.especialidad_id || !/^[A-Za-z0-9 -]{3,50}$/.test(item.matricula)
      )
    ) {
      nuevosErrores.especialidades = "Completa cada especialidad con una matricula valida.";
    } else if (especialidadesUnicas.size !== especialidadIds.length) {
      nuevosErrores.especialidades = "No repitas especialidades para el mismo profesional.";
    } else if (principales.length !== 1) {
      nuevosErrores.especialidades = "Marca una unica matricula principal.";
    }

    if (consultorioIds.length === 0) {
      nuevosErrores.consultorio_ids = "Selecciona al menos un consultorio compatible.";
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

    const horariosError = getHorariosError(horarios);
    if (horariosError) {
      nuevosErrores.horarios = horariosError;
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
        especialidades: prepararEspecialidadesPayload(),
        consultorio_ids: consultorioIds,
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
        horarios: prepararHorariosPayload(horarios),
      };

      await apiPut(`/profesionales/${id}`, payload);

      setInitialSnapshot(
        JSON.stringify({
          form: {
            ...form,
            email: form.email.trim(),
            telefono: form.telefono.trim(),
            calle: form.calle.trim(),
            numero: form.numero.trim(),
            codigo_postal: form.codigo_postal.trim(),
            piso: form.piso.trim(),
            departamento: form.departamento.trim(),
            foto_url: form.foto_url.trim(),
          },
          especialidades: prepararEspecialidadesPayload(),
          consultorio_ids: consultorioIds,
          horarios: prepararHorariosPayload(horarios),
        })
      );
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
    form: {
      ...form,
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      calle: form.calle.trim(),
      numero: form.numero.trim(),
      codigo_postal: form.codigo_postal.trim(),
      piso: form.piso.trim(),
      departamento: form.departamento.trim(),
      foto_url: form.foto_url.trim(),
    },
    especialidades: prepararEspecialidadesPayload(),
    consultorio_ids: consultorioIds,
    horarios: prepararHorariosPayload(horarios),
  });
  const isDirty = formSnapshot !== initialSnapshot;
  const canSubmit =
    !guardando && !loadingProfesional && !loadingProvincias && !loadingEspecialidades && !loadError && isDirty;

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

                <div className="field field-full">
                  <span className="field-label">Especialidades y matriculas</span>
                  <div className="profesional-especialidades-editor">
                    {especialidadesProfesional.map((item, index) => (
                      <div className="profesional-especialidad-row" key={`especialidad-${index}`}>
                        <div className="field">
                          <label htmlFor={`especialidad-${index}`}>Especialidad</label>
                          <select
                            id={`especialidad-${index}`}
                            value={item.especialidad_id}
                            onChange={(event) =>
                              handleEspecialidadProfesionalChange(index, "especialidad_id", event.target.value)
                            }
                            disabled={loadingEspecialidades || guardando}
                          >
                            <option value="">
                              {loadingEspecialidades ? "Cargando especialidades..." : "Selecciona una especialidad"}
                            </option>
                            {especialidades.map((especialidad) => (
                              <option key={especialidad.id} value={especialidad.id}>
                                {especialidad.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field">
                          <label htmlFor={`matricula-${index}`}>Matricula</label>
                          <input
                            id={`matricula-${index}`}
                            type="text"
                            value={item.matricula}
                            onChange={(event) =>
                              handleEspecialidadProfesionalChange(index, "matricula", event.target.value)
                            }
                            placeholder="MP 12345"
                            disabled={guardando}
                          />
                        </div>

                        <label className="principal-option">
                          <input
                            type="radio"
                            name="especialidad_principal"
                            checked={item.es_principal}
                            onChange={() => marcarEspecialidadPrincipal(index)}
                            disabled={guardando}
                          />
                          <span>Principal</span>
                        </label>

                        <button
                          type="button"
                          className="btn-secondary horario-remove"
                          onClick={() => quitarEspecialidadProfesional(index)}
                          disabled={guardando}
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.especialidades ? (
                    <span className="field-error">{errors.especialidades}</span>
                  ) : null}
                  <button
                    type="button"
                    className="btn-secondary horario-add"
                    onClick={agregarEspecialidadProfesional}
                    disabled={guardando}
                  >
                    + Agregar especialidad
                  </button>
                </div>

                <div className="field field-full">
                  <span className="field-label">Consultorios compatibles</span>
                  <div className={`checkbox-list ${errors.consultorio_ids ? "input-error" : ""}`}>
                    {consultoriosCompatibles.length > 0 ? (
                      consultoriosCompatibles.map((consultorio) => (
                        <label key={consultorio.id} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={consultorioIds.includes(consultorio.id)}
                            onChange={() => handleConsultorioChange(consultorio.id)}
                            disabled={guardando}
                          />
                          <span>
                            Consultorio {consultorio.numero_consultorio} - Piso {consultorio.piso}
                          </span>
                        </label>
                      ))
                    ) : (
                      <span className="checkbox-empty">
                        Selecciona especialidades para ver consultorios compatibles.
                      </span>
                    )}
                  </div>
                  {errors.consultorio_ids ? (
                    <span className="field-error">{errors.consultorio_ids}</span>
                  ) : null}
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

            <section className="registro-section">
              <div className="section-heading">
                <h2>Horarios de atencion</h2>
                <p>Actualiza los dias y rangos disponibles del profesional.</p>
              </div>

              <div className="horarios-editor">
                {horarios.map((horario, index) => (
                  <div className="horario-row" key={`${horario.dia}-${index}`}>
                    <div className="field">
                      <label htmlFor={`horario-dia-${index}`}>Dia</label>
                      <select
                        id={`horario-dia-${index}`}
                        value={horario.dia}
                        onChange={(event) => handleHorarioChange(index, "dia", event.target.value)}
                        disabled={guardando}
                      >
                        {diasSemana.map((dia) => (
                          <option key={dia} value={dia}>
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor={`horario-inicio-${index}`}>Desde</label>
                      <input
                        id={`horario-inicio-${index}`}
                        type="time"
                        value={horario.hora_inicio}
                        onChange={(event) =>
                          handleHorarioChange(index, "hora_inicio", event.target.value)
                        }
                        disabled={guardando}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor={`horario-fin-${index}`}>Hasta</label>
                      <input
                        id={`horario-fin-${index}`}
                        type="time"
                        value={horario.hora_fin}
                        onChange={(event) =>
                          handleHorarioChange(index, "hora_fin", event.target.value)
                        }
                        disabled={guardando}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-secondary horario-remove"
                      onClick={() => quitarHorario(index)}
                      disabled={guardando}
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                {errors.horarios ? <span className="field-error">{errors.horarios}</span> : null}

                <button
                  type="button"
                  className="btn-secondary horario-add"
                  onClick={agregarHorario}
                  disabled={guardando}
                >
                  + Agregar horario
                </button>
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
