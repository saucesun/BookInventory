<?php
// api.php - backend for the Book Inventory app
// The ?action= value in the URL tells us what to do (list, create, update, delete)

// CORS: React (port 5173) talks to Apache on XAMPP (port 80)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Reply right away to the browser's preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Connect to the SQLite database file
$pdo = new PDO('sqlite:' . __DIR__ . '/books.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create the table on first run
$pdo->exec("CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0
)");

$action = $_GET['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true);

// Basic validation: title and author are required, numbers can't be negative
if (in_array($action, ['create', 'update'])) {
    if (empty($input['title']) || empty($input['author'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and author are required.']);
        exit;
    }
    if ($input['quantity'] < 0 || $input['price'] < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Quantity and price cannot be negative.']);
        exit;
    }
}

switch ($action) {
    case 'list':
        // Get all books sorted by title
        $stmt = $pdo->query("SELECT * FROM books ORDER BY title ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create':
        // Add a new book
        $stmt = $pdo->prepare("INSERT INTO books (title, author, quantity, price) VALUES (:t, :a, :q, :p)");
        $stmt->execute([
            ':t' => $input['title'],
            ':a' => $input['author'],
            ':q' => (int)$input['quantity'],
            ':p' => (float)$input['price']
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'update':
        // Update a book by id
        $stmt = $pdo->prepare("UPDATE books SET title=:t, author=:a, quantity=:q, price=:p WHERE id=:id");
        $stmt->execute([
            ':t' => $input['title'],
            ':a' => $input['author'],
            ':q' => (int)$input['quantity'],
            ':p' => (float)$input['price'],
            ':id' => $input['id']
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'delete':
        // Remove a book by id
        $stmt = $pdo->prepare("DELETE FROM books WHERE id = :id");
        $stmt->execute([':id' => $input['id']]);
        echo json_encode(['success' => true]);
        break;

    default:
        // Unknown action
        http_response_code(404);
        echo json_encode(['error' => 'Unknown action.']);
}
