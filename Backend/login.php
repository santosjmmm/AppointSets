<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "db_appsets");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// --- 1. Check Admin Table ---
$stmt = $conn->prepare("SELECT admin_id, name, password FROM tb_admin WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password, $user['password']) || $password === $user['password']) {
        echo json_encode(["success" => true, "role" => "admin", "name" => $user['name'], "admin_id" => $user['admin_id']]);
        exit;
    }
}

// --- 2. Check Staff Table ---
$stmt = $conn->prepare("SELECT staff_id, name, password FROM tb_staff WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password, $user['password']) || $password === $user['password']) {
        echo json_encode(["success" => true, "role" => "staff", "user_type" => "staff", "name" => $user['name'], "staff_id" => $user['staff_id']]);
        exit;
    }
}

// --- 3. Check Dentist Table ---
// Maps to tb_dentist table, re-uses the "staff" dashboard routing but adds distinct storage markers
$stmt = $conn->prepare("SELECT dentist_id, dentist_name, password FROM tb_dentist WHERE email = ?");
if ($stmt) {
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($user = $res->fetch_assoc()) {
        if (password_verify($password, $user['password']) || $password === $user['password']) {
            echo json_encode([
                "success" => true, 
                "role" => "staff", // Keeps routing consistent with StaffDashboard
                "user_type" => "dentist", 
                "name" => $user['dentist_name'], // ✅ FIXED: Changed from 'name' to 'dentist_name'
                "dentist_id" => $user['dentist_id']
            ]);
            exit;
        }
    }
}

// --- 4. Check Patient Table ---
$stmt = $conn->prepare("SELECT patient_id, name, password FROM tb_patient WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password, $user['password']) || $password === $user['password']) {
        echo json_encode([
            "success" => true, 
            "role" => "patient", 
            "name" => $user['name'],
            "patient_id" => $user['patient_id']
        ]);
        exit;
    }
}

echo json_encode(["success" => false, "message" => "Invalid email or password."]);
?>