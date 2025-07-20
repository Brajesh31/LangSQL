import yup from "yup";
import { getDBHandler } from "../databaseHandlers/dbRegistry.js";
import { dbHandlers } from "../databaseHandlers/dbRegistry.js";

const validateConnectionDetails = async (req, res, next) => {
  const allowedDBTypes = Object.keys(dbHandlers);

  const connectionSchema = yup.object().shape({
    dbType: yup.string().oneOf(allowedDBTypes).required(),
    host: yup.string().required(),
    port: yup.number().positive().required(),
    username: yup.string().required(),
    password: yup.string().required(),
    database: yup.string().required(),
  });

  try {
    await connectionSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export default validateConnectionDetails;
