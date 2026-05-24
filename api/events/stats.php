<?php require_once __DIR__.'/../_bootstrap.php'; jsonResponse(['event_id'=>(int)($_GET['id']??0),'stats'=>['participants'=>0,'checkins'=>0,'revenue'=>0]]);
