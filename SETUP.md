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

Solo si falla esa ruta, probá:

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

La API queda en **[http://localhost:3000](http://localhost:3000)** · comprobar **[http://localhost:3000/health](http://localhost:3000/health)**.

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

Más contexto del producto: **[README](./README.md)**.
