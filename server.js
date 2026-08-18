const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Daandii faayilii mirkaneessuuf
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Node.js akka folder 'public' ykn faayiloota ala jiran hunda dubbisu gochuuf
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// MongoDB walqabsiisuu
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

// Weebsaayitiin yeroo banamu dirqamaan index.html akka banu gochuuf
app.get('*', (req, res) => {
  // Jalqaba folder public keessa barbaada, yoo dhabe dacha alaarraa fida
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sarvariin Toora http://localhost:${PORT} irratti jalqabeera.`));
