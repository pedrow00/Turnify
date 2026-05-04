const uniqueConstraintMessages = {
  profesionales_cuil_key: {
    create: 'No se pudo registrar porque el CUIL ya esta asignado a otro profesional.',
    update: 'No se pudo actualizar porque el CUIL ya esta asignado a otro profesional.',
  },
  pacientes_dni_key: {
    create: 'No se pudo registrar porque el DNI ya esta asignado a otro paciente.',
    update: 'No se pudo actualizar porque el DNI ya esta asignado a otro paciente.',
  },
  especialidades_nombre_key: {
    create: 'No se pudo registrar porque ya existe una especialidad con ese nombre.',
    update: 'No se pudo actualizar porque ya existe una especialidad con ese nombre.',
  },
  consultorios_numero_consultorio_key: {
    create: 'No se pudo registrar porque ya existe un consultorio con ese numero.',
    update: 'No se pudo actualizar porque ya existe un consultorio con ese numero.',
  },
  consultorio_especialidades_consultorio_id_especialidad_id_key: {
    create: 'No se pudo registrar porque esa especialidad ya esta asignada al consultorio.',
    update: 'No se pudo actualizar porque esa especialidad ya esta asignada al consultorio.',
  },
  horarios_consultorios_consultorio_id_hora_inicio_hora_fin_key: {
    create: 'No se pudo registrar porque el consultorio ya tiene ese horario cargado.',
    update: 'No se pudo actualizar porque el consultorio ya tiene ese horario cargado.',
  },
};

const getFriendlyDbError = (error, action = 'create') => {
  if (error?.code !== '23505') {
    return error;
  }

  const message = uniqueConstraintMessages[error.constraint]?.[action]
    || 'No se pudo guardar porque ya existe un registro con esos datos.';

  return new Error(message);
};

module.exports = { getFriendlyDbError };
