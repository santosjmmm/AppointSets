<?php
// Set CORS headers to match your React/Vite dev environment
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = new mysqli("localhost", "root", "", "db_appsets");

if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed"]);
    exit;
}

// Ensure variables are set to avoid "undefined index" notices
$patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : 0;
$month = isset($_GET['month']) ? $_GET['month'] : date('m');
$year = isset($_GET['year']) ? $_GET['year'] : date('Y');

// Calculate date range for the month
$start_date = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01";
$end_date = date("Y-m-t", strtotime($start_date));

$query = "SELECT a.*, s.service_name, d.dentist_name 
          FROM tb_appointment a
          JOIN tb_service s ON a.service_id = s.service_id
          JOIN tb_dentist d ON a.dentist_id = d.dentist_id
          WHERE a.patient_id = ? AND a.status != 'Cancelled'
          AND a.date BETWEEN ? AND ?
          ORDER BY a.time ASC"; // Added ordering by time

$stmt = $conn->prepare($query);
$stmt->bind_param("iss", $patient_id, $start_date, $end_date);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while($row = $result->fetch_assoc()) {
    // We keep $row['time'] as '15:30:00' (24-hour) so React can format it accurately
    $data[] = $row;
}

echo json_encode($data);