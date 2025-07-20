import testDatabaseConnection from "../utils/testdbconnection.util.js";
import { decryptData } from "../services/aes.encryption.js";
import validateConnectionDetails from "../middlewares/validation.middleware.js";
import testTrinoConnection from "../databaseHandlers/trino.handler.js";

const testConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const decryptedData = decryptData(req.body.connectionData, userId);
    if (decryptedData.type === "trino") {
      const result = await testTrinoConnection(decryptedData);
      if (!result.success) {
        return res.status(500).json({
          message: result.message,
          success: false,
        });
      }
      return res.status(200).json({
        message: result.message,
        success: true,
      });
    }
    const dbDetails = {
      host: decryptedData.host,
      username: decryptedData.username,
      password: decryptedData.password,
      database: decryptedData.database,
      port: Number(decryptedData.port),
      dbType: decryptedData.type,
    };

    const result = await testDatabaseConnection(dbDetails);
    if (!result.success) {
      return res.status(500).json({
        message: result.message,
        success: false,
      });
    }
    return res.status(200).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ message: "Connection Unsucess", sucess: false });
  }
};

export default testConnection;
