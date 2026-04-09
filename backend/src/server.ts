import { env } from "./config/env";
import { createApp } from "./app";

createApp().listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${String(env.PORT)}`);
  console.log("[boot] REST bajo /api/* — health en GET /health");
});
