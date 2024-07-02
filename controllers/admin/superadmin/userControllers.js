const users = require("../../../model/userModel");
const moment = require("moment");

const getCountryUser = async (req, res) => {
  try {
    const usersByCountry = await users.aggregate([
      { $match: { role: "customer" } },
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
      message: "Fetched country with user count",
      data: usersByCountry,
    });
  } catch (error) {
    console.error("Error fetching user data by country:", error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllUsersForAdmin = async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = { role: "customer" };

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
    const userData = await users
      .find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      totalCount: total,
      users: userData,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user data: " + error.message,
    });
  }
};

const userCountForGraph = async (req, res) => {
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
        role: "customer",
      });
      counts.push(count);
    }

    res.status(200).json({
      success: true,
      message: "User data fetched for graph.",
      counts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const userCountAndGrowthRate = async (req, res) => {
  try {
    const count = await users.countDocuments({ role: "customer" });

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
      role: 'customer',
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await users.countDocuments({
      role: 'customer',
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of users fetched successfully",
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
  getCountryUser,
  getAllUsersForAdmin,
  userCountForGraph,
  userCountAndGrowthRate,
};
