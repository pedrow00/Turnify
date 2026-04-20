const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Turnify funcionando 🚀');
});


const authRoutes = require('./routes/auth');
const especialidadRoutes = require('./routes/especialidad.routes');
const pacienteRoutes = require('./routes/paciente.routes');
const profesionalRoutes = require('./routes/profesional.routes');
const consultorioRoutes = require('./routes/consultorio.routes');
const turnoRoutes = require('./routes/turnos.routes');

app.use('/auth', authRoutes);
app.use('/especialidades', especialidadRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/profesionales', profesionalRoutes);
app.use('/consultorios', consultorioRoutes);
app.use('/turnos', turnoRoutes)

module.exports = app;