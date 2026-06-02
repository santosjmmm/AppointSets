<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Manila');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Absolute paths to prevent case-sensitive path bugs with PHPMailer
require_once __DIR__ . '/../PHPMailer/Exception.php';
require_once __DIR__ . '/../PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$conn = new mysqli("localhost", "root", "", "db_appsets");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database Connection Failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? '';

if ($_SERVER["REQUEST_METHOD"] === "POST" && $data) {
    
    // ==========================================
    // ACTION 1: VALIDATE DETAILS AND SEND OTP
    // ==========================================
    if ($action === 'send_signup_otp') {
        $email = trim($data['email'] ?? '');
        $full_name = trim($data['full_name'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($full_name) || empty($email) || empty($password)) {
            echo json_encode(["success" => false, "message" => "Required fields are missing!"]);
            exit();
        }

        if (strlen($password) < 8 || strlen($password) > 12) {
            echo json_encode(["success" => false, "message" => "Password must be 8-12 characters"]);
            exit();
        }

        // Check if email already exists in tb_patient
        $check = $conn->prepare("SELECT patient_id FROM tb_patient WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Email is already registered!"]);
            $check->close();
            exit();
        }
        $check->close();

        // Generate OTP Code
        $otp = (string)rand(100000, 999999);
        $expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));

        // Save OTP Code to Verification Record Window
        $clear = $conn->prepare("DELETE FROM tb_otp_verification WHERE email = ?");
        $clear->bind_param("s", $email);
        $clear->execute();
        $clear->close();

        $ins = $conn->prepare("INSERT INTO tb_otp_verification (email, otp_code, expires_at) VALUES (?, ?, ?)");
        $ins->bind_param("sss", $email, $otp, $expires_at);
        $ins->execute();
        $ins->close();

        // PHPMailer Core Routine Block
        $smtp_user = 'santosjm62904@gmail.com'; 
        $smtp_pass = 'sief nmae lsst ermn';        

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; 
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtp_user; 
            $mail->Password   = $smtp_pass;        
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom($smtp_user, "C'Smiles Dental");
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Account Registration Verification Code';
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #1cb9d0;'>Welcome to C'Smiles Dental System!</h2>
                    <p>Please use the verification code below to verify your identity and complete your account setup:</p>
                    <div style='background-color: #f0fbfb; border: 2px dashed #1cb9d0; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; color: #2d3436;'>
                        $otp
                    </div>
                    <p style='font-size: 12px; color: #999;'>This registration code context expires within 5 minutes.</p>
                </div>
            ";

            $mail->send();
            echo json_encode(["success" => true, "message" => "Verification OTP code sent to your email address!"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Mailer Exception Error: {$mail->ErrorInfo}"]);
        }
        exit();
    }

    // ==========================================
    // ACTION 2: VERIFY OTP AND COMMIT USER REGISTRATION
    // ==========================================
    elseif ($action === 'verify_and_register') {
        $full_name = trim($data['full_name'] ?? '');
        $age = trim($data['age'] ?? '');
        $contact_number = trim($data['contact_num'] ?? '');
        $address = trim($data['address'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        $otp = trim($data['otp'] ?? '');

        if (empty($email) || empty($otp) || empty($full_name) || empty($password)) {
            echo json_encode(["success" => false, "message" => "All form context parameters are required."]);
            exit();
        }

        $current_time = date("Y-m-d H:i:s");

        // Validate token matches active database instance
        $check = $conn->prepare("SELECT id FROM tb_otp_verification WHERE email = ? AND otp_code = ? AND expires_at > ? ORDER BY id DESC LIMIT 1");
        $check->bind_param("sss", $email, $otp, $current_time);
        $check->execute();
        $verification_valid = $check->get_result()->num_rows > 0;
        $check->close();

        if (!$verification_valid) {
            echo json_encode(["success" => false, "message" => "Invalid or expired verification OTP code."]);
            exit();
        }

        // Complete database insertion configuration
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("INSERT INTO tb_patient (name, age, contact_num, address, email, password) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $full_name, $age, $contact_number, $address, $email, $hashed_password);

        if ($stmt->execute()) {
            // Delete verification code trace on successful record creation
            $del = $conn->prepare("DELETE FROM tb_otp_verification WHERE email = ?");
            $del->bind_param("s", $email);
            $del->execute();
            $del->close();

            echo json_encode(["success" => true, "message" => "Registration successful! Account created."]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration SQL execution failure: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    } 
    
    else {
        echo json_encode(["success" => false, "message" => "Invalid request routing sequence."]);
        exit();
    }
}

$conn->close();
?>