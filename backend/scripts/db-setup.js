#!/usr/bin/env node
/**
 * Inicializa la base de datos de Turnify.
 *
 *   npm run db:setup            crea la base (si no existe), las tablas y los
 *                               datos demo. Si ya hay tablas, no hace nada.
 *   npm run db:reset            lo mismo, pero borrando el schema public antes.
 *                               (equivale a --reset --yes)
 *
 * Es seguro correrlo mas de una vez: la segunda vez informa que la base ya
 * esta inicializada y termina sin tocar nada.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { getClientConfig } = require('../src/config/dbConfig');
const { calcularCuil } = require('../src/utils/identidad');

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');
const resetConfirmed = args.includes('--yes') || args.includes('-y');

const DB_NAME = process.env.DB_NAME || 'turnify';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Turnify2026!';
// Datos ficticios: el DNI es la base para calcular el CUIL. El usuario
// profesional usa el mismo CUIL que su ficha en profesionales.
const DEMO_USERS = [
  {
    email: 'admin@turnify.test',
    rol: 'admin',
    nombre: 'Ana',
    apellido: 'Gómez',
    nombre_usuario: 'ana.gomez',
    dni: '30111222',
  },
  {
    email: 'socio@turnify.test',
    rol: 'socio',
    nombre: 'Bruno',
    apellido: 'Fernández',
    nombre_usuario: 'bruno.fernandez',
    dni: '28444555',
  },
  {
    email: 'secretaria@turnify.test',
    rol: 'secretaria',
    nombre: 'Carla',
    apellido: 'López',
    nombre_usuario: 'carla.lopez',
    dni: '32666777',
  },
  {
    email: 'profesional@turnify.test',
    rol: 'profesional',
    nombre: 'Juan',
    apellido: 'Puguita',
    nombre_usuario: 'juan.puguita',
    dni: '34567890',
    cuil: '20345678901',
  },
];

const DB_DIR = path.join(__dirname, '..', 'db');
const SCHEMA_FILE = path.join(DB_DIR, 'schema.sql');
const SEED_FILE = path.join(DB_DIR, 'seed.sql');

function log(message) {
  console.log(message);
}

/**
 * Crea la base si no existe. Cuando se usa DATABASE_URL se asume que la base
 * ya fue creada por el proveedor (Render, Neon, Railway, etc.).
 */
async function ensureDatabase() {
  if (process.env.DATABASE_URL) {
    log('DATABASE_URL definida: se usa la base existente, no se intenta crearla.');
    return;
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(DB_NAME)) {
    throw new Error(`Nombre de base invalido: "${DB_NAME}"`);
  }

  const admin = new Client(getClientConfig('postgres'));
  try {
    await admin.connect();
    const exists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DB_NAME]
    );

    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      log(`Base "${DB_NAME}" creada.`);
    } else {
      log(`Base "${DB_NAME}" ya existe.`);
    }
  } catch (error) {
    log(
      `No se pudo verificar ni crear la base (${error.message}). ` +
        'Se intenta conectar directamente.'
    );
  } finally {
    await admin.end().catch(() => {});
  }
}

async function countTables(client) {
  const result = await client.query(
    `SELECT count(*)::int AS total
       FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  return result.rows[0].total;
}

/**
 * El dump de pg_dump 17+ incluye meta-comandos de psql (\restrict) y GUCs que
 * no existen en versiones anteriores, asi que node-postgres no puede
 * ejecutarlo tal cual. Como el archivo se genera con pg_dump y no se edita a
 * mano, la limpieza se hace aca al aplicarlo.
 */
function sanitizeDump(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.startsWith('\\'))
    .join('\n')
    .replace(/^SET transaction_timeout = 0;\s*$/gm, '');
}

async function applyFile(client, file) {
  const sql = sanitizeDump(fs.readFileSync(file, 'utf8'));
  await client.query(sql);
}

async function createDemoUsers(client) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const created = [];

  for (const user of DEMO_USERS) {
    const rol = await client.query('SELECT id FROM roles WHERE nombre = $1', [
      user.rol,
    ]);
    if (rol.rowCount === 0) {
      throw new Error(`No existe el rol "${user.rol}" en la tabla roles`);
    }

    const cuil = user.cuil || calcularCuil(user.dni).replace(/-/g, '');

    const result = await client.query(
      `INSERT INTO usuarios
         (email, password_hash, rol_id, nombre, apellido,
          nombre_usuario, dni, cuil)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
         RETURNING id`,
      [
        user.email,
        passwordHash,
        rol.rows[0].id,
        user.nombre,
        user.apellido,
        user.nombre_usuario,
        user.dni,
        cuil,
      ]
    );

    if (result.rowCount > 0) created.push(user.email);
  }

  // El usuario profesional de demo se vincula al primer profesional cargado
  // para que el listado de Usuarios muestre su especialidad y matricula.
  await client.query(
    `UPDATE usuarios
        SET profesional_id = (SELECT id FROM profesionales ORDER BY id LIMIT 1)
      WHERE email = 'profesional@turnify.test'
        AND profesional_id IS NULL`
  );

  return created;
}

function printCredentials() {
  log('');
  log('  Usuarios demo:');
  log('  ---------------------------------------------------------------');
  for (const user of DEMO_USERS) {
    log(
      `  ${user.rol.padEnd(12)} ${user.email.padEnd(30)} ` +
        `usuario: ${user.nombre_usuario.padEnd(16)} DNI: ${user.dni}`
    );
  }
  log('  ---------------------------------------------------------------');
  log(`  Contrasena para todos: ${DEMO_PASSWORD}`);
  log('  Cambiar la contrasena antes de exponer el sistema publicamente.');
  log('');
}

async function main() {
  await ensureDatabase();

  const client = new Client(getClientConfig());
  await client.connect();

  try {
    const tables = await countTables(client);

    if (tables > 0) {
      if (!shouldReset) {
        log(
          `La base ya tiene ${tables} tablas: no se hace nada.\n` +
            'Si querés recrearla desde cero: npm run db:reset'
        );
        return;
      }

      if (!resetConfirmed) {
        log(
          'ERROR: --reset borra todos los datos de la base.\n' +
            'Si es lo que querés, agregá --yes (o usá npm run db:reset).'
        );
        process.exitCode = 1;
        return;
      }

      log('Borrando el schema public...');
      await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    }

    log('Aplicando schema.sql...');
    await applyFile(client, SCHEMA_FILE);

    // pg_dump deja search_path vacio en la sesion; el seed usa nombres sin
    // calificar, asi que lo restauramos antes de seguir.
    await client.query("SET search_path = public");

    log('Cargando seed.sql...');
    await applyFile(client, SEED_FILE);

    const created = await createDemoUsers(client);
    log(`Datos demo cargados. Usuarios creados: ${created.length}/${DEMO_USERS.length}.`);

    printCredentials();

    const total = await countTables(client);
    log(`Listo. ${total} tablas creadas en la base "${DB_NAME}".`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('');
  console.error('Error inicializando la base:', error.message);
  if (error.code) console.error(`Codigo: ${error.code}`);
  process.exit(1);
});
