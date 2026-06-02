<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$search = isset($_GET['search']) ? $conn->real_escape_string(trim($_GET['search'])) : '';
$patient_id = isset($_GET['patient_id']) ? (int)$_GET['patient_id'] : 0;

// --- MODE A: RETRIEVE SPECIFIC PATIENT TREATMENT HISTORY ---
if ($patient_id > 0) {
    // 1. Grab Core Profile details
    $profile_stmt = $conn->prepare("SELECT patient_id, name, email, contact_num FROM tb_patient WHERE patient_id = ?");
    $profile_stmt->bind_param("i", $patient_id);
    $profile_stmt->execute();
    $profile_res = $profile_stmt->get_result();
    $patient_profile = $profile_res->fetch_assoc();
    $profile_stmt->close();

    if (!$patient_profile) {
        echo json_encode(["success" => false, "message" => "Patient record not found."]);
        exit;
    }

    // 2. Extract Associated Appointments log history data (✅ MODIFIED: Added a.notes)
    $history_sql = "SELECT a.date, a.time, a.status, a.notes, s.service_name, d.dentist_name 
                    FROM tb_appointment a
                    JOIN tb_service s ON a.service_id = s.service_id
                    JOIN tb_dentist d ON a.dentist_id = d.dentist_id
                    WHERE a.patient_id = ?
                    ORDER BY a.date DESC, a.time DESC";
                    
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->bind_param("i", $patient_id);
    $history_stmt->execute();
    $history_res = $history_stmt->get_result();

    $history_logs = [];
    while ($row = $history_res->fetch_assoc()) {
        $row['formatted_date'] = date("M d, Y", strtotime($row['date']));
        $row['formatted_time'] = date("h:i A", strtotime($row['time']));
        $history_logs[] = $row;
    }
    $history_stmt->close();

    echo json_encode([
        "success" => true,
        "view" => "profile",
        "profile" => $patient_profile,
        "history" => $history_logs
    ]);
    exit;
}

// --- MODE B: FUZZY SEARCH LIST PATIENTS ---
$patient_query = "SELECT patient_id, name, email FROM tb_patient";
if ($search !== '') {
    $patient_query .= " WHERE name LIKE '%$search%' OR email LIKE '%$search%'";
}
$patient_query .= " ORDER BY name ASC";

$result = $conn->query($patient_query);
$patients = [];

while ($row = $result->fetch_assoc()) {
    $patients[] = $row;
}

echo json_encode([
    "success" => true,
    "view" => "index",
    "patients" => $patients
]);
$conn->close();
?>