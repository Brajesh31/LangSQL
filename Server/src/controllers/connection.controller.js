import Connection from "../models/connection.model.js";
import DatabaseMetadata from "../models/databasemetadata.model.js";
import { extractMetadata } from "../services/metadata.service.js";
import axios from "axios";
import trinoMetadataExtractor from "../extractors/trino.extractor.js";
import { decryptData } from "../services/aes.encryption.js";
// Create a new connection
export const createConnection = async (req, res) => {
  const { connectionData } = req.body;
  const userId = req.user.userId;

  try {
    const decryptedData = decryptData(connectionData, userId);
    // // if (decryptData.type == "trino") {
    // //   const metadata = await trinoMetadataExtractor(decryptedData);
    // //   if (!metadata) {
    // //     return res.status(500).json({
    // //       sucess: false,
    // //       message: "Connection failed. Please check your credentials",
    // //     });
    // //   }
    //   return res.status(200).json({
    //     sucess: true,
    //     message: "Connection created successfully",
    //     metadata,
    //   });
    // }
    const metaDetailes = {
      host: decryptedData.host,
      port: decryptedData.port,
      user: decryptedData.username,
      password: decryptedData.password,
      database: decryptedData.database,
      type: decryptedData.type,
    };
    const metadata = await extractMetadata(metaDetailes);

    if (!metadata) {
      return res.status(500).json({
        sucess: false,
        message: "Connection failed. Please check your credentials",
      });
    }
    const connection = new Connection({
      connectionData,
      status: "connected",
      lastConnected: new Date(),
      userId,
      metadata,
    });
    await connection.save();
    const metaData = new DatabaseMetadata({
      userId: userId,
      connectionId: connection._id,
      db_name: metadata.db_name,
      tables: metadata.tables,
    });
    await metaData.save();
    res.status(201).json({
      sucess: true,
      message: "Connection created successfully",
    });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

// Get all connections
export const getConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connections = await Connection.find({ userId });
    res.status(200).json({
      sucess: true,
      message: "Connections fetched successfully",
      data: { connections },
    });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

// Update a connection
export const updateConnection = async (req, res) => {
  const { connectionData } = req.body;
  const userId = req.user.userId;

  try {
    const connection = await Connection.findByIdAndUpdate(
      req.params.id,
      { connectionData, userId },
      { new: true }
    );
    res.status(200).json({
      sucess: true,
      message: "Connection updated successfully",
      connection,
    });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

// Delete a connection
export const deleteConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Connection.findByIdAndDelete(req.params.id, { userId });
    res
      .status(200)
      .json({ sucess: true, message: "Connection deleted successfully" });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

export const getMetadata = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connectionId = req.params.id;
    const metadata = await DatabaseMetadata.findOne({ userId, connectionId });
    if (!metadata) {
      return res
        .status(404)
        .json({ sucess: false, message: "Metadata not found" });
    }
    res.status(200).json({
      sucess: true,
      message: "Metadata fetched successfully",
      metadata,
    });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

export const getBufferQuestions = async (req, res) => {
  try {
    // Get the metadata from the incoming request body
    const data = JSON.stringify(req.body.metadata);

    // Access the API key (consider using process.env in Node.js for non-Vite environments)
    const apiKey = process.env.BUFFER_LANGFLOW_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "API Key is missing." });
    }

    // Make the API request
    const response = await axios.post(
      "https://api.langflow.astra.datastax.com/lf/81fea1a4-bfac-46e8-b6f7-d9d0f61116e3/api/v1/run/eb01c257-3ad7-4f10-9904-bff1d36b15e8?stream=false",
      {
        input_value: `${data}`,
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "Prompt-TySGF": {},
          "Agent-1Peig": {},
          "ChatInput-fIIlR": {},
          "ChatOutput-b7VXk": {},
          "TextOutput-Q93Ds": {},
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Log the full response for debugging purposes
    console.log("API Response:", response.data);

    // Check if the response structure is as expected
    if (
      !response.data ||
      !response.data.outputs ||
      !response.data.outputs[0]?.outputs ||
      !response.data.outputs[0]?.outputs[0]?.results?.message?.data?.text
    ) {
      return res.status(500).json({
        success: false,
        message: "Unexpected response format from external API.",
      });
    }

    // Extract data using regex
    const responseData =
      response.data.outputs[0].outputs[0].results.message.data.text.match(
        /\{.*\}/s
      );

    if (responseData) {
      // Log the matched data for debugging
      console.log("Extracted Data:", responseData);

      // Respond with success and the data
      return res.status(200).json({
        success: true,
        message: "Buffer questions fetched successfully",
        data: responseData[0], // Return the first matched group
      });
    } else {
      // Handle the case where the regex does not match anything
      return res.status(500).json({
        success: false,
        message: "Failed to extract valid data from the response.",
      });
    }
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error occurred:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateSchema = async (req, res) => {
  try {
    const { description, dialect } = req.body;

    // Validate required fields
    if (!description || !dialect) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: description and dialect",
      });
    }

    const apiKey = process.env.SCHEMA_LANGFLOW_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing SCHEMA_LANGFLOW_API_KEY",
      });
    }

    console.log("Generating schema with:", { description, dialect });

    const response = await axios.post(
      "https://api.langflow.astra.datastax.com/lf/ab147fa5-088c-429d-88aa-465c74c8b303/api/v1/run/af4138b3-c5a7-47df-b9da-691551c0bbd6?stream=false",
      {
        input_value: JSON.stringify({ description, dialect }),
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "Prompt-TySGF": {},
          "Agent-1Peig": {},
          "ChatInput-fIIlR": {},
          "ChatOutput-b7VXk": {},
          "TextOutput-Q93Ds": {},
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (
      !response.data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text
    ) {
      throw new Error("Invalid response format from LangFlow API");
    }

    const schema =
      response.data.outputs[0].outputs[0].results.message.data.text;

    res.status(200).json({
      success: true,
      message: "Schema generated successfully",
      schema,
    });
  } catch (error) {
    console.error("Schema generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate schema",
    });
  }
};
