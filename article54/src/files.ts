import {BackendiumRouter} from "backendium";
import {object, ValidationError} from "checkeasy";
import Tar from "./tar.js";

const router = new BackendiumRouter();

router.post<{tar: Tar}>("/push", async (request, response) => {
    const files = Object.fromEntries(await Promise.all((await request.body.tar.list()).map(async file => [file, await request.body.tar.extract(file)] as [string, Buffer])));
    console.log(files);
    response.end(true);
}, {
    bodyValidator: object({
        tar(value, key): Tar {
            try {
                return new Tar(Buffer.from(value, "base64"))
            }
            catch (error) {
                throw new ValidationError(`${key} must be Buffer`);
            }
        }
    }, {ignoreUnknown: true})
});

export default router;