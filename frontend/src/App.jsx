import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Paciente from "./pages/Paciente";
import RegistrarPaciente from "./pages/RegistrarPaciente";
import EditarPaciente from "./pages/EditarPaciente";
import Profesional from "./pages/Profesional";
import RegistrarProfesional from "./pages/RegistrarProfesional";
import EditarProfesional from "./pages/EditarProfesional";
import Turno from "./pages/Turno";
import ListadoTurnos from "./pages/ListadoTurnos";
import Navbar from "./components/Navbar";
import Consultorio from "./pages/Consultorio";
import RegistrarConsultorio from "./pages/RegistrarConsultorio";
import EditarConsultorio from "./pages/EditarConsultorio";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/paciente"
            element={
              <ProtectedRoute  permission="paciente">
                <Paciente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/nuevo"
            element={
              <ProtectedRoute permission="pacienteWrite">
                <RegistrarPaciente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/:id/editar"
            element={
              <ProtectedRoute permission="pacienteWrite">
                <EditarPaciente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profesional"
            element={
              <ProtectedRoute permission="profesional">
                <Profesional />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profesional/nuevo"
            element={
              <ProtectedRoute permission="profesional">
                <RegistrarProfesional />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profesional/:id/editar"
            element={
              <ProtectedRoute permission="profesional">
                <EditarProfesional />
              </ProtectedRoute>
            }
          />
          <Route
            path="/turno"
            element={
              <ProtectedRoute permission="turno">
                <Turno />
              </ProtectedRoute>
            }
          />
          <Route
            path="/turno/nuevo"
            element={
              <ProtectedRoute permission="turno">
                <Turno mode="form" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/turno/listado"
            element={
              <ProtectedRoute permission="turno">
                <ListadoTurnos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultorio"
            element={
              <ProtectedRoute permission="consultorio">
                <Consultorio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultorio/nuevo"
            element={
              <ProtectedRoute permission="consultorio">
                <RegistrarConsultorio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultorio/:id/editar"
            element={
              <ProtectedRoute permission="consultorio">
                <EditarConsultorio />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
