import Backendium from "backendium";
import {object, string} from "checkeasy";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
});

const repos = [];

app.post<{body: {auth: string}, headers: {auth: string}, repo: string}>("/push-check", (request, response) => {
    if (!repos.includes(request.body.repo.toLowerCase())) {
        response.status(404);
        response.end();
        return;
    }
    console.log(request.body);
    response.end(request.body.repo.toLowerCase());
}, {
    bodyValidator: object({
        body: object({auth: string()}, {ignoreUnknown: true}),
        headers: object({auth: string()}, {ignoreUnknown: true}),
        repo: string()
    })
});

app.post<{body: {auth: string}, headers: {auth: string}, repo: string}>("/pull-check", (request, response) => {
    if (!repos.includes(request.body.repo.toLowerCase())) {
        response.status(404);
        response.end();
        return;
    }
    console.log(request.body);
    response.end(request.body.repo.toLowerCase());
}, {
    bodyValidator: object({
        body: object({auth: string()}, {ignoreUnknown: true}),
        headers: object({auth: string()}, {ignoreUnknown: true}),
        repo: string()
    })
});

app.post("/repos/create", (request, response) => {
    if (repos.includes(request.body.toLowerCase())) {
        response.status(404);
        response.end();
        return;
    }
    repos.push(request.body.toLowerCase());
    response.end();
}, {
    bodyValidator: string()
});

app.get("/repos", (_, response) => {
    response.end(repos);
});

app.start();