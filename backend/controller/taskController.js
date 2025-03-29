const Task = require("../models/Task");

// Read: Get all tasks from the database
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find(); // Database Read Operation
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

// Write: Create a new task and save it to the database
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const newTask = new Task({ title, description, status });

    await newTask.save(); // Database Write Operation
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

module.exports = { getTasks, createTask };
