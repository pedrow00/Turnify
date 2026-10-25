const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const { requestLogger, logger } = require('./utils/logger');

const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret && isProduction) {
  throw new Error('SESSION_SECRET es obligatorio cuando NODE_ENV=production');
}
if (!sessionSecret) {
  logger.warn('SESSION_SECRET no definida: se usa un valor de desarrollo');
}

const app = express();

// En produccion el frontend se sirve desde el mismo origen que la API, asi
// que CORS no hace falta. En desarrollo se permite el servidor de Vite.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('API Turnify funcionando');
});

// Detras de un proxy (Render, Railway, Nginx) hace falta para que la cookie
// secure y el rate limit por IP vean el protocolo y la IP reales.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  session({
    secret: sessionSecret || 'dev-secret-cambiar',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

const pacienteRoutes = require('./routes/paciente.routes');
const profesionalRoutes = require('./routes/profesional.routes');
const consultorioRoutes = require('./routes/consultorio.routes');
const turnoRoutes = require('./routes/turnos.routes');
const especialidadRoutes = require('./routes/especialidades.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/pacientes', pacienteRoutes);
app.use('/profesionales', profesionalRoutes);
app.use('/consultorios', consultorioRoutes);
app.use('/turnos', turnoRoutes);
app.use('/especialidades', especialidadRoutes);
app.use('/auth', authRoutes);

module.exports = app;
