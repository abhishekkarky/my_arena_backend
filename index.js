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

// // creating subscriber routes
// app.use("/api/subscriber", require("./routes/subscriberRoutes"));

// // Creating group routes
// app.use("/api/group", require("./routes/groupRoutes"));

// // Creating broadcast routes
// app.use("/api/broadcast", require("./routes/broadcastRoutes"));

// // Creating notification routes
// app.use("/api/notification", require("./routes/notificationRoutes"));

// // Creating unsubscriber routes
// app.use("/api/unsubscriber", require("./routes/unsubscriberRoute"));

// // admin dashboard routes
// app.use("/api/admin/dashboard", require("./routes/admin/dashboardRoutes"));

// // admin userlist routes
// app.use("/api/admin/userlist", require("./routes/admin/userlistRoutes"));

// // editor routes
// app.use("/api/editor", require("./routes/editorRoutes"));

// // visit log routes
// app.use("/api/admin/visit", require("./routes/admin/visitRoutes"));

// // mailing list routes
// app.use("/api/admin/mailingList", require("./routes/admin/mailingListRoutes"));

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

module.exports = app;
