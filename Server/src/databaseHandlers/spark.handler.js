import pkg from "pg"; 
const { Client } = pkg;


async function testSparkConnection({ host, port, user, password, database }) {
    const connectionString = `jdbc:spark://${host}:${port}/${database}`;

    try {
        const client = new Client({
            connectionString,
            user,
            password
        });

        await client.connect();
        await client.query("SELECT 1"); // Simple query to test connection
        await client.end();

        return { success: true, message: "Spark connection successful" };
    } catch (error) {
        return { success: false, message: "Spark connection failed", error };
    }
}

export default testSparkConnection;
