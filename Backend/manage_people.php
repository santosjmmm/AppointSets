<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$conn = new mysqli("localhost", "root", "", "db_appsets");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit();
}

// ==========================================
// GET REQUEST: Fetch data separated by tables
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = [
        "patients" => [],
        "staff" => [],
        "dentists" => []
    ];

    // 1. Fetch Patients (from your edited-image.png structure)
    $resPatients = $conn->query("SELECT patient_id, name, age, address, email, contact_num, points FROM tb_patient ORDER BY patient_id DESC");
    if ($resPatients) {
        while ($row = $resPatients->fetch_assoc()) {
            $data["patients"][] = $row;
        }
    }

    // 2. Fetch Staff (from your image_6eda45.png structure)
    $resStaff = $conn->query("SELECT staff_id, name, email, contact_num, status FROM tb_staff ORDER BY staff_id DESC");
    if ($resStaff) {
        while ($row = $resStaff->fetch_assoc()) {
            $data["staff"][] = $row;
        }
    }

    // 3. Fetch Dentists (from your image_6edd73.png structure)
    $resDentists = $conn->query("SELECT dentist_id, dentist_name, contact_num, email, status, avail FROM tb_dentist ORDER BY dentist_id DESC");
    if ($resDentists) {
        while ($row = $resDentists->fetch_assoc()) {
            // Mapping dentist_name to 'name' uniform standard for easy presentation coding
            $row['name'] = $row['dentist_name'];
            $data["dentists"][] = $row;
        }
    }

    echo json_encode(["success" => true, "data" => $data]);
    $conn->close();
    exit();
}

// ==========================================
// POST REQUEST: Actions (Update info / Toggle Status)
// ==========================================
$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? '';
$roleType = $input['role_type'] ?? ''; // 'patient', 'staff', or 'dentist'

if ($action === 'toggle_status') {
    $id = intval($input['id']);
    $status = $input['status'];
    
    // Select correct table target
    $table = ($roleType === 'dentist') ? 'tb_dentist' : 'tb_staff';
    $idColumn = ($roleType === 'dentist') ? 'dentist_id' : 'staff_id';

    // Patients don't have a status column in your screenshots, so we safeguard this query:
    if ($roleType === 'patient') {
        echo json_encode(["success" => false, "message" => "Patients do not have a status attribute."]);
        exit();
    }

    $stmt = $conn->prepare("UPDATE $table SET status = ? WHERE $idColumn = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Status altered successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }
    $conn->close();
    exit();
}

if ($action === 'update_user') {
    $id = intval($input['id']);
    $name = $input['name'];
    $email = $input['email'];
    $contact_num = $input['contact_num'];

    if ($roleType === 'patient') {
        $age = intval($input['age']);
        $address = $input['address'];
        $points = intval($input['points']);

        $stmt = $conn->prepare("UPDATE tb_patient SET name = ?, age = ?, address = ?, email = ?, contact_num = ?, points = ? WHERE patient_id = ?");
        $stmt->bind_param("sisssii", $name, $age, $address, $email, $contact_num, $points, $id);
    } 
    elseif ($roleType === 'staff') {
        $stmt = $conn->prepare("UPDATE tb_staff SET name = ?, email = ?, contact_num = ? WHERE staff_id = ?");
        $stmt->bind_param("sssi", $name, $email, $contact_num, $id);
    } 
    elseif ($roleType === 'dentist') {
        $avail = $input['avail'] ?? '';
        $stmt = $conn->prepare("UPDATE tb_dentist SET dentist_name = ?, email = ?, contact_num = ?, avail = ? WHERE dentist_id = ?");
        $stmt->bind_param("ssssi", $name, $email, $contact_num, $avail, $id);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }
    $conn->close();
    exit();
}
?>