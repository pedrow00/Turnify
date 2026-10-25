const { Pool } = require('pg');
const { getClientConfig } = require('./dbConfig');

// getClientConfig soporta DATABASE_URL (Postgres gestionado) y las variables
// DB_* del entorno local. Ver dbConfig.js.
const pool = new Pool(getClientConfig());

module.exports = pool;
