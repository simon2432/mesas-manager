# Setup — Mesas Manager

Guía mínima para levantar **SQL Server (Docker)**, **backend** y **frontend** en Windows. El repo **no incluye** `backend/.env`: lo creás vos en un paso (copiando el ejemplo).

---

## Requisitos

- **Node.js** v20 o v22 (LTS)
- **Docker Desktop** en ejecución
- **Git**

---

## 1. Clonar e ir al proyecto

```powershell
git clone https://github.com/simon2432/mesas-manager
cd mesas-manager
```

---

## 2. SQL Server en Docker

Contraseña del usuario `sa` (demo, solo para desarrollo): **`MesasDemo1`** — está en `database/docker-compose.yml` y debe ser **la misma** que `password=` en tu `backend/.env`.

```powershell
cd database
docker compose up -d
```

Esperá ~30 s. Creá la base (la primera vez; si ya existe, podés ignorar el error):

```powershell
docker exec restaurant-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MesasDemo1" -C -Q "CREATE DATABASE restaurant_db"
```

Si falla esa ruta, probá:

```powershell
docker exec restaurant-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MesasDemo1" -C -Q "CREATE DATABASE restaurant_db"
```

---

## 3. Backend — `.env`

```powershell
cd ..\backend
copy .env.example .env
```

El `.env.example` ya trae `DATABASE_URL` con **`password=MesasDemo1`**. No hace falta codificar nada en la URL.

Luego:

```powershell
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

La API queda en **http://localhost:3000** · comprobar **http://localhost:3000/health**.

---

## 4. Frontend

Otra terminal:

```powershell
cd mesas-manager\frontend
npm install
npx expo start
```

Tecla **`w`** para abrir en el navegador.

**Login demo** (después del seed):

|            |                    |
| ---------- | ------------------ |
| Email      | `demo@mesas.local` |
| Contraseña | `Demo1234`         |

---

## Si cambiaste la contraseña en Docker antes

Si ya tenías un volumen de SQL Server con **otra** `SA_PASSWORD`, el contenedor sigue usando la vieja. Opciones: volver a poner en `docker-compose.yml` la clave que tenía el volumen, o borrar el volumen y levantar de nuevo (se pierden datos del contenedor):

```powershell
cd database
docker compose down -v
docker compose up -d
```

Después recreá `restaurant_db` con el `sqlcmd` del paso 2 y volvé a `migrate deploy` + `db:seed`.

---

## Otros

- **Puerto 1433 ocupado** (SQL Server de Windows + Docker): dejá solo uno o cambiá el mapeo en `docker-compose.yml` y el host en `DATABASE_URL`.
- **Expo en el celular** (misma Wi‑Fi): `EXPO_PUBLIC_API_URL=http://TU_IP:3000/api` antes de `expo start`.
- **Sin Docker**: creá `restaurant_db` en tu instancia y armá `DATABASE_URL` con tu usuario/clave; si la clave tiene símbolos, en la URL a veces hay que codificar (`!` → `%21`, `@` → `%40`).

Más contexto del producto: **[README](./README.md)**.
