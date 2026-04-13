# Setup — Mesas Manager (guía corta)

Objetivo: clonar el repo, conectar **SQL Server**, levantar la **API** y la app **Expo**, y cargar datos de prueba. Comandos pensados para **Windows** (PowerShell o CMD).

---

## Qué tener instalado

- **Node.js** (LTS, v20 o v22).
- **Git**.
- **SQL Server** con una **base vacía** (podés crearla con SQL Server Management Studio o similar).
- Para probar en el celular: app **Expo Go** (Play Store / App Store).
- Para emulador en la PC: **Android Studio** con un dispositivo virtual (AVD).

---

## 1. Clonar e ir a la carpeta

```powershell
git clone <url-de-tu-repo>
cd mesas-manager
```

---

## 2. Crear el archivo `.env` del backend

En Windows, desde la carpeta del proyecto:

```powershell
cd backend
copy .env.example .env
```

Abrí **`backend/.env`** con el editor de texto y reemplazá los valores. Abajo tenés un **ejemplo completo**; solo cambiá lo que está en **mayúsculas** o entre comillas según tu máquina.

### Ejemplo de `DATABASE_URL` (SQL Server)

Una sola línea. Significado de cada parte:

| Parte en la URL | Qué poner                                      |
| --------------- | ---------------------------------------------- |
| `localhost`     | Servidor SQL (en tu PC suele ser `localhost`). |
| `1433`          | Puerto (el típico de SQL Server).              |
| `restaurant_db` | **Nombre de la base** que creaste (vacía).     |
| `sa`            | **Usuario** que usa la API (puede ser otro).   |
| `TU_PASSWORD`   | **Contraseña** de ese usuario.                 |

**Ejemplo** (usuario `sa`, base `restaurant_db`, contraseña `MiSql2024!`):

```env
DATABASE_URL="sqlserver://localhost:1433;database=restaurant_db;user=sa;password=MiSql2024!;encrypt=true;trustServerCertificate=true"
```

> Si la contraseña tiene caracteres raros (`;`, `@`, etc.), a veces hay que escaparlos o usar el formato que indique la documentación de Prisma para SQL Server.

### Ejemplo de `JWT_SECRET`

Cualquier texto largo sirve en desarrollo. Ejemplo:

```env
JWT_SECRET="mi-clave-larga-para-desarrollo-no-usar-en-produccion-12345"
```

### Resto del `.env` (podés dejarlo así para empezar)

```env
PORT=3000
NODE_ENV=development
```

**`CLIENT_URL`**: para arrancar simple, podés **borrar la línea** o dejarla vacía:

```env
CLIENT_URL=
```

Así el backend suele aceptar peticiones desde Expo en local sin pelearse con CORS. Si más adelante tenés problemas en **web**, probá de nuevo con algo como `http://localhost:8081` (el puerto que muestre Expo en el navegador).

---

## 3. Comandos del backend (en orden)

Seguí en la carpeta **`backend/`**:

```powershell
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- **`migrate deploy`**: crea las tablas en la base que pusiste en `DATABASE_URL`.
- **`db:seed`**: **borra** datos viejos de demo y carga mesas, menú, mozos, historial de ejemplo, etc.

Si todo va bien, la API queda en **`http://localhost:3000`**.

Probar en el navegador:

- `http://localhost:3000/health` → debería responder OK.
- `http://localhost:3000/docs` → Swagger.

**Usuario para la app** (después del seed):

|            |                    |
| ---------- | ------------------ |
| Email      | `demo@mesas.local` |
| Contraseña | `Demo1234`         |

Dejá esta terminal **abierta** con `npm run dev`.

---

## 4. Comandos del frontend

Abrí **otra** terminal. Ubicate en la **raíz del clon** (la carpeta que contiene `backend` y `frontend`), luego:

```powershell
cd frontend
npm install
npx expo start
```

En la consola de Expo:

- **`w`** → abre la app en el **navegador** (lo más fácil en la misma PC; no hace falta configurar IP).
- **`a`** → abre en **emulador Android** (el emulador tiene que estar ya encendido). Sin variables extra, la app usa `http://10.0.2.2:3000/api` y suele funcionar con la API en `localhost:3000`.

Iniciá sesión con `demo@mesas.local` / `Demo1234`.

---

## 5. Solo si usás Expo Go en el celular (Android o iPhone)

El teléfono **no** entiende `localhost` de tu PC. Hacé:

1. PC y celular en la **misma Wi‑Fi**.
2. En Windows: `ipconfig` → anotá la **IPv4** (ej. `192.168.1.40`).
3. **Antes** de `npx expo start`, en PowerShell, desde la carpeta **`frontend`**:

```powershell
cd frontend
$env:EXPO_PUBLIC_API_URL="http://192.168.1.40:3000/api"
npx expo start
```

(Primero `cd` hasta la raíz del repo si hace falta, después `cd frontend`.)

(Cambiá `192.168.1.40` por **tu** IP.)

4. Abrí **Expo Go** y escaneá el **QR** que muestra la consola.

Si no carga, en el menú de Expo probá **Tunnel** y revisá que el **firewall** de Windows permita el puerto **3000**.

---

## 6. Resumen: orden de una sola pasada

1. Clonar → `cd mesas-manager`.
2. `backend`: `copy .env.example .env` → editar **`DATABASE_URL`** y **`JWT_SECRET`** con valores reales (ejemplos arriba).
3. `npm install` → `npm run prisma:generate` → `npx prisma migrate deploy` → `npm run db:seed` → `npm run dev`.
4. `frontend`: `npm install` → `npx expo start` → **`w`** (web) o celular/emulador como en §5 y §4.
5. Login: **`demo@mesas.local`** / **`Demo1234`**.

---

## Si algo falla

- **Error al migrar o al seed** → Revisá `DATABASE_URL` (nombre de base, usuario, contraseña, que SQL Server esté encendido).
- **La app no trae datos** → ¿Sigue corriendo `npm run dev` en `backend`? ¿Hiciste el seed?
- **Celular sin conexión a la API** → Misma Wi‑Fi, IP correcta en `EXPO_PUBLIC_API_URL`, firewall en **3000**.

Más detalle del producto: **[README](./README.md)**.
