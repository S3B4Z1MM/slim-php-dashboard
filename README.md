# Slim PHP Dashboard

Dieses Repository enthält eine abgesicherte Multi-Stage-Docker-Konfiguration für eine Slim-basierten PHP-Anwendung mit Nginx als Reverse-Proxy.

## Docker Images

Der `Dockerfile` definiert drei Targets:

- `dev` – Enthält Xdebug und aktiviert ausführliche Fehlerausgaben für die lokale Entwicklung.
- `stage` – Spiegelbild der Produktionsumgebung mit deaktivierten Debug-Einstellungen.
- `production` – Produktionsoptimiertes Image mit gehärteten PHP-Defaults und optimiertem Autoloader.

### Build-Beispiele

```bash
# Entwicklung (mit Xdebug)
docker build --target dev -t slim-dashboard:dev .

# Staging
docker build --target stage -t slim-dashboard:stage .

# Produktion
docker build --target production -t slim-dashboard:prod .
```

Alle Images nutzen denselben gehärteten PHP-Basestack und werden über Composer während des Builds mit Abhängigkeiten versorgt.

## Nginx Reverse Proxy

Unter `docker/nginx` befindet sich eine sichere Nginx-Konfiguration, die HTTP-Security-Header setzt, den Zugriff auf versteckte Dateien verhindert und statische Assets effizient ausliefert. Sie erwartet einen Upstream `php` auf Port `9000`.

Beispiel `docker-compose.yml` für die lokale Entwicklung:

```yaml
services:
  php:
    build:
      context: .
      target: dev
    environment:
      APP_ENV: development
    volumes:
      - ./:/var/www/html:delegated

  nginx:
    image: nginx:1.25-alpine
    depends_on:
      - php
    ports:
      - "8080:80"
    volumes:
      - ./public:/var/www/html/public:ro
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
```

## Sicherheitshinweise

- PHP ist so konfiguriert, dass gefährliche Defaults (z. B. `expose_php`, `allow_url_fopen`) deaktiviert sind.
- Sessions und Upload-Limits sind gehärtet.
- Xdebug wird ausschließlich im `dev`-Target installiert.
- Healthchecks überwachen den PHP-FPM-Prozess.
- Für Produktion werden keine Composer-Dev-Abhängigkeiten installiert und der Autoloader wird optimiert.

## Tests

Tests können innerhalb des Containers ausgeführt werden:

```bash
docker run --rm -it slim-dashboard:stage php vendor/bin/phpunit
```

