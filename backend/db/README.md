# Base de datos

## Archivos

| Archivo | Origen | Se edita a mano |
|---|---|---|
| `schema.sql` | Generado con `pg_dump --schema-only` desde una base funcionando | **No** |
| `seed.sql` | Escrito a mano: catálogos y datos de demostración | Sí |

`schema.sql` no se edita porque su valor es justamente ser una copia fiel de la
estructura real. Si cambia el modelo de datos, se regenera:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -h localhost -d turnify `
  --schema-only --no-owner --no-acl `
  -f backend\db\schema.sql
```

## Inicializar

```bash
cd backend
npm run db:setup     # crea la base si no existe, aplica schema + seed y crea los usuarios demo
npm run db:reset     # lo mismo, pero borrando todo primero
```

`db:setup` es seguro de repetir: si la base ya tiene tablas, no hace nada.

Detalles de implementación:

- Si existe `DATABASE_URL`, se usa esa conexión y no se intenta crear la base
  (en los Postgres gestionados la base la crea el proveedor).
- Si no, se conecta a la base `postgres` del mismo servidor y ejecuta
  `CREATE DATABASE` solo cuando hace falta. Postgres no tiene
  `CREATE DATABASE IF NOT EXISTS`, por eso la verificación es explícita.
- El dump de PostgreSQL 17+ incluye `\restrict` y `SET transaction_timeout`,
  que `node-postgres` no puede ejecutar. El script los quita al aplicar el
  archivo, sin modificar `schema.sql`.
- Los usuarios se crean con `bcrypt` en el script: no hay hashes ni
  contraseñas en los `.sql`.

## Usuarios

`db:setup` crea cuatro usuarios demo (ver el README principal) con nombre,
apellido, nombre de usuario, DNI y CUIL. El usuario
`profesional@turnify.test` queda vinculado al primer profesional del seed, que
es de donde el listado de Usuarios toma la especialidad, la matrícula y el
CUIL.

La identidad (`nombre`, `apellido`, `nombre_usuario`, `dni`, `cuil`) se guarda
en `usuarios`. `nombre_usuario`, `dni` y `cuil` tienen índices únicos porque
sirven para iniciar sesión. El CUIL se puede cargar directamente o calcularse
desde el DNI con el dígito verificador de AFIP: el formulario permite cargar
uno y completa el otro.

Los usuarios que ya existían antes de estos campos (o los creados con
`user:create`) pueden iniciar sesión con su email. Mientras no tengan datos
cargados, el listado deduce nombre y usuario del email y muestra un DNI/CUIL
estimado marcado como tal. Un admin puede completarlos desde **Usuarios →
Editar datos**.

Para una base que ya existe, o para recuperar el acceso:

```bash
npm run user:create -- --email admin@turnify.test --password "TuPassword123" --rol admin
```
