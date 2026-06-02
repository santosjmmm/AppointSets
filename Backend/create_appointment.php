<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$conn = new mysqli("localhost", "root", "", "db_appsets");

if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]));
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$patient_id = $data['patient_id'];
$service_name = $data['service'];
$dentist_name = $data['dentist'];
$date = $data['date'];

/*
|--------------------------------------------------------------------------
| FIX TIME FORMAT HERE
|--------------------------------------------------------------------------
| Converts:
| 1:00 PM  -> 13:00:00
| 2:30 PM  -> 14:30:00
| 9:00 AM  -> 09:00:00
|--------------------------------------------------------------------------
*/
$time = date("H:i:s", strtotime($data['time']));
$is_redeemed = $data['is_redeemed'] ?? false;
$redeemed_points = $data['redeemed_points'] ?? 0;

// 1. Get service_id
$stmt = $conn->prepare("SELECT service_id FROM tb_service WHERE service_name=?");
$stmt->bind_param("s", $service_name);
$stmt->execute();

$s_res = $stmt->get_result()->fetch_assoc();
$service_id = $s_res['service_id'] ?? null;

$stmt->close();

// 2. Get dentist_id
$stmt = $conn->prepare("SELECT dentist_id FROM tb_dentist WHERE dentist_name=?");
$stmt->bind_param("s", $dentist_name);
$stmt->execute();

$d_res = $stmt->get_result()->fetch_assoc();
$dentist_id = $d_res['dentist_id'] ?? null;

$stmt->close();

if (!$service_id || !$dentist_id) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid Service or Dentist"
    ]);
    exit;
}

// 3. Insert Appointment
$stmt = $conn->prepare("
    INSERT INTO tb_appointment 
    (date, time, patient_id, dentist_id, service_id) 
    VALUES (?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssiii",
    $date,
    $time,
    $patient_id,
    $dentist_id,
    $service_id
);

if ($stmt->execute()) {

    // Deduct points if reward was redeemed
    if ($is_redeemed && $redeemed_points > 0) {

        $deductStmt = $conn->prepare("
            UPDATE tb_patient
            SET points = points - ?
            WHERE patient_id = ?
        ");

        $deductStmt->bind_param(
            "ii",
            $redeemed_points,
            $patient_id
        );

        $deductStmt->execute();
        $deductStmt->close();
    }

echo json_encode([
    "success" => true,
    "stored_time" => $time,
    "is_redeemed" => $is_redeemed,
    "redeemed_points" => $redeemed_points
]);

} else {

    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}
$stmt->close();
$conn->close();
?>