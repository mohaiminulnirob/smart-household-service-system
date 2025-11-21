import { query } from "../config/db.js";
import { error, success } from "../utils/responseHelper.js";

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT 
        id, 
        name, 
        email, 
        phone,
        created_at,
        profilePic
      FROM users 
      WHERE id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json(error("User not found"));

    const user = rows[0];

    // Convert BLOB → Base64
    if (user.profilePic) {
      user.profilePic = `data:image/jpeg;base64,${user.profilePic.toString("base64")}`;
    }

    return res.json({ data: user });

  } catch (err) {
    console.error(err);
    return res.status(500).json(error(err.message));
  }
};


// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;   // <-- PHONE ADDED

    let profilePic = null;
    if (req.file) {
      profilePic = req.file.buffer;
    }

    const updates = [];
    const values = [];

    if (name) { updates.push("name=?"); values.push(name); }
   // if (email) { updates.push("email=?"); values.push(email); }
    if (phone) { updates.push("phone=?"); values.push(phone); }  // <-- PHONE SAVED
    if (profilePic) { updates.push("profilePic=?"); values.push(profilePic); }

    if (!updates.length)
      return res.status(400).json(error("Nothing to update"));

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id=?`,
      values
    );

    return res.json(success("Profile updated successfully"));

  } catch (err) {
    console.error(err);
    return res.status(500).json(error(err.message));
  }
};
