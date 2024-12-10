<?php

namespace App\Controller;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private string $secret;

    public function __construct(string $secret)
    {
        $this->secret = $secret;
    }

    public function login(Request $request, Response $response): Response
    {
        session_start();

        $data = $request->getParsedBody();
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if ($username === 'admin' && $password === 'password') {
            $payload = [
                'sub' => $username,
                'iat' => time(),
                'exp' => time() + 60 * 60 // 1 Stunde
            ];

            $jwt = JWT::encode($payload, $this->secret, 'HS256');

            $_SESSION['jwt'] = $jwt;

            return $response->withHeader('Location', '/')->withStatus(302);
        }

        // Redirect zur Login-Seite mit Query-Parameter (optional)
        return $response->withHeader('Location', '/login?error=1')->withStatus(401);
    }

    public function logout(Request $request, Response $response): Response
    {
        session_start();
        session_destroy();

        return $response->withHeader('Location', '/login')->withStatus(302);
    }
}
