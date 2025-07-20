import { promisify } from 'util';
import JDBC from 'jdbc';

const sparkExecution = async ({ url, user, password, query }) => {
    let sparkDB = new JDBC({
        url: url,
        properties: { user, password }
    });

    try {
        const initialize = promisify(sparkDB.initialize.bind(sparkDB));
        const getConnection = promisify(sparkDB.getConnection.bind(sparkDB));
        
        await initialize();
        const connection = await getConnection();

        console.log("Connected to Spark");

        const executeQuery = promisify(connection.createStatement().executeQuery.bind(connection.createStatement()));
        const resultSet = await executeQuery(query);

        let tables = [];
        while (resultSet.next()) {
            tables.push(resultSet.getString(1));
        }

        console.log("Query Result:", tables);
        return { success: true, message: 'Spark connection successful', data: tables };
    } catch (error) {
        return { success: false, message: error.message };
    } finally {
        console.log("Closing Spark connection");
    }
};

// ✅ Export only, do not execute immediately
export default sparkExecution;

