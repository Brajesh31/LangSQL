import pkg from "pg";
const { Client } = pkg;

const postgreSQLExecution = async ({
  host,
  port,
  username,
  password,
  database,
  query,
}) => {
  let client;
  try {
    client = new Client({ host, port, user: username, password, database });
    await client.connect();
    console.log("Connected to PostgreSQL");

    const startTime = Date.now();
    const result = await client.query(query);
    const executionTime = Date.now() - startTime;

    console.log("Query Result:", result.rows);

    return {
      success: true,
      message: "Query executed successfully",
      data: {
        results: result.rows,
        metadata: {
          rowCount: result.rowCount,
          executionTime: `${executionTime}ms`,
          affectedRows: result.rowCount,
          columns: result.fields.map((field) => field.name),
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
    if (client) await client.end();
    console.log("Connection closed");
  }
};

export default postgreSQLExecution;
