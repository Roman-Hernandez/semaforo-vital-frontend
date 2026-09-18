# Semáforo Vital Frontend

Base de proyecto **Next.js + React + Tailwind** con arquitectura por capas, preparada para crecer de forma ordenada.

## Estructura base

```text
src/
  app/                          # Capa framework (routing/layout)
  layers/
    presentation/
      pages/                    # Páginas y composición de vistas
      components/               # Componentes UI reutilizables
    domain/
      books/                    # Contratos/modelos del dominio
    application/
      services/                 # Casos de uso / lógica de aplicación
```

## Página implementada

- Hero inicial con el mensaje: **"Muy pronto"**

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Docker

```bash
docker build -t semaforo-vital-frontend .
docker run -p 3000:3000 semaforo-vital-frontend
```
