import IORedis from "ioredis";

const subscriber = new IORedis();

export function subscribeExecution(io) {

    const sub = new IORedis();

    sub.subscribe("executionResults");

    sub.on("message", (channel, message) => {

        const result = JSON.parse(message);

        io.to(result.roomId).emit("execution-result", result);
    });
}