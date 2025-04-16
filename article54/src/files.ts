import {BackendiumRouter} from "backendium";
import {object, string} from "checkeasy";
import Tar from "./tar.js";
import {getPushRepo} from "./utils.js";

export async function patchArticle(repo: string, files: Record<string, Buffer>) {

}

const router = new BackendiumRouter();

router.post<{tar: Tar, repo: string}>("/push", async (request, response) => {
    let {tar, repo, ...other} = request.body;
    repo = await getPushRepo(other, request.headers, repo);
    if (!repo) {
        response.status(401);
        response.end();
        return;
    }
    const files = await tar.object();
    console.log(repo, files);
    await patchArticle(repo, files);
    response.end();
}, {
    bodyValidator: object({tar: Tar.validator, repo: string()}, {ignoreUnknown: true})
});

export default router;