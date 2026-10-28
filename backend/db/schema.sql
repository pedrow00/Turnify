-- Turnify - estructura de la base de datos.
-- GENERADO con pg_dump --schema-only. No editar a mano: ver db/README.md.

--
-- PostgreSQL database dump
--

\restrict s7HCZCXq1yCqyWXWJhUTevpUJeO3m4ETRECZHSyJRazEgN3g0X2zinmgQBAHnfL

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: consultorio_especialidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultorio_especialidades (
    id integer NOT NULL,
    consultorio_id integer,
    especialidad_id integer
);


--
-- Name: consultorio_especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consultorio_especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consultorio_especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consultorio_especialidades_id_seq OWNED BY public.consultorio_especialidades.id;


--
-- Name: consultorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultorios (
    id integer NOT NULL,
    numero_consultorio character varying(20) NOT NULL,
    piso character varying(10) NOT NULL,
    ubicacion character varying(150) NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    especialidad_id integer
);


--
-- Name: consultorios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consultorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consultorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consultorios_id_seq OWNED BY public.consultorios.id;


--
-- Name: especialidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.especialidades (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.especialidades_id_seq OWNED BY public.especialidades.id;


--
-- Name: horarios_consultorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.horarios_consultorios (
    id integer NOT NULL,
    consultorio_id integer,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: horarios_consultorios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.horarios_consultorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: horarios_consultorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.horarios_consultorios_id_seq OWNED BY public.horarios_consultorios.id;


--
-- Name: horarios_profesionales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.horarios_profesionales (
    id integer NOT NULL,
    profesional_id integer,
    dia character varying(20) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: horarios_profesionales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.horarios_profesionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: horarios_profesionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.horarios_profesionales_id_seq OWNED BY public.horarios_profesionales.id;


--
-- Name: obras_sociales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obras_sociales (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: obras_sociales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.obras_sociales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: obras_sociales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.obras_sociales_id_seq OWNED BY public.obras_sociales.id;


--
-- Name: paciente_obras_sociales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paciente_obras_sociales (
    id integer NOT NULL,
    paciente_id integer,
    obra_social_id integer
);


--
-- Name: paciente_obras_sociales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paciente_obras_sociales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paciente_obras_sociales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paciente_obras_sociales_id_seq OWNED BY public.paciente_obras_sociales.id;


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pacientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    dni character varying(20) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(20),
    fecha_nacimiento date NOT NULL,
    calle character varying(150),
    numero character varying(20),
    codigo_postal character varying(10),
    piso character varying(10),
    dpto character varying(10),
    provincia_id character varying(10) NOT NULL,
    provincia_nombre character varying(100),
    localidad_id character varying(20) NOT NULL,
    localidad_nombre character varying(100),
    observaciones text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone,
    tipo_contacto character varying(30) DEFAULT 'personal'::character varying
);


--
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pacientes_id_seq OWNED BY public.pacientes.id;


--
-- Name: profesional_consultorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesional_consultorios (
    id integer NOT NULL,
    profesional_id integer,
    consultorio_id integer,
    activo boolean DEFAULT true
);


--
-- Name: profesional_consultorios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesional_consultorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesional_consultorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesional_consultorios_id_seq OWNED BY public.profesional_consultorios.id;


--
-- Name: profesional_especialidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesional_especialidades (
    id integer NOT NULL,
    profesional_id integer,
    especialidad_id integer,
    matricula character varying(50),
    es_principal boolean DEFAULT false
);


--
-- Name: profesional_especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesional_especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesional_especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesional_especialidades_id_seq OWNED BY public.profesional_especialidades.id;


--
-- Name: profesionales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesionales (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    sexo character varying(20),
    cuil character varying(20) NOT NULL,
    matricula character varying(50),
    email character varying(150) NOT NULL,
    telefono character varying(20),
    calle character varying(150),
    numero character varying(20),
    codigo_postal character varying(10),
    piso character varying(10),
    departamento character varying(10),
    provincia_nombre character varying(100),
    localidad_nombre character varying(100),
    foto_url text,
    especialidad_id integer,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone,
    fecha_baja timestamp without time zone,
    indisponibilidad_desde date,
    indisponibilidad_hasta date,
    indisponibilidad_motivo text,
    CONSTRAINT chk_profesional_indisponibilidad_rango CHECK ((((indisponibilidad_desde IS NULL) AND (indisponibilidad_hasta IS NULL)) OR ((indisponibilidad_desde IS NOT NULL) AND (indisponibilidad_hasta IS NOT NULL) AND (indisponibilidad_desde <= indisponibilidad_hasta))))
);


--
-- Name: profesionales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesionales_id_seq OWNED BY public.profesionales.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: turnos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.turnos (
    id integer NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    paciente_id integer NOT NULL,
    profesional_id integer NOT NULL,
    consultorio_id integer NOT NULL,
    especialidad_id integer NOT NULL,
    estado character varying(50) DEFAULT 'confirmado'::character varying,
    motivo_consulta text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone
);


--
-- Name: turnos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.turnos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: turnos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.turnos_id_seq OWNED BY public.turnos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(150),
    password_hash text,
    rol_id integer,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    profesional_id integer,
    activo boolean DEFAULT true NOT NULL,
    fecha_baja timestamp with time zone,
    nombre character varying(100),
    apellido character varying(100),
    nombre_usuario character varying(50),
    cuil character varying(11)
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: consultorio_especialidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorio_especialidades ALTER COLUMN id SET DEFAULT nextval('public.consultorio_especialidades_id_seq'::regclass);


--
-- Name: consultorios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorios ALTER COLUMN id SET DEFAULT nextval('public.consultorios_id_seq'::regclass);


--
-- Name: especialidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades ALTER COLUMN id SET DEFAULT nextval('public.especialidades_id_seq'::regclass);


--
-- Name: horarios_consultorios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios_consultorios ALTER COLUMN id SET DEFAULT nextval('public.horarios_consultorios_id_seq'::regclass);


--
-- Name: horarios_profesionales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios_profesionales ALTER COLUMN id SET DEFAULT nextval('public.horarios_profesionales_id_seq'::regclass);


--
-- Name: obras_sociales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obras_sociales ALTER COLUMN id SET DEFAULT nextval('public.obras_sociales_id_seq'::regclass);


--
-- Name: paciente_obras_sociales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paciente_obras_sociales ALTER COLUMN id SET DEFAULT nextval('public.paciente_obras_sociales_id_seq'::regclass);


--
-- Name: pacientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id SET DEFAULT nextval('public.pacientes_id_seq'::regclass);


--
-- Name: profesional_consultorios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_consultorios ALTER COLUMN id SET DEFAULT nextval('public.profesional_consultorios_id_seq'::regclass);


--
-- Name: profesional_especialidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_especialidades ALTER COLUMN id SET DEFAULT nextval('public.profesional_especialidades_id_seq'::regclass);


--
-- Name: profesionales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesionales ALTER COLUMN id SET DEFAULT nextval('public.profesionales_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: turnos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos ALTER COLUMN id SET DEFAULT nextval('public.turnos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: consultorio_especialidades consultorio_especialidades_consultorio_id_especialidad_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_consultorio_id_especialidad_id_key UNIQUE (consultorio_id, especialidad_id);


--
-- Name: consultorio_especialidades consultorio_especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_pkey PRIMARY KEY (id);


--
-- Name: consultorios consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT consultorios_pkey PRIMARY KEY (id);


--
-- Name: especialidades especialidades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_nombre_key UNIQUE (nombre);


--
-- Name: especialidades especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_pkey PRIMARY KEY (id);


--
-- Name: horarios_consultorios horarios_consultorios_consultorio_id_hora_inicio_hora_fin_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios_consultorios
    ADD CONSTRAINT horarios_consultorios_consultorio_id_hora_inicio_hora_fin_key UNIQUE (consultorio_id, hora_inicio, hora_fin);


--
-- Name: horarios_consultorios horarios_consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios_consultorios
    ADD CONSTRAINT horarios_consultorios_pkey PRIMARY KEY (id);


--
-- Name: horarios_profesionales horarios_profesionales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios_profesionales
    ADD CONSTRAINT horarios_profesionales_pkey PRIMARY KEY (id);


--
-- Name: obras_sociales obras_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obras_sociales
    ADD CONSTRAINT obras_sociales_pkey PRIMARY KEY (id);


--
-- Name: paciente_obras_sociales paciente_obras_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_pkey PRIMARY KEY (id);


--
-- Name: pacientes pacientes_dni_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_dni_key UNIQUE (dni);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);


--
-- Name: profesional_consultorios profesional_consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_consultorios
    ADD CONSTRAINT profesional_consultorios_pkey PRIMARY KEY (id);


--
-- Name: profesional_consultorios profesional_consultorios_profesional_id_consultorio_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_consultorios
    ADD CONSTRAINT profesional_consultorios_profesional_id_consultorio_id_key UNIQUE (profesional_id, consultorio_id);


--
-- Name: profesional_especialidades profesional_especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_especialidades
    ADD CONSTRAINT profesional_especialidades_pkey PRIMARY KEY (id);


--
-- Name: profesionales profesionales_cuil_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT profesionales_cuil_key UNIQUE (cuil);


--
-- Name: profesionales profesionales_matricula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT profesionales_matricula_key UNIQUE (matricula);


--
-- Name: profesionales profesionales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT profesionales_pkey PRIMARY KEY (id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_unique UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios_cuil_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_cuil_unique ON public.usuarios USING btree (cuil);


--
-- Name: usuarios_nombre_usuario_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_nombre_usuario_unique ON public.usuarios USING btree (lower((nombre_usuario)::text));


--
-- Name: usuarios_profesional_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_profesional_id_unique ON public.usuarios USING btree (profesional_id);


--
-- Name: consultorio_especialidades consultorio_especialidades_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: consultorios fk_consultorio_especialidad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT fk_consultorio_especialidad FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: profesionales fk_profesional_especialidad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT fk_profesional_especialidad FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: paciente_obras_sociales paciente_obras_sociales_obra_social_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_obra_social_id_fkey FOREIGN KEY (obra_social_id) REFERENCES public.obras_sociales(id);


--
-- Name: paciente_obras_sociales paciente_obras_sociales_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: profesional_consultorios profesional_consultorios_consultorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_consultorios
    ADD CONSTRAINT profesional_consultorios_consultorio_id_fkey FOREIGN KEY (consultorio_id) REFERENCES public.consultorios(id) ON DELETE CASCADE;


--
-- Name: profesional_consultorios profesional_consultorios_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_consultorios
    ADD CONSTRAINT profesional_consultorios_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.profesionales(id) ON DELETE CASCADE;


--
-- Name: profesional_especialidades profesional_especialidades_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesional_especialidades
    ADD CONSTRAINT profesional_especialidades_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: turnos turnos_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: turnos turnos_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id);


--
-- Name: usuarios usuarios_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.profesionales(id) ON DELETE SET NULL;


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict s7HCZCXq1yCqyWXWJhUTevpUJeO3m4ETRECZHSyJRazEgN3g0X2zinmgQBAHnfL

