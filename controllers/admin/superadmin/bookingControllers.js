const bookings = require("../../../model/bookingModel");
const moment = require("moment");

const bookingsCountForGraph = async (req, res) => {
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

      const count = await bookings.countDocuments({
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lte: endOfMonth.toDate(),
        },
      });
      counts.push(count);
    }

    res.status(200).json({
      success: true,
      message: "Bookings data fetched for graph.",
      counts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const bookingsCountAndGrowthRate = async (req, res) => {
  try {
    const count = await bookings.countDocuments();

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

    const previousMonthCount = await bookings.countDocuments({
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    });

    const currentMonthCount = await bookings.countDocuments({
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

module.exports = {
  bookingsCountForGraph,
  bookingsCountAndGrowthRate,
};
