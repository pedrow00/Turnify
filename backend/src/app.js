const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Turnify funcionando 🚀');
});


const pacienteRoutes = require('./routes/paciente.routes');
const profesionalRoutes = require('./routes/profesional.routes');
const consultorioRoutes = require('./routes/consultorio.routes');
const turnoRoutes = require('./routes/turnos.routes');
const especialidadRoutes = require('.//routes/especialidades.routes');

app.use('/pacientes', pacienteRoutes);
app.use('/profesionales', profesionalRoutes);
app.use('/consultorios', consultorioRoutes);
app.use('/turnos', turnoRoutes)
app.use('/especialidades', especialidadRoutes);

module.exports = app;