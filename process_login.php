<?php
session_start();

// Konfigurasi database
$servername = "localhost";
$username_db = "root"; // Ganti dengan username database Anda
$password_db = ""; // Ganti dengan password database Anda
$dbname = "database_barang"; // Ganti dengan nama database Anda

// Membuat koneksi
$conn = new mysqli($servername, $username_db, $password_db, $dbname);

// Memeriksa koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Mendapatkan data dari form
$username = $_POST['username'];
$password = $_POST['password'];

// Sanitasi input
$username = $conn->real_escape_string($username);
$password = $conn->real_escape_string($password);

// Query untuk memeriksa username dan password
$sql = "SELECT * FROM users WHERE username = '$username'";
$result = $conn->query($sql);


if ($result->num_rows > 0) {
    // Mengambil data pengguna
    $user = $result->fetch_assoc();

    // Verifikasi password
    if (password_verify($password, $user['password'])) {
        // Login berhasil, simpan informasi ke session
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_id'] = $user['id'];
        header("Location: dashboard.php"); // Arahkan ke halaman dashboard
        exit();
    } else {
        // Password salah
        echo "<script>alert('Password salah!'); window.location.href='login.php';</script>";
    }
} else {
    // Username tidak ditemukan
    echo "<script>alert('Username tidak ditemukan!'); window.location.href='login.php';</script>";
}

// Menutup koneksi
$conn->close();
?>
