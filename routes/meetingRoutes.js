const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  createMeeting,
  deleteMeeting,
  updateMeeting,
  getMyMeetings,
} = require("../controllers/meetingController");
const router = express.Router();

router
  .route("/meeting")
  .post(validateToken, createMeeting)
  .get(validateToken, getMyMeetings);

router
  .route("/meeting/:id")
  .delete(validateToken, deleteMeeting)
  .patch(validateToken, updateMeeting);

module.exports = router;
