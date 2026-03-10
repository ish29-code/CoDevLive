import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import Redis from "ioredis";

const redis = new Redis();

export async function executeCode({ roomId, code, language }) {

    const id = uuid();
    const execDir = `/tmp/executions/${id}`;

    try {

        await fs.mkdir(execDir, { recursive: true });

        const config = getLanguageConfig(language);

        if (!config) {
            await publishResult(roomId, false, "Unsupported language");
            return;
        }

        const fileName = `${config.fileNamePrefix}${config.extension}`;
        const filePath = path.join(execDir, fileName);

        await fs.writeFile(filePath, code);

        const dockerCommand = config.buildCommand(execDir, fileName);

        exec(dockerCommand, { timeout: 7000 }, async (error, stdout, stderr) => {

            const result = {
                roomId,
                success: !error,
                output: error ? stderr : stdout
            };

            await redis.publish("executionResults", JSON.stringify(result));

            try {
                await fs.rm(execDir, { recursive: true, force: true });
            } catch { }

        });

    } catch (err) {

        await publishResult(roomId, false, err.message);

    }
}

async function publishResult(roomId, success, output) {

    await redis.publish("executionResults", JSON.stringify({
        roomId,
        success,
        output
    }));
}

function getLanguageConfig(language) {

    const dockerFlags = `
        --rm
        --memory=150m
        --cpus=0.5
        --network=none
        --pids-limit=64
        --read-only
    `;

    switch (language) {

        case "javascript":
            return {
                extension: ".js",
                fileNamePrefix: "code",
                buildCommand: (dir, file) =>
                    `docker run ${dockerFlags} -v ${dir}:/app node:18 node /app/${file}`
            };

        case "python":
            return {
                extension: ".py",
                fileNamePrefix: "code",
                buildCommand: (dir, file) =>
                    `docker run ${dockerFlags} -v ${dir}:/app python:3.10 python /app/${file}`
            };

        case "cpp":
            return {
                extension: ".cpp",
                fileNamePrefix: "code",
                buildCommand: (dir, file) =>
                    `docker run ${dockerFlags} -v ${dir}:/app gcc:latest sh -c "g++ /app/${file} -o /app/a.out && /app/a.out"`
            };

        case "java":
            return {
                extension: ".java",
                fileNamePrefix: "Main",
                buildCommand: (dir, file) =>
                    `docker run ${dockerFlags} -v ${dir}:/app openjdk:17 sh -c "javac /app/${file} && java -cp /app Main"`
            };

        case "go":
            return {
                extension: ".go",
                fileNamePrefix: "main",
                buildCommand: (dir, file) =>
                    `docker run ${dockerFlags} -v ${dir}:/app golang:1.21 sh -c "cd /app && go run ${file}"`
            };

        default:
            return null;
    }
}