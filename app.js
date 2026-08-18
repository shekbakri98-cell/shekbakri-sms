document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentData = {
        studentId: document.getElementById('studentId').value,
        name: document.getElementById('name').value,
        grade: document.getElementById('grade').value,
        subject: document.getElementById('subject').value,
        examType: document.getElementById('examType').value
    };
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            document.getElementById('studentForm').reset();
            loadStudents(); 
        } else {
            alert('Dogoggorri uumameera: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        const students = await response.json();
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = '';
        students.forEach(student => {
            const row = `
                <tr class="hover:bg-gray-50 border-b transition">
                    <td class="p-3 border font-medium">\${student.studentId}</td>
                    <td class="p-3 border">\${student.name}</td>
                    <td class="p-3 border">Kutaa \${student.grade}</td>
                    <td class="p-3 border">\${student.subject}</td>
                    <td class="p-3 border"><span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">\${student.examType}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Hojii fiduu irratti rakkoon uumame:', error);
    }
}

window.onload = loadStudents;

document.getElementById('finishBtn').addEventListener('click', () => {
    alert('Qormaanni fi galmeessi kee xumurameera! Galatoomaa.');
});