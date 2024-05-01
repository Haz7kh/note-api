const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Note = require("./models/Note");
const User = require("./models/User");

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
// User Signup
app.post("/api/user/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// User Login
app.post("/api/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username: user.username }, "secret");
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to authenticate user
function authenticateUser(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }
  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// home route
app.get("/", (req, res) => {
  res.send("Welcome to Note Taking API");
});

// Get all notes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single note
app.get("/api/notes/:id", getNote, (req, res) => {
  res.json(res.note);
});

// Create a note
app.post("/api/notes", async (req, res) => {
  const note = new Note({
    title: req.body.title,
    text: req.body.text,
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a note
app.put("/api/notes/:id", getNote, async (req, res) => {
  if (req.body.title != null) {
    res.note.title = req.body.title;
  }
  if (req.body.text != null) {
    res.note.text = req.body.text;
  }
  res.note.modifiedAt = Date.now();

  try {
    const updatedNote = await res.note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
app.delete("/api/notes/:id", getNote, async (req, res) => {
  try {
    await res.note.remove();
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware function to get a single note by ID
async function getNote(req, res, next) {
  try {
    const note = await Note.findById(req.params.id);
    if (note == null) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.note = note;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Search notes
app.get("/api/notes/search", authenticateUser, async (req, res) => {
  const { title } = req.query;
  try {
    const notes = await Note.find({ title: { $regex: title, $options: "i" } });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
