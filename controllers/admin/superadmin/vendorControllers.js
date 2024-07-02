const futsals = require("../../../model/futsalModel");
const users = require("../../../model/userModel");
const moment = require("moment");

const getCountryVendor = async (req, res) => {
  try {
    const usersByCountry = await users.aggregate([
      { $match: { role: "vendor" } },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          country: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    res.json({
      success: true,
      message: "Fetched country with vendor count",
      data: usersByCountry,
    });
  } catch (error) {
    console.error("Error fetching vendor data by country:", error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllVendorsForAdmin = async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = { role: "vendor" };

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    if (searchQuery && searchQuery !== "undefined") {
      query.$or = [
        { fullName: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { number: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    const total = await users.countDocuments(query);
    const vendorData = await users
      .find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      totalCount: total,
      vendors: vendorData,
    });
  } catch (error) {
    console.error("Error retrieving vendor data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving vendor data: " + error.message,
    });
  }
};

const vendorCountForGraph = async (req, res) => {
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

      const count = await users.countDocuments({
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lte: endOfMonth.toDate(),
        },
        role: "vendor",
      });
      counts.push(count);
    }

    res.status(200).json({
      success: true,
      message: "Vendor data fetched for graph.",
      counts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const vendorCountAndGrowthRate = async (req, res) => {
  try {
    const count = await users.countDocuments({ role: "vendor" });

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

    const previousMonthCount = await users.countDocuments({
      role: "vendor",
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await users.countDocuments({
      role: "vendor",
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of vendors fetched successfully",
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
  getCountryVendor,
  getAllVendorsForAdmin,
  vendorCountForGraph,
  vendorCountAndGrowthRate,
};
