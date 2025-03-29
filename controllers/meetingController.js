const mongoose = require("mongoose");
const Meeting = require("../models/meetingModel");
const User = require("../models/userModel");

async function createMeeting(req, res) {
  try {
    const createdById = req.user.id;
    const { meeting, ...rest } = req.body;
    const emailArray = meeting
      .split(",")
      .map((email) => email.trim().toLowerCase());

    // Find users with matching emails
    const foundUsers = await User.find({ email: { $in: emailArray } });

    const foundEmails = foundUsers.map((user) => user.email.toLowerCase());

    // Find missing emails
    const missingEmails = emailArray.filter(
      (email) => !foundEmails.includes(email)
    );

    if (missingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: "The following emails were not found",
        missingEmails,
      });
    }

    // Build guest list with name and email
    const guestList = foundUsers.map((user) => ({
      user: user._id,
      name: `${user.firstName} ${user.lastName}`, // Add the user's name
      email: user.email,
      status: "pending",
      addedAt: new Date(),
    }));

    const newMeeting = new Meeting({
      ...rest,
      meeting,
      guests: guestList,
      createdBy: createdById,
    });

    const savedMeeting = await newMeeting.save();
    const populatedMeeting = await Meeting.findById(savedMeeting._id)
      .populate("guests.user")
      .populate("createdBy");

    res.status(201).json({
      success: true,
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function deleteMeeting(req, res) {
  try {
    const userId = req.user.id;
    const meetingId = req.params.id;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this meeting",
      });
    }
    await meeting.deleteOne();
    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateMeeting(req, res) {
  try {
    const userId = req.user.id;
    const meetingId = req.params.id;
    // console.log(meetingId);
    const { meeting, ...rest } = req.body;
    let guestList = [];

    if (meeting) {
      const emailArray = meeting
        .split(",")
        .map((email) => email.trim().toLowerCase());
      const foundUsers = await User.find({ email: { $in: emailArray } });

      const foundEmails = foundUsers.map((user) => user.email.toLowerCase());
      const missingEmails = emailArray.filter(
        (email) => !foundEmails.includes(email)
      );

      if (missingEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: "The following emails were not found",
          missingEmails,
        });
      }

      guestList = foundUsers.map((user) => ({
        user: user._id,
        name: `${user.firstName} ${user.lastName}`, // Assumes firstName and lastName fields exist
        email: user.email,
        status: "pending",
        addedAt: new Date(),
      }));
    }

    const updateData = { ...rest, meeting };
    if (guestList.length > 0) {
      updateData.guests = guestList;
    }

    const updatedMeeting = await Meeting.findOneAndUpdate(
      { _id: meetingId, createdBy: userId },
      updateData,
      { new: true, runValidator: true }
    );

    if (!updatedMeeting) {
      const meetingExists = await Meeting.findById(meetingId);
      if (!meetingExists) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this meeting",
        });
      }
    }

    await updatedMeeting.populate(["guests.user", "createdBy"]);
    res.status(200).json({
      success: true,
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
async function getMyMeetings(req, res) {
  try {
    // Get the authenticated user's ID from req.user
    const userId = req.user.id;

    // Find meetings where createdBy matches the user's ID
    const meetings = await Meeting.find({ createdBy: userId })
      .populate("createdBy", "-password") // Populate creator details
      .populate("guests.user", "-password") // Populate guest user details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getGuestMeetings(req, res) {
  try {
    const userId = req.user.id;

    // Find meetings where user exists in guests array
    const meetings = await Meeting.find({
      "guests.user": new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    console.error("Error fetching guest meetings:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}

const updateGuestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid meeting ID" });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Allowed values: 'accepted' or 'rejected'",
      });
    }

    // Update the guest status
    const updatedMeeting = await Meeting.findOneAndUpdate(
      {
        _id: id,
        "guests.user": userId,
      },
      {
        $set: { "guests.$.status": status },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "-password")
      .populate("guests.user", "-password");

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        error: "Meeting not found or user is not a guest in this meeting",
      });
    }

    res.status(200).json({
      success: true,
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error("Error updating guest status:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid meeting ID" });
    }
    const meeting = await Meeting.findById(id).select(
      "-__v  -password -createdBy -guests -meeting"
    );
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);

    // Handle CastError specifically
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid meeting ID format" });
    }

    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

module.exports = {
  createMeeting,
  deleteMeeting,
  updateMeeting,
  getMyMeetings,
  getGuestMeetings,
  updateGuestStatus,
  getMeetingById,
};
