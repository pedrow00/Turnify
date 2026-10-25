# Frontend de Turnify

Interfaz en React + Vite.

## Desarrollo

```bash
npm install
npm run dev
```

La URL de la API se toma de `VITE_API_URL`. En desarrollo está definida en
`.env.development` (`http://localhost:3000`). Para otros entornos, copiar
`.env.example` y ajustar el valor.

## Build

```bash
npm run build     # genera dist/
npm run preview   # sirve el build localmente
```

## Estructura

- `src/pages`: una pantalla por archivo.
- `src/components`: navbar, rutas protegidas y componentes reutilizables.
- `src/context`: estado de autenticación.
- `src/utils`: cliente HTTP (`api.js`), permisos por rol y breakpoints.
- `src/styles`: CSS por pantalla.

La documentación general del proyecto está en el
[README principal](../README.md).
