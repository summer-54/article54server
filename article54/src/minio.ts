import {Client} from "minio";
import cryptoRandomString from "crypto-random-string";
import {CryptoHasher} from "bun";
import {db} from "./db.js";

export const minio = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

export async function generateFileName(fileName: string, content: Buffer) {
    let file: string;
    const a = fileName.replaceAll('\\', '/').split('/');
    do {
        let hasher = new CryptoHasher("md5");
        hasher.update(content);
        file = `${cryptoRandomString({length: 64, type: "url-safe"})}_${a[a.length - 1]}_${hasher.digest().toString("base64")}`
    } while ((await db.selectFrom("article54files").where("file", '=', file).select(["id"]).execute()).length);
    return file;
}

export async function pushFile(repo: string, bucket: string, fileName: string, content: Buffer) {
    let file = await generateFileName(fileName, content);
    await db.insertInto("article54files").values({repo, bucket, fileName, file}).executeTakeFirstOrThrow();
    await minio.putObject(bucket, file, content);
}

export async function pushFiles(repo: string, bucket: string, files: Record<string, Buffer>) {
    await Promise.all(Object.entries(files).map(([fileName, content]) => pushFile(repo, bucket, fileName, content)));
}