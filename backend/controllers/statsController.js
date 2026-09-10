import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

export const getLandingStats = async (req, res) => {
  try {
    const [[activeWorkers]] = await query(
      "SELECT COUNT(*) AS count FROM workers WHERE availability = 'Available'"
    );
    const [[jobsCompleted]] = await query(
      "SELECT COUNT(*) AS count FROM service_requests WHERE status = 'Completed'"
    );
    const [[avgRating]] = await query(
      "SELECT ROUND(COALESCE(AVG(score), 0), 1) AS rating FROM ratings"
    );

    res.json(
      success("Landing stats retrieved", {
        active_workers: activeWorkers.count,
        jobs_completed: jobsCompleted.count,
        avg_rating: avgRating.rating,
      })
    );
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json(error("Server error"));
  }
};
