const paymentLogs = require("../../../model/paymentLogsModel");
const moment = require("moment");

const getAllPaymentsForAdmin = async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const searchQuery = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    if (searchQuery && searchQuery !== "undefined") {
      query.$or = [{ pidx: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const total = await paymentLogs.countDocuments(query);
    const paymentData = await paymentLogs
      .find(query)
      .limit(limit)
      .skip(skip)
      .populate("by")
      .populate("vendor")
      .populate("futsal")
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      totalCount: total,
      payments: paymentData,
    });
  } catch (error) {
    console.error("Error retrieving payment data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving payment data: " + error.message,
    });
  }
};

const getRevenueTotals = async (req, res) => {
  try {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();
    const lastMonthStart = moment()
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const lastMonthEnd = moment().subtract(1, "month").endOf("month").toDate();

    const revenue = await paymentLogs.aggregate([
      {
        $facet: {
          todayRevenue: [
            {
              $match: {
                createdAt: { $gte: todayStart, $lte: todayEnd },
              },
            },
            { $group: { _id: null, totalTodayAmount: { $sum: "$amount" } } },
          ],
          totalRevenue: [
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
          ],
          lastMonthRevenue: [
            {
              $match: {
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
      message: "Error retrieving revenue data for admin: " + error.message,
    });
  }
};

module.exports = {
  getAllPaymentsForAdmin,
  getRevenueTotals,
};
