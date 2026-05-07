import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Register from './pages/Register'
import Paciente from './pages/Paciente'
import RegistrarPaciente from './pages/RegistrarPaciente'
import EditarPaciente from './pages/EditarPaciente'
import Profesional from './pages/Profesional'
import RegistrarProfesional from './pages/RegistrarProfesional'
import EditarProfesional from './pages/EditarProfesional'
import Turno from './pages/Turno'
import Navbar from './components/Navbar'
import Consultorio from './pages/Consultorio'
import RegistrarConsultorio from './pages/RegistrarConsultorio'
import EditarConsultorio from './pages/EditarConsultorio'

function App() {
  return (
    <BrowserRouter> 
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/paciente" element={<Paciente/>} />
        <Route path="/paciente/nuevo" element={<RegistrarPaciente/>} />
        <Route path="/paciente/:id/editar" element={<EditarPaciente/>} />
        <Route path="/profesional" element={<Profesional/>} />
        <Route path="/profesional/nuevo" element={<RegistrarProfesional/>} />
        <Route path="/profesional/:id/editar" element={<EditarProfesional/>} />
        <Route path="/turno" element={<Turno/>} />
        <Route path="/consultorio" element={<Consultorio/>} />
        <Route path="/consultorio/nuevo" element={<RegistrarConsultorio/>} />
        <Route path="/consultorio/:id/editar" element={<EditarConsultorio/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
