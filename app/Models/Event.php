<?php
namespace App\Models;
class Event extends BaseModel {
    public function all(): array { return $this->db->query('SELECT e.*, c.name category_name FROM events e LEFT JOIN event_categories c ON c.id=e.category_id ORDER BY e.start_date DESC')->fetchAll(); }
    public function find(int $id): ?array { $s=$this->db->prepare('SELECT * FROM events WHERE id=:id'); $s->execute(['id'=>$id]); return $s->fetch() ?: null; }
    public function create(array $d): int { $sql='INSERT INTO events (organizer_id,category_id,title,description,poster,address,venue,map_url,start_date,end_date,start_time,end_time,is_multiday,capacity,status,visibility,is_paid,price,ecm_enabled,ecm_credits,slug,created_at,updated_at) VALUES (:organizer_id,:category_id,:title,:description,:poster,:address,:venue,:map_url,:start_date,:end_date,:start_time,:end_time,:is_multiday,:capacity,:status,:visibility,:is_paid,:price,:ecm_enabled,:ecm_credits,:slug,NOW(),NOW())'; $s=$this->db->prepare($sql); $s->execute($d); return (int)$this->db->lastInsertId(); }
}
