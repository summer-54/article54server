FROM oven/bun:latest

WORKDIR /app

COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./src

RUN bun i

CMD bun ./src/index.ts