<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class AuthMiddleware
{
    private string $secret;

    public function __construct(string $secret)
    {
        $this->secret = $secret;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        session_start();

        $jwt = $_SESSION['jwt'] ?? null;

        if (!$jwt) {
            return (new \Slim\Psr7\Response())
                ->withHeader('Location', '/login')
                ->withStatus(302);
        }

        try {
            // JWT validieren
            $decoded = JWT::decode($jwt, new Key($this->secret, 'HS256'));
            $request = $request->withAttribute('user', $decoded);
        } catch (\Exception $e) {
            return (new \Slim\Psr7\Response())
                ->withHeader('Location', '/login')
                ->withStatus(302);
        }

        return $handler->handle($request);
    }
}
