-- Datos iniciales y de demostracion de Turnify.
--
-- Se ejecuta una sola vez, sobre una base recien creada con schema.sql.
-- No crea usuarios: los crea scripts/db-setup.js con bcrypt, para no
-- commitear hashes de contrasenas.
--
-- Los datos de pacientes y profesionales son inventados.

BEGIN;

-- ---------------------------------------------------------------------------
-- Catalogos
-- ---------------------------------------------------------------------------

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

-- IDs explicitos para que no dependan del orden del SERIAL: el frontend
-- asume admin=1, socio=2, secretaria=3, profesional=4.
INSERT INTO roles (id, nombre) VALUES
(1, 'admin'),
(2, 'socio'),
(3, 'secretaria'),
(4, 'profesional');

SELECT setval('roles_id_seq', 4, true);

-- ---------------------------------------------------------------------------
-- Consultorios
-- ---------------------------------------------------------------------------

INSERT INTO consultorios (numero_consultorio, piso, ubicacion, activo) VALUES
('101', '1', 'Ala Sur', true),
('203', '2', 'Ala Sur', true);

INSERT INTO consultorio_especialidades (consultorio_id, especialidad_id)
SELECT c.id, e.id
FROM (VALUES
  ('101', 'Cardiología'),
  ('101', 'Clínica Médica'),
  ('203', 'Traumatología'),
  ('203', 'Clínica Médica'),
  ('203', 'Pediatría')
) AS pares (consultorio, especialidad)
JOIN consultorios c ON c.numero_consultorio = pares.consultorio
JOIN especialidades e ON e.nombre = pares.especialidad;

-- ---------------------------------------------------------------------------
-- Profesionales
-- ---------------------------------------------------------------------------

INSERT INTO profesionales (
  nombre, apellido, sexo, cuil, matricula, email, telefono,
  calle, numero, codigo_postal, provincia_nombre, localidad_nombre,
  especialidad_id, activo,
  indisponibilidad_desde, indisponibilidad_hasta, indisponibilidad_motivo
)
SELECT
  p.nombre, p.apellido, p.sexo, p.cuil, p.matricula, p.email, p.telefono,
  p.calle, p.numero, p.codigo_postal, p.provincia, p.localidad,
  e.id, true,
  p.indisponibilidad_desde, p.indisponibilidad_hasta, p.indisponibilidad_motivo
FROM (VALUES
  ('Juan', 'Puguita', 'M', '20345678901', 'MP 3562', 'juanp@correo.com', '356156122',
   'Mitre', '1562', '9022', 'Chaco', 'Capitán Solari',
   'Clínica Médica', NULL::date, NULL::date, NULL::text),
  ('Pedro', 'Picalapiedra', 'X', '20453469213', 'MP 3892', 'pedrito@correo.com', '345261258',
   'Avenida San Martín', '2356', '8495', 'Tucumán', 'Barrio Aeropuerto',
   'Traumatología', CURRENT_DATE + 10, CURRENT_DATE + 17, 'Congreso')
) AS p (nombre, apellido, sexo, cuil, matricula, email, telefono,
        calle, numero, codigo_postal, provincia, localidad,
        especialidad, indisponibilidad_desde, indisponibilidad_hasta, indisponibilidad_motivo)
JOIN especialidades e ON e.nombre = p.especialidad;

-- Especialidades por profesional (la principal se refleja tambien en
-- profesionales.especialidad_id, columna heredada que el backend sigue leyendo).
INSERT INTO profesional_especialidades (profesional_id, especialidad_id, matricula, es_principal)
SELECT pr.id, e.id, v.matricula, v.es_principal
FROM (VALUES
  ('MP 3562', 'Clínica Médica', 'MP 3562', true),
  ('MP 3562', 'Cardiología', 'MP 3562', false),
  ('MP 3892', 'Traumatología', 'MP 3892', true),
  ('MP 3892', 'Pediatría', 'MP 3892', false)
) AS v (matricula_profesional, especialidad, matricula, es_principal)
JOIN profesionales pr ON pr.matricula = v.matricula_profesional
JOIN especialidades e ON e.nombre = v.especialidad;

-- Consultorios habilitados para cada profesional.
INSERT INTO profesional_consultorios (profesional_id, consultorio_id, activo)
SELECT pr.id, c.id, true
FROM (VALUES
  ('MP 3562', '101'),
  ('MP 3562', '203'),
  ('MP 3892', '203')
) AS v (matricula, consultorio)
JOIN profesionales pr ON pr.matricula = v.matricula
JOIN consultorios c ON c.numero_consultorio = v.consultorio;

-- Horarios de atencion. Los nombres de dia son los que usa el backend
-- (getDiaSemana en turno.service.js): sin tildes.
INSERT INTO horarios_profesionales (profesional_id, dia, hora_inicio, hora_fin, activo)
SELECT pr.id, v.dia, v.hora_inicio::time, v.hora_fin::time, true
FROM (VALUES
  ('MP 3562', 'lunes', '08:00', '12:00'),
  ('MP 3562', 'miercoles', '08:00', '12:00'),
  ('MP 3562', 'viernes', '08:00', '15:00'),
  ('MP 3892', 'miercoles', '10:00', '17:00'),
  ('MP 3892', 'jueves', '15:00', '20:00')
) AS v (matricula, dia, hora_inicio, hora_fin)
JOIN profesionales pr ON pr.matricula = v.matricula;

-- ---------------------------------------------------------------------------
-- Pacientes (todos inventados)
-- ---------------------------------------------------------------------------

INSERT INTO pacientes (
  nombre, apellido, dni, email, telefono, fecha_nacimiento,
  calle, numero, codigo_postal, tipo_contacto,
  provincia_id, provincia_nombre, localidad_id, localidad_nombre, observaciones
) VALUES
('Omar', 'Varela', '35956123', 'omar.varela@correo.com', '351895754', '1999-04-08',
 '9 de Julio', '564', '8900', 'personal',
 '62', 'Río Negro', '62042090', 'Barrio Costa Este', NULL),
('Hector', 'Dominguez', '11566489', 'hector.dominguez@correo.com', '351689564', '1958-11-22',
 'Av. Colón', '1050', '9022', 'personal',
 '30', 'Entre Ríos', '30084015', 'Aldea San Juan', 'Paciente con obra social PAMI.'),
('Lucía', 'Fernández', '41258736', 'lucia.fernandez@correo.com', '3415551234', '1991-02-17',
 'Rioja', '1240', '2000', 'personal',
 '82', 'Santa Fe', '82084010', 'Rosario', NULL),
('Mateo', 'Ríos', '38965412', 'mateo.rios@correo.com', '2615559876', '1995-06-30',
 'San Martín', '890', '5500', 'personal',
 '14', 'Córdoba', '14014010', 'Córdoba', NULL);

INSERT INTO paciente_obras_sociales (paciente_id, obra_social_id)
SELECT p.id, o.id
FROM (VALUES
  ('35956123', 'OSDE'),
  ('11566489', 'PAMI'),
  ('41258736', 'IOMA'),
  ('38965412', 'Swiss Medical')
) AS v (dni, obra_social)
JOIN pacientes p ON p.dni = v.dni
JOIN obras_sociales o ON o.nombre = v.obra_social;

-- ---------------------------------------------------------------------------
-- Turnos
--
-- Las fechas se calculan relativas a CURRENT_DATE para que la demo no quede
-- con turnos vencidos. "Proximo <dia>" cae siempre entre 7 y 13 dias adelante.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_hoy          int  := EXTRACT(ISODOW FROM CURRENT_DATE)::int;
  v_prox_lunes   date := CURRENT_DATE + 7 + ((1 - v_hoy + 7) % 7);
  v_prox_mierc   date := CURRENT_DATE + 7 + ((3 - v_hoy + 7) % 7);
  v_prox_jueves  date := CURRENT_DATE + 7 + ((4 - v_hoy + 7) % 7);
  v_prox_viernes date := CURRENT_DATE + 7 + ((5 - v_hoy + 7) % 7);

  v_pac_omar    int := (SELECT id FROM pacientes WHERE dni = '35956123');
  v_pac_hector  int := (SELECT id FROM pacientes WHERE dni = '11566489');
  v_pac_lucia   int := (SELECT id FROM pacientes WHERE dni = '41258736');
  v_pac_mateo   int := (SELECT id FROM pacientes WHERE dni = '38965412');

  v_prof_juan   int := (SELECT id FROM profesionales WHERE matricula = 'MP 3562');
  v_prof_pedro  int := (SELECT id FROM profesionales WHERE matricula = 'MP 3892');

  v_cons_101    int := (SELECT id FROM consultorios WHERE numero_consultorio = '101');
  v_cons_203    int := (SELECT id FROM consultorios WHERE numero_consultorio = '203');

  v_esp_clinica  int := (SELECT id FROM especialidades WHERE nombre = 'Clínica Médica');
  v_esp_cardio   int := (SELECT id FROM especialidades WHERE nombre = 'Cardiología');
  v_esp_trauma   int := (SELECT id FROM especialidades WHERE nombre = 'Traumatología');
BEGIN
  INSERT INTO turnos (
    fecha, hora_inicio, hora_fin,
    paciente_id, profesional_id, consultorio_id, especialidad_id,
    estado, motivo_consulta
  ) VALUES
  -- Proxima semana, confirmados.
  (v_prox_lunes,   '09:00', '09:15', v_pac_omar,  v_prof_juan,  v_cons_101, v_esp_clinica, 'confirmado', 'Control de presión arterial'),
  (v_prox_lunes,   '09:15', '09:30', v_pac_hector, v_prof_juan,  v_cons_101, v_esp_clinica, 'confirmado', 'Renovación de receta'),
  (v_prox_mierc,   '10:00', '10:15', v_pac_lucia, v_prof_juan,  v_cons_101, v_esp_cardio,  'confirmado', 'Primera consulta cardiológica'),
  (v_prox_mierc,   '11:00', '11:15', v_pac_hector, v_prof_pedro, v_cons_203, v_esp_trauma,  'confirmado', 'Dolor de rodilla'),
  (v_prox_mierc,   '11:15', '11:30', v_pac_mateo, v_prof_pedro, v_cons_203, v_esp_trauma,  'confirmado', 'Control post operatorio'),
  (v_prox_jueves,  '16:00', '16:15', v_pac_omar,  v_prof_pedro, v_cons_203, v_esp_trauma,  'confirmado', 'Esguince de tobillo'),

  -- Cancelado (no ocupa agenda).
  (v_prox_viernes, '10:00', '10:15', v_pac_lucia, v_prof_juan,  v_cons_101, v_esp_clinica, 'cancelado',  'Reprogramado por el paciente');
END $$;

COMMIT;
