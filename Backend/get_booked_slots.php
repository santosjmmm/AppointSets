<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$conn = new mysqli("localhost", "root", "", "db_appsets");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$month = isset($_GET['month']) ? $conn->real_escape_string($_GET['month']) : '';
$year = isset($_GET['year']) ? $conn->real_escape_string($_GET['year']) : '';

if (empty($month) || empty($year)) {
    echo json_encode(["success" => false, "message" => "Month and Year parameters are required."]);
    exit();
}

// Format pattern to match YYYY-MM-%
$datePattern = $year . "-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-%";

// 💡 FIXED: Table name set to tb_appointment, columns set to date and time.
// Also ignores 'Cancelled' appointments so those slots become open again.
$sql = "SELECT date, time FROM tb_appointment WHERE date LIKE ? AND status != 'Cancelled'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $datePattern);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $dateKey = $row['date'];
    $rawTime = $row['time']; // e.g., "09:00:00.000000"
    
    // 💡 FIXED: Converts standard database time strings safely to match React ("9:00 AM")
    $formattedTime = date("g:i A", strtotime($rawTime));
    
    if (!isset($bookings[$dateKey])) {
        $bookings[$dateKey] = [];
    }
    $bookings[$dateKey][] = $formattedTime;
}

echo json_encode(["success" => true, "bookings" => $bookings]);
exit();
?>