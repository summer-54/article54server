import Backendium from "backendium";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
});

app.post("/login-check", (request, response) => {
    console.log(request.body.toString());
    response.end(true);
});

app.start();