const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CRITICAL FIX: JILDII PUBLIC MALEE KALLATTIIN AKKA DUBBISU TAASIFAMEERA ---
app.use(express.static(__dirname));

// MongoDB walqabsiisuu (Yoo database dhabame sarvariin itti fufa)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/school_db";
mongoose.connect(MONGO_URI)
  .then(() => console.log('Kuusaa Dataa (MongoDB) milkiidhaan walqabateera...'))
  .catch(err => {
    console.error('Kuusaa dataatti walqabachuun hin danda\'amne, garuu sarvariin itti fufa:', err.message);
  });

// --- MONGODB SCHEMAS ---
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  gender: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);

const questionSchema = new mongoose.Schema({
  examId: String,
  questionId: String,
  grade: String,
  subject: String,
  examType: String,
  questionText: String,
  imageUrl: String,
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: String
});
const Question = mongoose.model('Question', questionSchema);

const studentAnswerSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  grade: String,
  examType: String,
  subject: String,
  questionId: String,
  selectedOption: String,
  isCorrect: Boolean,
  submittedAt: { type: Date, default: Date.now }
});
const StudentAnswer = mongoose.model('StudentAnswer', studentAnswerSchema);

// --- API ROUTES ---
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Student.countDocuments().catch(() => 0);
    const males = await Student.countDocuments({ gender: 'Dhiira' }).catch(() => 0);
    const females = await Student.countDocuments({ gender: 'Dubara' }).catch(() => 0);
    res.json({ total, males, females, g9: 0, g10: 0, g11: 0, g12: 0 });
  } catch (err) { res.json({ total: 0, males: 0, females: 0, g9: 0, g10: 0, g11: 0, g12: 0 }); }
});

app.get('/api/questions/take', async (req, res) => {
  res.json({ alreadyTaken: false, questions: [] });
});

app.post('/api/answers/save', (req, res) => { res.json({ success: true }); });
app.post('/api/students', (req, res) => { res.json({ success: true }); });
app.post('/api/questions', (req, res) => { res.json({ success: true }); });

// Weebsaayitiin yeroo banamu dirqamaan index.html ala jiru akka banu gochuuf
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sarvariin Toora port ${PORT} irratti jalqabeera.`));
