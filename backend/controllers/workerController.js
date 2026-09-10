import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

// Update worker availability (manual override)
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!["Available", "Busy", "Offline"].includes(availability))
      return res.status(400).json(error("Invalid availability status"));

    await query("UPDATE workers SET availability = ? WHERE id = ?", [
      availability,
      id,
    ]);

    res.json(success(`Worker status updated to ${availability}`));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// Get assigned requests for a worker
export const getWorkerRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await query(
      `SELECT sr.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM service_requests sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.assigned_worker_id = ?
       ORDER BY sr.created_at DESC`,
      [id]
    );

    res.json(requests);
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// Get worker ratings
export const getWorkerRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const [ratings] = await query(
      `SELECT r.score, r.comment, r.created_at, u.name AS rated_by
       FROM ratings r
       JOIN users u ON r.rater_id = u.id
       WHERE r.ratee_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(ratings);
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// Update worker location
export const updateWorkerLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude)
      return res.status(400).json(error("Latitude and longitude are required"));

    await query("UPDATE workers SET latitude = ?, longitude = ? WHERE id = ?", [
      latitude,
      longitude,
      id,
    ]);

    res.json(success("Worker location updated successfully"));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

//Get nearby available workers (within radius)
export const getNearbyWorkers = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in KM

    if (!lat || !lng)
      return res.status(400).json(error("Latitude and longitude are required"));

    const [workers] = await query(
      `SELECT id, name, skill_category, availability, rating, latitude, longitude,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance
      FROM workers
      WHERE availability = 'Available'
      HAVING distance <= ?
      ORDER BY distance ASC
      LIMIT 20`,
      [lat, lng, lat, radius]
    );

    res.json(workers);
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// GET worker profile
export const getWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await query(
      "SELECT id, name, email, phone, skill_category, availability, profilePic FROM workers WHERE id=?",
      [id]
    );

    if (!rows.length)
      return res.status(404).json(error("Worker not found"));

    const worker = rows[0];

    return res.json({ data: worker });

  } catch (err) {
    console.error(err);
    return res.status(500).json(error(err.message));
  }
};


// UPDATE WORKER PROFILE
export const updateWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, skill_category } = req.body;

    const updates = [];
    const values = [];

    if (name) { updates.push("name=?"); values.push(name); }
    if (email) { updates.push("email=?"); values.push(email); }
    if (phone) { updates.push("phone=?"); values.push(phone); }
    if (skill_category) { updates.push("skill_category=?"); values.push(skill_category); }
    if (req.file) { updates.push("profilePic=?"); values.push(req.file.path); }

    if (!updates.length)
      return res.status(400).json(error("Nothing to update"));

    values.push(id);

    await query(`UPDATE workers SET ${updates.join(", ")} WHERE id=?`, values);

    return res.json(success("Worker profile updated successfully"));

  } catch (err) {
    console.error(err);
    return res.status(500).json(error(err.message));
  }
};
