<?php

declare(strict_types = 1);

namespace App;

/**
 * @property-read ?string $environment
 */
class Config
{
    protected array $config = [];

    public function __construct(array $env)
    {
        $this->config = [
            'environment' => $env['APP_ENVIRONMENT'] ?? 'production',
            'JWT_SECRET' => $env['JWT_SECRET'],
        ];
    }

    public function __get(string $name)
    {
        return $this->config[$name] ?? null;
    }
}
