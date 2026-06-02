<?php
// Match your exact CORS and headers configuration
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Inline connection setup matching your reference
$conn = new mysqli("localhost", "root", "", "db_appsets");
if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "error" => "Connection failed: " . $conn->connect_error
    ]);
    exit();
}

$response = [
    "success" => false,
    "services" => [],
    "dentists" => [],
    "error" => null
];

try {
    // 1. SERVICES: Get available regular services
    $serviceSql = "SELECT service_name FROM tb_service WHERE status = 'Available'";
    $serviceResult = $conn->query($serviceSql);

    if (!$serviceResult) {
        throw new Exception("Service query failed: " . $conn->error);
    }

    while ($row = $serviceResult->fetch_assoc()) {
        $response["services"][] = $row["service_name"];
    }

    // 2. DENTISTS: Get active dentists
    $dentistSql = "SELECT dentist_name FROM tb_dentist WHERE status = 'Active'";
    $dentistResult = $conn->query($dentistSql);

    if (!$dentistResult) {
        throw new Exception("Dentist query failed: " . $conn->error);
    }

    while ($row = $dentistResult->fetch_assoc()) {
        $response["dentists"][] = $row["dentist_name"];
    }

    $response["success"] = true;

} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

echo json_encode($response);
exit();
?>