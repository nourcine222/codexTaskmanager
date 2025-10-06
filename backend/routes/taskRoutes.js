const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, taskController.createTask);
router.get("/", protect, taskController.getTasks);
router.get("/:id", protect, taskController.getTaskById);
router.get("/project/:projectId", protect, taskController.getTasksByProject);
router.put("/:id", protect, taskController.updateTask);
router.delete("/:id", protect, admin, taskController.deleteTask);

module.exports = router;
