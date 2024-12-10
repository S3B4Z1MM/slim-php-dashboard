<?php

declare(strict_types = 1);

namespace App\Controller;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Views\Twig;

class ErrorController
{
    private Twig $twig;

    public function __construct(Twig $twig)
    {
        $this->twig = $twig;
    }

    public function notFound($request, $response)
    {
        return $this->twig->render($response, 'error/404.twig');
    }

    public function serverError(Request $request, Response $response): Response
    {
        return $this->twig->render($response, 'errors/500.twig');
    }
}
