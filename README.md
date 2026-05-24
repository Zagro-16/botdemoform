# EVENTPASS AI
Piattaforma SaaS eventi in PHP 8+, MVC, REST API, PWA-ready, compatibile con hosting condivisi e conversione Capacitor.

## Installazione
1. Carica i file su hosting/VPS.
2. `composer install`
3. Copia `.env.example` in `.env` e configura DB/mail/payments.
4. Importa `database/schema.sql` su MySQL/MariaDB.
5. Punta il webroot a `/` o usa rewrite verso `index.php`.

## Account demo
- admin@eventpass.ai / admin123
- organizer@test.com / organizer123
- hostess@test.com / hostess123

## API
Endpoint disponibili in `/api/*` per auth, eventi, partecipanti, QR, check-in, sponsor, documenti e statistiche.

## Sicurezza implementata
- Hash password (`password_hash`)
- Prepared statements PDO
- Token CSRF
- Sessioni server-side
- Sanitizzazione output

## Deploy cPanel/Aruba/Altervista
- Usa PHP 8.1+
- Abilita estensioni PDO MySQL, OpenSSL, mbstring, fileinfo, gd
- Esegui `composer install --no-dev`
- Rendi scrivibili: `storage/` e `assets/uploads/`

## Capacitor readiness
UI mobile first, PWA manifest e service worker inclusi. Per conversione:
1. `npm i @capacitor/core @capacitor/cli`
2. `npx cap init eventpass-ai com.eventpass.ai`
3. `npx cap add android` / `ios`
