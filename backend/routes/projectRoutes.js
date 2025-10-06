const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, projectController.createProject);
router.get("/", protect, projectController.getProjects);
router.get("/:id", protect, projectController.getProjectById);
router.put("/:id", protect, projectController.updateProject);
router.delete("/:id", protect, admin, projectController.deleteProject);

module.exports = router;
