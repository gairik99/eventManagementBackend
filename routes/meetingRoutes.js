const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  createMeeting,
  deleteMeeting,
  updateMeeting,
} = require("../controllers/meetingController");
const router = express.Router();

router.route("/meeting").post(validateToken, createMeeting);

router.route("/meeting/:id").delete(validateToken, deleteMeeting);
router.route("/meeting/:id").patch(validateToken, updateMeeting);

module.exports = router;
