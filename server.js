const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// 1. KUTAA FUULA WEEBSAAYITII SAAQUU (Routing)
// ==========================================

// Fuula Daashboordii Giddugaleessaa (Home Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fuula Qormaataa Barataa (Online Exam Page)
app.get('/qormaata', (req, res) => {
    res.sendFile(path.join(__dirname, 'qormaata.html'));
});

// Fuula Uunkaalee Waloo (All Forms Page)
app.get('/uunkaalee', (req, res) => {
    res.sendFile(path.join(__dirname, 'uunkaalee.html'));
});

// ==========================================
// 2. WAL-QUNNAMSIISA KUUSAA DEETAA ONLINE (Clever Cloud MySQL)
// ==========================================
const db = mysql.createConnection({
    host: '://clever-cloud.com',       
    user: 'uoly3lagqinw20jv',            
    password: 'osG4IxXTc3Dg4ajZbxuv',    
    database: 'byaolahodhgmbpyqhb5u'
});

db.connect((err) => {
    if (err) {
        console.error('Dogoggora MySQL wal-qunnamsiisuu: ' + err.stack);
        return;
    }
    console.log('Kuusaan deetaa MySQL Online milkiin wal-qunnameera!');
});

// ==========================================
// 3. KUTAA INTERFACE KOODIIWWAANII (APIs)
// ==========================================

// A. API Uunkaa Seensaa Icciitii (Frm_Login Authentication)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Maaloo, maqaa fi koodii icciitii guutaa!" });
    }

    const sql = "SELECT * FROM Tbl_Users WHERE Username = ? AND Password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Dogoggora server: " + err.message });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                success: true, 
                role: user.UserRole, 
                message: "Milkiin seentaniittu! Bagga nagaan dhuftan." 
            });
        } else {
            res.status(401).json({ success: false, message: "Maqaa seensaa ykn koodii icciitii sirrii miti!" });
        }
    });
});

// B. API Galmee Barataa (Upload - FaydaAliasNumber Hidha)
app.post('/galmeessi', (req, res) => {
    const sql = `INSERT INTO tblstudent 
    (Maqaa, Maqaa_Abbaa, Maqaa_Akaakayuu, Saala, Umrii, Kutaa, Aradaa, Ganda, Bilbila, FaydaAliasNumber) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        req.body.Maqaa, 
        req.body.Maqaa_Abbaa, 
        req.body.Maqaa_Akaakayuu, 
        req.body.Saala, 
        req.body.Umrii, 
        req.body.Kutaa, 
        req.body.Aradaa, 
        req.body.Ganda, 
        req.body.Bilbila, 
        req.body.FaydaAliasNumber
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).send("Dogoggora ragaa kuusuu: " + err.message);
        }
        res.send("Odeeffannoon barataa milkiin weebsaayitiirratti galmeeffameera!");
    });
});

// C. API Gaaffilee Qormaataa Barataaf Erguuf (Exam API)
app.get('/api/qormaata', (req, res) => {
    db.query("SELECT ID_Gaaffii, Kutaa, Gosa_Barnootaa, Gosa_Qormaataa, Gaaffii, Filannoo_A, Filannoo_B, Filannoo_C, Filannoo_D FROM tbl_Gaaffiiwwan", (err, results) => {
        if (err) return res.status(500).send("Dogoggora gaaffii fiduu: " + err.message);
        res.json(results);
    });
});

// D. API Deebii Barataa Madaaluu Fi Qabxii Herreeguuf (Evaluation API)
app.post('/api/madaali', (req, res) => {
    const deebiiBarataa = req.body.deebii;
    
    db.query("SELECT ID_Gaaffii, Deebii_Sirrii FROM tbl_Gaaffiiwwan", (err, results) => {
        if (err) return res.status(500).send("Dogoggora madaaluu: " + err.message);
        
        let qabxiiWaliigala = 0;
        let waliigalaGaaffii = results.length;
        
        if (waliigalaGaaffii === 0) {
            return res.json({ qabxii: 0, waliigala: 0, dhibbantaa: "0.00%" });
        }
        
        results.forEach(q => {
            if (deebiiBarataa[q.ID_Gaaffii] === q.Deebii_Sirrii) {
                qabxiiWaliigala++;
            }
        });
        
        let dhibbantaa = (qabxiiWaliigala / waliigalaGaaffii) * 100;
        res.json({
            qabxii: qabxiiWaliigala,
            waliigala: waliigalaGaaffii,
            dhibbantaa: dhibbantaa.toFixed(2) + "%"
        });
    });
});

// E. API Hordoffii Barataa Kuusuuf (Attendance API)
app.post('/api/attendance', (req, res) => {
    const { Barataa_ID, Guyyaa, Haala_Seensa, Kutaa } = req.body;
    const sql = "INSERT INTO tbl_Attendance (Barataa_ID, Guyyaa, Haala_Seensa, Kutaa) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [Barataa_ID, Guyyaa, Haala_Seensa, Kutaa], (err, result) => {
        if (err) return res.status(500).send("Dogoggora Attendance kuusuu: " + err.message);
        res.send("Hordoffiin seensa barataa milkiin kuufameera!");
    });
});

// F. API Ergaa Gabaabaa Bilbilaa Kuusuuf (SMS Service API)
app.post('/api/send-sms', (req, res) => {
    const { Lakk_Bilbila, Barruu_Ergaa } = req.body;
    const sql = "INSERT INTO tbl_SMSService (Lakk_Bilbila, Barruu_Ergaa) VALUES (?, ?)";
    
    db.query(sql, [Lakk_Bilbila, Barruu_Ergaa], (err, result) => {
        if (err) return res.status(500).send("Dogoggora SMS erguu: " + err.message);
        res.send("Ergaan gabaabaa (SMS) milkiin gara lakk " + Lakk_Bilbila + " tti ergameera!");
    });
});

// ==========================================
// 4. JALQABSIISTUU SERVER (Start Server)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server weebsaayitiitii port ${PORT} irratti banameera!`);
});
