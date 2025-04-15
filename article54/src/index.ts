import Backendium from "backendium";
import files from "./files.js";
import {setupEnv} from "./db.js";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
    // port: 8081
});

app.router(files);

(async () => {
    await setupEnv();
    app.start();
})();