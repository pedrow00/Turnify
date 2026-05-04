--
-- PostgreSQL database dump
--

\restrict 0MrYlaQHh82oYnk8J35NuMwxcbHhD9hKJd8AjyZfliMU9HBSyYMFvBvVZncu1eb

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-03 22:37:35

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
-- TOC entry 236 (class 1259 OID 24608)
-- Name: consultorio_especialidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultorio_especialidades (
    id integer NOT NULL,
    consultorio_id integer,
    especialidad_id integer
);


ALTER TABLE public.consultorio_especialidades OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24607)
-- Name: consultorio_especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultorio_especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultorio_especialidades_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 235
-- Name: consultorio_especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultorio_especialidades_id_seq OWNED BY public.consultorio_especialidades.id;


--
-- TOC entry 234 (class 1259 OID 24595)
-- Name: consultorios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultorios (
    id integer NOT NULL,
    numero_consultorio character varying(20) NOT NULL,
    piso character varying(10) NOT NULL,
    ubicacion character varying(150) NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.consultorios OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24594)
-- Name: consultorios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultorios_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 233
-- Name: consultorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultorios_id_seq OWNED BY public.consultorios.id;


--
-- TOC entry 228 (class 1259 OID 16485)
-- Name: especialidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.especialidades (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.especialidades OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16484)
-- Name: especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.especialidades_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 227
-- Name: especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.especialidades_id_seq OWNED BY public.especialidades.id;


--
-- TOC entry 238 (class 1259 OID 24628)
-- Name: horarios_consultorios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horarios_consultorios (
    id integer NOT NULL,
    consultorio_id integer,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.horarios_consultorios OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24627)
-- Name: horarios_consultorios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_consultorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_consultorios_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 237
-- Name: horarios_consultorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_consultorios_id_seq OWNED BY public.horarios_consultorios.id;


--
-- TOC entry 232 (class 1259 OID 24577)
-- Name: horarios_profesionales; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.horarios_profesionales OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24576)
-- Name: horarios_profesionales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_profesionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_profesionales_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 231
-- Name: horarios_profesionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_profesionales_id_seq OWNED BY public.horarios_profesionales.id;


--
-- TOC entry 220 (class 1259 OID 16420)
-- Name: obras_sociales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obras_sociales (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.obras_sociales OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16419)
-- Name: obras_sociales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obras_sociales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obras_sociales_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 219
-- Name: obras_sociales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obras_sociales_id_seq OWNED BY public.obras_sociales.id;


--
-- TOC entry 224 (class 1259 OID 16449)
-- Name: paciente_obras_sociales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paciente_obras_sociales (
    id integer NOT NULL,
    paciente_id integer,
    obra_social_id integer
);


ALTER TABLE public.paciente_obras_sociales OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16448)
-- Name: paciente_obras_sociales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paciente_obras_sociales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paciente_obras_sociales_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 223
-- Name: paciente_obras_sociales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paciente_obras_sociales_id_seq OWNED BY public.paciente_obras_sociales.id;


--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: pacientes; Type: TABLE; Schema: public; Owner: postgres
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
    fecha_modificacion timestamp without time zone
);


ALTER TABLE public.pacientes OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pacientes_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 221
-- Name: pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pacientes_id_seq OWNED BY public.pacientes.id;


--
-- TOC entry 230 (class 1259 OID 16496)
-- Name: profesional_especialidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesional_especialidades (
    id integer NOT NULL,
    profesional_id integer,
    especialidad_id integer,
    matricula character varying(50),
    es_principal boolean DEFAULT false
);


ALTER TABLE public.profesional_especialidades OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16495)
-- Name: profesional_especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesional_especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesional_especialidades_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 229
-- Name: profesional_especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesional_especialidades_id_seq OWNED BY public.profesional_especialidades.id;


--
-- TOC entry 226 (class 1259 OID 16467)
-- Name: profesionales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesionales (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    sexo character varying(20),
    cuil character varying(20) NOT NULL,
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
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone,
    fecha_baja timestamp without time zone
);


ALTER TABLE public.profesionales OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16466)
-- Name: profesionales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesionales_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 225
-- Name: profesionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesionales_id_seq OWNED BY public.profesionales.id;


--
-- TOC entry 242 (class 1259 OID 32808)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 32807)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 241
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 240 (class 1259 OID 24647)
-- Name: turnos; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.turnos OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 24646)
-- Name: turnos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.turnos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.turnos_id_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 239
-- Name: turnos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.turnos_id_seq OWNED BY public.turnos.id;


--
-- TOC entry 244 (class 1259 OID 32844)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(150),
    password_hash text,
    rol_id integer
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 32843)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 243
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4932 (class 2604 OID 24611)
-- Name: consultorio_especialidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorio_especialidades ALTER COLUMN id SET DEFAULT nextval('public.consultorio_especialidades_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 24598)
-- Name: consultorios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios ALTER COLUMN id SET DEFAULT nextval('public.consultorios_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16488)
-- Name: especialidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especialidades ALTER COLUMN id SET DEFAULT nextval('public.especialidades_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 24631)
-- Name: horarios_consultorios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_consultorios ALTER COLUMN id SET DEFAULT nextval('public.horarios_consultorios_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 24580)
-- Name: horarios_profesionales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_profesionales ALTER COLUMN id SET DEFAULT nextval('public.horarios_profesionales_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16423)
-- Name: obras_sociales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras_sociales ALTER COLUMN id SET DEFAULT nextval('public.obras_sociales_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 16452)
-- Name: paciente_obras_sociales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_obras_sociales ALTER COLUMN id SET DEFAULT nextval('public.paciente_obras_sociales_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16432)
-- Name: pacientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id SET DEFAULT nextval('public.pacientes_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 16499)
-- Name: profesional_especialidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_especialidades ALTER COLUMN id SET DEFAULT nextval('public.profesional_especialidades_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 16470)
-- Name: profesionales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesionales ALTER COLUMN id SET DEFAULT nextval('public.profesionales_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 32811)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 24650)
-- Name: turnos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos ALTER COLUMN id SET DEFAULT nextval('public.turnos_id_seq'::regclass);


--
-- TOC entry 4940 (class 2604 OID 32847)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5156 (class 0 OID 24608)
-- Dependencies: 236
-- Data for Name: consultorio_especialidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultorio_especialidades (id, consultorio_id, especialidad_id) FROM stdin;
1	1	1
2	1	2
3	2	1
4	2	2
\.


--
-- TOC entry 5154 (class 0 OID 24595)
-- Dependencies: 234
-- Data for Name: consultorios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultorios (id, numero_consultorio, piso, ubicacion, activo, fecha_creacion) FROM stdin;
1	101	1	Ala Norte	t	2026-03-30 13:03:03.528055
2	101	1	Ala Norte	t	2026-03-30 13:32:35.484308
4	202	2	Ala Sur	t	2026-05-03 22:31:41.368088
5	202	2	Ala Sur	t	2026-05-03 22:32:05.307577
6	202	2	Ala Sur	t	2026-05-03 22:32:15.966671
7	102	2	Ala Sur	t	2026-05-03 22:33:42.293532
\.


--
-- TOC entry 5148 (class 0 OID 16485)
-- Dependencies: 228
-- Data for Name: especialidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.especialidades (id, nombre) FROM stdin;
1	Cardiología
2	Clínica Médica
3	Pediatría
4	Traumatología
5	Dermatología
6	Psicología
\.


--
-- TOC entry 5158 (class 0 OID 24628)
-- Dependencies: 238
-- Data for Name: horarios_consultorios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios_consultorios (id, consultorio_id, hora_inicio, hora_fin, activo, fecha_creacion) FROM stdin;
1	1	08:00:00	09:00:00	t	2026-03-30 13:03:03.528055
2	1	09:00:00	10:00:00	t	2026-03-30 13:03:03.528055
3	2	08:00:00	09:00:00	t	2026-03-30 13:32:35.492781
4	2	09:00:00	10:00:00	t	2026-03-30 13:32:35.493428
\.


--
-- TOC entry 5152 (class 0 OID 24577)
-- Dependencies: 232
-- Data for Name: horarios_profesionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios_profesionales (id, profesional_id, dia, hora_inicio, hora_fin, activo, fecha_creacion) FROM stdin;
1	4	lunes	08:00:00	12:00:00	t	2026-03-28 22:22:10.445538
2	6	lunes	08:00:00	12:00:00	t	2026-03-28 22:23:20.022159
3	6	martes	08:00:00	12:00:00	t	2026-03-28 22:23:20.023689
\.


--
-- TOC entry 5140 (class 0 OID 16420)
-- Dependencies: 220
-- Data for Name: obras_sociales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obras_sociales (id, nombre) FROM stdin;
1	OSDE
2	IOMA
3	PAMI
4	Swiss Medical
5	Galeno
\.


--
-- TOC entry 5144 (class 0 OID 16449)
-- Dependencies: 224
-- Data for Name: paciente_obras_sociales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paciente_obras_sociales (id, paciente_id, obra_social_id) FROM stdin;
\.


--
-- TOC entry 5142 (class 0 OID 16429)
-- Dependencies: 222
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pacientes (id, nombre, apellido, dni, email, telefono, fecha_nacimiento, calle, numero, codigo_postal, piso, dpto, provincia_id, provincia_nombre, localidad_id, localidad_nombre, observaciones, fecha_creacion, fecha_modificacion) FROM stdin;
1	Felipe	Carbon	12345678	pedro@mail.com	351123456	2000-01-01	\N	\N	\N	\N	\N	14	\N	14028	\N	\N	2026-03-27 02:53:03.397052	\N
2	Agustina	Cardozo	44229761	agus@mail.com	351123456	2002-07-07	\N	\N	\N	\N	\N	14	\N	14028	\N	\N	2026-03-28 21:16:52.515105	\N
5	Roberto	Carlos	6787190912	pedro12@test.com	351987654	1995-08-15	San Martin	456	5000	3	A	14	Cordoba	14028	Cordoba Capital	Paciente de prueba	2026-05-03 22:20:16.431475	\N
\.


--
-- TOC entry 5150 (class 0 OID 16496)
-- Dependencies: 230
-- Data for Name: profesional_especialidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesional_especialidades (id, profesional_id, especialidad_id, matricula, es_principal) FROM stdin;
\.


--
-- TOC entry 5146 (class 0 OID 16467)
-- Dependencies: 226
-- Data for Name: profesionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesionales (id, nombre, apellido, sexo, cuil, email, telefono, calle, numero, codigo_postal, piso, departamento, provincia_nombre, localidad_nombre, foto_url, activo, fecha_creacion, fecha_modificacion, fecha_baja) FROM stdin;
1	Juan	Perez	\N	20-12345678-9	juan@mail.com	351123456	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-28 21:46:59.080606	\N	\N
3	wiz	pedro	\N	20-42725678-3	juan@mail.com	351123456	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-28 22:07:58.318989	\N	\N
4	Juan	Perez	\N	20-99999999-9	juan@mail.com	351123456	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-28 22:22:10.438385	\N	\N
6	Juan	Perez	\N	20-9123221-2	juan@mail.com	351123456	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-28 22:23:20.017775	\N	\N
7	Faustino	Lopez	Masculino	20-553312-3	carlos@test.com	351555555	Colon	789	5000	1	A	Cordoba	Cordoba Capital	https://foto.com/perfil.jpg	t	2026-05-03 22:23:19.008469	\N	\N
\.


--
-- TOC entry 5162 (class 0 OID 32808)
-- Dependencies: 242
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre) FROM stdin;
1	Admin
2	Socio
3	Secretaria
4	Profesional
\.


--
-- TOC entry 5160 (class 0 OID 24647)
-- Dependencies: 240
-- Data for Name: turnos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turnos (id, fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, estado, motivo_consulta, fecha_creacion, fecha_modificacion) FROM stdin;
1	2026-03-30	08:00:00	09:00:00	2	3	1	1	confirmado	Control	2026-03-30 16:02:47.060122	\N
2	2026-04-30	08:00:00	10:00:00	1	3	2	2	confirmado	Problemas con el Alcohol	2026-03-30 16:20:49.039718	\N
\.


--
-- TOC entry 5164 (class 0 OID 32844)
-- Dependencies: 244
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, password_hash, rol_id) FROM stdin;
\.


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 235
-- Name: consultorio_especialidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultorio_especialidades_id_seq', 6, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 233
-- Name: consultorios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultorios_id_seq', 7, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 227
-- Name: especialidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.especialidades_id_seq', 6, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 237
-- Name: horarios_consultorios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_consultorios_id_seq', 6, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 231
-- Name: horarios_profesionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_profesionales_id_seq', 3, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 219
-- Name: obras_sociales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obras_sociales_id_seq', 5, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 223
-- Name: paciente_obras_sociales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paciente_obras_sociales_id_seq', 1, false);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 221
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 5, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 229
-- Name: profesional_especialidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesional_especialidades_id_seq', 1, false);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 225
-- Name: profesionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesionales_id_seq', 7, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 241
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 239
-- Name: turnos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.turnos_id_seq', 2, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 243
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4964 (class 2606 OID 24616)
-- Name: consultorio_especialidades consultorio_especialidades_consultorio_id_especialidad_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_consultorio_id_especialidad_id_key UNIQUE (consultorio_id, especialidad_id);


--
-- TOC entry 4966 (class 2606 OID 24614)
-- Name: consultorio_especialidades consultorio_especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 24606)
-- Name: consultorios consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorios
    ADD CONSTRAINT consultorios_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16494)
-- Name: especialidades especialidades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_nombre_key UNIQUE (nombre);


--
-- TOC entry 4956 (class 2606 OID 16492)
-- Name: especialidades especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 24640)
-- Name: horarios_consultorios horarios_consultorios_consultorio_id_hora_inicio_hora_fin_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_consultorios
    ADD CONSTRAINT horarios_consultorios_consultorio_id_hora_inicio_hora_fin_key UNIQUE (consultorio_id, hora_inicio, hora_fin);


--
-- TOC entry 4970 (class 2606 OID 24638)
-- Name: horarios_consultorios horarios_consultorios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_consultorios
    ADD CONSTRAINT horarios_consultorios_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 24588)
-- Name: horarios_profesionales horarios_profesionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_profesionales
    ADD CONSTRAINT horarios_profesionales_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16427)
-- Name: obras_sociales obras_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras_sociales
    ADD CONSTRAINT obras_sociales_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 16455)
-- Name: paciente_obras_sociales paciente_obras_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16447)
-- Name: pacientes pacientes_dni_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_dni_key UNIQUE (dni);


--
-- TOC entry 4946 (class 2606 OID 16445)
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 16503)
-- Name: profesional_especialidades profesional_especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_especialidades
    ADD CONSTRAINT profesional_especialidades_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 16483)
-- Name: profesionales profesionales_cuil_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT profesionales_cuil_key UNIQUE (cuil);


--
-- TOC entry 4952 (class 2606 OID 16481)
-- Name: profesionales profesionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesionales
    ADD CONSTRAINT profesionales_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 32817)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 4976 (class 2606 OID 32815)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 24664)
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 32852)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 24617)
-- Name: consultorio_especialidades consultorio_especialidades_consultorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_consultorio_id_fkey FOREIGN KEY (consultorio_id) REFERENCES public.consultorios(id) ON DELETE CASCADE;


--
-- TOC entry 4985 (class 2606 OID 24622)
-- Name: consultorio_especialidades consultorio_especialidades_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultorio_especialidades
    ADD CONSTRAINT consultorio_especialidades_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- TOC entry 4986 (class 2606 OID 24641)
-- Name: horarios_consultorios horarios_consultorios_consultorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_consultorios
    ADD CONSTRAINT horarios_consultorios_consultorio_id_fkey FOREIGN KEY (consultorio_id) REFERENCES public.consultorios(id) ON DELETE CASCADE;


--
-- TOC entry 4983 (class 2606 OID 24589)
-- Name: horarios_profesionales horarios_profesionales_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios_profesionales
    ADD CONSTRAINT horarios_profesionales_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.profesionales(id) ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 16461)
-- Name: paciente_obras_sociales paciente_obras_sociales_obra_social_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_obra_social_id_fkey FOREIGN KEY (obra_social_id) REFERENCES public.obras_sociales(id);


--
-- TOC entry 4980 (class 2606 OID 16456)
-- Name: paciente_obras_sociales paciente_obras_sociales_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_obras_sociales
    ADD CONSTRAINT paciente_obras_sociales_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- TOC entry 4981 (class 2606 OID 16509)
-- Name: profesional_especialidades profesional_especialidades_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_especialidades
    ADD CONSTRAINT profesional_especialidades_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- TOC entry 4982 (class 2606 OID 16504)
-- Name: profesional_especialidades profesional_especialidades_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_especialidades
    ADD CONSTRAINT profesional_especialidades_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.profesionales(id) ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 24675)
-- Name: turnos turnos_consultorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_consultorio_id_fkey FOREIGN KEY (consultorio_id) REFERENCES public.consultorios(id);


--
-- TOC entry 4988 (class 2606 OID 24680)
-- Name: turnos turnos_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- TOC entry 4989 (class 2606 OID 24665)
-- Name: turnos turnos_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id);


--
-- TOC entry 4990 (class 2606 OID 24670)
-- Name: turnos turnos_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.profesionales(id);


--
-- TOC entry 4991 (class 2606 OID 32853)
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


-- Completed on 2026-05-03 22:37:36

--
-- PostgreSQL database dump complete
--

\unrestrict 0MrYlaQHh82oYnk8J35NuMwxcbHhD9hKJd8AjyZfliMU9HBSyYMFvBvVZncu1eb

