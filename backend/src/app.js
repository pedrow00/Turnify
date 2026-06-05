const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

const { requestLogger } = require('./utils/logger');
app.use(requestLogger);

app.get('/', (req, res) => {
    res.send('API Turnify funcionando');
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-cambiar',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 8 * 60 * 60 * 1000
  }
}));



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