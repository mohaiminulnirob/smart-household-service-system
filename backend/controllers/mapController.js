import { query } from "../config/db.js";
import { responseSuccess, responseError } from "../utils/responseHelper.js";

// Get all workers' locations for a user
export const getAllWorkersLocations = async (req, res) => {
  try {
    const sql = "SELECT id, name, skill_category, latitude, longitude FROM workers WHERE availability='Online'";
    const workers = await query(sql);
    responseSuccess(res, workers);
  } catch (err) {
    responseError(res, err.message);
  }
};

// Get all users' locations for a worker
export const getAllUsersLocations = async (req, res) => {
  try {
    const sql = "SELECT id, name, latitude, longitude FROM users";
    const users = await query(sql);
    responseSuccess(res, users);
  } catch (err) {
    responseError(res, err.message);
  }
};

// Update worker's live location
export const updateWorkerLocation = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { latitude, longitude, availability } = req.body;

    if (latitude == null || longitude == null)
      return responseError(res, "Latitude and longitude required", 400);

    await query(
      "UPDATE workers SET latitude=?, longitude=?, availability=? WHERE id=?",
      [latitude, longitude, availability || "Online", workerId]
    );

    responseSuccess(res, null, "Location updated successfully");
  } catch (err) {
    responseError(res, err.message);
  }
};
