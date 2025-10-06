const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/assign-task", protect, userController.assignTask);
router.put("/block/:userId", protect, admin, userController.blockUser);
router.put("/activate/:userId", protect, admin, userController.activateUser);
router.delete("/delete/:userId", protect, admin, userController.deleteUser);
router.get("/", protect, admin, userController.getAllUsers);

module.exports = router;
