<?php
namespace App\Models;
class Participant extends BaseModel {
    public function byEvent(int $eventId): array { $s=$this->db->prepare('SELECT * FROM participants WHERE event_id=:event_id ORDER BY created_at DESC'); $s->execute(['event_id'=>$eventId]); return $s->fetchAll(); }
    public function create(array $d): int { $s=$this->db->prepare('INSERT INTO participants (event_id,first_name,last_name,email,phone,company,profession,notes,privacy_consent,payment_status,checkin_status,created_at,updated_at) VALUES (:event_id,:first_name,:last_name,:email,:phone,:company,:profession,:notes,:privacy_consent,:payment_status,:checkin_status,NOW(),NOW())'); $s->execute($d); return (int)$this->db->lastInsertId(); }
}
