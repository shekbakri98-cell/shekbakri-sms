const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Bakki kun sirreeffameera (Jecha danda'amne jedhu keessatti \ fayyadamneerra)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Kuusaa Dataa (MongoDB) milkiidhaan walqabateera...'))
  .catch(err => console.error('Kuusaa dataatti walqabachuun hin danda\'amne:', err));

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  examType: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Barataan milkiidhaan galmeeffameera!', student: newStudent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sarvariin Toora http://localhost:${PORT} irratti jalqabeera.`));
