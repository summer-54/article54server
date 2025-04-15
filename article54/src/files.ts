import {BackendiumRouter} from "backendium";
import {object, ValidationError} from "checkeasy";
import Tar from "./tar.js";
import {checkLogin} from "./utils.js";

const router = new BackendiumRouter();

router.post<{tar: Tar}>("/push", async (request, response) => {
    const {tar, ...other} = request.body;
    if (!(await checkLogin(other, request.headers))) {
        response.status(401);
        response.end();
        return;
    }
    const files = await tar.object();
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