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

function uploadImage($file) {
    if(isset($file) && $file['error'] === 0){
        $targetDir = "../../Frontend/public/uploads/"; 
        if(!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        $imageName = time() . "_" . basename($file["name"]);
        if(move_uploaded_file($file["tmp_name"], $targetDir . $imageName)) return $imageName;
    }
    return "";
}

// GET: Fetch and clean up both tables distinctly
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $services = [];

    // 1. Fetch Regular Services
    $res1 = $conn->query("SELECT service_id, service_name, service_image, description, price, duration, status FROM tb_service");
    if ($res1) {
        while ($row = $res1->fetch_assoc()) {
            $row['service_type'] = 'regular';
            $services[] = $row;
        }
    }

    // 2. Fetch Reward Services (UPDATED: Using reward_desc with underscore now)
    $res2 = $conn->query("SELECT reward_id, reward_name, reward_image, reward_desc, points, reward_duration, status FROM tb_rewards");
    if ($res2) {
        while ($row = $res2->fetch_assoc()) {
            $services[] = [
                "service_id" => $row['reward_id'],
                "service_name" => $row['reward_name'],
                "service_image" => $row['reward_image'],
                "description" => $row['reward_desc'], // Clean mapping
                "price" => $row['points'],            // Map points to unified 'price' key for layout rendering
                "duration" => $row['reward_duration'],
                "status" => $row['status'],
                "service_type" => 'points'            // Crucial tag so React knows this belongs to the reward tab
            ];
        }
    }
    
    echo json_encode(["success" => true, "services" => $services]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $_POST['action'] ?? $input['action'] ?? '';

if ($action === 'add' || $action === 'update') {
    $type = $_POST['service_type'] ?? 'regular';
    $img = uploadImage($_FILES['service_image'] ?? null);
    
    $service_name = $_POST['service_name'] ?? '';
    $description = $_POST['description'] ?? '';
    $duration = $_POST['duration'] ?? '';
    
    if ($type === 'regular') {
        $price = isset($_POST['price']) && $_POST['price'] !== '' ? floatval($_POST['price']) : 0.00;
        
        if ($action === 'add') {
            $stmt = $conn->prepare("INSERT INTO tb_service (service_name, description, price, duration, service_image, status) VALUES (?, ?, ?, ?, ?, 'Available')");
            $stmt->bind_param("ssdss", $service_name, $description, $price, $duration, $img);
        } else {
            $id = intval($_POST['service_id']);
            if ($img !== "") {
                $stmt = $conn->prepare("UPDATE tb_service SET service_name=?, description=?, price=?, duration=?, service_image=? WHERE service_id=?");
                $stmt->bind_param("ssdssi", $service_name, $description, $price, $duration, $img, $id);
            } else {
                $stmt = $conn->prepare("UPDATE tb_service SET service_name=?, description=?, price=?, duration=? WHERE service_id=?");
                $stmt->bind_param("ssdsi", $service_name, $description, $price, $duration, $id);
            }
        }
    } else {
        $points = 0;
        if (isset($_POST['points_required']) && $_POST['points_required'] !== '') {
            $points = intval($_POST['points_required']);
        } elseif (isset($_POST['price']) && $_POST['price'] !== '') {
            $points = intval($_POST['price']);
        }

        if ($action === 'add') {
            // UPDATED: Standard reward_desc column
            $stmt = $conn->prepare("INSERT INTO tb_rewards (reward_name, reward_desc, points, reward_duration, reward_image, status) VALUES (?, ?, ?, ?, ?, 'Active')");
            $stmt->bind_param("ssiss", $service_name, $description, $points, $duration, $img);
        } else {
            $id = intval($_POST['service_id']);
            if ($img !== "") {
                // UPDATED: Standard reward_desc column
                $stmt = $conn->prepare("UPDATE tb_rewards SET reward_name=?, reward_desc=?, points=?, reward_duration=?, reward_image=? WHERE reward_id=?");
                $stmt->bind_param("ssissi", $service_name, $description, $points, $duration, $img, $id);
            } else {
                // UPDATED: Standard reward_desc column
                $stmt = $conn->prepare("UPDATE tb_rewards SET reward_name=?, reward_desc=?, points=?, reward_duration=? WHERE reward_id=?");
                $stmt->bind_param("ssisi", $service_name, $description, $points, $duration, $id);
            }
        }
    }
    
    if ($stmt && $stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Saved successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt ? $stmt->error : "SQL Statement compilation failed."]);
    }
    exit();
}

if ($action === 'toggle_status') {
    $id = intval($input['service_id']);
    $type = $input['service_type'];
    $newStatus = (strtolower($input['current_status']) === 'available' || strtolower($input['current_status']) === 'active') ? 'Unavailable' : 'Available';
    
    if ($type === 'regular') {
        $stmt = $conn->prepare("UPDATE tb_service SET status=? WHERE service_id=?");
    } else {
        $newStatus = ($newStatus === 'Available') ? 'Active' : 'Deactive';
        $stmt = $conn->prepare("UPDATE tb_rewards SET status=? WHERE reward_id=?");
    }
    
    $stmt->bind_param("si", $newStatus, $id);
    $stmt->execute();
    echo json_encode(["success" => true]);
    exit();
}
?>