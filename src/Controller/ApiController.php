<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\ExternalApiException;
use App\Service\WeatherService;
use JsonException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ApiController
{
    public function __construct(private readonly WeatherService $weatherService)
    {
    }

    public function overview(Request $request, Response $response): Response
    {
        return $this->respond(fn () => $this->weatherService->fetchOverview(), $response);
    }

    public function airQuality(Request $request, Response $response): Response
    {
        return $this->respond(fn () => $this->weatherService->fetchAirQuality(), $response);
    }

    public function solar(Request $request, Response $response): Response
    {
        return $this->respond(fn () => $this->weatherService->fetchSolar(), $response);
    }

    private function respond(callable $callback, Response $response): Response
    {
        try {
            $payload = $callback();
            $body = json_encode($payload, JSON_THROW_ON_ERROR);
        } catch (ExternalApiException $exception) {
            return $this->errorResponse($response, 502, $exception->getMessage());
        } catch (JsonException) {
            return $this->errorResponse($response, 500, 'Die Antwort konnte nicht verarbeitet werden.');
        }

        $response->getBody()->write($body);

        return $response->withHeader('Content-Type', 'application/json');
    }

    private function errorResponse(Response $response, int $status, string $message): Response
    {
        $payload = json_encode([
            'error' => true,
            'message' => $message,
        ], JSON_THROW_ON_ERROR);

        $response->getBody()->write($payload);

        return $response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/json');
    }
}
