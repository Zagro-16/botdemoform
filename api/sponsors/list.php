<?php require_once __DIR__.'/../_bootstrap.php'; use App\Models\Sponsor; jsonResponse(['data'=>(new Sponsor())->all()]);
