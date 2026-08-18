let questions = [];
let currentIndex = 0;
let timerInterval;
let selectedAnsValue = null; 

// Fuula Dashboard fi Kutaalee adda addaa gargar jijjiiruuf (Navigation)
function showSection(sectionId) {
    // Kutaalee hunda dhoksi
    const sections = ['dashboardSection', 'studentRegSection', 'teacherExamSection', 'studentExamSection', 'createUserSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Isa filatame qofa agarsiisi
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');
    
    // Mallattoo active jedhu menu irratti jijjiiri
    const navButtons = document.querySelectorAll('nav .btn-nav');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Button cuqaasame addaan baasi
    const activeBtn = Array.from(navButtons).find(btn => btn.getAttribute('onclick').includes(sectionId));
    if (activeBtn) activeBtn.classList.add('active');

    if(sectionId === 'dashboardSection') fetchStats();
}

// Lakkoofsa Barattootaa Kuusaa Dataa irraa fiduuf
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('statTotal').innerText = data.total || 0;
        document.getElementById('statDhiira').innerText = data.males || 0;
        document.getElementById('statDubar').innerText = data.females || 0;
        document.getElementById('statG9').innerText = data.g9 || 0;
        document.getElementById('statG10').innerText = data.g10 || 0;
        document.getElementById('statG11').innerText = data.g11 || 0;
        document.getElementById('statG12').innerText = data.g12 || 0;
    } catch(e) { console.error("Stats Fetch Error:", e); }
}

// VBA Logic: GaaffiiFilterGodhi & Double-check Check
async function startExam() {
    const studentId = document.getElementById('examStudId').value;
    const grade = document.getElementById('examGradeSelect').value;
    const subject = document.getElementById('examSubjSelect').value;
    const examType = document.getElementById('examTypeSelect').value;

    if(!studentId) return alert('Maaloo dursitanii ID Barataa galchaa!');
    if(!subject) return alert('Maaloo Gosa Barnootaa barreessi/filadhu!');

    const res = await fetch(`/api/questions/take?studentId=${studentId}&grade=${grade}&subject=${subject}&examType=${examType}`);
    const data = await res.json();

    if (!res.ok) {
        // VBA Alert: Double Fudhachuu Ittisuu
        return alert(data.message);
    }

    questions = data.questions;
    if(questions.length === 0) {
        return alert("Ulaagaa kanaan gaaffiin qophaa'e hin jiru!");
    }

    currentIndex = 0;
    document.getElementById('quizBox').classList.remove('hidden');
    displayQuestion();
    
    // VBA: TotalSeconds = 1200 (Daqiiqaa 20)
    startTimer(1200); 
}

function displayQuestion() {
    if(questions.length === 0) return;
    const q = questions[currentIndex];
    document.getElementById('quizQuestionText').innerText = `(${currentIndex + 1}/${questions.length}) ` + q.questionText;
    document.getElementById('lblA').innerText = q.optionA;
    document.getElementById('lblB').innerText = q.optionB;
    document.getElementById('lblC').innerText = q.optionC;
    document.getElementById('lblD').innerText = q.optionD;
    
    clearSelectionStyles();
    selectedAnsValue = null;

    if(q.imageUrl) {
        document.getElementById('quizImgContainer').classList.remove('hidden');
        document.getElementById('quizImg').src = q.imageUrl;
    } else {
        document.getElementById('quizImgContainer').classList.add('hidden');
    }
}

function selectAns(ans) {
    selectedAnsValue = ans;
    clearSelectionStyles();
    document.getElementById(`btnOpt${ans}`).style.backgroundColor = "#eab308";
    document.getElementById(`btnOpt${ans}`).style.color = "#0f172a";
}

function clearSelectionStyles() {
    ['A', 'B', 'C', 'D'].forEach(opt => {
        const btn = document.getElementById(`btnOpt${opt}`);
        if(btn) {
            btn.style.backgroundColor = "#0f172a";
            btn.style.color = "#fff";
        }
    });
}

// VBA Logic: btnIttiAanu_Click
async function nextQuiz() {
    if (!selectedAnsValue) {
        return alert("Maaloo odoo gara gaaffii itti aanutti hin dabarre deebii filadhu!");
    }

    const studentId = document.getElementById('examStudId').value;
    const grade = document.getElementById('examGradeSelect').value;
    const subject = document.getElementById('examSubjSelect').value;
    const examType = document.getElementById('examTypeSelect').value;
    const currentQ = questions[currentIndex];

    // Deebii Save Gochuu
    const res = await fetch('/api/answers/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            studentId, grade, subject, examType,
            questionId: currentQ.questionId,
            selectedOption: selectedAnsValue
        })
    });

    if (res.ok) {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            displayQuestion();
        } else {
            alert("Gaaffii dhumaa bira geessaniittu. Maaloo 'Xumuri' kan jedhu cuqaasaa!");
        }
    }
}

function prevQuiz() {
    if (currentIndex > 0) {
        currentIndex--;
        displayQuestion();
    }
}

// VBA Logic: btnXumuri_Click
function submitExam() {
    clearInterval(timerInterval);
    alert("Qormaanni keessan milkaa'inaan xumurameera! Amma waraqaan bu'aa keessanii ni baha.");
    document.getElementById('quizBox').classList.add('hidden');
    showSection('dashboardSection');
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        document.getElementById('timer').innerText = minutes + ":" + seconds;
        if (--timer < 0) { 
            clearInterval(timerInterval); 
            alert("Yeroon keessan xumurameera!");
            submitExam(); 
        }
    }, 1000);
}

// Login Form Event Listener
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    
    // Hanga database user uamutti seensa gabaabaa (Test Bypass)
    if(username === "admin" && password === "admin123") {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('appPage').classList.remove('hidden');
        showSection('dashboardSection');
        return;
    }

    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(res.ok && data.success) {
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('appPage').classList.remove('hidden');
            showSection('dashboardSection');
        } else {
            alert(data.message || "Username ykn Password dogoggora!");
        }
    } catch (err) {
        alert("Sarvariin kuusaa dataa waliin wal hin qabanne, maaloo login 'admin' fi 'admin123' fayyadami.");
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('appPage').classList.remove('hidden');
        showSection('dashboardSection');
    }
});

function logout() {
    document.getElementById('appPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginForm').reset();
}

// Forms Register Event handlers
document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newRole').value
    };
    const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    if(res.ok) { alert('User created successfully!'); document.getElementById('createUserForm').reset(); }
});

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        studentId: document.getElementById('regId').value,
        name: document.getElementById('regName').value,
        grade: document.getElementById('regGrade').value,
        gender: document.getElementById('regGender').value
    };
    const res = await fetch('/api/students', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    if(res.ok) { alert('Barataan milkiidhaan galmeeffameera!'); document.getElementById('studentForm').reset(); }
});

document.getElementById('questionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        examId: document.getElementById('qExamId').value,
        questionId: document.getElementById('qId').value,
        grade: document.getElementById('qGrade').value,
        subject: document.getElementById('qSubject').value,
        examType: document.getElementById('qType').value,
        questionText: document.getElementById('qText').value,
        imageUrl: document.getElementById('qImg').value,
        optionA: document.getElementById('optA').value,
Use code with caution.optionB: document.getElementById('optB').value,optionC: document.getElementById('optC').value,optionD: document.getElementById('optD').value,correctAnswer: document.getElementById('qCorrect').value};const res = await fetch('/api/questions', {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify(body)});if(res.ok) { alert('Gaaffiin kuusameera!'); document.getElementById('questionForm').reset(); }});
