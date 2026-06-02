<?php
// Disable showing errors as HTML to prevent breaking React JSON parsing
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Custom error handler to send PHP issues as JSON instead of crashing HTML style
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    echo json_encode(["error" => "PHP Runtime Error: $message in $file on line $line"]);
    exit;
});

// Database Connection
$conn = new mysqli("localhost", "root", "", "db_appsets");
if ($conn->connect_error) {
    echo json_encode(["error" => "Database link failure: " . $conn->connect_error]);
    exit;
}

$today = date('Y-m-d');

// 1. Authenticated Admin Context Resolution
$admin_id = isset($_SESSION['admin_id']) ? intval($_SESSION['admin_id']) : 1; 
$admin_name = "Admin";

$name_query = $conn->prepare("SELECT name FROM tb_admin WHERE admin_id = ?");
if ($name_query) {
    $name_query->bind_param("i", $admin_id);
    $name_query->execute();
    $result = $name_query->get_result();
    if ($row = $result->fetch_assoc()) {
        $admin_name = $row['name'];
    }
    $name_query->close();
}

// 2. Fetch Top Card Metrics
$total_patients = 0;
if ($res = $conn->query("SELECT COUNT(patient_id) as total FROM tb_patient")) {
    $row = $res->fetch_assoc();
    $total_patients = $row['total'] ?? 0;
}

$today_appointments = 0;
$today_stmt = $conn->prepare("SELECT COUNT(*) as total FROM tb_appointment WHERE date = ?");
if ($today_stmt) {
    $today_stmt->bind_param("s", $today);
    $today_stmt->execute();
    $today_appointments = $today_stmt->get_result()->fetch_assoc()['total'] ?? 0;
    $today_stmt->close();
}

$revenue = 0.0;
$rev_query = $conn->query("SELECT SUM(s.price) as total FROM tb_appointment a JOIN tb_service s ON a.service_id = s.service_id WHERE a.status = 'Completed'");
if ($rev_query) {
    $revenue = (float)($rev_query->fetch_assoc()['total'] ?? 0.0);
}

$pending_appointments = 0;
if ($res = $conn->query("SELECT COUNT(*) as total FROM tb_appointment WHERE status NOT IN ('Completed', 'Cancelled') AND date >= '$today'")) {
    $row = $res->fetch_assoc();
    $pending_appointments = $row['total'] ?? 0;
}

// 3. Fetch Lists for Table Tab Views
$recent_patients_list = [];
$patients_query = $conn->query("SELECT patient_id, name, contact_num FROM tb_patient ORDER BY patient_id DESC LIMIT 5");
if ($patients_query) {
    while ($row = $patients_query->fetch_assoc()) {
        $recent_patients_list[] = [
            "id" => intval($row['patient_id']), 
            "name" => $row['name'] ?? 'Unknown Patient',
            "contact" => $row['contact_num'] ?? 'N/A',
            "status" => "Active Card"
        ];
    }
}

$today_bookings_list = [];
$bookings_stmt = $conn->prepare("SELECT a.time, p.name as patient, s.service_name as service, d.dentist_name 
                                 FROM tb_appointment a 
                                 JOIN tb_patient p ON a.patient_id = p.patient_id 
                                 JOIN tb_service s ON a.service_id = s.service_id 
                                 JOIN tb_dentist d ON a.dentist_id = d.dentist_id
                                 WHERE a.date = ? AND a.status != 'Cancelled' 
                                 ORDER BY a.time ASC");
if ($bookings_stmt) {
    $bookings_stmt->bind_param("s", $today);
    $bookings_stmt->execute();
    $bookings_query = $bookings_stmt->get_result();
    while ($row = $bookings_query->fetch_assoc()) {
        $time_formatted = "N/A";
        if (!empty($row['time'])) {
            $time_formatted = date("g:i A", strtotime($row['time']));
        }
        $today_bookings_list[] = [
            "time" => $time_formatted,
            "patient" => $row['patient'] ?? 'Unknown',
            "service" => $row['service'] ?? 'General Service',
            "dentist" => $row['dentist_name'] ?? 'Not Assigned'
        ];
    }
    $bookings_stmt->close();
}

$pending_bookings_list = [];
// FIXED: Added JOIN tb_dentist d to dynamically retrieve the assigned dentist row values
$pending_stmt = $conn->prepare("SELECT a.date as requestDate, p.name as patient, s.service_name as service, d.dentist_name 
                                FROM tb_appointment a 
                                JOIN tb_patient p ON a.patient_id = p.patient_id 
                                JOIN tb_service s ON a.service_id = s.service_id 
                                JOIN tb_dentist d ON a.dentist_id = d.dentist_id
                                WHERE a.status NOT IN ('Completed', 'Cancelled') AND a.date >= ? 
                                ORDER BY a.date ASC, a.time ASC");
if ($pending_stmt) {
    $pending_stmt->bind_param("s", $today);
    $pending_stmt->execute();
    $pending_query = $pending_stmt->get_result();
    while ($row = $pending_query->fetch_assoc()) {
        $pending_bookings_list[] = [
            "requestDate" => !empty($row['requestDate']) ? date("Y-m-d", strtotime($row['requestDate'])) : $today,
            "patient" => $row['patient'] ?? 'Pending Assignment',
            "service" => $row['service'] ?? 'Evaluating Procedure',
            "dentist" => $row['dentist_name'] ?? 'Not Assigned'
        ];
    }
    $pending_stmt->close();
}

// 4. Doughnut Chart Data
$service_labels = []; 
$service_counts = [];
$service_chart_query = $conn->query("SELECT s.service_name, COUNT(a.appointment_id) as count FROM tb_appointment a JOIN tb_service s ON a.service_id = s.service_id GROUP BY s.service_id LIMIT 5");
if ($service_chart_query) {
    while($row = $service_chart_query->fetch_assoc()){
        $service_labels[] = $row['service_name'];
        $service_counts[] = intval($row['count']);
    }
}

// 5. Line Chart Data
$trend_labels = [];
$trend_counts = [];
$trend_stmt = $conn->prepare("SELECT COUNT(*) as total FROM tb_appointment WHERE date = ?");

if ($trend_stmt) {
    for ($i = 5; $i >= 0; $i--) {
        $date_check = date('Y-m-d', strtotime("-$i days"));
        $day_name = date('D', strtotime($date_check));
        
        $trend_stmt->bind_param("s", $date_check);
        $trend_stmt->execute();
        
        $res = $trend_stmt->get_result();
        $count = 0;
        if ($res && $row = $res->fetch_assoc()) {
            $count = $row['total'] ?? 0;
        }
        
        $trend_labels[] = $day_name;
        $trend_counts[] = intval($count);
    }
    $trend_stmt->close();
}

// 6. Return Structured JSON Payload 
echo json_encode([
    "admin_name" => $admin_name,
    "total_patients" => intval($total_patients),
    "today_appointments" => intval($today_appointments),
    "revenue" => floatval($revenue),
    "pending_appointments" => intval($pending_appointments),
    "recent_patients_list" => $recent_patients_list,
    "today_bookings_list" => $today_bookings_list,
    "pending_bookings_list" => $pending_bookings_list,
    "chart_data" => [
        "labels" => !empty($service_labels) ? $service_labels : ["No Services"],
        "counts" => !empty($service_counts) ? $service_counts : [0]
    ],
    "trend_data" => [
        "labels" => $trend_labels,
        "counts" => $trend_counts
    ]
]);
$conn->close();
?>