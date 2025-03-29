const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  createMeeting,
  deleteMeeting,
  updateMeeting,
  getMyMeetings,
  getGuestMeetings,
  updateGuestStatus,
  getMeetingById,
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

router.route("/meeting/guests").get(validateToken, getGuestMeetings);
router.route("/meeting/guests/:id").patch(validateToken, updateGuestStatus);
router.get("/copymeeting/:id", getMeetingById);

module.exports = router;
