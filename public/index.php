<?php

declare(strict_types = 1);

use App\Controller\ErrorController;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;

$app = require __DIR__ . '/../bootstrap.php';
$container = $app->getContainer();
$router = require CONFIG_PATH . '/routes.php';

// Error Middleware
$app->addErrorMiddleware(true, true, true);
$container->set('errorController', function() use ($container) {
    return new ErrorController($container->get(Twig::class));
});

$router($app);

$app->add(TwigMiddleware::create($app, $container->get(Twig::class)));

$app->run();
