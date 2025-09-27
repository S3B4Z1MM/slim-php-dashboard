<?php

declare(strict_types = 1);

namespace App\Controller;

use App\Service\WeatherService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Views\Twig;

class DashboardController
{
    public function __construct(
        private readonly Twig $twig,
        private readonly WeatherService $weatherService
    )
    {
    }

    public function index(Request $request, Response $response, $args): Response
    {
        $user = $request->getAttribute('user');

        return $this->twig->render($response, 'dashboard/index.twig', [
            'username' => $user->sub,
            'defaultLocation' => $this->weatherService->getLocationLabel(),
        ]);
    }
}
