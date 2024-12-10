<?php

declare(strict_types = 1);

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;

use App\Config;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/config/path_constants.php';

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$config = new Config($_ENV); // Pass the loaded env variables to Config

$container = require CONFIG_PATH . '/container.php';

AppFactory::setContainer($container);

return AppFactory::create();
