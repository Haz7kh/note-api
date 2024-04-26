const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewae
app.use(bodyParser.json());

// Connect to DB
mongoose
  .connect("mongodb+srv://khalmelhem:123321Kh@cluster0.xg4a801.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Note Taking API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
