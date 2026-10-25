# Turnify

Sistema de gestión de turnos para consultorios médicos. Permite administrar
pacientes, profesionales, consultorios y la agenda de turnos, con permisos
distintos según el rol de quien inicia sesión.

- **Backend:** Node.js + Express 5 + PostgreSQL (`pg`)
- **Frontend:** React + Vite
- **Autenticación:** sesiones con cookie `httpOnly` y contraseñas con `bcrypt`

## Roles

|       Rol      |                 Qué puede hacer                 |
|       ---      |                      ---                        |
| `admin`        | Todo, incluida la gestión de usuarios           |
| `socio`        | Pacientes, profesionales, consultorios y turnos |
| `secretaria`   | Pacientes, profesionales, consultorios y turnos |
| `profesional`  | Ver pacientes y gestionar turnos                |

## Puesta en marcha

Requisitos: Node.js 20 o superior y PostgreSQL 17 o superior.

### 1. Backend

```bash
cd backend
npm install
```

Copiar el archivo de variables de entorno y ajustar los datos de Postgres:

```bash
cp .env.example .env          # en PowerShell: Copy-Item .env.example .env
```

Crear la base, las tablas, los datos de ejemplo y los usuarios demo:

```bash
npm run db:setup
```

Levantar la API:

```bash
npm run dev                   # http://localhost:3000
```

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

El frontend apunta a `http://localhost:3000` mediante
`frontend/.env.development`. No hace falta crear ningún `.env`.

## Usuarios demo

`npm run db:setup` crea estos usuarios (contraseña `Turnify2026!`):

| Email | Usuario | DNI | Rol |
|---|---|---|---|
| `admin@turnify.test` | `ana.gomez` | 30.111.222 | admin |
| `socio@turnify.test` | `bruno.fernandez` | 28.444.555 | socio |
| `secretaria@turnify.test` | `carla.lopez` | 32.666.777 | secretaria |
| `profesional@turnify.test` | `juan.puguita` | 34.567.890 | profesional |

Se puede iniciar sesión con el email, el nombre de usuario, el DNI o el CUIL.
El CUIL de cada usuario demo se calcula a partir del DNI con el dígito
verificador de AFIP.

Los datos de pacientes, profesionales y turnos del seed son inventados. Las
fechas de los turnos se calculan al momento de cargar el seed, así que la
demo nunca queda con turnos vencidos.

## Scripts

### Backend

| Comando | Qué hace |
|---|---|
| `npm run dev` | API con recarga automática (nodemon) |
| `npm run db:setup` | Crea la base si no existe, aplica `schema.sql` + `seed.sql` y crea los usuarios demo. Si la base ya tiene tablas, no hace nada |
| `npm run db:reset` | Borra el schema `public` y vuelve a crear todo |
| `npm run user:create -- --email ... --password ... --rol ...` | Crea un usuario o le cambia la contraseña y el rol. Sirve para recuperar el acceso si no queda ningún admin |

### Frontend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint` | ESLint |

## Estructura

```
backend/
  db/
    schema.sql        estructura completa, generada con pg_dump (no editar)
    seed.sql          catálogos y datos de demostración
  scripts/
    db-setup.js       npm run db:setup / db:reset
    create-user.js    npm run user:create
  src/
    app.js            middlewares, sesión y montaje de rutas
    config/           conexión a Postgres
    controllers/      entrada HTTP
    routes/           rutas y permisos por rol
    services/         consultas SQL y reglas de negocio
    utils/            logger, autenticación e identidad (DNI/CUIL)
frontend/
  src/
    pages/            pantallas
    components/       navbar, rutas protegidas, etc.
    context/          estado de autenticación
    utils/            cliente HTTP, permisos y breakpoints
    styles/           CSS por pantalla
```

Más detalle sobre la base en [`backend/db/README.md`](backend/db/README.md).

## Decisiones de seguridad

- La gestión de usuarios **no es pública**: solo un `admin` puede listar,
  crear, editar datos, cambiar el rol y restablecer contraseñas. La primera
  cuenta se crea con `npm run user:create`.
- Cada usuario puede entrar a **Mi perfil** para ver sus datos (solo lectura)
  y cambiar su propia contraseña pidiendo la actual.
- El login acepta email, nombre de usuario, DNI o CUIL, y tiene límite de 10
  intentos por IP cada 15 minutos.
- La sesión se regenera al iniciar sesión, para evitar fijación de sesión.
- La sesión se valida contra la base en cada request: una baja o un cambio de
  rol se aplican al instante.
- Los errores de base de datos se registran en el servidor y no se devuelven
  al cliente.
- Los archivos `.env` están fuera del repositorio; solo se versionan los
  `.env.example`.
- Los usuarios no se eliminan: se dan de baja (`activo = false`) y sus turnos
  e historial se conservan. La sesión se valida contra la base en cada request,
  así que una baja o un cambio de rol se aplican al instante.
- Las contraseñas se guardan con `bcrypt`; los hashes no están en el
  repositorio, los genera el script de inicialización.

## Estado

Funcional en local. El despliegue (un servicio para la API + Postgres
gestionado) queda como paso siguiente.
