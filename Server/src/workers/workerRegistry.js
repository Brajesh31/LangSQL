const dbWorkers = {};

const registerDBWorker = (dbType, worker) => {
  dbWorkers[dbType] = worker;
};

const getDBWorker = (dbType) => {
  return dbWorkers[dbType] || null;
};

export { registerDBWorker, getDBWorker, dbWorkers };
