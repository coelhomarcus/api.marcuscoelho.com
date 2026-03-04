import { env } from "./config/env";
import { app } from "./app";
import cron from "node-cron";
import {
  refreshGitHubContributions,
  refreshGitHubStats,
} from "./modules/github/github.service";

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

// Atualiza cache do GitHub a cada 6 horas
cron.schedule("0 */6 * * *", () => {
  refreshGitHubContributions().catch(console.error);
  refreshGitHubStats().catch(console.error);
});

// Busca inicial ao subir o servidor
refreshGitHubContributions().catch(console.error);
refreshGitHubStats().catch(console.error);
