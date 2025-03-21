const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const { updateUser } = require("../controllers/userController");
const router = express.Router();

router.route("/updateuser").patch(validateToken, updateUser);

module.exports = router;
