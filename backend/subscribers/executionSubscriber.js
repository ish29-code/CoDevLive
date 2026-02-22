import Redis from "ioredis";

export function subscribeExecution(io) {

    const sub = new Redis();

    sub.subscribe("executionResults");

    sub.on("message", (channel, message) => {

        const result = JSON.parse(message);

        io.to(result.roomId).emit("execution-result", result);
    });
}