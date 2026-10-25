import { documentoDesde, formatearCuil, formatearDni } from "../utils/documento";

/**
 * Selector DNI/CUIL + un solo campo. El otro documento se calcula solo y se
 * muestra debajo, para que no haya que cargar los dos.
 */
export default function CamposDocumento({
  idPrefix,
  tipo,
  onTipoChange,
  numero,
  onNumeroChange,
}) {
  const { dni, cuil } = documentoDesde(tipo, numero);
  const completo = tipo === "dni" ? dni.length >= 7 : cuil.length === 11;

  return (
    <>
      <div className="usuarios-field">
        <label htmlFor={`${idPrefix}-tipo`}>Tipo de documento</label>
        <select
          id={`${idPrefix}-tipo`}
          value={tipo}
          onChange={(event) => {
            onTipoChange(event.target.value);
            onNumeroChange("");
          }}
        >
          <option value="dni">DNI</option>
          <option value="cuil">CUIL</option>
        </select>
      </div>

      <div className="usuarios-field">
        <label htmlFor={`${idPrefix}-numero`}>
          {tipo === "dni" ? "DNI" : "CUIL"}
        </label>
        <input
          id={`${idPrefix}-numero`}
          value={numero}
          onChange={(event) => onNumeroChange(event.target.value)}
          inputMode="numeric"
          placeholder={tipo === "dni" ? "30.111.222" : "20-30111222-3"}
          required
        />
        <span className="usuarios-hint">
          {completo
            ? tipo === "dni"
              ? `CUIL calculado: ${formatearCuil(cuil)}`
              : `DNI: ${formatearDni(dni)}`
            : tipo === "dni"
              ? "El CUIL se calcula automáticamente."
              : "El DNI se toma del CUIL."}
        </span>
      </div>
    </>
  );
}
