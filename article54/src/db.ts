import {type Generated, Kysely, PostgresDialect} from "kysely";
import * as pg from "pg";

export interface FilesTable {
    id: Generated<number>;
    repo: string;
    bucket: string;
    file: string;
    fileName: string;
}

export interface Database {
    article54files: FilesTable;
}

export let pool: pg.Pool, dialect: PostgresDialect, db: Kysely<Database>;

export function connect(host: string, port: number, user: string, password: string, database: string) {
    pool = new pg.Pool({host, port, user, password, database});
    dialect = new PostgresDialect({pool});
    db = new Kysely<Database>({dialect});
}

export async function setupDB() {
    try {
        await db.schema.createTable("article54files")
            .addColumn("id", "serial", cb => cb.primaryKey().unique())
            .addColumn("repo", "text", cb => cb.notNull())
            .addColumn("bucket", "text", cb => cb.notNull())
            .addColumn("file", "text", cb => cb.notNull())
            .addColumn("fileName", "text", cb => cb.notNull()).execute();
    } catch (error) {}
}

export async function setup(host: string, port: number, user: string, password: string, database: string) {
    connect(host, port, user, password, database);
    await setupDB();
}

export async function setupEnv() {
    await setup(process.env.DB_HOST ?? "localhost", Number(process.env.DB_PORT ?? 5432), process.env.DB_USER ?? "postgres", process.env.DB_PASSWORD ?? "", process.env.DB_NAME ?? "postgres");
}
