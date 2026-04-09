# Mesas Manager — Technical Test

> Sistema de gestión de mesas y operaciones para restaurantes, desarrollado como prueba técnica.

---

## Descripción

**Mesas Manager** es una aplicación fullstack orientada a la gestión operativa de un restaurante. Permite administrar mozos, mesas, sesiones de atención, pedidos del menú y visualizar métricas en un dashboard. Fue desarrollada como **prueba técnica** para demostrar capacidades de diseño de sistemas, arquitectura REST, modelado de datos relacional y desarrollo mobile.

---

## Stack tecnológico

### Backend

| Tecnología         | Versión | Rol                                |
| ------------------ | ------- | ---------------------------------- |
| Node.js            | LTS     | Runtime                            |
| TypeScript         | ^6.0    | Tipado estático                    |
| Express            | ^5.2    | Framework HTTP                     |
| Prisma             | ^7.7    | ORM                                |
| SQL Server         | —       | Base de datos                      |
| JWT (jsonwebtoken) | ^9.0    | Autenticación                      |
| bcrypt             | ^6.0    | Hash de contraseñas                |
| Zod                | ^4.3    | Validación de schemas              |
| tsx                | ^4.21   | Ejecución TypeScript en desarrollo |

### Frontend

| Tecnología              | Versión | Rol                        |
| ----------------------- | ------- | -------------------------- |
| React Native            | 0.81    | Framework mobile           |
| Expo                    | ~54.0   | Plataforma y tooling       |
| Expo Router             | ~6.0    | Navegación file-based      |
| React Navigation        | ^7.0    | Navegación entre pantallas |
| React Native Reanimated | ~4.1    | Animaciones fluidas        |
| TypeScript              | ~5.9    | Tipado estático            |

---

## Arquitectura del proyecto

```
mesas-manager/
├── backend/                    # API REST en Express + TypeScript
│   ├── prisma/
│   │   └── schema.prisma       # Modelo de datos
│   └── src/
│       ├── config/             # Variables de entorno validadas
│       ├── lib/                # Cliente Prisma (MSSQL adapter)
│       ├── middlewares/        # Auth, error handler, not found
│       ├── utils/              # HttpError helper, asyncHandler
│       ├── types/              # Extensiones de tipos Express
│       └── modules/            # Módulos por dominio
│           ├── auth/           # Login + JWT
│           ├── waiters/        # CRUD de mozos
│           ├── tables/         # CRUD de mesas
│           ├── menu/           # CRUD de items del menú
│           ├── tableSessions/  # Apertura/cierre de sesiones de mesa
│           ├── layouts/        # Layouts visuales del salón
│           ├── dashboard/      # Métricas en tiempo real
│           └── history/        # Historial de sesiones cerradas
│
└── frontend/                   # App mobile en React Native + Expo
    ├── app/                    # Rutas (Expo Router file-based)
    ├── components/             # Componentes reutilizables
    ├── hooks/                  # Custom hooks
    └── constants/              # Tema visual (colores, fuentes)
```

---

## Modelo de datos

El sistema maneja las siguientes entidades en SQL Server:

### `User`

Usuarios del sistema (administradores). Autenticación vía email + contraseña hasheada.

### `Waiter`

Mozos del restaurante. Se activan/desactivan sin eliminarlos del historial.

### `RestaurantTable`

Mesas físicas del local. Cada mesa tiene número, capacidad y estado (`FREE` | `OCCUPIED`).

### `Layout`

Configuraciones visuales del salón. Permiten mapear qué mesas están activas en un turno específico.

### `LayoutTable`

Tabla pivote que relaciona un `Layout` con sus `RestaurantTable`.

### `MenuItem`

Ítems del menú. Tienen nombre, descripción, precio y estado activo/inactivo.

### `TableSession`

Sesión de atención de una mesa. Vincula una `RestaurantTable` con un `Waiter`, registra la cantidad de comensales, el total acumulado y el estado (`OPEN` | `CLOSED`).

### `SessionItem`

Líneas de pedido dentro de una `TableSession`. Registra el ítem, cantidad, precio unitario y nombre del producto al momento del pedido (precio histórico).

---

## API REST

Base URL: `http://localhost:<PORT>/api`

### Auth

| Método | Endpoint      | Descripción                               | Auth requerida |
| ------ | ------------- | ----------------------------------------- | -------------- |
| `POST` | `/auth/login` | Login con email y contraseña, retorna JWT | No             |
| `GET`  | `/auth/me`    | Datos del usuario autenticado             | Sí             |

### Mozos

| Método   | Endpoint              | Descripción             | Auth requerida |
| -------- | --------------------- | ----------------------- | -------------- |
| `GET`    | `/waiters`            | Listar todos los mozos  | Sí             |
| `POST`   | `/waiters`            | Crear mozo              | Sí             |
| `GET`    | `/waiters/:id`        | Obtener mozo por ID     | Sí             |
| `PUT`    | `/waiters/:id`        | Actualizar mozo         | Sí             |
| `PATCH`  | `/waiters/:id/toggle` | Activar/desactivar mozo | Sí             |
| `DELETE` | `/waiters/:id`        | Eliminar mozo           | Sí             |

### Mesas

| Método   | Endpoint      | Descripción         | Auth requerida |
| -------- | ------------- | ------------------- | -------------- |
| `GET`    | `/tables`     | Listar mesas        | Sí             |
| `POST`   | `/tables`     | Crear mesa          | Sí             |
| `GET`    | `/tables/:id` | Obtener mesa por ID | Sí             |
| `PUT`    | `/tables/:id` | Actualizar mesa     | Sí             |
| `DELETE` | `/tables/:id` | Eliminar mesa       | Sí             |

### Menú

| Método   | Endpoint    | Descripción           | Auth requerida |
| -------- | ----------- | --------------------- | -------------- |
| `GET`    | `/menu`     | Listar ítems del menú | Sí             |
| `POST`   | `/menu`     | Crear ítem            | Sí             |
| `GET`    | `/menu/:id` | Obtener ítem por ID   | Sí             |
| `PUT`    | `/menu/:id` | Actualizar ítem       | Sí             |
| `DELETE` | `/menu/:id` | Eliminar ítem         | Sí             |

### Sesiones de mesa

| Método   | Endpoint                            | Descripción                 | Auth requerida |
| -------- | ----------------------------------- | --------------------------- | -------------- |
| `POST`   | `/table-sessions`                   | Abrir sesión en una mesa    | Sí             |
| `GET`    | `/table-sessions/:id`               | Ver sesión activa           | Sí             |
| `POST`   | `/table-sessions/:id/items`         | Agregar ítem al pedido      | Sí             |
| `DELETE` | `/table-sessions/:id/items/:itemId` | Quitar ítem del pedido      | Sí             |
| `POST`   | `/table-sessions/:id/close`         | Cerrar sesión (cobrar mesa) | Sí             |

### Layouts

| Método   | Endpoint       | Descripción                  | Auth requerida |
| -------- | -------------- | ---------------------------- | -------------- |
| `GET`    | `/layouts`     | Listar layouts del salón     | Sí             |
| `POST`   | `/layouts`     | Crear layout                 | Sí             |
| `GET`    | `/layouts/:id` | Obtener layout con sus mesas | Sí             |
| `PUT`    | `/layouts/:id` | Actualizar layout            | Sí             |
| `DELETE` | `/layouts/:id` | Eliminar layout              | Sí             |

### Dashboard

| Método | Endpoint     | Descripción                                                          | Auth requerida |
| ------ | ------------ | -------------------------------------------------------------------- | -------------- |
| `GET`  | `/dashboard` | Métricas del día (mesas activas, total recaudado, mozos en servicio) | Sí             |

### Historial

| Método | Endpoint   | Descripción                                         | Auth requerida |
| ------ | ---------- | --------------------------------------------------- | -------------- |
| `GET`  | `/history` | Historial de sesiones cerradas con filtros de fecha | Sí             |

---

## Instalación y ejecución

### Requisitos previos

- Node.js LTS
- SQL Server (local o remoto)
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# Generar cliente Prisma
npm run prisma:generate

# Modo desarrollo (hot reload)
npm run dev

# Producción
npm run build
npm start
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## Variables de entorno (Backend)

Crear un archivo `.env` en `/backend` con las siguientes variables:

```env
DATABASE_URL="sqlserver://HOST:PORT;database=DBNAME;user=USER;password=PASSWORD;encrypt=true"
JWT_SECRET="un-secreto-seguro-y-largo"
PORT=3000
CLIENT_URL="http://localhost:8081"
NODE_ENV=development
```

| Variable       | Descripción                               | Requerida en producción |
| -------------- | ----------------------------------------- | ----------------------- |
| `DATABASE_URL` | Cadena de conexión a SQL Server           | Sí                      |
| `JWT_SECRET`   | Secreto para firmar JWT (mínimo 32 chars) | Sí                      |
| `PORT`         | Puerto donde escucha la API               | No (default: 3000)      |
| `CLIENT_URL`   | Origen permitido por CORS                 | Sí                      |
| `NODE_ENV`     | Entorno de ejecución                      | Sí                      |

---

## Seguridad

- Las contraseñas se almacenan hasheadas con **bcrypt** (nunca en texto plano).
- La autenticación usa **JWT** con expiración de 7 días.
- Todas las rutas operativas requieren un `Bearer token` válido en el header `Authorization`.
- Los errores no exponen información interna del servidor.
- El email se normaliza (lowercase + trim) antes de comparar.

---

## Decisiones de diseño

- **Modular por dominio:** cada entidad de negocio tiene su carpeta con schema, servicio, controlador y rutas. Facilita el escalado y el mantenimiento.
- **`asyncHandler` wrapper:** elimina el boilerplate de try/catch en cada controller de Express.
- **Zod para validación:** schemas declarativos que sirven tanto para validar requests como para inferir tipos TypeScript.
- **`SessionItem` con precio histórico:** el `unitPrice` y `productName` se copian al momento del pedido, preservando el historial aunque el menú cambie.
- **SQL Server sin enums Prisma:** se usan strings con valores fijos (`FREE | OCCUPIED`, `OPEN | CLOSED`) y la restricción vive en la lógica de la aplicación.
- **Expo Router:** navegación file-based que simplifica la estructura de rutas mobile y permite deep linking nativo.
