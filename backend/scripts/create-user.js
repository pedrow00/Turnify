#!/usr/bin/env node
/**
 * Crea o actualiza un usuario del sistema.
 *
 * Sirve para dos casos:
 *   - recuperar el acceso si te quedaste sin administrador
 *   - crear usuarios en una base existente sin pasar por la interfaz
 *
 * Uso:
 *   npm run user:create -- --email admin@turnify.test --password Turnify2026! --rol admin
 *
 * Si el email ya existe, actualiza la contrasena y el rol.
 */
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { getClientConfig } = require('../src/config/dbConfig');

const ROLES = ['admin', 'socio', 'secretaria', 'profesional'];

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const [rawKey, inlineValue] = arg.slice(2).split('=');
    if (inlineValue !== undefined) {
      parsed[rawKey] = inlineValue;
    } else {
      parsed[rawKey] = argv[i + 1];
      i += 1;
    }
  }
  return parsed;
}

function usage(message) {
  if (message) console.error(`\nError: ${message}`);
  console.error(
    '\nUso:\n' +
      '  npm run user:create -- --email <email> --password <password> --rol <rol>\n\n' +
      `Roles validos: ${ROLES.join(', ')}\n`
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = String(args.email || '').trim().toLowerCase();
  const password = String(args.password || '');
  const rol = String(args.rol || '').trim().toLowerCase();

  if (!email || !email.includes('@')) usage('email invalido');
  if (password.length < 8) usage('la contrasena debe tener al menos 8 caracteres');
  if (!ROLES.includes(rol)) usage(`rol invalido: "${rol}"`);

  const client = new Client(getClientConfig());
  await client.connect();

  try {
    const rolRow = await client.query('SELECT id FROM roles WHERE nombre = $1', [
      rol,
    ]);
    if (rolRow.rowCount === 0) {
      usage(`el rol "${rol}" no existe en la tabla roles (corré npm run db:setup)`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await client.query('SELECT id FROM usuarios WHERE email = $1', [
      email,
    ]);

    if (existing.rowCount > 0) {
      await client.query(
        'UPDATE usuarios SET password_hash = $1, rol_id = $2 WHERE email = $3',
        [passwordHash, rolRow.rows[0].id, email]
      );
      console.log(`Usuario actualizado: ${email} (rol: ${rol})`);
    } else {
      await client.query(
        'INSERT INTO usuarios (email, password_hash, rol_id) VALUES ($1, $2, $3)',
        [email, passwordHash, rolRow.rows[0].id]
      );
      console.log(`Usuario creado: ${email} (rol: ${rol})`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
