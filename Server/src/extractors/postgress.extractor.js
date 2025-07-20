import pkg from "pg";
const { Pool } = pkg;
import { MetadataExtractor } from "./metadata.extractor.js";

export class PostgreSQLMetadataExtractor extends MetadataExtractor {
  constructor(connection) {
    super(connection);
  }

  // Fetch tables from the PostgreSQL database
  async getTables() {
    const res = await this.connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'`);
    return res.rows.map((row) => row.table_name);
  }

  // Fetch columns of a specific table in PostgreSQL
  async getColumns(tableName) {
    const columnRes = await this.connection.query(
      `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1`,
      [tableName]
    );

    return columnRes.rows.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
      unique: false, // You can add logic for unique constraints if needed
      indexed: false, // You can add logic for indexed columns
      description: `Column of type ${col.data_type}`,
    }));
  }
}
