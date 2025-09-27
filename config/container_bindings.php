<?php

declare(strict_types = 1);

use App\Config;
use App\Controller\ApiController;
use App\Controller\ErrorController;
use App\Service\WeatherService;
use Slim\Views\Twig;
use Twig\Extra\Intl\IntlExtension;

use function DI\create;

return [
    Config::class => create(Config::class)->constructor($_ENV),
    Twig::class => function (Config $config) {
        $twig = Twig::create(TEMPLATE_PATH, [
            'cache'       => STORAGE_PATH . '/cache',
            'auto_reload' => $config->environment === 'development',
        ]);

        $twig->addExtension(new IntlExtension());
        return $twig;
    },
    ErrorController::class => create(ErrorController::class),
    WeatherService::class => create(WeatherService::class),
    ApiController::class => create(ApiController::class),
];
