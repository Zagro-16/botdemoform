<?php
require_once __DIR__ . '/config/bootstrap.php';
use App\Services\AuthService;
$auth = new AuthService();
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path === '/' || $path === '/index.php') { include __DIR__ . '/app/Views/dashboard/index.php'; exit; }
if ($path === '/login') { include __DIR__ . '/app/Views/auth/login.php'; exit; }
if ($path === '/register-event') { include __DIR__ . '/app/Views/public/register-event.php'; exit; }
http_response_code(404); echo '404';
