<?php require_once __DIR__.'/../_bootstrap.php'; use App\Models\Participant; jsonResponse(['data'=>(new Participant())->byEvent((int)($_GET['event_id']??0))]);
