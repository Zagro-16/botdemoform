<?php include __DIR__ . '/../layouts/header.php'; ?>
<div class="card glass p-4 mx-auto" style="max-width:420px"><h3>Login</h3><form method="post" action="/api/auth/login.php"><input type="hidden" name="csrf_token" value="<?=csrf_token()?>"><input class="form-control mb-2" name="email" type="email" placeholder="Email" required><input class="form-control mb-2" name="password" type="password" placeholder="Password" required><button class="btn btn-primary w-100">Accedi</button></form></div>
<?php include __DIR__ . '/../layouts/footer.php'; ?>
