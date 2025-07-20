import axios from "axios";

// Function to fetch metadata (schemas, tables, columns)
const trinoMetadataExtractor = async (config) => {
  try {
    // Prepare headers for authentication
    const authString = `${config.clientId}:${config.apiKey}`;
    const encodedAuth = Buffer.from(authString).toString("base64");

    // 1. Get available catalogs
    const catalogsResponse = await axios.get(
      `${config.host}/v1/metadata/catalogs`, // Endpoint for getting catalogs
      {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      }
    );
    const catalogs = catalogsResponse.data;

    // 2. Get schemas for each catalog
    const schemaPromises = catalogs.map(async (catalog) => {
      const schemasResponse = await axios.get(
        `${config.host}/v1/metadata/catalogs/${catalog}/schemas`, // Get schemas in the catalog
        {
          headers: {
            Authorization: `Basic ${encodedAuth}`,
          },
        }
      );
      return { catalog, schemas: schemasResponse.data };
    });

    const schemasData = await Promise.all(schemaPromises);

    // 3. Get tables for each schema in each catalog
    const tablePromises = schemasData.map(async (catalogData) => {
      const { catalog, schemas } = catalogData;
      const schemaTablePromises = schemas.map(async (schema) => {
        const tablesResponse = await axios.get(
          `${config.host}/v1/metadata/catalogs/${catalog}/schemas/${schema}/tables`, // Get tables in schema
          {
            headers: {
              Authorization: `Basic ${encodedAuth}`,
            },
          }
        );
        return { schema, tables: tablesResponse.data };
      });

      const schemaTables = await Promise.all(schemaTablePromises);
      return { catalog, schemaTables };
    });

    const metadata = await Promise.all(tablePromises);

    // 4. Return metadata
    return {
      message: "Metadata successfully retrieved from Starburst!",
      metadata,
    };
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
};

export default trinoMetadataExtractor;
