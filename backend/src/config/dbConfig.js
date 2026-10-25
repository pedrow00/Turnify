require('dotenv').config();

/**
 * Configuracion de conexion a Postgres.
 *
 * Prioridad:
 *   1. DATABASE_URL  (un solo string, es lo que usan los Postgres gestionados)
 *   2. Variables DB_* (entorno local)
 *
 * `database` permite apuntar a otra base del mismo servidor, por ejemplo
 * "postgres" para crearla antes de que exista.
 */
function getClientConfig(database) {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: database || process.env.DB_NAME || 'turnify',
  };
}

module.exports = { getClientConfig };
