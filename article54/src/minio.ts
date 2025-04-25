import {Client} from "minio";
import cryptoRandomString from "crypto-random-string";
import crypto from "crypto";
import {type Database, db} from "./db.js";
import {Transaction} from "kysely";

const MAX_IN_BUCKET = Number(process.env.MAX_IN_BUCKET ?? 100);
const BUCKET_PREFIX = process.env.BUCKET_PREFIX ?? "article54";

export const minio = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

export async function generateFileName(fileName: string, content: Buffer) {
    let file: string;
    const a = fileName.replaceAll('\\', '/').split('/');
    do {
        let hasher = crypto.createHash("md5");
        hasher.update(content);
        file = `${cryptoRandomString({length: 64, type: "url-safe"})}_${hasher.digest("hex")}_${a[a.length - 1]}`
    } while ((await db.selectFrom("article54files").where("file", '=', file).select(["id"]).execute()).length);
    return file;
}

export async function getNewBucket(transaction: Transaction<Database>) {
    let map = new Map<string, number>;
    (await transaction.selectFrom("article54files").select(["bucket"]).execute()).forEach(({bucket}) => {
        if (!map.has(bucket)) map.set(bucket, 0);
        map.set(bucket, (map.get(bucket) ?? 0) + 1);
    });
    for (const [bucket, count] of Array.from(map.entries())) {
        if (count < MAX_IN_BUCKET) return bucket;
    }
    let bucket = `${BUCKET_PREFIX}.${Array.from(map.keys()).length}`;
    await minio.makeBucket(bucket);
    return bucket;
}

export async function pushFile(repo: string, bucket: string, fileName: string, content: Buffer, transaction: Transaction<Database>) {
    let file = await generateFileName(fileName, content);
    await transaction.insertInto("article54files").values({repo, bucket, fileName, file}).executeTakeFirstOrThrow();
    await minio.putObject(bucket, file, content);
}

export async function pushFiles(repo: string, bucket: string, files: Record<string, Buffer>, transaction: Transaction<Database>) {
    await Promise.all(Object.entries(files).map(([fileName, content]) => pushFile(repo, bucket, fileName, content, transaction)));
}

export async function removeFiles(files: Array<[string, string]>, transaction: Transaction<Database>) {
    let map = new Map<string, Array<string>>;
    await Promise.all(files.map(async ([bucket, file]) =>
        transaction.deleteFrom("article54files").where(({and, eb}) =>
            and([eb("bucket", '=', bucket), eb("file", '=', file)])).execute()));
    files.forEach(([bucket, file]) => {
        if (!map.has(bucket)) map.set(bucket, []);
        map.set(bucket, [...(map.get(bucket) ?? []), file]);
    });
    await Promise.all(map.entries().map(async ([bucket, files]) =>
        await minio.removeObjects(bucket, files)));
}

export async function getFile(repo: string, fileName: string) {
    return new Promise(async (resolve, reject) => {
        try {
            let {bucket, file} = await db.selectFrom("article54files").where(({eb, and}) => and([eb("repo", '=', repo), eb("fileName", '=', fileName)]))
                .select(["bucket", "file"]).executeTakeFirstOrThrow();
            const stream = await minio.getObject(bucket, file);
            let buffer = Buffer.alloc(0);
            stream.on("data", chunk => {
                buffer = Buffer.concat([buffer, chunk]);
            });
            stream.on("end", () => resolve(buffer));
            stream.on("error", error => reject(error));
        }
        catch {
            resolve(null);
        }
    }); 
}
