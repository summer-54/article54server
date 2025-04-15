import Backendium from "backendium";
import files from "./files.js";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
    // port: 8081
});

app.router(files);

app.start();