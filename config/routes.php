<?php

declare(strict_types = 1);

use App\Config;
use App\Controller\AuthController;
use App\Controller\DashboardController;
use App\Controller\LoginController;
use App\Middleware\AuthMiddleware;
use Slim\App;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;


return function (App $app) {
    
    $config =  $app->getContainer()->get(Config::class);
    $secret =  $config->JWT_SECRET;

    // Login-Seite
    $app->get('/login', [LoginController::class, 'index']);

    // Login-Formular absenden (JWT erstellen)
    $app->post('/login', [new AuthController($secret), 'login'])
        ->add(function ($request, $handler) {
            $response = $handler->handle($request);

            if ($response->getStatusCode() === 401) {
                return $response->withHeader('Location', '/login?error=1')->withStatus(302);
            }

            return $response;
        });

    // Logout
    $app->get('/logout', [new AuthController($secret), 'logout']);

    // Geschützte Route: Dashboard
    $app->get('/', [DashboardController::class, 'index'])->add(new AuthMiddleware($secret));

    $app->group('/api', function (RouteCollectorProxy $group)  {
        $group->get('/page1', function (Request $request, Response $response) { 
            $result = file_get_contents('https://dummyjson.com/posts?limit=50&sortBy=id&order=asc');
            
            if ($result === false) {
                $response->getBody()->write(json_encode(['error' => 'API call failed']));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write($result); 
            return $response->withHeader('Content-Type', 'application/json'); 
        });
        $group->get('/page2', function (Request $request, Response $response) { 
            $result = file_get_contents('https://dummyjson.com/posts?limit=50&sortBy=views&order=desc');
            
            if ($result === false) {
                $response->getBody()->write(json_encode(['error' => 'API call failed']));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write($result); 
            return $response->withHeader('Content-Type', 'application/json'); 
        });
        $group->get('/page3', function (Request $request, Response $response) { 
            $result = file_get_contents('https://dummyjson.com/posts?limit=50&sortBy=title&order=desc');
            
            if ($result === false) {
                $response->getBody()->write(json_encode(['error' => 'API call failed']));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write($result); 
            return $response->withHeader('Content-Type', 'application/json'); 
        });
    })->add(new AuthMiddleware($secret));

    // Catch-all Route nach der Fehler-Middleware
    $app->map(['GET', 'POST'], '/{routes:.+}', function ($request, $response, $args) {
        $errorController = $this->get('errorController');
        return $errorController->notFound($request, $response);
    });
};
