import * as superagent from "superagent";

const pushCheckUrl = process.argv[2] ?? process.env.PUSH_CHECK;
const pullCheckUrl = process.argv[3] ?? process.env.PULL_CHECK;

export async function getPushRepo(body: Record<string, any>, headers: Record<string, string>, repo: string): Promise<string | null> {
    try {
        let response = await superagent.post(pushCheckUrl).send({body, headers, repo});
        if (response.statusCode !== 200) return null;
        return response.text;
    }
    catch {
        return null;
    }
}

export async function getPullRepo(body: Record<string, any>, headers: Record<string, string>, repo: string): Promise<string | null> {
    try {
        let response = await superagent.post(pullCheckUrl).send({body, headers, repo});
        if (response.statusCode !== 200) return null;
        return response.text;
    }
    catch {
        return null;
    }
}