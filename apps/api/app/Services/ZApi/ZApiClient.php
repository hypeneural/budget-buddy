<?php

namespace App\Services\ZApi;

use App\Models\WhatsAppInstance;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZApiClient
{
    protected string $baseUrl;
    protected int $timeout;
    protected int $retries;
    protected int $retryDelay;
    protected string $userAgent;

    public function __construct()
    {
        $this->baseUrl = config('zapi.base_url');
        $this->timeout = config('zapi.timeout');
        $this->retries = config('zapi.retries');
        $this->retryDelay = config('zapi.retry_delay');
        $this->userAgent = config('zapi.user_agent');
    }

    /**
     * Build HTTP client for a specific instance
     */
    protected function client(WhatsAppInstance $instance): PendingRequest
    {
        $instanceId = $instance->instance_id;
        $instanceToken = $this->decryptToken($instance->instance_token);
        $clientToken = $this->decryptToken($instance->client_token);

        $baseUrl = "{$this->baseUrl}/instances/{$instanceId}/token/{$instanceToken}";

        return Http::baseUrl($baseUrl)
            ->withHeaders([
                'Client-Token' => $clientToken,
                'Content-Type' => 'application/json',
                'User-Agent' => $this->userAgent,
            ])
            ->timeout($this->timeout)
            ->retry($this->retries, $this->retryDelay, function ($exception) {
                return $exception instanceof RequestException &&
                    ($exception->response?->serverError() || $exception->response?->status() === 429);
            });
    }

    /**
     * Decrypt a token from the database
     */
    protected function decryptToken(?string $encryptedToken): ?string
    {
        if (!$encryptedToken) {
            return null;
        }

        try {
            return Crypt::decryptString($encryptedToken);
        } catch (\Exception $e) {
            // Token might not be encrypted (for backwards compatibility)
            return $encryptedToken;
        }
    }

    /**
     * Encrypt a token for database storage
     */
    public static function encryptToken(string $token): string
    {
        return Crypt::encryptString($token);
    }

    /**
     * Send text message
     */
    public function sendText(
        WhatsAppInstance $instance,
        string $phone,
        string $message,
        array $options = []
    ): array {
        $payload = [
            'phone' => $this->normalizePhone($phone),
            'message' => $message,
        ];

        if (isset($options['delayMessage'])) {
            $payload['delayMessage'] = min(15, max(1, (int) $options['delayMessage']));
        } else {
            $payload['delayMessage'] = config('zapi.default_delay_message');
        }

        if (isset($options['delayTyping'])) {
            $payload['delayTyping'] = min(15, max(0, (int) $options['delayTyping']));
        } else {
            $payload['delayTyping'] = config('zapi.default_delay_typing');
        }

        if (isset($options['editMessageId'])) {
            $payload['editMessageId'] = $options['editMessageId'];
        }

        Log::info('Z-API sendText request', [
            'instance_id' => $instance->id,
            'phone' => $this->maskPhone($phone),
            'message_length' => strlen($message),
        ]);

        $response = $this->client($instance)->post('/send-text', $payload);

        if ($response->failed()) {
            Log::error('Z-API sendText failed', [
                'instance_id' => $instance->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \Exception("Z-API sendText failed: {$response->body()}", $response->status());
        }

        $data = $response->json();

        Log::info('Z-API sendText success', [
            'instance_id' => $instance->id,
            'zaapId' => $data['zaapId'] ?? null,
            'messageId' => $data['messageId'] ?? null,
        ]);

        return [
            'success' => true,
            'zaapId' => $data['zaapId'] ?? null,
            'messageId' => $data['messageId'] ?? null,
            'id' => $data['id'] ?? null,
            'payload' => $payload,
            'response' => $data,
        ];
    }

    /**
     * Get QR code as base64 image (or detect if already connected)
     */
    public function getQrCodeImage(WhatsAppInstance $instance): array
    {
        $response = $this->client($instance)->get('/qr-code/image');

        if ($response->failed()) {
            throw new \Exception("Z-API getQrCodeImage failed: {$response->body()}", $response->status());
        }

        $data = $response->json();

        // Z-API returns {"connected": true} when already connected
        if (isset($data['connected']) && $data['connected'] === true) {
            return [
                'connected' => true,
                'imageBase64' => null,
                'refreshedAt' => now()->toIso8601String(),
            ];
        }

        return [
            'connected' => false,
            'imageBase64' => $data['value'] ?? null,
            'refreshedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * Get device/phone information when connected
     */
    public function getDeviceInfo(WhatsAppInstance $instance): array
    {
        $response = $this->client($instance)->get('/device');

        if ($response->failed()) {
            throw new \Exception("Z-API getDeviceInfo failed: {$response->body()}", $response->status());
        }

        $data = $response->json();

        // Update instance with phone number if available
        if (!empty($data['phone'])) {
            $instance->update([
                'phone_number' => $data['phone'],
            ]);
        }

        return [
            'phone' => $data['phone'] ?? null,
            'imgUrl' => $data['imgUrl'] ?? null,
            'name' => $data['name'] ?? null,
            'retrievedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * Get full status: combines status, device info, and QR code in single response
     */
    public function getFullStatus(WhatsAppInstance $instance): array
    {
        // First check connection status
        $statusResponse = $this->client($instance)->get('/status');

        if ($statusResponse->failed()) {
            throw new \Exception("Z-API getStatus failed: {$statusResponse->body()}", $statusResponse->status());
        }

        $statusData = $statusResponse->json();
        $connected = $statusData['connected'] ?? false;

        // Update instance status in database
        $instance->update([
            'status' => $connected ? 'connected' : 'disconnected',
            'smartphone_connected' => $statusData['smartphoneConnected'] ?? false,
            'last_status_error' => $statusData['error'] ?? null,
            'last_status_at' => now(),
            'connected_at' => $connected ? ($instance->connected_at ?? now()) : null,
        ]);

        $result = [
            'connected' => $connected,
            'smartphoneConnected' => $statusData['smartphoneConnected'] ?? false,
            'error' => $statusData['error'] ?? null,
            'checkedAt' => now()->toIso8601String(),
        ];

        if ($connected) {
            // Get device info when connected
            try {
                $deviceResponse = $this->client($instance)->get('/device');
                if ($deviceResponse->successful()) {
                    $deviceData = $deviceResponse->json();
                    $result['phone'] = $deviceData['phone'] ?? null;
                    $result['imgUrl'] = $deviceData['imgUrl'] ?? null;
                    $result['deviceName'] = $deviceData['name'] ?? null;

                    // Update phone in database
                    if (!empty($deviceData['phone'])) {
                        $instance->update(['phone_number' => $deviceData['phone']]);
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get device info', ['error' => $e->getMessage()]);
            }
        } else {
            // Get QR code when disconnected
            try {
                $qrResponse = $this->client($instance)->get('/qr-code/image');
                if ($qrResponse->successful()) {
                    $qrData = $qrResponse->json();
                    // Only set qrCode if not connected response
                    if (!isset($qrData['connected']) || $qrData['connected'] !== true) {
                        $result['qrCode'] = $qrData['value'] ?? null;
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get QR code', ['error' => $e->getMessage()]);
            }
        }

        return $result;
    }

    /**
     * Get phone code for connection
     */
    public function getPhoneCode(WhatsAppInstance $instance, string $phone): array
    {
        $normalizedPhone = $this->normalizePhone($phone);
        $response = $this->client($instance)->get("/phone-code/{$normalizedPhone}");

        if ($response->failed()) {
            throw new \Exception("Z-API getPhoneCode failed: {$response->body()}", $response->status());
        }

        $data = $response->json();

        return [
            'code' => $data['code'] ?? null,
            'generatedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * Get connection status
     */
    public function getStatus(WhatsAppInstance $instance): array
    {
        $response = $this->client($instance)->get('/status');

        if ($response->failed()) {
            throw new \Exception("Z-API getStatus failed: {$response->body()}", $response->status());
        }

        $data = $response->json();

        // Update instance status in database
        $instance->update([
            'status' => $data['connected'] ? 'connected' : 'disconnected',
            'smartphone_connected' => $data['smartphoneConnected'] ?? false,
            'last_status_error' => $data['error'] ?? null,
            'last_status_at' => now(),
            'connected_at' => $data['connected'] ? ($instance->connected_at ?? now()) : null,
        ]);

        return [
            'connected' => $data['connected'] ?? false,
            'smartphoneConnected' => $data['smartphoneConnected'] ?? false,
            'error' => $data['error'] ?? null,
            'checkedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * Disconnect instance
     */
    public function disconnect(WhatsAppInstance $instance): array
    {
        $response = $this->client($instance)->get('/disconnect');

        if ($response->failed()) {
            throw new \Exception("Z-API disconnect failed: {$response->body()}", $response->status());
        }

        // Update instance status
        $instance->update([
            'status' => 'disconnected',
            'smartphone_connected' => false,
            'connected_at' => null,
            'phone_number' => null,
        ]);

        return [
            'disconnected' => true,
            'disconnectedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * Normalize phone number (remove non-digits, ensure country code)
     */
    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        // Add Brazil country code if not present
        if (strlen($phone) === 10 || strlen($phone) === 11) {
            $phone = '55' . $phone;
        }

        return $phone;
    }

    /**
     * Mask phone number for logging (privacy)
     */
    protected function maskPhone(string $phone): string
    {
        $phone = $this->normalizePhone($phone);
        return substr($phone, 0, 4) . '****' . substr($phone, -4);
    }
}
