const Futsal = require("../../../model/futsalModel");
const TimeSlot = require("../../../model/timeSlotModel");
const moment = require("moment");
const users = require("../../../model/userModel");

const generateTimeSlots = (dayOfWeek, startTime, endTime) => {
  const slots = [];
  let startMoment = moment(startTime, "HH:mm");
  let endMoment = moment(endTime, "HH:mm");

  while (startMoment.isBefore(endMoment)) {
    const endSlotMoment = moment(startMoment).add(1, "hours");
    slots.push({
      startTime: startMoment.format("HH:mm"),
      endTime: endSlotMoment.format("HH:mm"),
      dayOfWeek: dayOfWeek,
    });
    startMoment.add(1, "hours");
  }

  return slots;
};

const createFutsal = async (req, res) => {
  const futsalImage = req.file;
  const {
    name,
    location,
    groundSize,
    price,
    lat,
    long,
    dayOfWeek,
    startTime,
    endTime,
  } = req.body;

  if (
    !name ||
    !location ||
    !price ||
    !lat ||
    !long ||
    !groundSize ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !futsalImage
  ) {
    return res.status(403).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    const uploadedImage = futsalImage.originalname.replace(/\s/g, "_");
    const futsalImageUrl = `${process.env.BACKEND_URL}/uploads/${uploadedImage}`;
    const newFutsal = new Futsal({
      name,
      location,
      price,
      groundSize,
      lat,
      long,
      addedBy: req.user.id,
      futsalImageUrl,
      dayOfWeek,
      startTime,
      endTime,
    });
    const savedFutsal = await newFutsal.save();

    const slots = generateTimeSlots(dayOfWeek, startTime, endTime);
    const savedSlots = await TimeSlot.insertMany(
      slots.map((slot) => ({ ...slot, futsal: savedFutsal._id }))
    );
    savedFutsal.timeSlots = savedSlots.map((slot) => slot._id);
    await savedFutsal.save();
    await users.findByIdAndUpdate(req.user.id, { $inc: { totalFutsals: 1 } });

    res.status(200).json({
      success: true,
      message: "Futsal created successfully",
      futsal: savedFutsal,
    });
  } catch (error) {
    console.error("Error creating futsal and time slots:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllFutsals = async (req, res) => {
  const userId = req.user.id;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = { addedBy: userId };

    if (searchQuery && searchQuery !== "undefined") {
      const regex = new RegExp(searchQuery, "i");
      query.name = regex || "";
    }

    const futsals = await Futsal.find(query)
      .populate("timeSlots")
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    const total = await Futsal.countDocuments(query);

    res.status(200).json({
      success: true,
      futsals: futsals,
      totalCount: total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllFutsalForBooking = async (req, res) => {
  const userId = req.user.id;
  try {
    const futsalData = await Futsal.find({ addedBy: userId });
    res.status(200).json({
      success: true,
      futsals: futsalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getFutsalById = async (req, res) => {
  const futsalId = req.params.id;
  if (!futsalId) {
    return res.status(403).json({
      success: false,
      message: "Futsal not found",
    });
  }
  try {
    const futsal = await Futsal.findById(futsalId);
    if (!futsal) {
      return res.status(404).json({
        success: false,
        message: "Futsal not found",
      });
    }
    res.status(200).json({
      success: true,
      futsal: futsal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateFutsal = async (req, res) => {
  const futsalId = req.params.id;
  const {
    name,
    location,
    groundSize,
    price,
    lat,
    long,
    dayOfWeek,
    startTime,
    endTime,
  } = req.body;
  const futsalImage = req.file;

  if (
    !name ||
    !location ||
    !price ||
    !lat ||
    !long ||
    !groundSize ||
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    return res.status(403).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    let futsal = await Futsal.findById(futsalId);
    if (!futsal) {
      return res.status(403).json({
        success: false,
        message: "Futsal not found",
      });
    }

    let futsalImageUrl = futsal.futsalImageUrl;
    if (futsalImage) {
      const uploadedImage = futsalImage.originalname.replace(/\s/g, "_");
      futsalImageUrl = `${process.env.BACKEND_URL}/uploads/${uploadedImage}`;
    }

    const existingTimeSlots = futsal.timeSlots;
    futsal.timeSlots = [];
    await futsal.save();

    await TimeSlot.deleteMany({ _id: { $in: existingTimeSlots } });

    const slots = generateTimeSlots(dayOfWeek, startTime, endTime);
    const savedSlots = await TimeSlot.insertMany(
      slots.map((slot) => ({ ...slot, futsal: futsal._id }))
    );

    futsal.name = name;
    futsal.location = location;
    futsal.price = price;
    futsal.groundSize = groundSize;
    futsal.lat = lat;
    futsal.long = long;
    futsal.dayOfWeek = dayOfWeek;
    futsal.startTime = startTime;
    futsal.endTime = endTime;
    futsal.futsalImageUrl = futsalImageUrl;
    futsal.timeSlots = savedSlots.map((slot) => slot._id);

    await futsal.save();

    res.status(200).json({
      success: true,
      message: "Futsal updated successfully",
      futsal: futsal,
    });
  } catch (error) {
    console.error("Error updating futsal and time slots:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFutsal = async (req, res) => {
  const futsalId = req.params.id;
  if (!futsalId) {
    return res.status(403).json({
      success: false,
      message: "Futsal not found",
    });
  }
  try {
    const futsal = await Futsal.findById(futsalId);
    if (!futsal) {
      return res.status(403).json({
        success: false,
        message: "Futsal not found",
      });
    }
    await Futsal.findByIdAndDelete(futsalId);
    res.status(200).json({
      success: true,
      message: "Futsal deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const futsalCountForGraph = async (req, res) => {
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

      const count = await Futsal.countDocuments({
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lte: endOfMonth.toDate(),
        },
        addedBy: userId,
      });
      counts.push(count);
    }

    res.status(200).json({
      success: true,
      message: "Futsal data fetched successfully",
      counts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const futsalCountAndGrowthRate = async (req, res) => {
  try {
    const count = await Futsal.countDocuments({ addedBy: req.user.id });

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

    const previousMonthCount = await Futsal.countDocuments({
      addedBy: req.user.id,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await Futsal.countDocuments({
      addedBy: req.user.id,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of futsal fetched successfully",
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

module.exports = {
  createFutsal,
  getAllFutsals,
  getFutsalById,
  updateFutsal,
  deleteFutsal,
  futsalCountForGraph,
  futsalCountAndGrowthRate,
  getAllFutsalForBooking,
};
