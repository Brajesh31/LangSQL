import { getDBWorker } from "../workers/workerRegistry.js";

const executeQuery = async (dbConfig) => {
  const worker = getDBWorker(dbConfig.dbType);
  console.log(worker);
  console.log(typeof worker);
  if (!worker) {
    return {
      success: false,
      message: `Database type '${dbConfig.dbType}' is not supported.`,
    };
  }
  return await worker(dbConfig);
};

export default executeQuery;
