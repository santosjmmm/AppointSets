<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// FIXED: Explicitly set local time tracking configuration to eliminate database offset crashes
date_default_timezone_set('Asia/Manila');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// FIXED: Using absolute directory references to prevent case-sensitive path crashes
require_once __DIR__ . '/../PHPMailer/Exception.php';
require_once __DIR__ . '/../PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

$conn = new mysqli("localhost", "root", "", "db_appsets");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? '';

$tables = ["tb_admin", "tb_patient", "tb_dentist", "tb_staff"];

// ==========================================
// ACTION 1: CHECK EMAIL AND SEND OTP CODE
// ==========================================
if ($action === 'send_otp') {
    $email = isset($data['email']) ? trim($data['email']) : '';

    if (empty($email)) {
        echo json_encode(["success" => false, "message" => "Please provide a valid email address."]);
        exit;
    }

    $account_found = false;
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SELECT email FROM $table WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $account_found = true;
            $stmt->close();
            break;
        }
        $stmt->close();
    }

    if (!$account_found) {
        echo json_encode(["success" => false, "message" => "No registered account found with that email."]);
        exit;
    }

    $otp = (string)rand(100000, 999999);
    $expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));

    // Check if table structure handles the request safely
    try {
        $clear = $conn->prepare("DELETE FROM tb_otp_verification WHERE email = ?");
        $clear->bind_param("s", $email);
        $clear->execute();
        $clear->close();

        $ins = $conn->prepare("INSERT INTO tb_otp_verification (email, otp_code, expires_at) VALUES (?, ?, ?)");
        $ins->bind_param("sss", $email, $otp, $expires_at);
        $ins->execute();
        $ins->close();
    } catch (Exception $dbEx) {
        echo json_encode(["success" => false, "message" => "Database table 'tb_otp_verification' missing. Run the SQL table setup query in phpMyAdmin."]);
        exit;
    }

    // SMTP Credential Check
    $smtp_user = 'santosjm62904@gmail.com'; 
    $smtp_pass = 'sief nmae lsst ermn';        

    // SAFE BYPASS FOR TESTING: Returns OTP directly if credentials are left blank
    if ($smtp_user === 'your_clinic_email@gmail.com') {
        echo json_encode([
            "success" => true, 
            "message" => "Testing Mode: OTP Code generated successfully! Your Code is: $otp"
        ]);
        exit;
    }

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
        $mail->Subject = 'Password Reset Verification Code';
        $mail->Body    = "
            <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                <h2 style='color: #1cb9d0;'>Password Reset Request</h2>
                <p>Please use the verification code token below to complete your credential reset sequence:</p>
                <div style='background-color: #f0fbfb; border: 2px dashed #1cb9d0; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; color: #2d3436;'>
                    $otp
                </div>
                <p style='font-size: 12px; color: #999;'>This verification context window expires within 5 minutes.</p>
            </div>
        ";

        $mail->send();
        echo json_encode(["success" => true, "message" => "Verification OTP code sent to your email address!"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Mailer Exception: {$mail->ErrorInfo}"]);
    }
}

// ==========================================
// ACTION 2: VALIDATE TOKEN AND RECORD UPDATE
// ==========================================
elseif ($action === 'verify_and_reset') {
    $email = isset($data['email']) ? trim($data['email']) : '';
    $otp = isset($data['otp']) ? trim($data['otp']) : '';
    $new_password = $data['new_password'] ?? '';

    if (empty($email) || empty($otp) || empty($new_password)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    // FIXED: Capture the literal localized time directly to avoid database timezone server discrepancies
    $current_time = date("Y-m-d H:i:s");

    // FIXED: Explicit parameters bound directly to evaluate dynamic validation windows cleanly
    $check = $conn->prepare("SELECT id FROM tb_otp_verification WHERE email = ? AND otp_code = ? AND expires_at > ? ORDER BY id DESC LIMIT 1");
    $check->bind_param("sss", $email, $otp, $current_time);
    $check->execute();
    $verification_valid = $check->get_result()->num_rows > 0;
    $check->close();

    if (!$verification_valid) {
        echo json_encode(["success" => false, "message" => "Invalid or expired verification OTP token."]);
        exit;
    }

    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $account_updated = false;

    foreach ($tables as $table) {
        $stmt = $conn->prepare("SELECT email FROM $table WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            $stmt->close();
            
            $update = $conn->prepare("UPDATE $table SET password = ? WHERE email = ?");
            $update->bind_param("ss", $hashed_password, $email);
            
            if ($update->execute()) {
                $account_updated = true;
                
                $del = $conn->prepare("DELETE FROM tb_otp_verification WHERE email = ?");
                $del->bind_param("s", $email);
                $del->execute();
                $del->close();
            }
            $update->close();
            break;
        }
        $stmt->close();
    }

    if ($account_updated) {
        echo json_encode(["success" => true, "message" => "Success! Password has been updated."]);
    } else {
        echo json_encode(["success" => false, "message" => "An error occurred during password update."]);
    }
} 

else {
    echo json_encode(["success" => false, "message" => "Invalid request routing sequence target parameter context."]);
}

$conn->close();
?>