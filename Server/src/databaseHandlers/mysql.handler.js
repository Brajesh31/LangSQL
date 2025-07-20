import mysql from 'mysql2/promise';

const testMySQLConnection = async ({ host, port, username, password, database }) => {
    try {
        const connection = await mysql.createConnection({ host, port, user: username, password, database });
        await connection.end();
        return { success: true, message: 'MySQL connection successful' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export default testMySQLConnection;
