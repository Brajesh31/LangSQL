import express from "express";
import testTrinoConnection from "../databaseHandlers/trino.handler.js"; // Import the connection function
import axios from "axios";
import { LangflowClient } from "@datastax/langflow-client";

const router = express.Router();
// Route to check Trino connection
router.post("/testtrino", async (req, res) => {
  try {
    console.log("Received Connection Config:", req.body);

    const connectionConfig = req.body; // Extract connection details from request body

    if (!connectionConfig.host || !connectionConfig.port || !connectionConfig.user || !connectionConfig.password) {
      return res.status(400).json({ success: false, message: "Missing required connection parameters" });
    }

    const result = await testTrinoConnection(connectionConfig);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /testtrino:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


router.post("/", async (req, res) => {
  let inputValue = {
    query:
      "Retrieve the names and emails of users along with the total number of orders they have placed.",
    metadata: {
      databases: {
        flask_db: {
          tables: {
            users: ["id", "name", "email"],
            orders: ["order_id", "user_id", "amount"],
          },
        },
        analytics_db: {
          tables: {
            events: ["event_id", "event_name", "timestamp"],
          },
        },
      },
    },
    dialect: "mysql",
  };

  try {
    const payload = {
      input_value: JSON.stringify(inputValue),
      output_type: "chat",
      input_type: "chat",
      tweaks: {
        "ChatInput-dOH3m": {},
        "Prompt-cMcHL": {},
        "GoogleGenerativeAIModel-3V8H5": {},
        "ChatOutput-XCd37": {},
      },
    };


    res.json(response.data);
  } catch (error) {
    console.error(
      "Error calling Langflow API:",
      error.response?.data || error.message
    );

    if (error.response) {
      // API responded with an error (4xx or 5xx)
      console.error("API Error:", error.response.status, error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      // Request made but no response received
      console.error("No response from API:", error.request);
      res.status(500).json({ error: "No response from API" });
    } else {
      // Other errors
      console.error("Request Error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

router.post("/client", );

export default router;
