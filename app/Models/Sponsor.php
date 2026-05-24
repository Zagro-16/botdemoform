<?php
namespace App\Models;
class Sponsor extends BaseModel {
    public function all(): array { return $this->db->query('SELECT * FROM sponsors ORDER BY name')->fetchAll(); }
}
