export class MetadataExtractor {
    constructor(connection) {
      this.connection = connection;
    }
  
    async getTables() {
      throw new Error("getTables() method should be implemented");
    }
  
    async getColumns(tableName) {
      throw new Error("getColumns() method should be implemented");
    }
  }