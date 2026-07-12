import { connectToDB } from "./config/db";
import { validateEnv } from "./config/env";
import dotenv from "dotenv";
import http from "http";
import app from "./app";

dotenv.config();

// Validate env vars early — fail fast with clear messages
validateEnv();

async function startServer() {
    await connectToDB();

    const server = http.createServer(app);

    const port = process.env.PORT || 5000;

    server.listen(port, () => {
        console.log(`Server is now listening on port ${port}`);
    });
}

startServer().catch((err) => {
    console.error("Error while starting the server:", err);
    process.exit(1);
});
