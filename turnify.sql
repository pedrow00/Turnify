'-------------PACIENTES-----------------'
CREATE TABLE obras_sociales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE NOT NULL,

    calle VARCHAR(150),
    numero VARCHAR(20),
    codigo_postal VARCHAR(10),
    piso VARCHAR(10),
    dpto VARCHAR(10),

    provincia_id VARCHAR(10) NOT NULL,
    provincia_nombre VARCHAR(100),

    localidad_id VARCHAR(20) NOT NULL,
    localidad_nombre VARCHAR(100),

    observaciones TEXT,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP
);

CREATE TABLE paciente_obras_sociales (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    obra_social_id INTEGER REFERENCES obras_sociales(id)
);

'-----------PROFESIONALES---------------'
CREATE TABLE profesionales (
    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    sexo VARCHAR(20),

    cuil VARCHAR(20) UNIQUE NOT NULL,
    matricula VARCHAR(50) UNIQUE,

    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),

    calle VARCHAR(150),
    numero VARCHAR(20),
    codigo_postal VARCHAR(10),
    piso VARCHAR(10),
    departamento VARCHAR(10),

    provincia_nombre VARCHAR(100),
    localidad_nombre VARCHAR(100),

    foto_url TEXT,

    especialidad_id INTEGER,

    activo BOOLEAN DEFAULT true,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,
    fecha_baja TIMESTAMP,

    CONSTRAINT fk_profesional_especialidad
    FOREIGN KEY (especialidad_id)
    REFERENCES especialidades(id)
);


CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE profesional_especialidades (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES profesionales(id) ON DELETE CASCADE,
    especialidad_id INTEGER REFERENCES especialidades(id),

    matricula VARCHAR(50),
    es_principal BOOLEAN DEFAULT false
);

CREATE TABLE horarios_profesionales (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES profesionales(id) ON DELETE CASCADE,

    dia VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE profesional_consultorios (
    id SERIAL PRIMARY KEY,

    profesional_id INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
    consultorio_id INTEGER NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,

    UNIQUE(profesional_id, consultorio_id)
);

INSERT INTO obras_sociales (nombre) VALUES
('OSDE'),
('IOMA'),
('PAMI'),
('Swiss Medical'),
('Galeno');

INSERT INTO especialidades (nombre) VALUES
('Cardiología'),
('Clínica Médica'),
('Pediatría'),
('Traumatología'),
('Dermatología'),
('Psicología');

'-----------CONSULTORIOS---------------'
CREATE TABLE consultorios (
    id SERIAL PRIMARY KEY,

    numero_consultorio VARCHAR(20) NOT NULL,
    piso VARCHAR(10) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultorio_especialidades (
    id SERIAL PRIMARY KEY,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    especialidad_id INTEGER REFERENCES especialidades(id),

    UNIQUE (consultorio_id, especialidad_id)
);
CREATE TABLE horarios_consultorios (
    id SERIAL PRIMARY KEY,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (consultorio_id, hora_inicio, hora_fin)
);

'--------------TURNOS---------------'

CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,

    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    profesional_id INTEGER NOT NULL REFERENCES profesionales(id),
    consultorio_id INTEGER NOT NULL REFERENCES consultorios(id),
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),

    estado VARCHAR(50) DEFAULT 'confirmado', -- confirmado, cancelado, atendido
    motivo_consulta TEXT,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,

    CONSTRAINT chk_turnos_duracion_15_minutos
    CHECK (hora_fin = hora_inicio + INTERVAL '15 minutes'),

    CONSTRAINT chk_turnos_dia_laborable
    CHECK (EXTRACT(ISODOW FROM fecha) BETWEEN 1 AND 5)
);

------------------USUARIOS Y ROLES---------------------------

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO roles (nombre) VALUES
('admin'),
('socio'),
('secretaria'),
('profesional');


CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150),
    password_hash TEXT,

    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);
