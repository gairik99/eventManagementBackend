const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");

app.use("/api/v1", authRouter);
app.use("/api/v1/user", userRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "this is test page" });
});

module.exports = app;
