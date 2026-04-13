# Setup — Mesas Manager

Guía para levantar **backend**, **frontend** y **SQL Server en Docker** en Windows (PowerShell o CMD). El único archivo que **no viene en el repo** y hay que crear a mano es `**backend/.env`**.

---

## Requisitos previos

- **Node.js** v20 o v22 (LTS).
- **Git** (para clonar).
- **Docker Desktop** instalado y **en ejecución** (para la base en contenedor).

Opcional: **Expo Go** en el celular; **Android Studio** si querés emulador Android.

---

## Orden exacto de pasos (camino feliz con Docker)

### 0. Clonar (si aún no tenés el repo)

```powershell
git clone <url-del-repo>
cd mesas-manager
```

(Ajustá la carpeta si tu clon tiene otro nombre.)

### 1. Levantar SQL Server en Docker

```powershell
cd database
docker compose up -d
```

Esperá unos **30 segundos** a que arranque el contenedor `restaurant-sqlserver`.

**Crear la base vacía** `restaurant_db` (solo la primera vez; si ya existe, podés ignorar el error):

```powershell
docker exec restaurant-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Pass123" -C -Q "CREATE DATABASE restaurant_db"
```

Si no existe `sqlcmd` en esa ruta:

```powershell
docker exec restaurant-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Pass123" -C -Q "CREATE DATABASE restaurant_db"
```

La contraseña del `sa` está en `**database/docker-compose.yml**` (`SA_PASSWORD`), por defecto `**YourStrong!Pass123**`.

### 2. Crear `backend/.env`

En la carpeta `**backend**` no hay `.env` en el repo: crealo **a mano** (o `copy .env.example .env` y reemplazá el contenido).

**Contenido recomendado** (copiar tal cual; fijate en la nota del `DATABASE_URL`):

```env
DATABASE_URL="sqlserver://localhost:1433;database=restaurant_db;user=sa;password=YourStrong%21Pass123;encrypt=true;trustServerCertificate=true"
JWT_SECRET="mi-clave-larga-para-desarrollo-no-usar-en-produccion-12345"
PORT=3000
NODE_ENV=development
CLIENT_URL=
```

- `**password=YourStrong%21Pass123**` es la misma clave que `**YourStrong!Pass123**` del Docker, pero con el `**!` escrito como `%21**`, porque Prisma parsea la URL y a muchos equipos les da `**P1000` / credenciales inválidas** si ponen el `!` literal en la cadena.
- Si en tu máquina **funciona** con `password=YourStrong!Pass123` dentro de las comillas, podés dejarlo así; si `**npx prisma migrate deploy`** falla con autenticación, usá siempre `**%21**`.

### 3. Backend — instalar, Prisma, migraciones, seed, servidor

```powershell
cd ..\backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Dejá esta terminal **abierta**. La API queda en **[http://localhost:3000](http://localhost:3000)**.

**Comprobar:**

- [http://localhost:3000/health](http://localhost:3000/health) → JSON con `"ok": true` y `"message": "OK"`
- Rutas de la API bajo [http://localhost:3000/api/…](http://localhost:3000/api/…) (ver `backend/src/routes/index.ts`)

### 4. Frontend — otra terminal nueva

```powershell
cd mesas-manager\frontend
npm install
npx expo start
```

Cuando aparezca el menú de Expo, presioná `**w**` para abrir en el **navegador** (suele ser **[http://localhost:8081](http://localhost:8081)**).

**Entrar a la app** (después del seed):


|            |                    |
| ---------- | ------------------ |
| Email      | `demo@mesas.local` |
| Contraseña | `Demo1234`         |


---

## Resumen de una línea

`database` → `docker compose up -d` → crear `restaurant_db` → `backend/.env` → `npm install` + `prisma:generate` + `migrate deploy` + `db:seed` + `dev` → `frontend` → `npm install` + `expo start` → `**w`**.

---

## Sin Docker (SQL Server instalado en Windows)

Creá la base `**restaurant_db**` a mano (SSMS, Azure Data Studio, etc.) y armá `**DATABASE_URL**` con tu usuario, contraseña y host. Si la contraseña tiene `**!**`, `**@**`, etc., en la URL usá codificación (`!` → `%21`, `@` → `%40`).

---

## Expo Go en el celular

Misma Wi‑Fi que la PC. En PowerShell, desde `**frontend**`:

```powershell
$env:EXPO_PUBLIC_API_URL="http://TU_IPv4:3000/api"
npx expo start
```

(`ipconfig` en Windows para ver la IPv4.) Escanear el QR con Expo Go. Si falla, probá **Tunnel** en Expo y abrí el firewall del puerto **3000**.

## Emulador Android

Emulador encendido → `npx expo start` → tecla `**a`**. Sin variable extra suele bastar `http://10.0.2.2:3000/api` hacia la API en `localhost`.

---

## Si algo falla

- **Al hacer login aparece el mensaje largo de “SQL Server rechazó el usuario o la contraseña”** → No es el email/contraseña de la app: el **backend no llega a conectar** a la base. Hacé esto en orden:
  1. `docker ps` y comprobá que el contenedor `**restaurant-sqlserver`** esté **Up**.
  2. Abrí `**backend/.env`** y revisá `**DATABASE_URL**`: la parte `**password=**` debe ser **exactamente** la misma clave que `**SA_PASSWORD`** en `**database/docker-compose.yml**`. Si la clave es `YourStrong!Pass123`, en la URL usá `**password=YourStrong%21Pass123**` (el `!` → `**%21**`). Si tiene `**@**`, usá `**%40**`.
  3. Si cambiaste `SA_PASSWORD` en Docker **después** de crear el volumen, el `sa` del contenedor puede seguir con la clave vieja: o volvés a la clave original, o recreás el volumen (se pierden datos del contenedor).
  4. Reiniciá el backend (`Ctrl+C` y otra vez `npm run dev`).
- `**P1000` / credenciales `sa` inválidas** → En `DATABASE_URL` usá `**YourStrong%21Pass123`** en lugar de `YourStrong!Pass123`.
- `**restaurant_db` no existe** → Volvé al paso 1 con `sqlcmd` o creala con SSMS.
- **401** en `/api/waiters`, menú, etc. **sin login** → Normal; primero tenés que entrar con el usuario demo.
- **Docker + SQL Server en Windows a la vez** → Pueden chocar en el puerto **1433**; dejá solo uno escuchando o cambiá el mapeo de puertos en `docker-compose.yml`.

Más sobre el producto: **[README](./README.md)**.