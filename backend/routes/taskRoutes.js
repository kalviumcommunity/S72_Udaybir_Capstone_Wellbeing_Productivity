const express = require("express");
const { getTasks, createTask } = require("../controller/taskController");
const router = express.Router();

router.get("/", getTasks);    // Read from Database
router.post("/", createTask); // Write to Database

module.exports = router;
