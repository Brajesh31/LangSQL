import mysql from "mysql2/promise";

const mySqlExecution = async ({
  host,
  port,
  username,
  password,
  database,
  query,
}) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
    });

    console.log("Connected to MySQL");
    const startTime = Date.now();
    const [rows] = await connection.execute(query);
    const executionTime = Date.now() - startTime;

    console.log("Query Result:", rows);

    return {
      success: true,
      message: "Query executed successfully",
      data: {
        results: rows,
        metadata: {
          rowCount: rows.length,
          executionTime: `${executionTime}ms`,
          affectedRows: rows.affectedRows || 0,
          columns: rows.length > 0 ? Object.keys(rows[0]) : [],
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  } finally {
    if (connection) await connection.end();
    console.log("Connection closed");
  }
};

export default mySqlExecution;
