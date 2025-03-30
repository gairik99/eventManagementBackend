const { mongoose } = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  date: {
    type: String,
    required: true,
  },
  isAllDay: {
    type: Boolean,
    default: false,
  },
  slots: [
    {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
  ],
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Provide your name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Provide your name"],
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: [true, "Provide your email"],
      required: [true, "Provide your email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Provide a password"],
    },
    category: String,
    agree: {
      type: Boolean,
      default: false,
    },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
