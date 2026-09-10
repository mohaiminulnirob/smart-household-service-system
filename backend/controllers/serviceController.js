import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

// Create request (modified to accept optional selected_worker_id)
export const createRequest = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      category,
      description,
      location,
      latitude,
      longitude,
      selected_worker_id,
    } = req.body;

    if (!category || !description || !location || !latitude || !longitude)
      return res.status(400).json(error("All fields are required"));

    let assignedWorkerId = null;
    let status = "Pending";

    let problemPicUrl = null;
    if (req.file) problemPicUrl = req.file.path;

    // ------------------------------------------------------
    // 📌 1) Worker selected manually
    // ------------------------------------------------------
    if (selected_worker_id) {
      const [workerRows] = await query(
        "SELECT id, skill_category, availability FROM workers WHERE id = ?",
        [selected_worker_id]
      );

      if (!workerRows.length)
        return res.status(400).json(error("Selected worker not found"));

      const worker = workerRows[0];

      if (
        worker.skill_category &&
        worker.skill_category.toLowerCase() !== String(category).toLowerCase()
      ) {
        return res.status(400).json(
          error("Selected worker does not match the requested category")
        );
      }

      if (worker.availability !== "Available")
        return res.status(400).json(error("Selected worker is not available"));

      assignedWorkerId = worker.id;
      status = "Assigned";
    } 
    else {
      // ------------------------------------------------------
      // 📌 2) Auto-assign nearest worker
      // ------------------------------------------------------
      const [workers] = await query(
        `SELECT id, latitude, longitude,
                (6371 * ACOS(
                  COS(RADIANS(?)) * COS(RADIANS(latitude)) *
                  COS(RADIANS(longitude) - RADIANS(?)) +
                  SIN(RADIANS(?)) * SIN(RADIANS(latitude))
                )) AS distance
         FROM workers
         WHERE skill_category = ? AND availability = 'Available'
         HAVING distance IS NOT NULL
         ORDER BY distance ASC, rating DESC
         LIMIT 1`,
        [latitude, longitude, latitude, category]
      );

      if (workers.length > 0) {
        assignedWorkerId = workers[0].id;
        status = "Assigned";
      }
    }

    // ------------------------------------------------------
    // 📌 3) INSERT Request with Cloudinary URL
    // ------------------------------------------------------
    const [result] = await query(
      `INSERT INTO service_requests 
        (user_id, category, description, location, latitude, longitude, status, assigned_worker_id, problem_pic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        category,
        description,
        location,
        latitude,
        longitude,
        status,
        assignedWorkerId,
        problemPicUrl
      ]
    );

    return res.status(201).json({
      ...success("Service request created successfully"),
      request_id: result.insertId,
      assigned_worker_id: assignedWorkerId,
      status
    });

  } catch (err) {
    console.error("Create request error:", err);
    return res.status(500).json(error("Server error"));
  }
};

// USER: Cancel a request
export const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [reqData] = await query(
      "SELECT assigned_worker_id, status FROM service_requests WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!reqData.length)
      return res.status(404).json(error("Request not found"));

    const { assigned_worker_id, status } = reqData[0];

    if (status === "Completed")
      return res.status(400).json(error("Completed request cannot be cancelled"));

    // Make worker available if one was assigned
    if (assigned_worker_id) {
      await query("UPDATE workers SET availability = 'Available' WHERE id = ?", [
        assigned_worker_id,
      ]);
    }

    await query(
      "UPDATE service_requests SET status = 'Cancelled' WHERE id = ?",
      [id]
    );

    res.json(success("Request cancelled successfully"));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// WORKER: Accept a request
export const acceptRequest = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const [reqData] = await query(
      "SELECT * FROM service_requests WHERE id = ? AND assigned_worker_id = ?",
      [id, workerId]
    );

    if (!reqData.length)
      return res.status(404).json(error("Request not assigned to you"));

    const request = reqData[0];

    if (request.status !== "Assigned")
      return res.status(400).json(error("Cannot accept this request"));

    // Accept the job
    await query(
      "UPDATE service_requests SET status = 'Accepted' WHERE id = ?",
      [id]
    );

    // Worker becomes busy only after accepting
    await query("UPDATE workers SET availability = 'Busy' WHERE id = ?", [
      workerId,
    ]);

    res.json(success("Request accepted successfully"));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// WORKER: Reject a request
export const rejectRequest = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const [reqData] = await query(
      "SELECT * FROM service_requests WHERE id = ? AND assigned_worker_id = ?",
      [id, workerId]
    );

    if (!reqData.length)
      return res.status(404).json(error("Request not assigned to you"));

    if (reqData[0].status !== "Assigned")
      return res.status(400).json(error("Cannot reject this request"));

    // Reject request → return back to pending
    await query(
      `UPDATE service_requests 
       SET status = 'Pending', assigned_worker_id = NULL 
       WHERE id = ?`,
      [id]
    );

    res.json(success("Request rejected successfully"));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};

// Get all requests by a user (now includes problem_pic base64)
// Get all requests by a user
export const getUserRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT 
         sr.id,
         sr.user_id,
         sr.category,
         sr.description,
         sr.location,
         sr.latitude,
         sr.longitude,
         sr.status,
         sr.assigned_worker_id,
         sr.created_at,
         sr.problem_pic,   -- IMPORTANT
         w.name AS worker_name, 
         w.phone AS worker_phone,
         w.skill_category,
         EXISTS(
            SELECT 1 FROM ratings 
            WHERE ratings.request_id = sr.id 
              AND ratings.rater_id = sr.user_id
         ) AS user_has_rated
       FROM service_requests sr 
       LEFT JOIN workers w ON sr.assigned_worker_id = w.id 
       WHERE sr.user_id = ?
       ORDER BY sr.created_at DESC`,
      [id]
    );

    res.json(rows);

  } catch (err) {
    console.error("getUserRequests error:", err);
    res.status(500).json(error(err.message));
  }
};



// Get all requests for a worker
export const getWorkerRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT 
         sr.*, 
         u.name AS user_name, 
         u.email AS user_email,
         u.phone AS user_phone
       FROM service_requests sr 
       JOIN users u ON sr.user_id = u.id
       WHERE sr.assigned_worker_id = ?
       ORDER BY sr.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};


// Mark a request as completed (and free worker)
export const completeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [reqData] = await query(
      "SELECT assigned_worker_id, status FROM service_requests WHERE id = ?",
      [id]
    );
    if (!reqData.length) return res.status(404).json(error("Request not found"));

    const { assigned_worker_id, status } = reqData[0];

    if (status !== "Accepted")
      return res.status(400).json(error("Only accepted requests can be completed"));

    // Mark request completed
    await query("UPDATE service_requests SET status = 'Completed' WHERE id = ?", [
      id,
    ]);

    // Make worker available again
    if (assigned_worker_id)
      await query("UPDATE workers SET availability = 'Available' WHERE id = ?", [
        assigned_worker_id,
      ]);

    res.json(success("Request marked as completed"));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
};
