import {BackendiumRouter} from "backendium";
import {object, string} from "checkeasy";
import Tar from "./tar.js";
import {getPushRepo} from "./utils.js";
import {db} from "./db.js";
import {getNewBucket, pushFiles, removeFiles} from "./minio.js";

export async function patchArticle(repo: string, files: Record<string, Buffer>) {
    let oldFiles = await db.selectFrom("article54files").where("repo", '=', repo).select(["bucket", "file"]).execute();
    await db.transaction().execute(async transaction => {
        await pushFiles(repo, oldFiles.length ? oldFiles[0].bucket : await getNewBucket(transaction), files, transaction);
        await removeFiles(oldFiles.map(({bucket, file}) => [bucket, file] as [string, string]), transaction);
    });
}

const router = new BackendiumRouter();

router.post<{tar: Tar, repo: string}>("/push", async (request, response) => {
    const {tar, repo: repo_, ...other} = request.body;
    const repo = await getPushRepo(other, request.headers, repo_);
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