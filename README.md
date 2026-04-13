# Mesas Manager

<p align="center">
  <img src="frontend/assets/images/mesas-logo.png" alt="Mesas Manager" width="220" />
</p>

Aplicación pensada para **un restaurante**: centraliza mesas en vivo, consumos, cierre de cuentas, menú, mozos y números del negocio en un solo lugar. El stack es un **monorepo** con API en Node y app móvil/web en Expo, hablando con **SQL Server** a través de Prisma.

No pretende ser un SaaS multi-local: el modelo es **un salón, un equipo**. Igual hay **login con usuario y contraseña**: sirve para saber quién opera la app y mantener la sesión acotada al dispositivo, no para armar perfiles con distintos niveles de acceso en esta versión (quien tiene credenciales puede usar las pantallas habituales del flujo operativo).

---

## Qué incluye (funcionalidades)

- **Acceso** — Pantalla de bienvenida, registro/login y sesión con JWT; cierre de sesión desde _Más_.
- **Mesas** — Vista principal del salón: mesas activas, ocupación y métricas rápidas del día; abrir mesa (mozo, comensales), ver detalle, cargar ítems del menú, cerrar sesión de mesa; desactivar mesa en salón cuando está libre.
- **Layouts** — Plantas con conjuntos de mesas; aplicar hasta dos layouts sin solapamiento; reglas claras cuando hay conflicto (reemplazar agrupaciones).
- **Gestión de mesas** — Alta, edición y activación en catálogo (numeración, capacidad, etc.).
- **Dashboard** — Resumen por **día** o por **rango de fechas** (ingresos, sesiones, personas, ítems vendidos, etc.), alineado a la fecha operativa del servidor.
- **Historial** — Sesiones cerradas por fecha y detalle con líneas consumidas.
- **Menú** — Catálogo de ítems con precio y descripción; altas, edición y baja lógica (sin borrado duro).
- **Meseros** — ABM de mozos y activación/desactivación para asignarlos al abrir mesa.
- **Guía de uso** — Pantalla informativa dentro de _Más_, con capturas de referencia del flujo.

La **API REST** documenta endpoints y contratos en **Swagger** (`/docs` con el backend en marcha).

---

## Estructura del repositorio

```
mesas-manager/
├── backend/          # API Express, Prisma, lógica de negocio y migraciones
│   ├── prisma/       # Esquema y migraciones SQL Server
│   ├── scripts/      # Utilidades (p. ej. seed de datos demo)
│   └── src/          # Módulos (auth, mesas, sesiones, menú, layouts, dashboard, historial…)
├── frontend/         # Cliente Expo (Expo Router)
│   ├── app/          # Rutas y pantallas
│   ├── assets/       # Imágenes (logo, figuras de ayuda, etc.)
│   └── src/          # Componentes, API client, stores, hooks, utilidades
└── README.md         # Este archivo
```

---

## Tecnologías (resumen)

| Área                       | Elección principal                            |
| -------------------------- | --------------------------------------------- |
| **API**                    | Node.js, Express, TypeScript                  |
| **Datos**                  | Prisma ORM, Microsoft SQL Server              |
| **Auth**                   | JWT, bcrypt                                   |
| **Validación**             | Zod (backend y formularios donde aplica)      |
| **Cliente**                | React 19, React Native, Expo ~54, Expo Router |
| **Estado / datos remotos** | Zustand (persistencia local), TanStack Query  |
| **HTTP**                   | Axios                                         |
| **Tests (backend)**        | Vitest                                        |

---

## Datos de demostración (seed)

Después de tener la base creada y las migraciones aplicadas, podés cargar un escenario listo para probar la app (mesas, mozos, menú, layouts, historial de varios días y una mesa con cuenta abierta):

```bash
cd backend
npm run db:seed
```

También funciona como semilla oficial de Prisma: `npx prisma db seed` (desde `backend/`).

**Usuario para entrar en la app**

| Campo    | Valor              |
| -------- | ------------------ |
| Email    | `demo@mesas.local` |
| Password | `Demo1234`         |

El script **borra** usuarios, mesas, menú, mozos, layouts y sesiones existentes y vuelve a insertar solo el set demo. No corre en `NODE_ENV=production` salvo que definas `ALLOW_DEMO_SEED=1` (por si acaso).

---

## Puesta en marcha

Los pasos detallados (variables de entorno, creación de la base, migraciones, cómo levantar backend y frontend en paralelo, y opciones para dispositivo físico o web) viven en un documento aparte para no mezclar la descripción del producto con el checklist de instalación:

**→ [Setup del proyecto](./SETUP.md)**

---

## Licencia

Uso **privado** / interno.
