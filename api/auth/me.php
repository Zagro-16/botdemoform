<?php require_once __DIR__.'/../_bootstrap.php'; use App\Services\AuthService; jsonResponse(['user'=>(new AuthService())->user()]);
