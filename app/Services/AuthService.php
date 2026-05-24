<?php
namespace App\Services;
use App\Models\User;
class AuthService {
    public function login(string $email, string $password): bool {
        $userModel = new User();
        $user = $userModel->findByEmail($email);
        if (!$user || !password_verify($password, $user['password'])) return false;
        $_SESSION['user'] = ['id'=>$user['id'],'email'=>$user['email'],'role_id'=>$user['role_id'],'name'=>$user['name']];
        return true;
    }
    public function logout(): void { unset($_SESSION['user']); session_regenerate_id(true); }
    public function user(): ?array { return $_SESSION['user'] ?? null; }
}
