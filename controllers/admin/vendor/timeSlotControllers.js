const TimeSlot = require("../../../model/timeSlotModel");
const moment = require("moment");

const getAllTimeSlotForBooking = async (req, res) => {
  const { futsalId, date } = req.query;

  try {
    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    const timeSlots = await TimeSlot.find({
      futsal: futsalId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({ success: true, timeSlots: timeSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllTimeSlotForBooking };
