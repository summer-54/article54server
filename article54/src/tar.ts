import * as tar from "tar-stream";
import { Readable } from 'stream';

export default class Tar {
    constructor(protected buffer: Buffer) {}

    list(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const extract = tar.extract();
            const fileList: string[] = [];

            extract.on('entry', (header, stream, next) => {
                fileList.push(header.name);
                stream.resume(); // Пропускаем содержимое
                next();
            });

            extract.on('finish', () => resolve(fileList));
            extract.on('error', reject);

            Readable.from(this.buffer).pipe(extract);
        });
    }

    extractFile(targetFile: string): Promise<Buffer | null> {
        return new Promise((resolve, reject) => {
            const extract = tar.extract();
            let found = false;

            extract.on('entry', (header, stream, next) => {
                if (header.name === targetFile) {
                    found = true;
                    const chunks: Buffer[] = [];

                    stream.on('data', (chunk) => chunks.push(chunk));
                    stream.on('end', () => {
                        resolve(Buffer.concat(chunks));
                        next();
                    });
                } else {
                    stream.resume(); // Пропускаем ненужные файлы
                    next();
                }
            });

            extract.on('finish', () => {
                if (!found) resolve(null); // Файл не найден
            });

            extract.on('error', reject);

            Readable.from(this.buffer).pipe(extract);
        });
    }

    async extract(targetFile: string): Promise<Buffer> {
        let file = await this.extractFile(targetFile);
        if (!file) {
            throw new Error(`File not found: ${targetFile}`);
        }
        return file;
    }

    async object() {
        return Object.fromEntries(await Promise.all((await this.list())
            .map(async file => [file, await this.extract(file)] as [string, Buffer])));
    }
}