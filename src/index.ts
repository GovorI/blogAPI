import { app } from "./app";
import { SETTINGS } from "./settings";

app.listen(SETTINGS.PORT || 3000, () => {
  console.log(`server is running on port ${SETTINGS.PORT}...`);
});
