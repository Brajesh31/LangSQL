import { MySQLMetadataExtractor } from "../extractors/mysql.extractor.js";
import { PostgreSQLMetadataExtractor } from "../extractors/postgress.extractor.js";

export function MetadataExtractorFactory(dbType, connection) {
  switch (dbType) {
    case "mysql":
      return new MySQLMetadataExtractor(connection);
    case "postgresql":
      return new PostgreSQLMetadataExtractor(connection);
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}
