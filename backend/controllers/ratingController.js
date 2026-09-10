import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

// Add a rating (user to worker)
export const addRating = async (req, res) => {
  try {
    const { request_id, rater_id, ratee_id, score, comment } = req.body;

    if (!request_id || !rater_id || !ratee_id || !score)
      return res.status(400).json(error("Missing required fields"));

    if (score < 1 || score > 5)
      return res.status(400).json(error("Score must be between 1 and 5"));

    // Check if request exists and is completed
    const [reqData] = await query(
      "SELECT status FROM service_requests WHERE id = ?",
      [request_id]
    );
    if (!reqData.length)
      return res.status(404).json(error("Service request not found"));

    if (reqData[0].status !== "Completed")
      return res.status(400).json(error("Can only rate completed requests"));

    // Insert rating
    await query(
      "INSERT INTO ratings (request_id, rater_id, ratee_id, score, comment) VALUES (?, ?, ?, ?, ?)",
      [request_id, rater_id, ratee_id, score, comment || null]
    );

    // Update worker’s rating and count
    const [workerData] = await query(
      "SELECT rating, rating_count FROM workers WHERE id = ?",
      [ratee_id]
    );

    if (workerData.length) {
      const oldRating = workerData[0].rating || 0;
      const oldCount = workerData[0].rating_count || 0;
      const newCount = oldCount + 1;
      const newRating = ((oldRating * oldCount) + score) / newCount;

      await query(
        "UPDATE workers SET rating = ?, rating_count = ? WHERE id = ?",
        [newRating, newCount, ratee_id]
      );
    }

    res.status(201).json(success("Rating submitted successfully"));
  } catch (err) {
    console.error("Rating Error:", err);
    res.status(500).json(error("Server error"));
  }
};

// Get all ratings for a specific worker
export const getWorkerRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const [ratings] = await query(
      `SELECT r.id, r.score, r.comment, r.created_at, u.name AS rater_name
       FROM ratings r
       JOIN users u ON r.rater_id = u.id
       WHERE r.ratee_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    // Get worker summary with computed aggregate from actual ratings
    const [worker] = await query(
      `SELECT w.name,
              COALESCE(ROUND(AVG(r.score), 1), 0) AS rating,
              COUNT(r.id) AS rating_count
       FROM workers w
       LEFT JOIN ratings r ON r.ratee_id = w.id
       WHERE w.id = ?
       GROUP BY w.id`,
      [id]
    );

    if (!worker.length)
      return res.status(404).json(error("Worker not found"));

    res.json({
      worker: worker[0],
      total_reviews: worker[0].rating_count,
      ratings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(error("Server error"));
  }
};
