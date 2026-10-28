import { formatearCuil, soloDigitos } from "../utils/documento";

/**
 * Campo CUIL unico. No se calcula a partir del DNI ni se deduce de otro dato:
 * el valor se ingresa y se guarda tal cual (solo digitos en el backend).
 */
export default function CampoCuil({ id, value, onChange }) {
  const digitos = soloDigitos(value);
  const completo = digitos.length === 11;

  return (
    <div className="usuarios-field">
      <label htmlFor={id}>CUIL</label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="numeric"
        placeholder="20-30111222-3"
        required
      />
      <span className="usuarios-hint">
        {completo
          ? `Se guarda como ${formatearCuil(digitos)}`
          : "11 dígitos, con o sin guiones."}
      </span>
    </div>
  );
}
