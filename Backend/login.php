<?php
error_reporting(0);
ini_set('display_errors', 0);

// --- 1. Cloud CORS Setup ---
// Replaced localhost with your live production Vercel link to allow communication
header("Access-Control-Allow-Origin: https://appoint-sets-n35v1b0rs-jhayem-s-projects.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- 2. Dynamic Railway Database Connection ---
// Uses the production database variables injected by Railway, falls back to XAMPP if empty
$host     = getenv('MYSQLHOST') ?: "localhost";
$user     = getenv('MYSQLUSER') ?: "root";
$password = getenv('MYSQLPASSWORD') ?: "";
$database = getenv('MYSQLDATABASE') ?: "db_appsets";
$port     = getenv('MYSQLPORT') ?: "3306";

$conn = new mysqli($host, $user, $password, $database, $port);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password_input = trim($data['password'] ?? '');

// --- 3. Check Admin Table ---
$stmt = $conn->prepare("SELECT admin_id, name, password FROM tb_admin WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password_input, $user['password']) || $password_input === $user['password']) {
        echo json_encode(["success" => true, "role" => "admin", "name" => $user['name'], "admin_id" => $user['admin_id']]);
        exit;
    }
}

// --- 4. Check Staff Table ---
$stmt = $conn->prepare("SELECT staff_id, name, password FROM tb_staff WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password_input, $user['password']) || $password_input === $user['password']) {
        echo json_encode(["success" => true, "role" => "staff", "user_type" => "staff", "name" => $user['name'], "staff_id" => $user['staff_id']]);
        exit;
    }
}

// --- 5. Check Dentist Table ---
$stmt = $conn->prepare("SELECT dentist_id, dentist_name, password FROM tb_dentist WHERE email = ?");
if ($stmt) {
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($user = $res->fetch_assoc()) {
        if (password_verify($password_input, $user['password']) || $password_input === $user['password']) {
            echo json_encode([
                "success" => true, 
                "role" => "staff", 
                "user_type" => "dentist", 
                "name" => $user['dentist_name'], 
                "dentist_id" => $user['dentist_id']
            ]);
            exit;
        }
    }
}

// --- 6. Check Patient Table ---
$stmt = $conn->prepare("SELECT patient_id, name, password FROM tb_patient WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    if (password_verify($password_input, $user['password']) || $password_input === $user['password']) {
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

$stmt->close();
$conn->close();
?>
