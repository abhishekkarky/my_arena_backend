const paymentLogModel = require("../../../model/paymentLogsModel");
const moment = require("moment");
const mongoose = require("mongoose");

const getAllPaymentLogs = async (req, res) => {
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
    // }

    const total = await paymentLogModel.countDocuments(query);
    const paymentLogData = await paymentLogModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 })
      .populate("vendor")
      .populate("futsal")
      .populate("by");

    res.status(200).json({
      success: true,
      totalCount: total,
      paymentLogs: paymentLogData,
    });
  } catch (error) {
    console.error("Error retrieving payment logs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRevenueDataForGraph = async (req, res) => {
  const userId = req.user.id;
  try {
    const currentYear = moment().year();
    const startOfYear = moment(`${currentYear}-01-01T00:00:00.000Z`)
      .startOf("year")
      .toDate();
    const endOfYear = moment(`${currentYear}-12-31T23:59:59.999Z`)
      .endOf("year")
      .toDate();

    const revenueData = await paymentLogModel.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => 0);

    revenueData.forEach((data) => {
      monthlyRevenue[data._id - 1] = data.totalRevenue;
    });

    res.status(200).json({
      success: true,
      message: `Revenue data for ${currentYear} fetched successfully`,
      revenueData: monthlyRevenue,
    });
  } catch (err) {
    console.error("Error retrieving revenue data:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const getRevenueTotals = async (req, res) => {
  const userId = req.user.id;
  try {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();
    const lastMonthStart = moment()
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const lastMonthEnd = moment().subtract(1, "month").endOf("month").toDate();

    const revenue = await paymentLogModel.aggregate([
      {
        $facet: {
          todayRevenue: [
            {
              $match: {
                vendor: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: todayStart, $lte: todayEnd },
              },
            },
            { $group: { _id: null, totalTodayAmount: { $sum: "$amount" } } },
          ],
          totalRevenue: [
            { $match: { vendor: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
          ],
          lastMonthRevenue: [
            {
              $match: {
                vendor: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
              },
            },
            {
              $group: { _id: null, totalLastMonthAmount: { $sum: "$amount" } },
            },
          ],
        },
      },
    ]);

    const todayTotal =
      revenue[0].todayRevenue.length > 0
        ? revenue[0].todayRevenue[0].totalTodayAmount
        : 0;
    const overallTotal =
      revenue[0].totalRevenue.length > 0
        ? revenue[0].totalRevenue[0].totalAmount
        : 0;
    const lastMonthTotal =
      revenue[0].lastMonthRevenue.length > 0
        ? revenue[0].lastMonthRevenue[0].totalLastMonthAmount
        : 0;

    const growthRate = ((overallTotal - lastMonthTotal) / lastMonthTotal) * 100;

    res.status(200).json({
      success: true,
      todayTotal: todayTotal,
      overallTotal: overallTotal,
      growth: growthRate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving revenue data: " + error.message,
    });
  }
};

module.exports = {
  getAllPaymentLogs,
  getRevenueTotals,
  getRevenueDataForGraph,
};
