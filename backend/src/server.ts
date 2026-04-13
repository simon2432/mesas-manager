import { env } from "./config/env";
import { createApp } from "./app";

createApp().listen(env.PORT, () => {
  console.log(
    `Mesas API · http://localhost:${String(env.PORT)} · /api · GET /health`,
  );
});
