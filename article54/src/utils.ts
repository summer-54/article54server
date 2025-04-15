import * as superagent from "superagent";

const loginCheckUrl = process.argv[2] ?? process.env.LOGIN_CHECK;

export async function checkLogin(body: Record<string, any>, headers: Record<string, string>) {
    try {
        return (await superagent.post(loginCheckUrl).send({body, headers})).statusCode === 200;
    }
    catch {
        return false;
    }
}