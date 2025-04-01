const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const taskRoutes = require('../backend/routes/taskRoutes');
const moodRoutes = require('./routes/moodRoutes');
const focusRoutes = require('./routes/focusRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
      path: "./config/.env",
  });
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/tasks", require("./routes/taskRoutes"));

// Basic route
app.get('/', (req, res) => {
  res.send('Sentience API is running');
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
