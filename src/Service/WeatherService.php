<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\ExternalApiException;
use DateInterval;
use DateTimeImmutable;
use DateTimeZone;
use JsonException;

class WeatherService
{
    private const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
    private const AIR_QUALITY_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

    public function __construct(
        private readonly float $latitude = 52.52,
        private readonly float $longitude = 13.41,
        private readonly string $locationLabel = 'Berlin, Deutschland',
        private readonly string $timezone = 'Europe/Berlin'
    ) {
    }

    public function fetchOverview(): array
    {
        $params = [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'hourly' => 'temperature_2m,apparent_temperature,relativehumidity_2m,precipitation_probability,precipitation,wind_speed_10m',
            'current' => 'temperature_2m,apparent_temperature,relativehumidity_2m,wind_speed_10m,weather_code',
            'daily' => 'sunrise,sunset',
            'forecast_days' => 1,
            'timezone' => $this->timezone,
        ];

        $payload = $this->request(self::FORECAST_ENDPOINT, $params);

        $hourly = $this->buildHourlySeries(
            $payload['hourly']['time'] ?? [],
            $payload['hourly'] ?? [],
            [
                'temperature' => 'temperature_2m',
                'apparentTemperature' => 'apparent_temperature',
                'humidity' => 'relativehumidity_2m',
                'precipitationProbability' => 'precipitation_probability',
                'precipitation' => 'precipitation',
                'windSpeed' => 'wind_speed_10m',
            ]
        );

        $temperatures = array_column($hourly, 'temperature');
        $windSpeeds = array_column($hourly, 'windSpeed');
        $precipitationProbabilities = array_column($hourly, 'precipitationProbability');

        $current = $payload['current'] ?? [];

        return [
            'meta' => [
                'location' => $this->locationLabel,
                'coordinates' => [
                    'latitude' => $this->latitude,
                    'longitude' => $this->longitude,
                ],
                'timezone' => $payload['timezone'] ?? $this->timezone,
                'source' => 'Open-Meteo Forecast API',
                'updatedAt' => $current['time'] ?? null,
            ],
            'current' => [
                'temperature' => $this->roundValue($current['temperature_2m'] ?? null),
                'apparentTemperature' => $this->roundValue($current['apparent_temperature'] ?? null),
                'humidity' => $this->roundValue($current['relativehumidity_2m'] ?? null),
                'windSpeed' => $this->roundValue($current['wind_speed_10m'] ?? null),
                'weatherCode' => $current['weather_code'] ?? null,
                'description' => $this->describeWeather($current['weather_code'] ?? null),
                'time' => $current['time'] ?? null,
            ],
            'hourly' => $hourly,
            'highlights' => [
                'maxTemperature' => $this->roundValue($temperatures ? max($temperatures) : null),
                'minTemperature' => $this->roundValue($temperatures ? min($temperatures) : null),
                'averageWindSpeed' => $this->roundValue($windSpeeds ? $this->average($windSpeeds) : null),
                'rainChance' => $this->roundValue($precipitationProbabilities ? max($precipitationProbabilities) : null),
                'sunrise' => $payload['daily']['sunrise'][0] ?? null,
                'sunset' => $payload['daily']['sunset'][0] ?? null,
            ],
        ];
    }

    public function getLocationLabel(): string
    {
        return $this->locationLabel;
    }

    public function fetchAirQuality(): array
    {
        $params = [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'hourly' => 'pm10,pm2_5,ozone,carbon_monoxide',
            'forecast_days' => 1,
            'timezone' => $this->timezone,
        ];

        $payload = $this->request(self::AIR_QUALITY_ENDPOINT, $params);

        $hourly = $this->buildHourlySeries(
            $payload['hourly']['time'] ?? [],
            $payload['hourly'] ?? [],
            [
                'pm10' => 'pm10',
                'pm25' => 'pm2_5',
                'ozone' => 'ozone',
                'carbonMonoxide' => 'carbon_monoxide',
            ]
        );

        $pm25Values = array_column($hourly, 'pm25');
        $pm10Values = array_column($hourly, 'pm10');
        $ozoneValues = array_column($hourly, 'ozone');

        $aqi = $this->calculateAirQualityIndex($pm25Values);

        return [
            'meta' => [
                'location' => $this->locationLabel,
                'coordinates' => [
                    'latitude' => $this->latitude,
                    'longitude' => $this->longitude,
                ],
                'timezone' => $payload['timezone'] ?? $this->timezone,
                'source' => 'Open-Meteo Air Quality API',
                'updatedAt' => $hourly[0]['time'] ?? null,
            ],
            'hourly' => $hourly,
            'highlights' => [
                'averagePm25' => $this->roundValue($pm25Values ? $this->average($pm25Values) : null),
                'maxPm10' => $this->roundValue($pm10Values ? max($pm10Values) : null),
                'maxOzone' => $this->roundValue($ozoneValues ? max($ozoneValues) : null),
            ],
            'airQualityIndex' => $aqi,
        ];
    }

    public function fetchSolar(): array
    {
        $params = [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'hourly' => 'shortwave_radiation,diffuse_radiation,direct_radiation,direct_normal_irradiance',
            'daily' => 'sunrise,sunset',
            'forecast_days' => 1,
            'timezone' => $this->timezone,
        ];

        $payload = $this->request(self::FORECAST_ENDPOINT, $params);

        $hourly = $this->buildHourlySeries(
            $payload['hourly']['time'] ?? [],
            $payload['hourly'] ?? [],
            [
                'shortwaveRadiation' => 'shortwave_radiation',
                'diffuseRadiation' => 'diffuse_radiation',
                'directRadiation' => 'direct_radiation',
                'directNormalIrradiance' => 'direct_normal_irradiance',
            ]
        );

        $directRadiation = array_column($hourly, 'directRadiation');

        $sunrise = $payload['daily']['sunrise'][0] ?? null;
        $sunset = $payload['daily']['sunset'][0] ?? null;
        $daylightHours = $sunrise && $sunset ? $this->calculateDaylightHours($sunrise, $sunset) : null;

        return [
            'meta' => [
                'location' => $this->locationLabel,
                'coordinates' => [
                    'latitude' => $this->latitude,
                    'longitude' => $this->longitude,
                ],
                'timezone' => $payload['timezone'] ?? $this->timezone,
                'source' => 'Open-Meteo Solar Radiation Model',
                'updatedAt' => $hourly[0]['time'] ?? null,
            ],
            'hourly' => $hourly,
            'highlights' => [
                'peakRadiation' => $this->roundValue($directRadiation ? max($directRadiation) : null),
                'sunrise' => $sunrise,
                'sunset' => $sunset,
                'daylightHours' => $daylightHours,
            ],
        ];
    }

    /**
     * @param array<string, mixed> $series
     * @return array<int, array<string, float|string|null>>
     */
    private function buildHourlySeries(array $time, array $series, array $mapping, int $limit = 12): array
    {
        $result = [];

        foreach ($time as $index => $timestamp) {
            if ($index >= $limit) {
                break;
            }

            $entry = ['time' => $timestamp];

            foreach ($mapping as $alias => $sourceKey) {
                $values = $series[$sourceKey] ?? [];
                $entry[$alias] = isset($values[$index]) ? $this->roundValue($values[$index]) : null;
            }

            $result[] = $entry;
        }

        return $result;
    }

    private function request(string $endpoint, array $params): array
    {
        $queryString = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
        $url = sprintf('%s?%s', $endpoint, $queryString);

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'Accept: application/json',
                    'User-Agent: SlimDashboard/1.0',
                ],
                'timeout' => 8,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);

        if ($response === false) {
            throw new ExternalApiException('Die externen Wetterdaten konnten nicht geladen werden.');
        }

        try {
            return json_decode($response, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new ExternalApiException('Die Antwort des Wetterdienstes ist ungültig.', 0, $exception);
        }
    }

    /**
     * @param array<int, float|int|null> $values
     */
    private function average(array $values): float
    {
        $filtered = array_values(array_filter($values, static fn ($value) => $value !== null));

        if ($filtered === []) {
            return 0.0;
        }

        return array_sum($filtered) / count($filtered);
    }

    private function roundValue(float|int|null $value): ?float
    {
        if ($value === null) {
            return null;
        }

        return round((float) $value, 1);
    }

    /**
     * @param array<int, float|int|null> $pm25Values
     */
    private function calculateAirQualityIndex(array $pm25Values): array
    {
        $average = $pm25Values ? $this->average($pm25Values) : 0.0;

        if ($average <= 12) {
            $category = 'Ausgezeichnet';
            $color = 'success';
            $message = 'Die Luftqualität ist hervorragend.';
        } elseif ($average <= 35.4) {
            $category = 'Gut';
            $color = 'primary';
            $message = 'Leichte Belastung, bestens geeignet für Outdoor-Aktivitäten.';
        } elseif ($average <= 55.4) {
            $category = 'Mittel';
            $color = 'warning';
            $message = 'Empfindliche Personen sollten Aktivitäten im Freien reduzieren.';
        } else {
            $category = 'Belastet';
            $color = 'danger';
            $message = 'Hohe Belastung – Aufenthalt im Freien möglichst meiden.';
        }

        return [
            'score' => $this->roundValue($average),
            'category' => $category,
            'color' => $color,
            'message' => $message,
        ];
    }

    private function describeWeather(?int $code): string
    {
        return match ($code) {
            0 => 'Klarer Himmel',
            1, 2 => 'Leicht bewölkt',
            3 => 'Bedeckt',
            45, 48 => 'Nebel',
            51, 53, 55 => 'Leichter Nieselregen',
            56, 57 => 'Gefrierender Nieselregen',
            61 => 'Leichter Regen',
            63 => 'Mäßiger Regen',
            65 => 'Starker Regen',
            66, 67 => 'Gefrierender Regen',
            71, 73, 75 => 'Schneefall',
            77 => 'Schneekörner',
            80 => 'Leichte Schauer',
            81 => 'Mäßige Schauer',
            82 => 'Heftige Schauer',
            85, 86 => 'Schneeschauer',
            95 => 'Gewitter',
            96, 99 => 'Gewitter mit Hagel',
            default => 'Wird aktualisiert…',
        };
    }

    private function calculateDaylightHours(string $sunrise, string $sunset): ?float
    {
        try {
            $start = new DateTimeImmutable($sunrise, new DateTimeZone($this->timezone));
            $end = new DateTimeImmutable($sunset, new DateTimeZone($this->timezone));
        } catch (\Exception) {
            return null;
        }

        $interval = $start->diff($end);

        if (!$interval instanceof DateInterval) {
            return null;
        }

        $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60);

        return round($hours, 1);
    }
}
