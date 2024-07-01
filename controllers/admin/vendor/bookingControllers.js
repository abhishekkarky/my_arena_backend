const Bookings = require("../../../model/bookingModel");
const moment = require("moment");
const users = require("../../../model/userModel");
const timeSlots = require("../../../model/timeSlotModel");

const addBooking = async (req, res) => {
  const userId = req.user.id;
  const { user, futsal, date, timeSlot, paid } = req.body;

  const checkUser = await users.findOne({ number: user });
  if (!checkUser) {
    return res.status(403).json({ success: false, message: "User not found" });
  } else if (checkUser.isVerified === false) {
    return res.status(403).json({
      success: false,
      message: "User is not verified yet.",
    });
  }

  try {
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

    await timeSlots.updateMany(
      { _id: { $in: timeSlot } },
      { $set: { available: false } }
    );

    const newBooking = new Bookings({
      user: checkUser._id,
      futsal: futsal,
      vendor: userId,
      date: date,
      timeSlot: timeSlot,
      paid: paid,
    });

    await newBooking.save();

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
      vendor: userId,
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

const bookingCountForGraph = async (req, res) => {
  const userId = req.user.id;
  try {
    let { startTimestamp, endTimestamp } = req.query;

    if (!startTimestamp || !endTimestamp) {
      const currentYear = moment().year();
      startTimestamp = moment(
        `${currentYear}-01-01T00:00:00.000Z`
      ).toISOString();

      endTimestamp = moment().toISOString();
    }

    const isValidDate = (dateString) => {
      return moment(dateString, moment.ISO_8601, true).isValid();
    };

    if (!isValidDate(startTimestamp) || !isValidDate(endTimestamp)) {
      console.log("Invalid timestamp format");
      return res
        .status(403)
        .json({ success: false, message: "Invalid timestamp format" });
    }

    const counts = [];
    for (let month = 1; month <= 12; month++) {
      const startOfMonth = moment(startTimestamp)
        .startOf("month")
        .month(month - 1);
      const endOfMonth = moment(startOfMonth).endOf("month");

      const count = await Bookings.countDocuments({
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lte: endOfMonth.toDate(),
        },
        vendor: userId,
      });
      counts.push(count);
    }

    res.status(200).json({
      success: true,
      message: "Booking data fetched successfully",
      counts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const bookingCountAndGrowthRate = async (req, res) => {
  try {
    const count = await Bookings.countDocuments({ vendor: req.user.id });

    const previousMonthStart = moment()
      .subtract(1, "months")
      .startOf("month")
      .toDate();
    const previousMonthEnd = moment()
      .subtract(1, "months")
      .endOf("month")
      .toDate();

    const currentMonthStart = moment().startOf("month").toDate();
    const currentMonthEnd = moment().endOf("month").toDate();

    const previousMonthCount = await Bookings.countDocuments({
      vendor: req.user.id,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await Bookings.countDocuments({
      vendor: req.user.id,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of bookings fetched successfully",
      count: count,
      growth: growthRate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteBooking = async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await Bookings.findById(bookingId);
    if (!booking) {
      return res.status(403).json({
        success: false,
        message: "Booking not found",
      });
    }
    await Bookings.findByIdAndDelete(bookingId);
    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addBooking,
  getAllBookings,
  bookingCountForGraph,
  bookingCountAndGrowthRate,
  deleteBooking,
};
