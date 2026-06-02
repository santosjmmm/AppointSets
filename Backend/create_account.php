<?php
header("Access-Control-Allow-Origin: http://localhost:5184");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "db_appsets");

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $role = $data['role'];
    $name = mysqli_real_escape_string($conn, $data['name']);
    $contact = mysqli_real_escape_string($conn, $data['contact']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    if ($role == 'dentist') {
        $sql = "INSERT INTO tb_dentist (dentist_name, contact_num, email, password, status) 
                VALUES ('$name', '$contact', '$email', '$password', 'Active')";
    } else {
        $sql = "INSERT INTO tb_staff (name, email, contact_num, password, status) 
                VALUES ('$name', '$email', '$contact', '$password', 'Active')";
    }

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
?>