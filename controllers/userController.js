const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const updateUser = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // List of allowed fields to update
    const allowedUpdates = [
      "firstName",
      "lastName",
      "userName",
      "category",
      "password",
      "email",
    ];
    const updates = req.body;

    // Validate request has updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    // Check for invalid fields
    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedUpdates.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields detected: ${invalidFields.join(", ")}`,
        validFields: allowedUpdates,
      });
    }
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
  }
};

module.exports = { updateUser };
