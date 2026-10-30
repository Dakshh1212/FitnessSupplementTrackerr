
const path = require("path");

// Load backend environment variables independently of the launch directory.
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./config/mysql");
const aiRoutes = require("./routes/ai");

const app = express();

app.disable("x-powered-by");

/* ======================
   SECURITY MIDDLEWARE
====================== */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  "http://localhost:3000,http://54.224.232.248"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Permit server-to-server requests that don't send an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

/* ======================
   STATIC UPLOADS
====================== */
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "uploads"), {
    dotfiles: "deny",
    index: false,
    maxAge: "1d",
  })
);

/* ======================
   API ROUTES
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
app.use("/api/ai", aiRoutes);
/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
    database: "MySQL",
    time: new Date().toISOString(),
  });
});

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

/* ======================
   GLOBAL ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed.",
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large.",
    });
  }

  console.error("SERVER ERROR:", err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.statusCode && err.statusCode < 500
        ? err.message
        : "Internal server error.",
  });
});

/* ======================
   START SERVER
====================== */
const PORT = Number(process.env.PORT) || 5002;

const server = app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log("MySQL configuration loaded.");
});

server.on("error", (err) => {
  console.error("HTTP SERVER ERROR:", err.message);
  process.exitCode = 1;
});

/* ======================
   GRACEFUL SHUTDOWN
====================== */
let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  const timeout = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);

  timeout.unref();

  server.close((serverError) => {
    if (serverError) {
      console.error("HTTP shutdown error:", serverError.message);
      process.exitCode = 1;
    }

    // Close the pool after HTTP requests have stopped.
    db.end((dbError) => {
      if (dbError) {
        console.error("MySQL shutdown error:", dbError.message);
        process.exitCode = 1;
      }

      clearTimeout(timeout);
      process.exit(process.exitCode || 0);
    });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
