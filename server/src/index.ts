import Backendium from "backendium";
import {object, string} from "checkeasy";

const app = new Backendium({
    host: process.env.HOST,
    port: Number(process.env.PORT)
});

const repos: Array<string> = [];

app.post<{body: {auth: string}, headers: {auth: string}, query: {}, repo: string}>("/push-check", (request, response) => {
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
        query: object({}, {ignoreUnknown: true}),
        repo: string()
    }, {ignoreUnknown: true}),
    validationErrorHandler() {
        console.log(arguments);
    }
});

app.post<{headers: {auth: string}, query: {}, repo: string}>("/pull-check", (request, response) => {
    if (!repos.includes(request.body.repo.toLowerCase())) {
        response.status(404);
        response.end();
        return;
    }
    console.log(request.body);
    response.end(request.body.repo.toLowerCase());
}, {
    bodyValidator: object({
        headers: object({auth: string()}, {ignoreUnknown: true}),
        query: object({}, {ignoreUnknown: true}),
        repo: string()
    }, {ignoreUnknown: true}),
    validationErrorHandler() {
        console.log(arguments);
    }
});

app.post<string>("/repos/create", (request, response) => {
    if (repos.includes(request.body.toLowerCase())) {
        response.status(404);
        response.end();
        return;
    }
    repos.push(request.body.toLowerCase());
    response.end();
}, {
    bodyValidator: (value, key) => {
        return string()(value.toString(), key);
    }
});

app.get("/repos", (_, response) => {
    response.end(repos);
});

app.start();
