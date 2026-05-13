// 🔐 Clear only app auth data

console.log("Clearing FitTrack auth data...");

// Remove only what your app uses
localStorage.removeItem("token");
localStorage.removeItem("user");

// Optional: clear session storage if used
sessionStorage.removeItem("token");
sessionStorage.removeItem("user");

console.log("Auth data cleared ✅");

// Reload
window.location.reload();