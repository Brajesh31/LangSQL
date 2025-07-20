import executeQuery from "../utils/worker.util.js";
import Connection from "../models/connection.model.js";
import { decryptData } from "../services/aes.encryption.js";
import QueryHistory from "../models/queeryhistory.model.js";
import axios from "axios";
import { LangFlowService } from "../services/langflow.service.js";
import DatabaseMetadata from "../models/databasemetadata.model.js";
import { extractMetadata } from "../services/metadata.service.js";

const ddlRegex = /^\s*(CREATE|ALTER|DROP|TRUNCATE|RENAME|COMMENT)\s+/i;

export const executeDBQuery = async (req, res) => {
  try {
    const { query, connectionId, dialect } = req.body;
    const userId = req.user.userId;

    const connection = await Connection.findOne({
      userId,
      _id: connectionId,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    const decryptedConnection = decryptData(connection.connectionData, userId);
    const body = {
      dbType: decryptedConnection.type,
      username: decryptedConnection.username,
      password: decryptedConnection.password,
      host: decryptedConnection.host,
      port: Number(decryptedConnection.port),
      database: decryptedConnection.database,
      query: query,
    };

    const result = await executeQuery(body);

    // Convert execution time from string (e.g., "3ms") to number (milliseconds)
    const executionTimeStr = result.data?.metadata?.executionTime || "0ms";
    const responseTime = parseInt(executionTimeStr.replace(/[^0-9]/g, ""));

    // if (ddlRegex.test(query)) {
    //   const metadata = await extractMetadata(decryptedConnection);
    //   const newMetaData = await DatabaseMetadata.findOne({
    //     userId,
    //     connectionId: connectionId,
    //   });

    //   if (newMetaData) {
    //     newMetaData.tables = metadata.tables;
    //     await newMetaData.save();
    //   }
    // }

    // Create query history entry
    await QueryHistory.create({
      userId,
      query,
      status: result.success ? "success" : "failed",
      dbName: decryptedConnection.database,
      error: result.success ? "" : result.message || "Query execution failed",
      response: result.data,
      responseTime: responseTime,
      rows: Number(result.data?.metadata?.rowCount || 0),
      affectedRows: Number(result.data?.metadata?.affectedRows || 0),
    });

    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success
        ? "Query executed successfully"
        : "Query execution failed",
      data: result.data,
    });
  } catch (error) {
    // Log error for debugging but send safe message to client
    console.error("Query execution error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while executing the query",
    });
  }
};

export const generateQuery = async (req, res) => {
  try {
    const { message, database, dialect } = req.body;
    console.log(req.body);
    const userId = req.user.userId;

    const metaData = await DatabaseMetadata.findOne({
      userId,
      connectionId: database,
    });

    if (!metaData) {
      return res.status(404).json({
        success: false,
        message: "Database metadata not found",
      });
    }

    const cleanedMetaData = {
      db_name: metaData.db_name,
      tables: metaData.tables,
    };

    if (dialect === "trino" || dialect === "spark") {
      const result = await LangFlowService(req.body, cleanedMetaData);
      const data = { sql_query: result.data.query };

      return res.status(result.success ? 200 : 500).json({
        success: result.success,
        message: result.success
          ? "Query generated successfully"
          : "Failed to generate query",
        data,
      });
    }

    const token = process.env.DRF_SERVICE_TOKEN;
    const host = process.env.DRF_SERVER_HOST;


    if (!token || !host) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const response = await axios.post(
      `${host}api/generate-sql/`,
      {
        user_id: userId,
        question: message,
        connectionId: database,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);

    return res.status(200).json({
      success: true,
      message: "Query generated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Query generation error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while generating the query",
    });
  }
};
