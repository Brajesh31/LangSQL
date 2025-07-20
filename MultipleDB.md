To make the API more scalable for future database support, we can structure it in a way that allows adding new database types without modifying core logic.  

### **Scalable Approach:**
1. Use a **database handler registry** where each database type is registered dynamically.
2. Create a **generic connection tester** that delegates to the registered handlers.
3. Allow easy extension by just adding new handlers without modifying existing code.

---

### **Updated Project Structure**
```
/database-test-api
│── /src
│   ├── /controllers
│   │   ├── connectionController.js
│   ├── /middlewares
│   │   ├── validationMiddleware.js
│   ├── /routes
│   │   ├── connectionRoutes.js
│   ├── /databaseHandlers
│   │   ├── mongodbHandler.js
│   │   ├── postgresqlHandler.js
│   │   ├── mysqlHandler.js
│   │   ├── dbRegistry.js  # New
│   ├── /utils
│   │   ├── dbConnector.js
│   ├── server.js
│── package.json
│── .env
```

---

### **1. Create a Database Handler Registry (`dbRegistry.js`)**
This registry keeps track of available database handlers, making it easy to add new databases in the future.

```javascript
const dbHandlers = {};

const registerDBHandler = (dbType, handler) => {
    dbHandlers[dbType] = handler;
};

const getDBHandler = (dbType) => {
    return dbHandlers[dbType] || null;
};

module.exports = { registerDBHandler, getDBHandler };
```

---

### **2. Create Individual Handlers for Each DB**
Each handler is responsible for testing the connection for a specific database.

#### **MongoDB Handler (`mongodbHandler.js`)**
```javascript
const mongoose = require('mongoose');

const testMongoDBConnection = async ({ host, port, username, password, database }) => {
    try {
        const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoose.connection.close();
        return { success: true, message: 'MongoDB connection successful' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = testMongoDBConnection;
```

---

#### **PostgreSQL Handler (`postgresqlHandler.js`)**
```javascript
const { Client } = require('pg');

const testPostgreSQLConnection = async ({ host, port, username, password, database }) => {
    try {
        const client = new Client({ host, port, user: username, password, database });
        await client.connect();
        await client.end();
        return { success: true, message: 'PostgreSQL connection successful' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = testPostgreSQLConnection;
```

---

#### **MySQL Handler (`mysqlHandler.js`)**
```javascript
const mysql = require('mysql2/promise');

const testMySQLConnection = async ({ host, port, username, password, database }) => {
    try {
        const connection = await mysql.createConnection({ host, port, user: username, password, database });
        await connection.end();
        return { success: true, message: 'MySQL connection successful' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = testMySQLConnection;
```

---

### **3. Modify `dbConnector.js` to Use Registry**
Instead of hardcoding DB types, we now dynamically retrieve the handler from the registry.

```javascript
const { getDBHandler } = require('../databaseHandlers/dbRegistry');

const testDatabaseConnection = async (dbConfig) => {
    const handler = getDBHandler(dbConfig.dbType);
    if (!handler) {
        return { success: false, message: `Database type '${dbConfig.dbType}' is not supported.` };
    }
    return await handler(dbConfig);
};

module.exports = { testDatabaseConnection };
```

---

### **4. Register Database Handlers in `server.js`**
Before the server starts, we register all supported database handlers.

```javascript
const express = require('express');
const dotenv = require('dotenv');
const connectionRoutes = require('./routes/connectionRoutes');
const { registerDBHandler } = require('./databaseHandlers/dbRegistry');

// Import database handlers
const testMongoDBConnection = require('./databaseHandlers/mongodbHandler');
const testPostgreSQLConnection = require('./databaseHandlers/postgresqlHandler');
const testMySQLConnection = require('./databaseHandlers/mysqlHandler');

dotenv.config();
const app = express();

app.use(express.json());
app.use('/connection', connectionRoutes);

// Register available database handlers
registerDBHandler('mongodb', testMongoDBConnection);
registerDBHandler('postgresql', testPostgreSQLConnection);
registerDBHandler('mysql', testMySQLConnection);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

### **5. Controller (`connectionController.js`)**
```javascript
const { testDatabaseConnection } = require('../utils/dbConnector');

const testConnection = async (req, res) => {
    const result = await testDatabaseConnection(req.body);
    return res.status(result.success ? 200 : 500).json(result);
};

module.exports = { testConnection };
```

---

### **6. Middleware for Validation (`validationMiddleware.js`)**
Instead of hardcoding allowed DB types, we dynamically check from `dbRegistry`.

```javascript
const yup = require('yup');
const { getDBHandler } = require('../databaseHandlers/dbRegistry');

const validateConnectionDetails = async (req, res, next) => {
    const allowedDBTypes = Object.keys(require('../databaseHandlers/dbRegistry').dbHandlers);

    const connectionSchema = yup.object().shape({
        dbType: yup.string().oneOf(allowedDBTypes).required(),
        host: yup.string().required(),
        port: yup.number().positive().required(),
        username: yup.string().required(),
        password: yup.string().required(),
        database: yup.string().required()
    });

    try {
        await connectionSchema.validate(req.body);
        next();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = validateConnectionDetails;
```

---

### **7. Routes (`connectionRoutes.js`)**
```javascript
const express = require('express');
const { testConnection } = require('../controllers/connectionController');
const validateConnectionDetails = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/test', validateConnectionDetails, testConnection);

module.exports = router;
```

---

### **8. Adding a New Database**
Now, adding a new database is simple:
1. Create a new handler in `/databaseHandlers/yourDbHandler.js`
2. Register it in `server.js` using:
   ```javascript
   registerDBHandler('newdb', testNewDBConnection);
   ```

---

### **9. Example Request**
#### **POST `/connection/test`**
```json
{
    "dbType": "postgresql",
    "host": "localhost",
    "port": 5432,
    "username": "your_username",
    "password": "your_password",
    "database": "testdb"
}
```

---

### **10. Expected Responses**
#### **Supported DB Type**
```json
{
    "success": true,
    "message": "PostgreSQL connection successful"
}
```

#### **Unsupported DB Type**
```json
{
    "success": false,
    "message": "Database type 'oracle' is not supported."
}
```

---

### **Final Thoughts**
- **Scalable**: Just add a new handler file & register it.
- **Modular**: Each DB type has its own logic file.
- **Validation**: Automatically updates based on registered handlers.

This structure ensures long-term maintainability. Let me know if you need further enhancements!