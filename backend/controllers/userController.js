// backend/controllers/userController.js

exports.getAllUsers = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "All users route working properly",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User profile route working properly",
      user: req.user || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
