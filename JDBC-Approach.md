We can make use of the `node-jdbc` package or `sequelize` for SQL-based databases, while keeping your modular approach intact.

### Suggested Directory Structure for Express with JDBC (or SQL) Database Connection:

```
/your-express-app
│
├── /config                # Configuration files (e.g., database connections)
│   └── db.js              # Centralized DB connection logic for SQL (MySQL/PostgreSQL)
│
├── /controllers           # Express controllers handling requests
│   └── databaseController.js
│
├── /models                # SQL models (for MySQL, PostgreSQL)
│   └── DatabaseMetadata.js
│
├── /extractors            # Logic for extracting metadata based on DB dialects
│   ├── metadataExtractor.js   # Interface for metadata extractors
│   ├── mysqlMetadataExtractor.js  # MySQL metadata extractor
│   ├── postgresqlMetadataExtractor.js  # PostgreSQL metadata extractor
│
├── /factories             # Factory classes to instantiate the correct extractor
│   └── metadataExtractorFactory.js
│
├── /routes                # Routes to handle incoming API requests
│   └── databaseRoutes.js
│
├── /middleware            # Middlewares (e.g., authentication)
│
├── /utils                 # Utility functions (e.g., helper methods)
│
├── /public                # Static files (e.g., HTML, CSS, JS)
│
└── app.js                 # Main entry point for your Express app
```

### Detailed Explanation of the Structure:

1. **/config/db.js**:
   This file will contain the logic for establishing a connection to SQL databases (like MySQL or PostgreSQL) using `node-jdbc` or `sequelize`.

   Example using `node-jdbc` for MySQL and PostgreSQL:
   ```javascript
   // config/db.js
   import JDBC from 'jdbc';
   import _ from 'lodash';

   const mysqlConfig = {
       url: 'jdbc:mysql://localhost:3306/mydatabase',
       user: 'yourUser',
       password: 'yourPassword',
       drivername: 'com.mysql.cj.jdbc.Driver',
       minpoolsize: 10,
       maxpoolsize: 100
   };

   const postgresConfig = {
       url: 'jdbc:postgresql://localhost:5432/mydatabase',
       user: 'yourUser',
       password: 'yourPassword',
       drivername: 'org.postgresql.Driver',
       minpoolsize: 10,
       maxpoolsize: 100
   };

   const mysqlConnection = new JDBC(mysqlConfig);
   const postgresConnection = new JDBC(postgresConfig);

   export function createConnection(dbType) {
     if (dbType === 'mysql') {
       return mysqlConnection;
     } else if (dbType === 'postgresql') {
       return postgresConnection;
     } else {
       throw new Error('Unsupported database type');
     }
   }
   ```

2. **/controllers/databaseController.js**:
   This controller will handle the logic of connecting to the database and extracting metadata using the factory.

   ```javascript
   // controllers/databaseController.js
   import { MetadataExtractorFactory } from '../factories/metadataExtractorFactory';
   import { createConnection } from '../config/db';
   import DatabaseMetadata from '../models/DatabaseMetadata';

   export const addDatabase = async (req, res) => {
     const { dbType, host, port, user, password, database } = req.body;

     try {
       const connection = createConnection(dbType);

       // Instantiate the correct metadata extractor using the factory
       const metadataExtractor = MetadataExtractorFactory(dbType, connection);

       // Fetch tables and columns metadata
       const tables = await metadataExtractor.getTables();
       const metadata = { db_name: database, tables: [] };

       for (const table of tables) {
         const columns = await metadataExtractor.getColumns(table);
         metadata.tables.push({ name: table, columns });
       }

       // Save metadata to the database
       const newMetadata = new DatabaseMetadata(metadata);
       await newMetadata.save();

       res.status(200).json({ message: 'Database metadata saved successfully!', data: newMetadata });
     } catch (error) {
       res.status(500).json({ message: 'Error processing database metadata', error: error.message });
     }
   };
   ```

3. **/models/DatabaseMetadata.js**:
   This file defines the MongoDB model for storing database metadata, like tables and columns, for persistence.

   ```javascript
   // models/DatabaseMetadata.js
   import mongoose from 'mongoose';

   const DatabaseMetadataSchema = new mongoose.Schema({
     db_name: { type: String, required: true },
     tables: [{
       name: { type: String, required: true },
       columns: [{
         name: { type: String, required: true },
         type: { type: String, required: true },
         nullable: { type: Boolean, required: true },
         unique: { type: Boolean, required: true },
         indexed: { type: Boolean, required: true },
         description: { type: String }
       }]
     }]
   });

   export default mongoose.model('DatabaseMetadata', DatabaseMetadataSchema);
   ```

4. **/extractors/metadataExtractor.js**:
   Define the common interface for metadata extractors.

   ```javascript
   // extractors/metadataExtractor.js
   export class MetadataExtractor {
     constructor(connection) {
       this.connection = connection;
     }

     async getTables() {
       throw new Error('getTables() method should be implemented');
     }

     async getColumns(tableName) {
       throw new Error('getColumns() method should be implemented');
     }
   }
   ```

5. **/factories/metadataExtractorFactory.js**:
   Factory for instantiating the correct metadata extractor based on the `dbType` provided (MySQL, PostgreSQL).

   ```javascript
   // factories/metadataExtractorFactory.js
   import { MySQLMetadataExtractor } from '../extractors/mysqlMetadataExtractor';
   import { PostgreSQLMetadataExtractor } from '../extractors/postgresqlMetadataExtractor';

   export function MetadataExtractorFactory(dbType, connection) {
     switch (dbType) {
       case 'mysql':
         return new MySQLMetadataExtractor(connection);
       case 'postgresql':
         return new PostgreSQLMetadataExtractor(connection);
       default:
         throw new Error(`Unsupported database type: ${dbType}`);
     }
   }
   ```

6. **/routes/databaseRoutes.js**:
   This file contains API routes for adding databases and fetching metadata.

   ```javascript
   // routes/databaseRoutes.js
   import express from 'express';
   import { addDatabase } from '../controllers/databaseController';

   const router = express.Router();

   router.post('/add-database', addDatabase);

   export default router;
   ```

7. **app.js**:
   The entry point of your application, where you set up the Express app and connect to MongoDB (for storing metadata).

   ```javascript
   // app.js
   import express from 'express';
   import mongoose from 'mongoose';
   import bodyParser from 'body-parser';
   import databaseRoutes from './routes/databaseRoutes';

   const app = express();

   app.use(bodyParser.json());  // For parsing application/json
   app.use('/api', databaseRoutes);

   // MongoDB connection (for storing metadata)
   mongoose.connect('mongodb://localhost/yourdb', { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => console.log("MongoDB connected"))
     .catch((err) => console.log("MongoDB connection error:", err));

   app.listen(3000, () => {
     console.log("Server is running on port 3000");
   });
   ```

### Summary:
- **/config/db.js**: Sets up the JDBC-like connections using `node-jdbc` for SQL databases.
- **/controllers/databaseController.js**: Handles requests and connects to the database using the correct extractor.
- **/models/DatabaseMetadata.js**: Defines the MongoDB schema to store metadata.
- **/extractors**: Handles database-specific metadata extraction logic.
- **/factories/metadataExtractorFactory.js**: Factory for creating the correct metadata extractor based on the database type.
- **app.js**: The Express app's entry point that configures middleware, routes, and database connections.

This structure will allow you to scale the application while keeping your codebase modular and easy to maintain!