export const soloDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

export const formatearCuil = (cuil) => {
  const digitos = soloDigitos(cuil);
  if (digitos.length !== 11) return digitos;
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
};
