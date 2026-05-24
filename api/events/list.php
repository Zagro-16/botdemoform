<?php require_once __DIR__.'/../_bootstrap.php'; use App\Models\Event; jsonResponse(['data'=>(new Event())->all()]);
