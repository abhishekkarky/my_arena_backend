const express = require("express");

const path = require("path");

const cors = require("cors");
const moment = require("moment-timezone");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const morgan = require("morgan");

moment.tz.setDefault("Asia/Kathmandu");

const app = express();
app.use(morgan("dev"));

dotenv.config();

app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ limit: "40mb", extended: true }));

const corsPolicy = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsPolicy));

app.use("/uploads", (req, res, next) => {
  express.static(path.resolve(__dirname, "uploads"))(req, res, next);
});

connectDB();

const port = process.env.PORT;

// creating user routes
app.use("/api/user", require("./routes/user/userRoutes"));

// creating futsal routes for vendor
app.use('/api/futsal', require('./routes/admin/vendor/futsalRoutes'))

// creating booking routes for vendor
app.use('/api/booking', require('./routes/admin/vendor/bookingRoutes'))

// creating notification routes for vendor
app.use('/api/notification', require('./routes/admin/vendor/notificationRoutes'))

// creating paymentLog routes for vendor
app.use('/api/paymentLog', require('./routes/admin/vendor/paymentLogRoutes'))

// creating futsal routes for superadmin
app.use('/api/superadmin/futsal', require('./routes/admin/superadmin/futsalRoutes'))

// creating user routes for superadmin
app.use('/api/superadmin/user', require('./routes/admin/superadmin/userRoutes'))

// creating vendor routes for superadmin
app.use('/api/superadmin/vendor', require('./routes/admin/superadmin/vendorRoutes'))

// creating paymentLog routes for superadmin
app.use('/api/superadmin/paymentLogs', require('./routes/admin/superadmin/paymentLogsRoutes'))

// creating booking routes for superadmin
app.use('/api/superadmin/booking', require('./routes/admin/superadmin/bookingRoutes'))

// creating notification routes for superadmin
app.use('/api/superadmin/notification', require('./routes/admin/superadmin/notificationRoutes'))

// creating booking routes for user
app.use('/api/user/bookings', require('./routes/user/bookingRoutes'))

// creating notification routes for user
app.use('/api/user/notification', require('./routes/user/notificationRoutes'))

// creating futsal routes for user
app.use('/api/user/futsal', require('./routes/user/futsalRoutes'))

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

module.exports = app;
