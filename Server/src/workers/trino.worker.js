import axios from "axios";

// Function to execute a SQL query and check for long-running queries
const executeQueryWithStatusCheck = async (config, sqlQuery) => {
  try {
    console.log("Executing query:", sqlQuery);

    const authString = `${config.clientID}:${config.apiKey}`;
    const encodedAuth = Buffer.from(authString).toString("base64"); // Encoding clientID:apiKey in base64

    // Step 1: Execute the query
    const response = await axios.post(
      `${config.galaxyDomain}/v1/statement`, // The endpoint for executing queries
      { query: sqlQuery }, // SQL query
      {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { queryId } = response.data;
    console.log(`Query ID: ${queryId}`);

    // Step 2: Poll the status of the query
    const statusResponse = await axios.get(
      `${config.host}/v1/statement/${queryId}`, // Check query status with queryId
      {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      }
    );

    // Step 3: Handle the results
    if (statusResponse.data.state === "FINISHED") {
      return {
        message: "Query finished successfully!",
        data: statusResponse.data, // Query result
      };
    } else {
      return {
        message: "Query still running, please check again.",
        status: statusResponse.data.state,
      };
    }
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
};

export default executeQueryWithStatusCheck;
