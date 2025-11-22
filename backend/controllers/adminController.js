import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

// Get all pending workers (availability = 'Offline')
export const getPendingWorkers = async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT id, name, email, skill_category, location, availability FROM workers WHERE admin_verified=0"
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error("getPendingWorkers error:", err);
    return res.status(500).json(error(err.message));
  }
};

// Approve a worker
export const approveWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const [existing] = await query("SELECT * FROM workers WHERE id=?", [id]);
    if (!existing.length) return res.status(404).json(error("Worker not found"));

    await query("UPDATE workers SET admin_verified=1 WHERE id=?", [id]);
    await query(
      "INSERT INTO admin_logs (admin_id, action_type, description) VALUES (?, ?, ?)",
      [adminId, "approve_worker", `Approved worker id=${id}`]
    );

    return res.json(success("Worker approved successfully"));
  } catch (err) {
    console.error("approveWorker error:", err);
    return res.status(500).json(error(err.message));
  }
};

// Reject a worker
export const rejectWorker = async (req, res) => {
  try {
    const { id } = req.params;

    const [worker] = await query("SELECT * FROM workers WHERE id=?", [id]);
    if (!worker.length) return res.status(404).json(error("Worker not found"));

    await query("DELETE FROM workers WHERE id=?", [id]);

    return res.json(success("Worker rejected and removed"));
  } catch (err) {
    console.error("rejectWorker error:", err);
    return res.status(500).json(error(err.message));
  }
};


// Get work requests
export const getWorkRequests = async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT 
        r.id, 
        r.user_id, 
        r.category, 
        r.description, 
        r.location, 
        r.status,
        r.assigned_worker_id, 
        r.service_type_id, 
        r.created_at, 
        r.problem_Pic,
        u.name AS user_name
      FROM service_requests r
      JOIN users u ON u.id = r.user_id
    `);

    // Convert BLOB → Base64 for each request
    const formatted = rows.map((item) => {
      if (item.problem_Pic) {
        item.problem_Pic = `data:image/jpeg;base64,${item.problem_Pic.toString("base64")}`;
      }
      return item;
    });

    return res.json({ data: formatted });

  } catch (err) {
    console.error("getWorkRequests error:", err);
    return res.status(500).json(error(err.message));
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const [rows] = await query(
      "SELECT id, name, email, phone FROM users WHERE id=? AND role='admin'",
      [id]
    );

    if (!rows.length)
      return res.status(404).json(error("Admin not found"));

    return res.json({ data: rows[0] });

  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};


// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, phone, password } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name=?");
      values.push(name);
    }

    if (phone) {
      updates.push("phone=?");
      values.push(phone);
    }

    if (password) {
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.hash(password, 10);
      updates.push("password_hash=?");
      values.push(hash);
    }

    if (!updates.length)
      return res.status(400).json(error("No updates provided"));

    // Add admin ID at the end
    values.push(adminId);

    // Update admin row
    await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id=? AND role='admin'`,
      values
    );

    // Return updated data
    const [updated] = await query(
      "SELECT id, name, email, phone FROM users WHERE id=?",
      [adminId]
    );

    return res.json({
      data: updated[0],
      message: "Profile updated successfully",
    });

  } catch (err) {
    console.error("updateAdminProfile error:", err);
    return res.status(500).json(error(err.message));
  }
};

//get all valid workers
export const getAllWorkers = async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT id, name, email, rating, skill_category, availability, phone, created_at
      FROM workers
      WHERE admin_verified = 1
    `);

    return res.json({ data: rows });

  } catch (err) {
    console.error("getAllWorkers error:", err);
    return res.status(500).json(error(err.message));
  }
};

//get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Total approved workers
    const [approved] = await query(
      "SELECT COUNT(*) AS total FROM workers WHERE admin_verified = 1"
    );

    // Total pending workers
    const [pending] = await query(
      "SELECT COUNT(*) AS total FROM workers WHERE admin_verified = 0"
    );

    // Work request counts
    const [completed] = await query(
      "SELECT COUNT(*) AS total FROM service_requests WHERE status = 'Completed'"
    );

    const [pendingReq] = await query(
      "SELECT COUNT(*) AS total FROM service_requests WHERE status = 'Pending'"
    );

    const [cancelled] = await query(
      "SELECT COUNT(*) AS total FROM service_requests WHERE status = 'Cancelled'"
    );

    // Average worker rating
    const [rating] = await query(
      "SELECT AVG(score) AS avg_rating FROM ratings"
    );

    return res.json({
      data: {
        approved_workers: approved[0].total,
        pending_workers: pending[0].total,
        completed_requests: completed[0].total,
        pending_requests: pendingReq[0].total,
        cancelled_requests: cancelled[0].total,
        average_rating: Number(rating[0].avg_rating || 0).toFixed(2),
      },
    });

  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json(error(err.message));
  }
};
