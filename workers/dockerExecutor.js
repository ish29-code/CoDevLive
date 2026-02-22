import { exec } from "child_process";
import fs from "fs";
import { v4 as uuid } from "uuid";
import Redis from "ioredis";

const redis = new Redis();

export async function executeCode({ roomId, code, language }) {

    const id = uuid();

    const config = getLanguageConfig(language);

    if (!config) {
        await redis.publish("executionResults", JSON.stringify({
            roomId,
            success: false,
            output: "Unsupported language"
        }));
        return;
    }

    const fileName = `${config.fileNamePrefix}${id}.${config.extension}`;
    const filePath = `/tmp/${fileName}`;

    fs.writeFileSync(filePath, code);

    const command = config.buildCommand(fileName);

    exec(command, { timeout: 7000 }, async (error, stdout, stderr) => {

        const result = {
            roomId,
            success: !error,
            output: error ? stderr : stdout
        };

        await redis.publish("executionResults", JSON.stringify(result));

        try { fs.unlinkSync(filePath); } catch { }
    });
}

function getLanguageConfig(language) {

    const baseDockerFlags = `
        --rm
        --memory=150m
        --cpus=0.5
        --network=none
        --pids-limit=64
        -v /tmp:/app
    `;

    switch (language) {

        case "javascript":
            return {
                extension: "js",
                fileNamePrefix: "",
                buildCommand: (file) =>
                    `docker run ${baseDockerFlags} node:18 node /app/${file}`
            };

        case "python":
            return {
                extension: "py",
                fileNamePrefix: "",
                buildCommand: (file) =>
                    `docker run ${baseDockerFlags} python:3.10 python /app/${file}`
            };

        case "cpp":
            return {
                extension: "cpp",
                fileNamePrefix: "",
                buildCommand: (file) =>
                    `docker run ${baseDockerFlags} gcc:latest sh -c "g++ /app/${file} -o /app/a.out && /app/a.out"`
            };

        case "java":
            return {
                extension: "java",
                fileNamePrefix: "Main",
                buildCommand: (file) =>
                    `docker run ${baseDockerFlags} openjdk:17 sh -c "javac /app/${file} && java -cp /app ${file.replace(".java", "")}"`
            };

        default:
            return null;
    }
}