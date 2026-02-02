<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendWhatsAppTextJob;
use App\Models\WhatsAppInstance;
use App\Models\WhatsAppMessage;
use App\Services\ZApi\ZApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ZApiController extends Controller
{
    public function __construct(protected ZApiClient $client)
    {
    }

    /**
     * Get instance status from Z-API
     */
    public function status(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('view', $whatsappInstance);

        if (!$whatsappInstance->hasCredentials()) {
            return response()->json([
                'error' => [
                    'code' => 'NO_CREDENTIALS',
                    'message' => 'Instância não possui credenciais Z-API configuradas.',
                ],
            ], 400);
        }

        try {
            $status = $this->client->getStatus($whatsappInstance);

            return response()->json(['data' => $status]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'code' => 'ZAPI_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Get QR code for connection
     */
    public function qrCode(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('view', $whatsappInstance);

        if (!$whatsappInstance->hasCredentials()) {
            return response()->json([
                'error' => [
                    'code' => 'NO_CREDENTIALS',
                    'message' => 'Instância não possui credenciais Z-API configuradas.',
                ],
            ], 400);
        }

        try {
            $qrData = $this->client->getQrCodeImage($whatsappInstance);

            $whatsappInstance->update(['last_qr_at' => now()]);

            return response()->json(['data' => $qrData]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'code' => 'ZAPI_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Get phone code for connection
     */
    public function phoneCode(Request $request, WhatsAppInstance $whatsappInstance, string $phone): JsonResponse
    {
        $this->authorize('view', $whatsappInstance);

        if (!$whatsappInstance->hasCredentials()) {
            return response()->json([
                'error' => [
                    'code' => 'NO_CREDENTIALS',
                    'message' => 'Instância não possui credenciais Z-API configuradas.',
                ],
            ], 400);
        }

        try {
            $codeData = $this->client->getPhoneCode($whatsappInstance, $phone);

            return response()->json(['data' => $codeData]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'code' => 'ZAPI_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Disconnect instance
     */
    public function disconnect(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('update', $whatsappInstance);

        if (!$whatsappInstance->hasCredentials()) {
            return response()->json([
                'error' => [
                    'code' => 'NO_CREDENTIALS',
                    'message' => 'Instância não possui credenciais Z-API configuradas.',
                ],
            ], 400);
        }

        try {
            $result = $this->client->disconnect($whatsappInstance);

            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'code' => 'ZAPI_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Send text message (queued)
     */
    public function sendText(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whatsapp_instance_id' => 'required|exists:whatsapp_instances,id',
            'phone' => 'required|string|min:10|max:20',
            'message' => 'required|string|max:4096',
            'delayMessage' => 'nullable|integer|min:1|max:15',
            'delayTyping' => 'nullable|integer|min:0|max:15',
            'idempotencyKey' => 'nullable|string|max:255',
        ]);

        $instance = WhatsAppInstance::findOrFail($validated['whatsapp_instance_id']);
        $this->authorize('view', $instance);

        if (!$instance->hasCredentials()) {
            return response()->json([
                'error' => [
                    'code' => 'NO_CREDENTIALS',
                    'message' => 'Instância não possui credenciais Z-API configuradas.',
                ],
            ], 400);
        }

        // Check idempotency
        $idempotencyKey = $validated['idempotencyKey'] ?? Str::uuid()->toString();

        $existingMessage = WhatsAppMessage::where('idempotency_key', $idempotencyKey)->first();
        if ($existingMessage) {
            return response()->json([
                'data' => [
                    'message_id' => $existingMessage->id,
                    'status' => $existingMessage->status,
                    'duplicate' => true,
                ],
            ], 200);
        }

        // Create message record
        $message = WhatsAppMessage::create([
            'whatsapp_instance_id' => $instance->id,
            'company_id' => $request->user()->company_id,
            'direction' => 'outbound',
            'phone' => $validated['phone'],
            'message' => $validated['message'],
            'status' => 'pending',
            'idempotency_key' => $idempotencyKey,
            'provider_payload' => [
                'delayMessage' => $validated['delayMessage'] ?? config('zapi.default_delay_message'),
                'delayTyping' => $validated['delayTyping'] ?? config('zapi.default_delay_typing'),
            ],
        ]);

        // Mark as queued and dispatch job
        $message->markAsQueued();
        SendWhatsAppTextJob::dispatch($message->id);

        return response()->json([
            'data' => [
                'message_id' => $message->id,
                'status' => 'queued',
            ],
        ], 202);
    }

    /**
     * Update instance credentials
     */
    public function updateCredentials(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('update', $whatsappInstance);

        $validated = $request->validate([
            'instance_id' => 'required|string|max:255',
            'instance_token' => 'required|string|max:500',
            'client_token' => 'required|string|max:500',
        ]);

        $whatsappInstance->update([
            'instance_id' => $validated['instance_id'],
            'instance_token' => ZApiClient::encryptToken($validated['instance_token']),
            'client_token' => ZApiClient::encryptToken($validated['client_token']),
        ]);

        return response()->json([
            'data' => [
                'id' => $whatsappInstance->id,
                'name' => $whatsappInstance->name,
                'has_credentials' => true,
            ],
        ]);
    }
}
