const Notification = require("../../../model/notificationModel");
const moment = require("moment");

const notificationCountAndGrowthRate = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

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

    const previousMonthCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const growthRate =
      ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    res.status(200).json({
      success: true,
      message: "Count and growth of notification fetched successfully",
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
  notificationCountAndGrowthRate,
};
