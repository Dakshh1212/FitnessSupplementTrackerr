const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// ✅ MYSQL CONNECTION
require("./config/mysql");

const app = express();

/* ======================
   🔒 SECURITY MIDDLEWARE
====================== */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   📂 STATIC FILES
====================== */
app.use("/uploads", express.static("uploads"));

/* ======================
   📦 ROUTES
====================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/diet", require("./routes/diet"));
app.use("/api/supplements", require("./routes/supplements"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/upload", require("./routes/upload"));

/* ======================
   ❤️ HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API running with MySQL 🚀",
    database: "MySQL",
    time: new Date()
  });
});

/* ======================
   ❌ 404 HANDLER (IMPORTANT FIX)
====================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌"
  });
});

/* ======================
   ❌ GLOBAL ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR ❌", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ======================
   🚀 START SERVER
====================== */
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ MySQL Project Active");
});