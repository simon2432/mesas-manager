# Mesas Manager

Monorepo: API Express + Prisma (SQL Server) y cliente Expo (Expo Router).

## Backend

```bash
cd backend
npm install
```

`.env`: `DATABASE_URL` (SQL Server), `JWT_SECRET`, `PORT` (default 3000).

```bash
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

Documentación interactiva: `http://localhost:3000/docs`

## Frontend

```bash
cd frontend
npm install
npx expo start
```

`EXPO_PUBLIC_API_URL` (opcional): base con `/api`. Por defecto: emulador Android `http://10.0.2.2:3000/api`; web / simulador iOS `http://localhost:3000/api`.

## API (`/api`)

Misma base que el cliente (`getApiBaseUrl`). Login: `POST /api/auth/login` → JWT. Resto: header `Authorization: Bearer <token>`.

Prefijos montados en el servidor: `/auth`, `/users`, `/waiters`, `/tables`, `/menu`, `/table-sessions`, `/layouts`, `/dashboard`, `/history`.

Contrato detallado (métodos, roles, query params): **Swagger** en `http://localhost:3000/docs`.

Mozos e ítems de menú: sin DELETE en API; desactivar con `PATCH .../toggle-active` o actualización con `isActive: false` según el recurso.

## Tests y dependencias

- Backend: `cd backend && npm test` (Vitest)
- Frontend: `cd frontend && npm test`
- `cd backend && npm run depcheck` — ignora `@prisma/client` (runtime vía Prisma)

## Reset del frontend

`node frontend/scripts/reset-project.js` mueve `app`, `components`, `hooks`, `constants`, `scripts` a `app-example` y deja plantilla mínima. Requiere directorio vacío o inexistente `app-example`. **Irreversible sin copia manual.**

## Licencia

Privado / uso interno.
