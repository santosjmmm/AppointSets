<?php
// 1. Set Headers for React Communication (CORS)
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// 2. Database Connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "db_appsets";

$conn = new mysqli($host, $user, $pass, $dbname);

// Check Connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// 3. Handle the Search Logic
// We look for a 'search' parameter in the URL (e.g., get_patients.php?search=Juan)
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';

$query = "SELECT * FROM tb_patient";

if (!empty($search)) {
    // Search by Name or Email
    $query .= " WHERE name LIKE '%$search%' OR email LIKE '%$search%'";
}

// Sort by Name Alphabetically
$query .= " ORDER BY name ASC";

$result = $conn->query($query);

// 4. Format the Data for React
$patients = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $patients[] = [
            "patient_id" => $row['patient_id'], // Ensure this matches your DB column
            "name"       => $row['name'],
            "age"        => $row['age'],
            "address"    => $row['address'],
            "contact_num" => $row['contact_num'], // Check if your DB uses contact_num or contact
            "email"      => $row['email']
        ];
    }
}

// 5. Send JSON Response
echo json_encode($patients);

$conn->close();
?>