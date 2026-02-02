<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppMessage extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_messages';

    protected $fillable = [
        'whatsapp_instance_id',
        'company_id',
        'direction',
        'phone',
        'message',
        'status',
        'zaap_id',
        'whatsapp_message_id',
        'provider_payload',
        'provider_response',
        'error_message',
        'idempotency_key',
        'quote_id',
        'supplier_id',
        'sent_at',
    ];

    protected $casts = [
        'provider_payload' => 'array',
        'provider_response' => 'array',
        'sent_at' => 'datetime',
    ];

    public function whatsappInstance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Scope for pending messages
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for failed messages
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for outbound messages
     */
    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    /**
     * Mark as queued
     */
    public function markAsQueued(): void
    {
        $this->update(['status' => 'queued']);
    }

    /**
     * Mark as sent
     */
    public function markAsSent(?string $zaapId = null, ?string $messageId = null, ?array $response = null): void
    {
        $this->update([
            'status' => 'sent',
            'zaap_id' => $zaapId,
            'whatsapp_message_id' => $messageId,
            'provider_response' => $response,
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $errorMessage, ?array $response = null): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'provider_response' => $response,
        ]);
    }
}
