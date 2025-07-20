import mysql from "mysql2";
import { MetadataExtractor } from "./metadata.extractor.js";

export class MySQLMetadataExtractor extends MetadataExtractor {
  constructor(connection) {
    super(connection);
  }

  // Fetch tables from the MySQL database
  async getTables() {
    const [tables] = await this.connection.promise().query("SHOW TABLES");
    return tables.map(
      (table) => table[`Tables_in_${this.connection.config.database}`]
    );
  }

  // Fetch columns of a specific table in MySQL
  async getColumns(tableName) {
    const [columns] = await this.connection
      .promise()
      .query(`DESCRIBE ${tableName}`);
    return columns.map((col) => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === "YES",
      unique: col.Key === "UNI",
      indexed: col.Key !== "PRI" && col.Key !== "UNI",
      description: `Column of type ${col.Type}`,
    }));
  }
}
