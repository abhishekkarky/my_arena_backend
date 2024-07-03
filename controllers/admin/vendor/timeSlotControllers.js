const futsals = require("../../../model/futsalModel");
const moment = require("moment");

const getAllTimeSlotForBooking = async (req, res) => {
  const { futsalId, date } = req.query;

  try {
    const futsal = await futsals.findById(futsalId);
    if (!futsal) {
      return res
        .status(403)
        .json({ success: false, message: "Futsal not found" });
    }

    let availableDays;
    if (Array.isArray(futsal.dayOfWeek) && futsal.dayOfWeek.length === 1) {
      availableDays = futsal.dayOfWeek[0].split(", ").map((day) => day.trim());
    } else if (Array.isArray(futsal.dayOfWeek)) {
      availableDays = futsal.dayOfWeek;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format for dayOfWeek",
      });
    }

    const dayOfWeek = moment(date).format("dddd");

    if (!availableDays.includes(dayOfWeek)) {
      return res.status(403).json({
        success: false,
        message: `Futsal is not available on ${dayOfWeek}`,
      });
    }

    const startTime = moment(date + " " + futsal.startTime, "YYYY-MM-DD HH:mm");
    const endTime = moment(date + " " + futsal.endTime, "YYYY-MM-DD HH:mm");

    const timeSlots = [];
    let currentTime = startTime;

    while (currentTime < endTime) {
      timeSlots.push({
        startTime: currentTime.format("HH:mm"),
        endTime: currentTime.clone().add(1, "hour").format("HH:mm"),
      });
      currentTime = currentTime.add(1, "hour");
    }
    res.status(200).json({ success: true, timeSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllTimeSlotForBooking };
