import axios from "axios";

const testTrinoConnection = async (config) => {
  try {
    // Create a base64 encoded authorization string
    const authString = `${config.clientId}:${config.apiKey}`;
    const encodedAuth = Buffer.from(authString).toString("base64"); // Encoding clientID:apiKey in base64

    const response = await axios.post(
      `${config.galaxyDomain}/oauth/v2/token`,
      "grant_type=client_credentials", // Form URL-encoded body
      {
        headers: {
          Authorization: `Basic ${encodedAuth}`, // Use the base64 encoded string
          "Content-Type": "application/x-www-form-urlencoded", // Matching Content-Type
        },
      }
    );

    console.log(response.data);
    return {
      message: "Connected to Starburst Galaxy API!",
      data: response.data,
      success: true,
    };
  } catch (error) {
    return { error: error.response?.data || error.message, success: false };
  }
};

export default testTrinoConnection;
