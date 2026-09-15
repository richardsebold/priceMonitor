import { backfillLegacyVerifiedUsers } from "../src/modules/identity/infra/backfill-legacy-verified-users";

backfillLegacyVerifiedUsers()
  .then((result) => {
    console.log(`Usuários marcados como verificados: ${result.count}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha no backfill de usuários existentes:", error);
    process.exit(1);
  });
