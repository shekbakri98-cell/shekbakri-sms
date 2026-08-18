const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// MongoDB walqabsiisuu
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('Database connection error:', err));

// --- MONGODB SCHEMAS (Tables) ---

// 1. Barataa (Student Schema)
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  gender: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);

// 2. Gaaffilee (Question Schema)
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

// 3. Deebii Barataa (tbl_Deebii_Barataa Schema)
const studentAnswerSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  grade: String,
  examType: String,
  subject: String,
  questionId: String,
  selectedOption: String, // A, B, C, D
  isCorrect: Boolean,
  submittedAt: { type: Date, default: Date.now }
});
const StudentAnswer = mongoose.model('StudentAnswer', studentAnswerSchema);

// 4. Seensa (User Schema)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- API ROUTES ---

// Dashboard Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const males = await Student.countDocuments({ gender: 'Dhiira' });
    const females = await Student.countDocuments({ gender: 'Dubara' });
    const g9 = await Student.countDocuments({ grade: '9' });
    const g10 = await Student.countDocuments({ grade: '10' });
    const g11 = await Student.countDocuments({ grade: '11' });
    const g12 = await Student.countDocuments({ grade: '12' });
    res.json({ total, males, females, g9, g10, g11, g12 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Double Fudhachuu Ittisuu & Gaaffii Filter Godhachuu (VBA: GaaffiiFilterGodhi)
app.get('/api/questions/take', async (req, res) => {
  const { studentId, grade, subject, examType } = req.query;
  
  if (!studentId) return res.status(400).json({ error: "ID Barataa ni barbaachisa!" });

  try {
    // VBA Check: Barataan kun kanaan dura qormaata kana fudhateeraa?
    const alreadyTaken = await StudentAnswer.countDocuments({ studentId, subject, examType });
    if (alreadyTaken > 0) {
      return res.status(400).json({ 
        alreadyTaken: true, 
        message: `Barataan kun qormaata '${subject}' (${examType}) duraan fudhateera! Gosa barnootaa tokko yeroo lama fudhachuun hin danda'amu.` 
      });
    }

    // VBA Filter Logic
    const questions = await Question.find({ grade, subject, examType });
    res.json({ alreadyTaken: false, questions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Deebii Barataa Kuusuu (VBA: INSERT INTO tbl_Deebii_Barataa)
app.post('/api/answers/save', async (req, res) => {
  const { studentId, grade, examType, subject, questionId, selectedOption } = req.body;
  try {
    const question = await Question.findOne({ questionId });
    const isCorrect = question ? (question.correctAnswer === selectedOption) : false;

    // Maqaa barataa argachuuf
    const student = await Student.findOne({ studentId });
    const studentName = student ? student.name : "Unknown";

    const newAnswer = new StudentAnswer({
      studentId, studentName, grade, examType, subject, questionId, selectedOption, isCorrect
    });
    await newAnswer.save();
    res.status(201).json({ success: true, message: "Deebiin kuusameera!" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Barataa Galmeessuu
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Barataan milkiidhaan galmeeffameera!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Gaaffii Kuusuu
app.post('/api/questions', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json({ message: 'Gaaffiin milkiidhaan kuufameera!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Users Create & Login
app.post('/api/users/register', async (req, res) => {
  try { const n = new User(req.body); await n.save(); res.status(201).json({ message: 'User created!' }); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) res.json({ success: true, role: user.role });
  else res.status(400).json({ success: false, message: 'Username ykn Password dogoggora!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
