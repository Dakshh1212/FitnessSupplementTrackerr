// Clear authentication data script
// Run this in browser console to reset authentication state

console.log('Clearing authentication data...');

// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('Authentication data cleared. Please refresh the page.');

// Refresh the page
window.location.reload();