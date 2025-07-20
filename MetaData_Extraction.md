Looking to **automatically generate metadata** when a user provides their **database connection details** (e.g., hostname, username, password, database name) and tests the connection. The goal is that when the user connects to a database, the system will automatically inspect the schema of the connected database (tables, columns, relationships, etc.) and create the corresponding metadata.

This will require a two-step process:

1. **Connect to the Database**: Establish a connection to the user's database based on the connection details.
2. **Automate Metadata Extraction**: Once connected, fetch the database schema and create the `DatabaseMetadata` object.

### Steps to Implement the Solution

Here’s how you can do this:

---

### **1. Database Connection Setup:**

First, you'll need a library to connect to different types of databases (e.g., MySQL, PostgreSQL, etc.). **Node.js** has libraries like `mysql2` for MySQL and `pg` for PostgreSQL, which can be used to establish connections. You can dynamically detect the type of database and use the respective library for connection.

For example, let’s assume you're supporting MySQL, PostgreSQL, and MongoDB.

### **2. Collecting Database Connection Details from User:**

You'll have a form or API endpoint where the user provides their database connection details (host, port, username, password, database name, etc.).

Example request:

```json
{
  "host": "localhost",
  "port": "3306",
  "user": "root",
  "password": "password",
  "database": "users_db",
  "db_type": "mysql"  // Can be 'mysql', 'postgresql', etc.
}
```

### **3. Testing the Database Connection:**

In your Express server, you'll first attempt to **test the connection** to the provided database using the appropriate database driver. If the connection is successful, proceed to fetch the schema.

Here’s an example of how you can implement the connection and schema extraction:

```javascript
import express from 'express';
import mysql from 'mysql2';
import { Pool } from 'pg';
import mongoose from 'mongoose';
import DatabaseMetadata from './models/DatabaseMetadata'; // Import the model
import { extractMetadata } from './utils/metadataExtractor'; // Utility to extract schema

const router = express.Router();

// Endpoint to test the database connection and extract metadata
router.post('/add-database', async (req, res) => {
  const { host, port, user, password, database, db_type } = req.body;

  try {
    let connection;
    // MySQL connection
    if (db_type === 'mysql') {
      connection = mysql.createConnection({ host, port, user, password, database });
      connection.connect(err => {
        if (err) return res.status(500).json({ message: 'Connection failed', error: err.message });
      });

      // Fetch schema
      const metadata = await extractMetadata('mysql', connection);

      // Save metadata to DB
      const newMetadata = new DatabaseMetadata(metadata);
      await newMetadata.save();
      res.status(200).json({ message: 'Database connected and metadata saved!', data: newMetadata });

    }
    // PostgreSQL connection
    else if (db_type === 'postgresql') {
      const client = new Pool({ host, port, user, password, database });

      client.connect(err => {
        if (err) return res.status(500).json({ message: 'Connection failed', error: err.message });
      });

      // Fetch schema
      const metadata = await extractMetadata('postgresql', client);

      // Save metadata to DB
      const newMetadata = new DatabaseMetadata(metadata);
      await newMetadata.save();
      res.status(200).json({ message: 'Database connected and metadata saved!', data: newMetadata });
    }
    // MongoDB connection
    else if (db_type === 'mongodb') {
      const uri = `mongodb://${user}:${password}@${host}:${port}/${database}`;
      mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

      // Fetch schema (MongoDB schema is dynamic, so this part is different)
      const metadata = await extractMetadata('mongodb', mongoose.connection);

      // Save metadata to DB
      const newMetadata = new DatabaseMetadata(metadata);
      await newMetadata.save();
      res.status(200).json({ message: 'MongoDB connected and metadata saved!', data: newMetadata });
    } else {
      res.status(400).json({ message: 'Unsupported database type' });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ message: 'Error connecting to the database', error: error.message });
  }
});

export default router;
```

### **4. Extract Metadata Based on DB Type:**

You need to implement the logic to extract the database schema depending on the type of database (MySQL, PostgreSQL, MongoDB). Below is a simplified implementation that shows how this can be done.

#### **Utility to Extract Metadata (`utils/metadataExtractor.js`):**

```javascript
// Function to extract metadata for MySQL and PostgreSQL
export const extractMetadata = async (dbType, connection) => {
  let metadata = { db_name: connection.config.database, tables: [] };

  if (dbType === 'mysql') {
    const [tables] = await connection.promise().query("SHOW TABLES");
    
    for (let table of tables) {
      const tableName = table[`Tables_in_${connection.config.database}`];
      const [columns] = await connection.promise().query(`DESCRIBE ${tableName}`);
      const tableMetadata = {
        name: tableName,
        primary_key: null,
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          unique: col.Key === 'UNI',
          indexed: col.Key !== 'PRI' && col.Key !== 'UNI',
          description: `Column of type ${col.Type}`
        }))
      };
      metadata.tables.push(tableMetadata);
    }
  }
  
  // For PostgreSQL
  else if (dbType === 'postgresql') {
    const res = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'`);
    
    for (const row of res.rows) {
      const tableName = row.table_name;
      const columnRes = await connection.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1`, [tableName]);
      
      const tableMetadata = {
        name: tableName,
        primary_key: null,  // Primary key extraction can be done here if needed
        columns: columnRes.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          unique: false,  // You can fetch unique constraints here
          indexed: false,  // You can fetch indexed columns here
          description: `Column of type ${col.data_type}`
        }))
      };
      metadata.tables.push(tableMetadata);
    }
  }
  
  // For MongoDB (more complex as MongoDB is schema-less)
  else if (dbType === 'mongodb') {
    const collections = await connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const sampleDoc = await connection.db.collection(collectionName).findOne();
      
      const columns = sampleDoc ? Object.keys(sampleDoc).map(key => ({
        name: key,
        type: typeof sampleDoc[key],
        nullable: true,
        unique: false,
        indexed: false,
        description: `Field of type ${typeof sampleDoc[key]}`
      })) : [];
      
      const tableMetadata = {
        name: collectionName,
        primary_key: '_id',
        columns
      };
      metadata.tables.push(tableMetadata);
    }
  }

  return metadata;
};
```

### **5. Final Flow**

1. The user provides database connection details (host, port, user, password, database, and db type).
2. The **Express server** establishes a connection with the database (MySQL/PostgreSQL/MongoDB).
3. Once the connection is successful, the server uses the **`extractMetadata()`** function to fetch tables, columns, and other relevant details.
4. This metadata is then saved to the MongoDB database (for future use).
5. Finally, the system returns a success message with the saved metadata.

---

### **Conclusion**

With this approach, you can automate the process of collecting metadata for the user's database as soon as they provide the connection details. The system will dynamically inspect the database schema and generate the metadata (tables, columns, etc.), which is then saved for future reference, such as for query generation by the AI model.

