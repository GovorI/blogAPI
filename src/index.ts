import { app } from "./app";
import { SETTINGS } from "./settings";
import { runDb } from "./db/db_connection";

async function startApp() {
  try {
    await runDb();
    app.listen(SETTINGS.PORT || 3000, () => {
      console.log(`server is running on port ${SETTINGS.PORT}...`);
    });
  } catch (e) {
    console.log("Can't connect to mongo server", e);
  }
}

startApp();
