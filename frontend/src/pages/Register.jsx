import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Register.css";

const ROLES = [
  { id: 2, label: "Socio" },
  { id: 3, label: "Secretaria" },
  { id: 4, label: "Profesional" },
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rol_id: "3",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(formData.email, formData.password, Number(formData.rol_id));
      setSuccess(`Usuario ${formData.email} creado correctamente`);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        rol_id: formData.rol_id,
      });
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="logo">
            <img src="/LogoSinLetras.png" alt="Turnify" className="logo-img" />
            <span className="logo-text">Turnify</span>
          </Link>
          <h1>Crear Usuario</h1>
          <p>Creá un usuario y asignale un rol</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error ? <div className="submit-error">{error}</div> : null}
          {success ? <div className="submit-success">{success}</div> : null}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol_id">Tipo de usuario</label>
            <select
              id="rol_id"
              name="rol_id"
              value={formData.rol_id}
              onChange={handleChange}
            >
              {ROLES.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Creando usuario..." : "Crear Usuario"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            <Link to="/">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
