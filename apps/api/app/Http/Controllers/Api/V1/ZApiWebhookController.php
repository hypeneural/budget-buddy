<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZApiWebhookController extends Controller
{
    /**
     * Handle Z-API webhook callbacks
     */
    public function handle(Request $request, int $instanceId): JsonResponse
    {
        // Find instance
        $instance = WhatsAppInstance::find($instanceId);

        if (!$instance) {
            Log::warning('Z-API Webhook: Instance not found', ['instance_id' => $instanceId]);
            return response()->json(['error' => 'Instance not found'], 404);
        }

        // Verify webhook secret if configured
        $expectedSecret = config('zapi.webhook_secret');
        if ($expectedSecret) {
            $providedSecret = $request->header('X-Webhook-Secret');
            if ($providedSecret !== $expectedSecret) {
                Log::warning('Z-API Webhook: Invalid secret', [
                    'instance_id' => $instanceId,
                ]);
                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        // Log raw payload
        $payload = $request->all();
        Log::info('Z-API Webhook received', [
            'instance_id' => $instanceId,
            'type' => $payload['type'] ?? 'unknown',
            'payload' => $payload,
        ]);

        // Handle different webhook types
        $type = $payload['type'] ?? null;

        switch ($type) {
            case 'ReceivedMessage':
                $this->handleReceivedMessage($instance, $payload);
                break;

            case 'MessageStatusUpdate':
                $this->handleMessageStatusUpdate($instance, $payload);
                break;

            case 'ConnectionUpdate':
                $this->handleConnectionUpdate($instance, $payload);
                break;

            default:
                Log::info('Z-API Webhook: Unhandled type', [
                    'instance_id' => $instanceId,
                    'type' => $type,
                ]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle received message (inbound)
     */
    protected function handleReceivedMessage(WhatsAppInstance $instance, array $payload): void
    {
        // Future: Create inbound message record
        Log::info('Z-API Webhook: ReceivedMessage', [
            'instance_id' => $instance->id,
            'from' => $payload['from'] ?? null,
        ]);
    }

    /**
     * Handle message status update
     */
    protected function handleMessageStatusUpdate(WhatsAppInstance $instance, array $payload): void
    {
        $messageId = $payload['messageId'] ?? null;
        $status = $payload['status'] ?? null;

        if (!$messageId) {
            return;
        }

        // Find and update message
        $message = $instance->messages()
            ->where('whatsapp_message_id', $messageId)
            ->first();

        if ($message) {
            $newStatus = match ($status) {
                'DELIVERY_ACK' => 'delivered',
                'READ' => 'read',
                default => null,
            };

            if ($newStatus) {
                $message->update(['status' => $newStatus]);
                Log::info('Z-API Webhook: Message status updated', [
                    'message_id' => $message->id,
                    'status' => $newStatus,
                ]);
            }
        }
    }

    /**
     * Handle connection status update
     */
    protected function handleConnectionUpdate(WhatsAppInstance $instance, array $payload): void
    {
        $connected = $payload['connected'] ?? false;

        $instance->update([
            'status' => $connected ? 'connected' : 'disconnected',
            'smartphone_connected' => $payload['smartphoneConnected'] ?? false,
            'connected_at' => $connected ? now() : null,
        ]);

        Log::info('Z-API Webhook: Connection updated', [
            'instance_id' => $instance->id,
            'connected' => $connected,
        ]);
    }
}
