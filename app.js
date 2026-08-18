let questions = [];
let currentIndex = 0;
let timerInterval;

// 1. NAVIGATION CONTROL (KUTAALEE GARGAR JIJJIIRUU)
function showSection(sectionId) {
    // Kutaalee hunda dhoksi
    const sections = ['dashboardSection', 'studentRegSection', 'teacherExamSection', 'studentExamSection', 'createUserSection'];
    sections.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Isa cuqaasame qofa agarsiisi
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');
}

// 2. QORMAATA JALQABSIISUU (STUDENT EXAM CONTROL)
function startExamControl() {
    const studId = document.getElementById('examStudId').value.trim();
    if (!studId) {
        return alert('Maaloo dursitanii ID Barataa galchaa!');
    }
    
    // Quiz box saanduqa agarsiisi
    const quizArea = document.getElementById('liveQuizArea');
    if (quizArea) quizArea.classList.remove('hidden');
    
    // Sa'aatii daqiiqaa 20 (1200 seconds) countdown jalqabi
    startTimerCountdown(1200);
}

// 3. QORMAATA XUMURUU (END EXAM CONTROL)
function endExamControl() {
    clearInterval(timerInterval);
    alert("Qormaanni keessan milkaa'inaan xumurameera! Waraqaan bu'aa keessanii ni baha.");
    
    const quizArea = document.getElementById('liveQuizArea');
    if (quizArea) quizArea.classList.add('hidden');
    
    showSection('dashboardSection');
}

// 4. SA'AATII LAKKAAWUU COUNTDOWN
function startTimerCountdown(duration) {
    let timer = duration, minutes, seconds;
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.innerText = minutes + ":" + seconds;
        }
        
        if (--timer < 0) { 
            clearInterval(timerInterval); 
            endExamControl(); 
        }
    }, 1000);
}

// 5. LOGOUT CONTROL
function logout() {
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}
