// import * as tar from "tar";
import * as fs from "node:fs/promises";
import {Stats} from "fs";
import * as archiver from "archiver";
import { PassThrough } from 'stream';
import superagent from "superagent";

async function createTar(files: Array<[string, Buffer, Stats]>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const archive = archiver.create('tar');
        const chunks: Buffer[] = [];
        const collector = new PassThrough();

        collector.on('data', (chunk) => chunks.push(chunk));
        collector.on('end', () => resolve(Buffer.concat(chunks)));
        collector.on('error', reject);

        archive.pipe(collector);

        files.forEach(([name, data, stats]) => {
            archive.append(data, {name, stats});
        });

        archive.finalize();
    });
}

(async () => {
    let files = await Promise.all((await Promise.all((await fs.readdir("./test", {recursive: true}))
        .map(async file => [file, await fs.lstat("./test/" + file)] as [string, Stats])))
        .filter(([, stats]) => stats.isFile())
        .map(async ([file, stats]) => [file, await fs.readFile("./test/" + file), stats] as [string, Buffer, Stats]));
    console.log(files.map(([file]) => file));

    let tar = await createTar(files);
    // await fs.writeFile("./test.tar", tar);

    const response = await superagent.post("http://localhost:8081/push")
        .send({tar: tar.toString("base64"), auth: "test", repo: "test"}).set("auth", "test");
    console.log(response);
})();