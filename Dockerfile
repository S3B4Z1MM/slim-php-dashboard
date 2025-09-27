# syntax=docker/dockerfile:1.6

ARG PHP_VERSION=8.2

FROM php:${PHP_VERSION}-fpm-alpine AS php-base
LABEL maintainer="DevOps Team" \
      org.opencontainers.image.source="https://github.com/example/slim-php-dashboard" \
      org.opencontainers.image.title="Slim PHP Dashboard"

ARG UID=1000
ARG GID=1000
ENV APP_DIR=/var/www/html \
    COMPOSER_ALLOW_SUPERUSER=1 \
    PATH="/var/www/html/vendor/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

RUN addgroup -S app -g ${GID} \
    && adduser -S -D -G app -u ${UID} app \
    && apk add --no-cache \
        bash \
        curl \
        git \
        icu-dev \
        libpng-dev \
        libzip-dev \
        oniguruma-dev \
        tzdata \
        unzip \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j"$(nproc)" intl mbstring opcache pdo_mysql zip \
    && rm -rf /tmp/* /var/cache/apk/*

COPY --from=composer:2.7 /usr/bin/composer /usr/local/bin/composer

WORKDIR ${APP_DIR}

COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/10-opcache.ini
COPY docker/php/conf.d/security.ini /usr/local/etc/php/conf.d/20-security.ini

FROM php-base AS vendor-dev
COPY composer.json composer.lock ./
RUN composer install \
        --no-interaction \
        --no-progress \
        --prefer-dist

FROM php-base AS vendor-prod
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
    && composer dump-autoload --no-dev --optimize

FROM php-base AS dev
ENV APP_ENV=development \
    APP_DEBUG=1
COPY --from=vendor-dev --chown=app:app ${APP_DIR}/vendor ${APP_DIR}/vendor
COPY --chown=app:app . ${APP_DIR}
RUN composer dump-autoload --optimize
RUN set -eux; \
    apk add --no-cache --virtual .phpize-deps $PHPIZE_DEPS; \
    pecl install xdebug; \
    docker-php-ext-enable xdebug; \
    apk del .phpize-deps; \
    rm -rf /tmp/pear
COPY docker/php/conf.d/dev.ini /usr/local/etc/php/conf.d/99-environment.ini
USER app
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD php -v >/dev/null || exit 1
CMD ["php-fpm", "--nodaemonize"]

FROM php-base AS stage
ENV APP_ENV=staging \
    APP_DEBUG=0
COPY --from=vendor-prod --chown=app:app ${APP_DIR}/vendor ${APP_DIR}/vendor
COPY --chown=app:app . ${APP_DIR}
RUN composer dump-autoload --no-dev --optimize
COPY docker/php/conf.d/stage.ini /usr/local/etc/php/conf.d/99-environment.ini
USER app
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD php -v >/dev/null || exit 1
CMD ["php-fpm", "--nodaemonize"]

FROM php-base AS production
ENV APP_ENV=production \
    APP_DEBUG=0
COPY --from=vendor-prod --chown=app:app ${APP_DIR}/vendor ${APP_DIR}/vendor
COPY --chown=app:app . ${APP_DIR}
RUN composer dump-autoload --no-dev --classmap-authoritative
COPY docker/php/conf.d/production.ini /usr/local/etc/php/conf.d/99-environment.ini
USER app
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD php -v >/dev/null || exit 1
CMD ["php-fpm", "--nodaemonize"]
