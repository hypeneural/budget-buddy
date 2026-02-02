<?php

namespace App\Jobs;

use App\Models\WhatsAppInstance;
use App\Models\WhatsAppMessage;
use App\Services\ZApi\ZApiClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendWhatsAppTextJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [5, 30, 60]; // seconds between retries

    protected int $messageId;

    public function __construct(int $messageId)
    {
        $this->messageId = $messageId;
    }

    public function handle(ZApiClient $client): void
    {
        $message = WhatsAppMessage::find($this->messageId);

        if (!$message) {
            Log::warning('SendWhatsAppTextJob: Message not found', ['id' => $this->messageId]);
            return;
        }

        if ($message->status !== 'queued') {
            Log::info('SendWhatsAppTextJob: Message already processed', [
                'id' => $this->messageId,
                'status' => $message->status,
            ]);
            return;
        }

        $instance = $message->whatsappInstance;

        if (!$instance) {
            $message->markAsFailed('WhatsApp instance not found');
            return;
        }

        // Use lock to prevent concurrent sends on same instance (rate limiting)
        $lockKey = "zapi_send_{$instance->id}";
        $lock = Cache::lock($lockKey, 10);

        if (!$lock->get()) {
            // Release and retry later
            $this->release(5);
            return;
        }

        try {
            $result = $client->sendText(
                $instance,
                $message->phone,
                $message->message,
                [
                    'delayMessage' => config('zapi.default_delay_message'),
                    'delayTyping' => config('zapi.default_delay_typing'),
                ]
            );

            $message->markAsSent(
                $result['zaapId'] ?? null,
                $result['messageId'] ?? null,
                $result['response'] ?? null
            );

            // Update quote_supplier if this message is for a quote
            if ($message->quote_id && $message->supplier_id) {
                \DB::table('quote_supplier')
                    ->where('quote_id', $message->quote_id)
                    ->where('supplier_id', $message->supplier_id)
                    ->update([
                        'message_status' => 'sent',
                        'zapi_message_id' => $result['messageId'] ?? null,
                        'zapi_zaap_id' => $result['zaapId'] ?? null,
                        'sent_at' => now(),
                        'error_message' => null,
                    ]);
            }

            Log::info('SendWhatsAppTextJob: Message sent successfully', [
                'message_id' => $this->messageId,
                'zaap_id' => $result['zaapId'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('SendWhatsAppTextJob: Failed to send message', [
                'message_id' => $this->messageId,
                'error' => $e->getMessage(),
            ]);

            if ($this->attempts() >= $this->tries) {
                $message->markAsFailed($e->getMessage());

                // Update quote_supplier if this message is for a quote
                if ($message->quote_id && $message->supplier_id) {
                    \DB::table('quote_supplier')
                        ->where('quote_id', $message->quote_id)
                        ->where('supplier_id', $message->supplier_id)
                        ->update([
                            'message_status' => 'failed',
                            'error_message' => $e->getMessage(),
                        ]);
                }
            } else {
                throw $e; // Retry
            }
        } finally {
            $lock->release();
        }
    }

    public function failed(\Throwable $exception): void
    {
        $message = WhatsAppMessage::find($this->messageId);

        if ($message) {
            $message->markAsFailed($exception->getMessage());
        }

        Log::error('SendWhatsAppTextJob: Job failed permanently', [
            'message_id' => $this->messageId,
            'error' => $exception->getMessage(),
        ]);
    }
}
