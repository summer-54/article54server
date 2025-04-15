import Backendium from "backendium";
import {object, string} from "checkeasy";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
});

app.post<{body: {auth: string}, headers: {auth: string}, repo: string}>("/login-check", (request, response) => {
    console.log(request.body);
    response.end();
}, {
    bodyValidator: object({
        body: object({auth: string()}, {ignoreUnknown: true}),
        headers: object({auth: string()}, {ignoreUnknown: true}),
        repo: string()
    })
});

app.start();