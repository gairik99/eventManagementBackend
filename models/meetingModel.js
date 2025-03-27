const { mongoose, Schema } = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    eventTopic: {
      type: String,
      required: [true, "Provide your name"],
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    hostName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Provide a date"],
    },
    time: {
      type: String,
      required: [true, "Provide a time"],
    },
    ampm: {
      type: String,
      required: [true, "Provide a am/pm"],
      default: "PM",
    },
    timeZone: {
      type: String,
      required: [true, "Provide a timezone"],
    },
    duration: {
      type: Number,
      required: [true, "Provide duration"],
    },
    fontColor: {
      type: String,
    },
    bannerColor: {
      type: String,
    },
    meetingLink: {
      type: String,
      required: [true, "Provide a meetingLink"],
    },
    meeting: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    guests: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        // Additional fields you might want to add
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        email: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;
