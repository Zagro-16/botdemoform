<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

class Database {
    private static ?PDO $pdo = null;
    public static function connection(): PDO {
        if (self::$pdo) return self::$pdo;
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', env('DB_HOST','127.0.0.1'), env('DB_PORT','3306'), env('DB_DATABASE','eventpass_ai'));
        self::$pdo = new PDO($dsn, env('DB_USERNAME','root'), env('DB_PASSWORD',''), [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
        return self::$pdo;
    }
}
