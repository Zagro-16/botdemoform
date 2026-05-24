<?php
namespace App\Models;
class User extends BaseModel {
    public function findByEmail(string $email): ?array { $s=$this->db->prepare('SELECT * FROM users WHERE email=:email LIMIT 1'); $s->execute(['email'=>$email]); return $s->fetch() ?: null; }
    public function create(array $data): int { $s=$this->db->prepare('INSERT INTO users (role_id,name,email,password,status,created_at,updated_at) VALUES (:role_id,:name,:email,:password,:status,NOW(),NOW())'); $s->execute($data); return (int)$this->db->lastInsertId(); }
}
