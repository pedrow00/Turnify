-- Turnify — esquema PostgreSQL para clínica privada
-- Ejecutar: psql -U ... -d ... -f db/schema.sql

BEGIN;

CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sin profesional_id al inicio (FK circular con profesionales.usuario_id)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(40) NOT NULL CHECK (rol IN ('socio', 'secretaria', 'profesional', 'admin')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profesionales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  matricula VARCHAR(50) NOT NULL UNIQUE,
  especialidad_id INTEGER NOT NULL REFERENCES especialidades (id),
  telefono VARCHAR(40),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  usuario_id INTEGER UNIQUE REFERENCES usuarios (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS profesional_id INTEGER UNIQUE REFERENCES profesionales (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  telefono VARCHAR(40),
  fecha_nacimiento DATE,
  direccion TEXT,
  obra_social VARCHAR(120),
  notas_internas TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultorios (
  id SERIAL PRIMARY KEY,
  numero_consultorio VARCHAR(20) NOT NULL UNIQUE,
  piso SMALLINT,
  observaciones TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Franjas recurrentes de disponibilidad del profesional (ej. Lun 09:00–13:00; dia_semana 0=domingo … 6=sábado)
CREATE TABLE IF NOT EXISTS agenda_profesional (
  id SERIAL PRIMARY KEY,
  profesional_id INTEGER NOT NULL REFERENCES profesionales (id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_turno_min SMALLINT NOT NULL DEFAULT 30 CHECK (duracion_turno_min > 0),
  consultorio_id INTEGER REFERENCES consultorios (id) ON DELETE SET NULL,
  vigente_desde DATE,
  vigente_hasta DATE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_agenda_horas CHECK (hora_fin > hora_inicio)
);

CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  paciente_id INTEGER NOT NULL REFERENCES pacientes (id),
  profesional_id INTEGER NOT NULL REFERENCES profesionales (id),
  consultorio_id INTEGER REFERENCES consultorios (id),
  especialidad_id INTEGER REFERENCES especialidades (id),
  motivo_consulta TEXT,
  estado VARCHAR(40) NOT NULL DEFAULT 'programado'
    CHECK (estado IN ('programado', 'confirmado', 'en_sala', 'atendido', 'cancelado', 'no_asistio')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_turno_horas CHECK (hora_fin > hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos (fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_profesional_fecha ON turnos (profesional_id, fecha);
CREATE INDEX IF NOT EXISTS idx_agenda_profesional ON agenda_profesional (profesional_id, dia_semana);

COMMIT;
