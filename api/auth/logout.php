<?php require_once __DIR__.'/../_bootstrap.php'; use App\Services\AuthService; (new AuthService())->logout(); jsonResponse(['success'=>true]);
