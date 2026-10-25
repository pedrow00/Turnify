const PESOS_CUIL = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export const soloDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

export const formatearDni = (dni) => {
  const digitos = soloDigitos(dni);
  if (digitos.length === 8) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  }
  if (digitos.length === 7) {
    return `${digitos.slice(0, 1)}.${digitos.slice(1, 4)}.${digitos.slice(4)}`;
  }
  return digitos;
};

export const formatearCuil = (cuil) => {
  const digitos = soloDigitos(cuil);
  if (digitos.length !== 11) return digitos;
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
};

/**
 * CUIL con el dígito verificador de AFIP: prefijo (2) + DNI (8) + DV.
 * Devuelve solo dígitos, igual que se guarda en la base.
 */
export const calcularCuil = (dni, prefijo = "20") => {
  const baseDni = soloDigitos(dni).padStart(8, "0");
  const base = `${prefijo}${baseDni}`;
  const suma = base
    .split("")
    .reduce((total, digito, indice) => total + Number(digito) * PESOS_CUIL[indice], 0);
  const resto = suma % 11;
  const verificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return `${prefijo}${baseDni}${verificador}`;
};

export const dniDesdeCuil = (cuil) => {
  const digitos = soloDigitos(cuil);
  if (digitos.length !== 11) return "";
  return digitos.slice(2, 10).replace(/^0+(?=\d)/, "");
};

/**
 * A partir de lo que se cargó (DNI o CUIL) devuelve ambos valores listos
 * para mandar al backend.
 */
export const documentoDesde = (tipo, numero) => {
  const digitos = soloDigitos(numero);
  if (!digitos) return { dni: "", cuil: "" };

  if (tipo === "cuil") {
    return { dni: dniDesdeCuil(digitos), cuil: digitos };
  }
  return { dni: digitos, cuil: calcularCuil(digitos) };
};
