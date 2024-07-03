const futsals = require("../../../model/futsalModel");
const Futsal = require("../../../model/futsalModel");
const moment = require("moment");

const getAllFutsalsForAdmin = async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (startDate && endDate) {
      const start = moment(endDate).startOf("day").toDate();
      const end = moment(startDate).endOf("day").toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    if (searchQuery && searchQuery !== "undefined") {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { location: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    const total = await Futsal.countDocuments(query);
    const futsalData = await Futsal.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 })
      .populate("addedBy")
      .populate("timeSlots");

    res.status(200).json({
      success: true,
      totalCount: total,
      futsals: futsalData,
    });
  } catch (error) {
    console.log("Error retrieving futsal data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const futsalCountAndGrowthRate = async (req, res) => {
  try {
    const count = await Futsal.countDocuments();

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
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await Futsal.countDocuments({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of futsals fetched successfully",
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

module.exports = {
  getAllFutsalsForAdmin,
  futsalCountAndGrowthRate,
  deleteFutsal
};
