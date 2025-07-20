import { getDBHandler } from "../databaseHandlers/dbRegistry.js";

const testDatabaseConnection = async (dbConfig) => {
  const handler = getDBHandler(dbConfig.dbType);
  if (!handler) {
    return {
      success: false,
      message: `Database type '${dbConfig.dbType}' is not supported.`,
    };
  }
  return await handler(dbConfig);
};

export default testDatabaseConnection;
