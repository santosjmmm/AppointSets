<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

$method = $_SERVER['REQUEST_METHOD'];

// --- UPDATE STATUS AND NOTES (POST) ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $apt_id = isset($data['appointment_id']) ? (int)$data['appointment_id'] : 0;
    $new_status = trim($data['status'] ?? '');
    // ✅ NEW: Capture notes parameter from payload, defaulting to an empty string if empty
    $notes = trim($data['notes'] ?? '');

    if ($apt_id > 0 && !empty($new_status)) {
        // ✅ MODIFIED: Added notes into the UPDATE query statement logic mapping
        $stmt = $conn->prepare("UPDATE tb_appointment SET status = ?, notes = ? WHERE appointment_id = ?");
        $stmt->bind_param("ssi", $new_status, $notes, $apt_id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Appointment records updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update record"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Invalid target parameters"]);
    }
    exit;
}

// --- FETCH CALENDAR APPOINTMENTS (GET) ---
if ($method === 'GET') {
    $month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
    $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

    // Establish dynamic string padding boundaries
    $start_date = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01";
    $number_days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    $end_date = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-$number_days";

    // ✅ NOTE: a.* automatically pulls your 'notes' column into the data rows array map payload
    $query = "SELECT a.*, s.service_name, d.dentist_name, p.name AS patient_name, p.patient_id 
              FROM tb_appointment a
              JOIN tb_service s ON a.service_id = s.service_id
              JOIN tb_dentist d ON a.dentist_id = d.dentist_id
              JOIN tb_patient p ON a.patient_id = p.patient_id
              WHERE a.date BETWEEN ? AND ? 
              ORDER BY a.time ASC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $start_date, $end_date);
    $stmt->execute();
    $result = $stmt->get_result();

    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $day_idx = (int)date("j", strtotime($row['date']));
        // Format time safely for output
        $row['formatted_time'] = date("h:i A", strtotime($row['time']));
        $appointments[$day_idx][] = $row;
    }

    echo json_encode([
        "success" => true,
        "month" => $month,
        "year" => $year,
        "appointments" => (object)$appointments
    ]);
    $stmt->close();
    exit;
}
?>