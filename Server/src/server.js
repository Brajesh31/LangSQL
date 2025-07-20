import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import firebaseAdmin from "firebase-admin"; // Import Firebase Admin SDK
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import xssClean from "xss-clean";
import morgan from "morgan";

//utilities imports
import connectDB from "./utils/connection.util.js";

//routes imports
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import extractorRoutes from "./routes/extractor.routes.js";
import connectionRoutes from "./routes/connection.routes.js";

import executeRoutes from "./routes/execute.routes.js";
import testtrino from "./routes/trinotest.routes.js";
import historyRoutes from "./routes/history.routes.js";

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import testPostgreSQLConnection from "./databaseHandlers/postgresql.handler.js";
import testMySQLConnection from "./databaseHandlers/mysql.handler.js";
import testSparkConnection from "./databaseHandlers/spark.handler.js";
import testTrinoConnection from "./databaseHandlers/trino.handler.js";
import testConnection from "./controllers/test.controller.js";

import mySqlExecution from "./workers/mysql.worker.js";
import postgreSQLExecution from "./workers/postgresql.worker.js";

import {
  dbHandlers,
  registerDBHandler,
} from "./databaseHandlers/dbRegistry.js";

import { dbWorkers, registerDBWorker } from "./workers/workerRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "../service-account.json"))
);

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount), // Initialize using the service account key
});

//constants
const CORS_OPTIONS = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://192.168.0.104:5173", // Your React app's IP and port
      "http://localhost:5173",
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Accept the request
    } else {
      callback(new Error("Not allowed by CORS")); // Reject the request
    }
  },
  credentials: true, // Allow cookies or other credentials to be sent
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

//server config/initialization
dotenv.config();

const PORT = process.env.PORT || 3000;
connectDB();
const app = express();

//middlewares
app.use(morgan("dev")); //logs requests to the console
app.use(helmet()); //sets security HTTP headers
app.use(mongoSanitize()); //cleans user input from malicious HTML
app.use(xssClean()); //cleans user input from malicious scripts
app.use(hpp()); //prevents HTTP Parameter Pollution attacks
app.use(express.json()); //parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); //parses incoming requests with URL-encoded payloads
app.use(cookieParser()); //parses incoming requests with cookies
app.use(cors(CORS_OPTIONS)); //enables Cross-Origin Resource Sharing

registerDBHandler("postgresql", testPostgreSQLConnection);
registerDBHandler("mysql", testMySQLConnection);
registerDBHandler("trino", testTrinoConnection);
registerDBHandler("spark", testSparkConnection);

registerDBWorker("mysql", mySqlExecution);
registerDBWorker("postgresql", postgreSQLExecution);

//routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/extractor", extractorRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/testtrino", testtrino);
app.use("/api/execute", executeRoutes);
app.use("/api/history", historyRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
