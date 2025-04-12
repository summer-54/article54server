import Backendium from "backendium";

const loginCheckUrl = process.argv[2] ?? process.env.LOGIN_CHECK;

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
});

app.start();