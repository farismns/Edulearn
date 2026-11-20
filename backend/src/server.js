import "dotenv/config";
import app from "./app.js";
import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection before starting server
    const database = await checkDatabaseConnection();

    console.log("Database connected:", database.database);

    const server = app.listen(PORT, () => {
      console.log(`Edulearn API running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await closeDatabaseConnection();
        console.log("Server and database connections closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    await closeDatabaseConnection();
    process.exit(1);
  }
};

startServer();
