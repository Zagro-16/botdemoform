<?php require_once __DIR__.'/../_bootstrap.php'; $id=(int)($_GET['id']??0); jsonResponse(['url'=>env('APP_URL','').'/register-event?event_id='.$id]);
