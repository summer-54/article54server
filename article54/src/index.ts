import Backendium from "backendium";
import files from "./files.js";

const loginCheckUrl = process.argv[2] ?? process.env.LOGIN_CHECK;

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
    // port: 8081
});

app.router(files);

app.start();