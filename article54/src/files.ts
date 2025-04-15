import {BackendiumRouter} from "backendium";
import {object, string} from "checkeasy";
import Tar from "./tar.js";
import {checkLogin} from "./utils.js";

export function patchArticle(repo: string, files: Record<string, Buffer>) {

}

const router = new BackendiumRouter();

router.post<{tar: Tar, repo: string}>("/push", async (request, response) => {
    const {tar, repo, ...other} = request.body;
    if (!(await checkLogin(other, request.headers, repo))) {
        response.status(401);
        response.end();
        return;
    }
    const files = await tar.object();
    console.log(files);
    response.end(true);
}, {
    bodyValidator: object({tar: Tar.validator, repo: string()}, {ignoreUnknown: true})
});

export default router;