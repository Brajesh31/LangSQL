const dbHandlers = {};

const registerDBHandler = (dbType, handler) => {
    dbHandlers[dbType] = handler;
};

const getDBHandler = (dbType) => {
    return dbHandlers[dbType] || null;
};

export { registerDBHandler, getDBHandler,dbHandlers};

