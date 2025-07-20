import mongoose from "mongoose";

// Enhanced Column Metadata Schema
const ColumnSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Column Name
  type: { type: String, required: true }, // Column Data Type (String, Integer, Date, etc.)
  nullable: { type: Boolean, default: true }, // Is the column nullable?
  unique: { type: Boolean, default: false }, // Is the column unique (e.g., for primary keys)?
  default_value: { type: mongoose.Schema.Types.Mixed, default: null }, // Default Value if any
  description: { type: String, default: "" }, // Column Description (Optional)
  indexed: { type: Boolean, default: false }, // Is the column indexed?
  references: { type: String, default: "" }, // Foreign Key Reference (to another table)
});

// Enhanced Table Metadata Schema
const TableSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Table Name
  columns: [ColumnSchema], // Array of columns (using the ColumnSchema)
  primary_key: { type: String }, // Name of the primary key column
  description: { type: String, default: "" }, // Table Description (Optional)
});

// Metadata Schema for the entire database
const DatabaseMetadataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID
  connectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Connection" }, // Connection ID
  db_name: { type: String, required: true }, // Database Name
  tables: [TableSchema], // Array of tables in the database
  last_updated: { type: Date, default: Date.now }, // Last updated time for metadata
  created_at: { type: Date, default: Date.now }, // Creation time for metadata
});

const DatabaseMetadata = mongoose.model(
  "DatabaseMetadata",
  DatabaseMetadataSchema
);

export default DatabaseMetadata;
