import { useNavigate } from "react-router-dom";
console.log("Inicio cargado");
const Inicio = () => {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4 text-primary">Turnify</h1>

      <div className="d-grid gap-3 col-6 mx-auto">
        <button className="btn btn-primary" onClick={() => navigate("/pacientes")}>
          Gestión de Pacientes
        </button>

        <button className="btn btn-primary">
          Profesionales
        </button>

        <button className="btn btn-primary">
          Consultorios
        </button>

        <button className="btn btn-primary">
          Turnos
        </button>
      </div>
    </div>
  );
};

export default Inicio;