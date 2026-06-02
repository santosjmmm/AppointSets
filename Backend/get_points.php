<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$patient_id = $_GET['patient_id'] ?? null;

if (!$patient_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing patient_id"
    ]);
    exit;
}

// 1. Fetch patient points
$stmt = $conn->prepare("
    SELECT points 
    FROM tb_patient 
    WHERE patient_id = ?
");
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$patient_result = $stmt->get_result()->fetch_assoc();
$points = $patient_result['points'] ?? 0;
$stmt->close();

// 2. Fetch active rewards from tb_rewards
$rewards_query = "SELECT reward_id, reward_name, reward_desc, points, reward_image, reward_duration FROM tb_rewards WHERE status = 'Active'";
$rewards_result = $conn->query($rewards_query);

$rewards = [];
if ($rewards_result) {
    while ($row = $rewards_result->fetch_assoc()) {
        $rewards[] = [
            "id" => (int)$row['reward_id'],
            "service_name" => $row['reward_name'],
            "description" => $row['reward_desc'],
            "price" => (int)$row['points'],
            "image" => $row['reward_image'],
            "duration" => $row['reward_duration']
        ];
    }
}

// 3. Return everything in one response JSON payload
echo json_encode([
    "success" => true,
    "points" => $points,
    "rewards" => $rewards
]);

$conn->close();
?>