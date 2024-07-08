const Bookings = require("../../model/bookingModel");
const futsals = require("../../model/futsalModel");
const paymentLogs = require("../../model/paymentLogsModel");
const users = require("../../model/userModel");

const getAllBookings = async (req, res) => {
  const userId = req.user.id;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {
      user: userId,
    };

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    // if (searchQuery) {
    //   query.$or = [{ description: { $regex: new RegExp(searchQuery, "i") } }];
    // } else {
    //   query.futsal = { $ne: null };
    // }

    const total = await Bookings.countDocuments(query);
    const bookingData = await Bookings.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 })
      .populate("futsal")
      .populate("user")
      .populate("timeSlot");

    res.status(200).json({
      success: true,
      totalCount: total,
      bookingsData: bookingData,
    });
  } catch (error) {
    console.log("Error retrieving booking data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  const userId = req.user.id;
  const { futsal, date, timeSlot, paid } = req.body;
  console.log(req.body)

  try {
    const futsalData = await futsals.findById(futsal).populate("addedBy");
    const vendor = futsalData.addedBy._id;
    console.log(vendor)

    const existingBooking = await Bookings.findOne({
      date: date,
      timeSlot: timeSlot,
    });

    if (existingBooking) {
      return res.status(403).json({
        success: false,
        message: "This timeslot is already booked",
      });
    }

    const newBooking = new Bookings({
      user: userId,
      futsal: futsal,
      vendor: vendor,
      date: date,
      timeSlot: timeSlot,
      paid: paid,
    });

    await newBooking.save();

    if (req.body.paid === "true") {
      const populatedFutsal = await futsals.findOne({ _id: futsal });
      const newPaymentLog = new paymentLogs({
        by: userId,
        vendor: vendor,
        futsal: futsal,
        amount: populatedFutsal.price,
      });
      await newPaymentLog.save();
    }

    await users.findByIdAndUpdate(userId, {
      $inc: { totalBookings: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
    getAllBookings,
    createBooking
}
