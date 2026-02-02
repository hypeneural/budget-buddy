<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppMessage;
use App\Jobs\SendWhatsAppTextJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class QueueController extends Controller
{
    /**
     * Get queue status - pending jobs count
     */
    public function status(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        // Count pending messages
        $pending = WhatsAppMessage::where('company_id', $companyId)
            ->where('status', 'queued')
            ->count();

        // Count sent today
        $sentToday = WhatsAppMessage::where('company_id', $companyId)
            ->where('status', 'sent')
            ->whereDate('sent_at', today())
            ->count();

        // Count failed
        $failed = WhatsAppMessage::where('company_id', $companyId)
            ->where('status', 'failed')
            ->count();

        // Get recent messages
        $recent = WhatsAppMessage::where('company_id', $companyId)
            ->with(['supplier:id,name', 'quote:id,title'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'phone' => $m->phone,
                'status' => $m->status,
                'supplier' => $m->supplier?->name,
                'quote' => $m->quote?->title,
                'created_at' => $m->created_at,
                'sent_at' => $m->sent_at,
                'error' => $m->error_message,
            ]);

        return response()->json([
            'data' => [
                'pending' => $pending,
                'sent_today' => $sentToday,
                'failed' => $failed,
                'recent' => $recent,
            ],
        ]);
    }

    /**
     * Process pending queue jobs manually (for cron or button trigger)
     * 
     * This processes up to N jobs from the queue synchronously.
     * Can be called via:
     * - Authenticated API request (button in frontend)
     * - Cron job with secret token
     */
    public function work(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 5), 20); // Max 20 per call
        $processed = 0;
        $errors = [];

        // Get pending messages from this company (or all if called via cron with token)
        $query = WhatsAppMessage::where('status', 'queued')
            ->orderBy('created_at');

        // If authenticated user, limit to their company
        if ($request->user()) {
            $query->where('company_id', $request->user()->company_id);
        }

        $messages = $query->limit($limit)->get();

        foreach ($messages as $message) {
            try {
                // Dispatch and process immediately (sync)
                SendWhatsAppTextJob::dispatchSync($message->id);
                $processed++;

                // Small delay between messages to avoid rate limiting
                usleep(500000); // 0.5 seconds
            } catch (\Exception $e) {
                Log::error('Queue work error', [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'data' => [
                'processed' => $processed,
                'total_pending' => $messages->count(),
                'errors' => $errors,
            ],
        ]);
    }

    /**
     * Public endpoint for cron job (protected by secret token)
     * 
     * Usage: GET /api/v1/queue/cron?token=YOUR_SECRET_TOKEN
     */
    public function cron(Request $request): JsonResponse
    {
        $token = $request->input('token');
        $expectedToken = config('app.queue_cron_token');

        if (!$expectedToken || $token !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $limit = min((int) $request->input('limit', 10), 50);
        $processed = 0;
        $errors = [];

        $messages = WhatsAppMessage::where('status', 'queued')
            ->orderBy('created_at')
            ->limit($limit)
            ->get();

        foreach ($messages as $message) {
            try {
                SendWhatsAppTextJob::dispatchSync($message->id);
                $processed++;
                usleep(500000); // 0.5 seconds delay
            } catch (\Exception $e) {
                Log::error('Cron queue error', [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = $message->id;
            }
        }

        return response()->json([
            'success' => true,
            'processed' => $processed,
            'errors_count' => count($errors),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Retry failed messages
     */
    public function retry(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $messageId = $request->input('message_id');

        $query = WhatsAppMessage::where('company_id', $companyId)
            ->where('status', 'failed');

        if ($messageId) {
            $query->where('id', $messageId);
        }

        $updated = $query->update([
            'status' => 'queued',
            'error_message' => null,
            'attempts' => 0,
        ]);

        return response()->json([
            'data' => [
                'requeued' => $updated,
            ],
        ]);
    }
}
