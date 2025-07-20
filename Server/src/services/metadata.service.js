import { MetadataExtractorFactory } from "../factories/metadata.extractor.factory.js";
import mysql from "mysql2";
import pkg from "pg";
const { Pool } = pkg;

export const extractMetadata = async (data) => {
  const { host, port, user, password, database, type } = data;
  console.log(data);

  try {
    let connection;
    let metadataExtractor;

    // MySQL connection
    if (type === "mysql") {
      connection = mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
      });

      connection.connect();

      // Create the extractor based on the db type
      metadataExtractor = MetadataExtractorFactory(type, connection);
    }

    // PostgreSQL connection
    else if (type === "postgresql") {
      connection = new Pool({
        host,
        port,
        user,
        password,
        database,
      });

      // PostgreSQL Pool doesn't require connection.connect(), use pool directly
      // Create the extractor based on the db type
      metadataExtractor = MetadataExtractorFactory(type, connection);
    }

    // Extract the metadata
    const tables = await metadataExtractor.getTables();
    const metadata = { db_name: database, tables: [] };

    // For each table, extract columns
    for (const table of tables) {
      const columns = await metadataExtractor.getColumns(table);
      metadata.tables.push({ name: table, columns });
    }

    console.log(metadata);

    return metadata;
  } catch (error) {
    console.error(error);
    throw new Error("Error extracting metadata");
  }
};
