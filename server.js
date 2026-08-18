const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Fuula Daashboordii Jalqabaa (Home Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Fuula Qormaataa Barataa (Exam Page)
app.get('/qormaata', (req, res) => {
    res.sendFile(path.join(__dirname, 'qormaata.html'));
});

// --- SADDARKAA SIRREEFFAMAA: Password fi Ragaaleen Clever Cloud Sirreeffamaniiru ---
const db = mysql.createConnection({
    host: 'byaolahodhgmbpyqhb5u-mysql.services.clever-cloud.com',       
    user: 'uoly3lagqinw20jv',            
    password: 'osG4IxXTc3Dg4ajZbXuv',    // <--- Password kee isa sirrii ti
    database: 'byaolahodhgmbpyqhb5u',
    port: 3306                           
});

db.connect((err) => {
    if (err) {
        console.error('Dogoggora MySQL wal-qunnamsiisuu: ' + err.stack);
        return;
    }
    console.log('Kuusaan deetaa MySQL Online milkiin wal-qunnameera!');

    // --- TAABLEOTA OFIIN AKKA UUMU GOCHUU ---
    
    // 1. Table tblstudent Uumuu (Yoo duraan hin jirre)
    const sql_student = `CREATE TABLE IF NOT EXISTS tblstudent (
        ID_Barataa INT AUTO_INCREMENT PRIMARY KEY,
        Maqaa VARCHAR(100),
        Maqaa_Abbaa VARCHAR(100),
        Maqaa_Akaakayuu VARCHAR(100),
        Saala VARCHAR(10),
        Umrii INT,
        Kutaa VARCHAR(50),
        Aradaa VARCHAR(100),
        Ganda VARCHAR(100),
        Bilbila VARCHAR(20),
        FaydaAliasNumber VARCHAR(100)
    )`;
    db.query(sql_student, (err) => { 
        if (err) console.error("Error tblstudent uumuu irratti: " + err.message); 
        else console.log("Table 'tblstudent' qophaa'aa dha/uumameera.");
    });

    // 2. Table tbl_Gaaffiiwwan Uumuu (Yoo duraan hin jirre)
    const sql_gaaffii = `CREATE TABLE IF NOT EXISTS tbl_Gaaffiiwwan (
        ID_Gaaffii INT AUTO_INCREMENT PRIMARY KEY,
        Kutaa VARCHAR(50),
        Gosa_Barnootaa VARCHAR(100),
        Gosa_Qormaataa VARCHAR(100),
        Gaaffii TEXT,
        Filannoo_A TEXT,
        Filannoo_B TEXT,
        Filannoo_C TEXT,
        Filannoo_D TEXT,
        Deebii_Sirrii VARCHAR(10)
    )`;
    db.query(sql_gaaffii, (err) => { 
        if (err) console.error("Error tbl_Gaaffiiwwan uumuu irratti: " + err.message); 
        else console.log("Table 'tbl_Gaaffiiwwan' qophaa'aa dha/uumameera.");
    });
});

// 3. Ragaa Galmee Barataa Kuusuuf (Upload API)
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

// 4. Gaaffilee Qormaataa MySQL irraa Fuudhanii Barataaf Erguuf (Exam API)
app.get('/api/qormaata', (req, res) => {
    db.query("SELECT ID_Gaaffii, Kutaa, Gosa_Barnootaa, Gosa_Qormaataa, Gaaffii, Filannoo_A, Filannoo_B, Filannoo_C, Filannoo_D FROM tbl_Gaaffiiwwan", (err, results) => {
        if (err) return res.status(500).send("Dogoggora gaaffii fiduu: " + err.message);
        res.json(results);
    });
});

// 5. Deebii Barataa Madaaluu Fi Qabxii Herreeguuf (Evaluation API)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server weebsaayitiitii port ${PORT} irratti banameera!`);
});
