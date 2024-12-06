const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Mengizinkan koneksi dari frontend
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());

// Konfigurasi koneksi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_barang'
});

// Endpoint untuk mendapatkan data barang
app.get('/api/barang', (req, res) => {
    const sql = 'SELECT nama_barang, harga_jual, satuan, harga_beli, margin FROM barang';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Gagal mengambil data' });
        } else {
            res.json(results);
        }
    });
});

/// Rute login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Verifikasi password dengan bcrypt
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (isMatch) {
                    // Login berhasil
                    res.json({ success: true });
                } else {
                    // Password salah
                    res.json({ success: false, message: 'Password salah!' });
                }
            });
        } else {
            // Username tidak ditemukan
            res.json({ success: false, message: 'Username tidak ditemukan!' });
        }
    });
});

app.use(
    session({
        secret: 'akuberdiri123',
        resave: false,
        saveUninitialized: true,
    })
);

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query untuk mencari user berdasarkan username
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            const user = results[0];

            // Verifikasi password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Password verification error:', err);
                    return res.status(500).send('Internal server error');
                }

                if (isMatch) {
                    // Login berhasil, simpan ke sesi
                    req.session.username = user.username;
                    req.session.user_id = user.id;

                    res.json({ success: true, redirectUrl: '/dashboard.html' }); // Redirect ke halaman dashboard
                } else {
                    // Password salah
                    res.json({ success: false, message: 'Password salah' });
                }
            });
        } else {
            // Username tidak ditemukan
            res.json({ success: false, message: 'Username tidak ditemukan' });
        }
    });
});

// Route untuk halaman dashboard (contoh)
app.get('/dashboard', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login'); // Jika belum login, arahkan ke halaman login
    }

    res.send(`Selamat datang, ${req.session.username}!`);
});


// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
