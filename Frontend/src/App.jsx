import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Register from './pages/Register'
import Paciente from './pages/Paciente'
import Profesional from './pages/Profesional'
import Turno from './pages/Turno'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter> 
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/paciente" element={<Paciente/>} />
        <Route path="/profesional" element={<Profesional/>} />
        <Route path="/turno" element={<Turno/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App